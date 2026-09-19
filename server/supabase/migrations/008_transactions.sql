-- Chunk DB-4: Transactional Integrity for Multi-Step Writes
-- These RPCs ensure that complex multi-table inserts/updates are atomic.

-- 1. Create Payment Group Transaction
CREATE OR REPLACE FUNCTION create_payment_group_txn(
    p_user_id uuid,
    p_trip_id uuid,
    p_group_type text,
    p_subtotal numeric,
    p_discount_amount numeric,
    p_discount_code text,
    p_service_fee numeric,
    p_total numeric,
    p_items jsonb
) RETURNS uuid AS $$
DECLARE
    v_group_id uuid;
    v_item jsonb;
BEGIN
    -- Insert payment group
    INSERT INTO payment_groups (
        user_id, trip_id, group_type, subtotal, discount_amount, discount_code, service_fee, total, status
    ) VALUES (
        p_user_id, p_trip_id, p_group_type::payment_group_type_enum, p_subtotal, p_discount_amount, p_discount_code, p_service_fee, p_total, 'created'
    ) RETURNING id INTO v_group_id;

    -- Insert items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO payment_group_items (
            payment_group_id, booking_id, item_type, label, amount
        ) VALUES (
            v_group_id,
            (v_item->>'booking_id')::uuid,
            (v_item->>'item_type')::payment_item_type_enum,
            v_item->>'label',
            (v_item->>'amount')::numeric
        );
    END LOOP;

    RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Verify Payment Transaction
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
            provider, provider_order_id, provider_payment_id, status, paid_at
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
