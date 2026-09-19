-- Chunk DB-4: Backfill Transactions
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
            provider, provider_order_id, provider_payment_id, status, paid_at, created_at
        ) VALUES (
            (v_payment->>'user_id')::uuid,
            (v_payment->>'booking_id')::uuid,
            v_payment->>'booking_type',
            (v_payment->>'amount')::numeric,
            v_payment->>'currency',
            v_payment->>'provider',
            v_payment->>'provider_order_id',
            v_payment->>'provider_payment_id',
            v_payment->>'status',
            (v_payment->>'paid_at')::timestamptz,
            (v_payment->>'created_at')::timestamptz
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
