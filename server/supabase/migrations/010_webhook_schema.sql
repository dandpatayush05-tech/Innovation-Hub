-- Chunk 12a: Webhook Schema Alignment

-- 1. Create a generic function to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Update payment_groups table
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payment_groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop constraint if it exists to be safe, then add
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_razorpay_order_id_key;
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_razorpay_order_id_key UNIQUE (razorpay_order_id);

-- Attach trigger
DROP TRIGGER IF EXISTS update_payment_groups_updated_at ON payment_groups;
CREATE TRIGGER update_payment_groups_updated_at
    BEFORE UPDATE ON payment_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Update payments table
-- The unified payments table starts at line 358 in schema.sql
ALTER TABLE payments RENAME COLUMN provider_order_id TO razorpay_order_id;
ALTER TABLE payments RENAME COLUMN provider_payment_id TO razorpay_payment_id;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Attach trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Redefine RPCs to use the newly renamed columns
CREATE OR REPLACE FUNCTION verify_payment_txn(
    p_group_id uuid,
    p_user_id uuid,
    p_provider_order_id text,
    p_provider_payment_id text
) RETURNS void AS $$
DECLARE
    v_item record;
BEGIN
    -- Update group status
    UPDATE payment_groups 
    SET status = 'paid', razorpay_order_id = p_provider_order_id 
    WHERE id = p_group_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment group not found or unauthorized';
    END IF;

    -- Iterate items and create payment records + confirm bookings
    FOR v_item IN (SELECT * FROM payment_group_items WHERE payment_group_id = p_group_id)
    LOOP
        -- Insert atomic payment row
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, razorpay_order_id, razorpay_payment_id, status, paid_at
        ) VALUES (
            p_user_id, v_item.booking_id, v_item.item_type::text, v_item.amount, 'INR',
            'razorpay', p_provider_order_id, p_provider_payment_id, 'paid', NOW()
        );

        -- Confirm booking based on polymorphic type
        IF v_item.item_type = 'hotel' THEN
            UPDATE bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'tour' THEN
            UPDATE guide_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'flight' THEN
            UPDATE flight_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'bus_leg' THEN
            UPDATE bus_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        ELSIF v_item.item_type = 'auto' THEN
            UPDATE auto_bookings SET status = 'confirmed' WHERE id = v_item.booking_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION backfill_payments_txn(
    p_payments jsonb
) RETURNS void AS $$
DECLARE
    v_payment jsonb;
BEGIN
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO payments (
            user_id, booking_id, booking_type, amount, currency, 
            provider, razorpay_order_id, razorpay_payment_id, status, paid_at, created_at
        ) VALUES (
            (v_payment->>'user_id')::uuid,
            (v_payment->>'booking_id')::uuid,
            v_payment->>'booking_type',
            (v_payment->>'amount')::numeric,
            v_payment->>'currency',
            v_payment->>'provider',
            v_payment->>'razorpay_order_id',
            v_payment->>'razorpay_payment_id',
            v_payment->>'status',
            (v_payment->>'paid_at')::timestamptz,
            (v_payment->>'created_at')::timestamptz
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
