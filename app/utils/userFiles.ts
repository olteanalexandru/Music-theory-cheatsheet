import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserFileRecord {
    id: string;
    fileName: string;
    storagePath: string;
    fileKind: 'gp' | 'midi';
    uploadedAt: string;
}

const BUCKET = 'play-along-files';

export async function listUserFiles(supabase: SupabaseClient, userId: string): Promise<UserFileRecord[]> {
    const { data, error } = await supabase
        .from('uploaded_files')
        .select('id, file_name, storage_path, file_kind, uploaded_at')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
        id: row.id as string,
        fileName: row.file_name as string,
        storagePath: row.storage_path as string,
        fileKind: row.file_kind as 'gp' | 'midi',
        uploadedAt: row.uploaded_at as string,
    }));
}

// Each upload gets a timestamp-prefixed path so re-uploading the same file
// name never collides with (or silently overwrites) a previous save.
export async function uploadUserFile(
    supabase: SupabaseClient,
    userId: string,
    file: File,
    fileKind: 'gp' | 'midi'
): Promise<void> {
    const storagePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file);
    if (uploadError) throw uploadError;
    const { error: insertError } = await supabase
        .from('uploaded_files')
        .insert({ user_id: userId, file_name: file.name, storage_path: storagePath, file_kind: fileKind });
    if (insertError) throw insertError;
}

export async function downloadUserFile(supabase: SupabaseClient, record: UserFileRecord): Promise<File> {
    const { data, error } = await supabase.storage.from(BUCKET).download(record.storagePath);
    if (error || !data) throw error ?? new Error('Download failed.');
    return new File([data], record.fileName);
}

export async function deleteUserFile(supabase: SupabaseClient, record: UserFileRecord): Promise<void> {
    await supabase.storage.from(BUCKET).remove([record.storagePath]);
    await supabase.from('uploaded_files').delete().eq('id', record.id);
}
