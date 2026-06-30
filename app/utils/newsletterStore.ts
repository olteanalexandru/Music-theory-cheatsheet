import type { SupabaseClient } from '@supabase/supabase-js';

export interface NewsletterCampaign {
    id: string;
    subject: string;
    htmlBody: string;
    sentBy: string | null;
    recipientCount: number;
    sentAt: string;
}

interface NewsletterCampaignRow {
    id: string;
    subject: string;
    html_body: string;
    sent_by: string | null;
    recipient_count: number;
    sent_at: string;
}

function toCampaign(row: NewsletterCampaignRow): NewsletterCampaign {
    return {
        id: row.id,
        subject: row.subject,
        htmlBody: row.html_body,
        sentBy: row.sent_by,
        recipientCount: row.recipient_count,
        sentAt: row.sent_at,
    };
}

// Public, no-auth signup. Postgres reports the unique-email conflict as
// error code 23505, which we surface as a friendlier message instead of a
// raw constraint-violation string; any other error (e.g. failing the email
// format check) is reported generically since the column check's own
// message isn't user-facing-friendly either.
export async function subscribeToNewsletter(supabase: SupabaseClient, email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    if (!error) return { error: null };
    if (error.code === '23505') return { error: "You're already subscribed." };
    return { error: 'Please enter a valid email address.' };
}

// Admin-only - RLS grants select on this table only to profiles.is_admin = true.
export async function fetchSubscriberCount(supabase: SupabaseClient): Promise<number> {
    const { count } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true });
    return count ?? 0;
}

export async function fetchCampaigns(supabase: SupabaseClient): Promise<NewsletterCampaign[]> {
    const { data } = await supabase.from('newsletter_campaigns').select('*').order('sent_at', { ascending: false });
    return ((data ?? []) as NewsletterCampaignRow[]).map(toCampaign);
}

// Invokes the send-newsletter Edge Function, which independently
// re-verifies the caller is a real admin server-side before sending
// anything - this client-side call is a convenience, not the security
// boundary. The function batches the actual Resend sends and only returns
// once every batch has gone out.
export async function sendNewsletter(
    supabase: SupabaseClient,
    fields: { subject: string; html: string }
): Promise<{ error: string | null; recipientCount?: number }> {
    const { data, error } = await supabase.functions.invoke('send-newsletter', { body: fields });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error as string };
    return { error: null, recipientCount: data?.recipientCount as number | undefined };
}

// Invokes the newsletter-unsubscribe Edge Function with the token from the
// emailed unsubscribe link. No Supabase session is required - the token
// itself, validated server-side, is the authorization.
export async function unsubscribeFromNewsletter(supabase: SupabaseClient, token: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.functions.invoke('newsletter-unsubscribe', { body: { token } });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error as string };
    return { error: null };
}
