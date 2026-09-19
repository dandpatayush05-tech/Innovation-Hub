-- Chunk 12a: Help Center Content Schema

CREATE TABLE IF NOT EXISTS public.help_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS public.help_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.help_categories(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('faq_item', 'policy_section', 'static_page')),
    question TEXT,
    title TEXT,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_help_articles_updated_at ON help_articles;
CREATE TRIGGER update_help_articles_updated_at
    BEFORE UPDATE ON help_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_categories
CREATE POLICY "Public can view help categories" ON public.help_categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Service role can manage help categories" ON public.help_categories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for help_articles
CREATE POLICY "Public can view published help articles" ON public.help_articles
    FOR SELECT TO public USING (is_published = true);

CREATE POLICY "Service role can manage help articles" ON public.help_articles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Public can create support tickets" ON public.support_tickets
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Service role can manage support tickets" ON public.support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed Initial Categories
INSERT INTO public.help_categories (slug, title, display_order, icon) VALUES
    ('faq', 'Frequently Asked Questions', 10, 'HelpCircle'),
    ('booking-rules', 'Booking Rules', 20, 'BookOpen'),
    ('cancellation-policy', 'Cancellation Policy', 30, 'XCircle'),
    ('refund-policy', 'Refund Policy', 40, 'Banknote'),
    ('payment-policy', 'Payment Policy', 50, 'CreditCard'),
    ('terms-and-conditions', 'Terms & Conditions', 60, 'FileText'),
    ('privacy-policy', 'Privacy Policy', 70, 'Shield')
ON CONFLICT (slug) DO NOTHING;
