-- Chunk 12e: Notifications Log Table

CREATE TABLE IF NOT EXISTS public.notifications_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id TEXT, -- Can be null or hold provider_payment_id
    type TEXT NOT NULL, -- e.g., 'sms_payment_success', 'sms_payment_failure'
    status TEXT NOT NULL, -- 'sent', 'failed'
    details TEXT, -- Holds error messages or Twilio SID
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access, standard users no access
CREATE POLICY "Service role can manage notifications" ON public.notifications_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add phone to users for SMS notifications
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
