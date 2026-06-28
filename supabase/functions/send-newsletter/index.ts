// Supabase Edge Function: send-newsletter
//
// Deploy: supabase functions deploy send-newsletter
// Secrets (supabase secrets set ...): RESEND_API_KEY, RESEND_FROM_EMAIL, PUBLIC_SITE_URL
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
//
// This function holds the service-role key and can email every subscriber,
// so it never trusts the caller's own claim of being an admin - it reads
// the caller's JWT (attached automatically by supabase.functions.invoke()),
// resolves the user from it, and checks profiles.is_admin server-side
// before doing anything else.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_BATCH_LIMIT = 100;

function escapeHtmlAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

Deno.serve(async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: userData, error: userError } = await admin.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
    if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }

    const { data: profile } = await admin.from('profiles').select('is_admin').eq('user_id', userData.user.id).maybeSingle();
    if (!profile?.is_admin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    let body: { subject?: string; html?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const subject = body.subject?.trim();
    const html = body.html?.trim();
    if (!subject || !html) {
        return new Response(JSON.stringify({ error: 'subject and html are required' }), { status: 400 });
    }

    const { data: subscribers, error: subscribersError } = await admin
        .from('newsletter_subscribers')
        .select('email, unsubscribe_token');
    if (subscribersError) {
        return new Response(JSON.stringify({ error: subscribersError.message }), { status: 500 });
    }
    if (!subscribers || subscribers.length === 0) {
        return new Response(JSON.stringify({ error: 'No subscribers to send to' }), { status: 400 });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')!;
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL')!;

    for (let i = 0; i < subscribers.length; i += RESEND_BATCH_LIMIT) {
        const batch = subscribers.slice(i, i + RESEND_BATCH_LIMIT);
        const payload = batch.map((subscriber) => {
            const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${subscriber.unsubscribe_token}`;
            return {
                from: fromEmail,
                to: subscriber.email,
                subject,
                html: `${html}<hr style="margin-top:24px;border-color:#e5e5e5"><p style="font-size:12px;color:#888">Don't want these emails? <a href="${escapeHtmlAttribute(unsubscribeUrl)}">Unsubscribe</a>.</p>`,
            };
        });

        const response = await fetch('https://api.resend.com/emails/batch', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ error: `Resend error: ${errorText}` }), { status: 502 });
        }
    }

    await admin.from('newsletter_campaigns').insert({
        subject,
        html_body: html,
        sent_by: userData.user.id,
        recipient_count: subscribers.length,
    });

    return new Response(JSON.stringify({ recipientCount: subscribers.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});
