-- Chunk 8a: Payment Groups and Multi-Leg payments

CREATE TABLE public.payment_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    group_type TEXT CHECK (group_type IN ('whole_trip', 'single_leg', 'multi_leg')),
    subtotal NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    discount_code TEXT,
    service_fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('created', 'pending', 'paid', 'failed')),
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_group_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_group_id UUID REFERENCES public.payment_groups(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL, -- Logical FK since it can map to bookings, flight_bookings, etc.
    item_type TEXT CHECK (item_type IN ('hotel', 'tour', 'bus_leg', 'flight', 'auto')),
    label TEXT,
    amount NUMERIC NOT NULL
);

ALTER TABLE public.payment_group_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.discount_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE, -- null = automatic rule, not a coupon
    type TEXT CHECK (type IN ('percent', 'flat')),
    value NUMERIC NOT NULL,
    min_amount NUMERIC DEFAULT 0,
    applies_to TEXT CHECK (applies_to IN ('whole_trip', 'any')),
    active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;

-- Seed the automatic discount rule for whole trips (5% off)
INSERT INTO public.discount_rules (code, type, value, min_amount, applies_to, active)
VALUES (null, 'percent', 5, 0, 'whole_trip', true);
