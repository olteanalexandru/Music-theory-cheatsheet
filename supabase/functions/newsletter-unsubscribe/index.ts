// Supabase Edge Function: newsletter-unsubscribe
//
// Deploy: supabase functions deploy newsletter-unsubscribe
// No extra secrets needed beyond the auto-injected SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY.
//
// Called from app/unsubscribe/page.tsx with the token from an emailed
// unsubscribe link - the caller has no Supabase session at all (the
// supabase-js client still attaches the anon key as a bearer token by
// default, which satisfies this project's default JWT verification). The
// unsubscribe token itself, validated against newsletter_subscribers here,
// is the real authorization - there is no public delete policy on that
// table, since "delete by arbitrary token" is exactly what this function
// exists to gate safely. Deletes the row outright (rather than marking it
// unsubscribed) so a later resubscribe is a plain conflict-free insert.

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    let body: { token?: string };
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    const token = body.token?.trim();
    if (!token) {
        return new Response(JSON.stringify({ error: 'token is required' }), { status: 400 });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data, error } = await admin
        .from('newsletter_subscribers')
        .delete()
        .eq('unsubscribe_token', token)
        .select()
        .maybeSingle();
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    if (!data) {
        return new Response(JSON.stringify({ error: 'Invalid or already-used unsubscribe link' }), { status: 404 });
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
});
