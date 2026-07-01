// Google Identity Services type declaration (loaded via CDN script tag)
declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: { access_token?: string; error?: string }) => void;
                    }) => { requestAccessToken: () => void };
                };
            };
        };
    }
}

export interface DriveFileRecord {
    id: string;
    fileName: string;
    fileKind: 'gp' | 'midi';
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const MULTIPART_BOUNDARY = 'music_theory_pa_boundary_8f3a2c';

export function requestGoogleDriveToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.'));
    if (!window.google?.accounts?.oauth2) return Promise.reject(new Error('Google Identity Services not loaded.'));
    return new Promise((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: DRIVE_SCOPE,
            callback: (response) => {
                if (response.error || !response.access_token) {
                    reject(new Error(response.error ?? 'No access token returned.'));
                } else {
                    resolve(response.access_token);
                }
            },
        });
        client.requestAccessToken();
    });
}

export async function listDriveFiles(token: string): Promise<DriveFileRecord[]> {
    const res = await fetch(
        'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,description)',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
    const json = (await res.json()) as { files: Array<{ id: string; name: string; description?: string }> };
    return json.files
        .filter((f) => f.description === 'gp' || f.description === 'midi')
        .map((f) => ({ id: f.id, fileName: f.name, fileKind: f.description as 'gp' | 'midi' }));
}

export async function uploadDriveFile(token: string, file: File, fileKind: 'gp' | 'midi'): Promise<void> {
    const metadata = JSON.stringify({ name: file.name, description: fileKind, parents: ['appDataFolder'] });
    const fileBuffer = await file.arrayBuffer();
    const body = new Blob([
        `--${MULTIPART_BOUNDARY}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${MULTIPART_BOUNDARY}\r\nContent-Type: application/octet-stream\r\n\r\n`,
        fileBuffer,
        `\r\n--${MULTIPART_BOUNDARY}--`,
    ]);
    const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${MULTIPART_BOUNDARY}`,
            },
            body,
        }
    );
    if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
}

export async function downloadDriveFile(token: string, record: DriveFileRecord): Promise<File> {
    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(record.id)}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
    const blob = await res.blob();
    return new File([blob], record.fileName);
}

export async function deleteDriveFile(token: string, record: DriveFileRecord): Promise<void> {
    await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(record.id)}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
}
