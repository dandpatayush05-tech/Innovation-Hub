-- Migration: Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT "uuid-ossp".uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid NOT NULL,
  booking_type text NOT NULL, -- 'hotel', 'flight', 'bus', 'auto', 'tour'
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  provider text DEFAULT 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  status text NOT NULL, -- 'created', 'pending', 'paid', 'failed', 'refunded'
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON payments(provider_order_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- App accesses via service role key, so no RLS policies needed.
