-- Chunk DB-2: Constraints, Foreign Keys & Enums Migration

-- 1. Sanitize existing data before applying strict constraints
DO $$ 
BEGIN
    UPDATE payments SET amount = 0 WHERE amount < 0;
    UPDATE payment_groups SET subtotal = 0 WHERE subtotal < 0;
    UPDATE payment_groups SET total = 0 WHERE total < 0;
    UPDATE payment_groups SET service_fee = 0 WHERE service_fee < 0;
    UPDATE payment_group_items SET amount = 0 WHERE amount < 0;
    UPDATE trips SET end_date = start_date WHERE end_date < start_date;
    UPDATE auto_bookings SET end_date = start_date WHERE end_date < start_date;
END $$;

-- 2. Foreign Key ON DELETE adjustments
-- Re-adding/Confirming FK constraints for trips.id
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_trip_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE guide_bookings DROP CONSTRAINT IF EXISTS guide_bookings_trip_id_fkey;
ALTER TABLE guide_bookings ADD CONSTRAINT guide_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE flight_bookings DROP CONSTRAINT IF EXISTS flight_bookings_trip_id_fkey;
ALTER TABLE flight_bookings ADD CONSTRAINT flight_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE bus_bookings DROP CONSTRAINT IF EXISTS bus_bookings_trip_id_fkey;
ALTER TABLE bus_bookings ADD CONSTRAINT bus_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE auto_bookings DROP CONSTRAINT IF EXISTS auto_bookings_trip_id_fkey;
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;

ALTER TABLE trip_photos DROP CONSTRAINT IF EXISTS trip_photos_trip_id_fkey;
ALTER TABLE trip_photos ADD CONSTRAINT trip_photos_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;

ALTER TABLE payment_group_items DROP CONSTRAINT IF EXISTS payment_group_items_payment_group_id_fkey;
ALTER TABLE payment_group_items ADD CONSTRAINT payment_group_items_payment_group_id_fkey FOREIGN KEY (payment_group_id) REFERENCES payment_groups(id) ON DELETE CASCADE;

-- 3. Create ENUM Types
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('created', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_group_status_enum AS ENUM ('created', 'pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_group_type_enum AS ENUM ('whole_trip', 'single_leg', 'multi_leg');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_item_type_enum AS ENUM ('hotel', 'tour', 'bus_leg', 'flight', 'auto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_rule_type_enum AS ENUM ('percent', 'flat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_applies_to_enum AS ENUM ('whole_trip', 'any');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Convert text columns to ENUMs
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_status_check;
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_group_type_check;
ALTER TABLE payment_groups DROP CONSTRAINT IF EXISTS payment_groups_status_check;
ALTER TABLE payment_group_items DROP CONSTRAINT IF EXISTS payment_group_items_item_type_check;
ALTER TABLE discount_rules DROP CONSTRAINT IF EXISTS discount_rules_type_check;
ALTER TABLE discount_rules DROP CONSTRAINT IF EXISTS discount_rules_applies_to_check;

ALTER TABLE payments 
  ALTER COLUMN status TYPE payment_status_enum USING status::payment_status_enum;

ALTER TABLE payment_groups 
  ALTER COLUMN status TYPE payment_group_status_enum USING status::payment_group_status_enum,
  ALTER COLUMN group_type TYPE payment_group_type_enum USING group_type::payment_group_type_enum;

ALTER TABLE payment_group_items 
  ALTER COLUMN item_type TYPE payment_item_type_enum USING item_type::payment_item_type_enum;

ALTER TABLE discount_rules 
  ALTER COLUMN type TYPE discount_rule_type_enum USING type::discount_rule_type_enum,
  ALTER COLUMN applies_to TYPE discount_applies_to_enum USING applies_to::discount_applies_to_enum;

-- 5. NOT NULL Constraints
ALTER TABLE payments ALTER COLUMN amount SET NOT NULL;
ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
ALTER TABLE payments ALTER COLUMN currency SET NOT NULL;
ALTER TABLE payment_groups ALTER COLUMN total SET NOT NULL;
ALTER TABLE payment_groups ALTER COLUMN subtotal SET NOT NULL;
ALTER TABLE trips ALTER COLUMN destination SET NOT NULL;

-- 6. Check Constraints on Money Values and Dates
ALTER TABLE payments ADD CONSTRAINT payments_amount_check CHECK (amount >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_subtotal_check CHECK (subtotal >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_total_check CHECK (total >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_service_fee_check CHECK (service_fee >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_discount_amount_check CHECK (discount_amount >= 0);
ALTER TABLE payment_groups ADD CONSTRAINT payment_groups_total_invariant CHECK (total >= (subtotal - discount_amount));
ALTER TABLE payment_group_items ADD CONSTRAINT payment_group_items_amount_check CHECK (amount >= 0);

ALTER TABLE trips ADD CONSTRAINT trips_date_check CHECK (end_date >= start_date);
ALTER TABLE auto_bookings ADD CONSTRAINT auto_bookings_date_check CHECK (end_date >= start_date);
