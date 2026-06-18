-- ============================================================
-- Brews Lee — Complete Database Schema with Encryption
-- ============================================================
--
-- ⚠️  SETUP REQUIRED BEFORE FIRST RUN  ⚠️
--
-- You MUST register the master encryption key in Supabase Vault
-- BEFORE running this script. In the Supabase SQL Editor, run:
--
--   SELECT vault.create_secret(
--     'REPLACE_WITH_YOUR_STRONG_64_CHAR_SECRET',
--     'brews_lee_enc_key',
--     'Brews Lee PII master encryption key'
--   );
--
-- Generate a strong key at: https://generate-secret.vercel.app/64
-- NEVER commit the key value to git or put it in source code.
--
-- After that one-time setup, paste and run THIS entire script.
-- It is safe to re-run on an existing database (idempotent).
-- ============================================================


-- ──────────────────────────────────────
-- 0. ENCRYPTION INFRASTRUCTURE
-- ──────────────────────────────────────

-- pgcrypto provides pgp_sym_encrypt / pgp_sym_decrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Private schema keeps the key-retrieval function out of the public API surface
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

-- Internal function: fetches the master key from Supabase Vault.
-- SECURITY DEFINER makes it execute as the owner (postgres) who can read vault.decrypted_secrets.
-- The raw key is never returned to any client — it stays inside DB function calls only.
CREATE OR REPLACE FUNCTION private.get_enc_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, public
AS $$
DECLARE
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets
  WHERE name = 'brews_lee_enc_key'
  LIMIT 1;

  IF v_key IS NULL THEN
    RAISE EXCEPTION
      '[BrewsLee] Encryption key "brews_lee_enc_key" not found in Supabase Vault. '
      'Run the one-time vault.create_secret(...) setup command first.';
  END IF;

  RETURN v_key;
END;
$$;

-- Revoke direct invocation from all unprivileged roles
REVOKE ALL ON FUNCTION private.get_enc_key() FROM PUBLIC;


-- ──────────────────────────────────────
-- 1. PROFILES TABLE
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name       text,
  email      text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns for cart & favorites persistence (safe if already exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_products jsonb DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cart jsonb DEFAULT '[]';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ──────────────────────────────────────
-- 2. ADDRESSES TABLE
--    Sensitive PII columns are stored as encrypted bytea:
--      • full_name       — identifies the person
--      • mobile          — personal phone number
--      • street_address  — precise home/work location
--    Non-sensitive columns (barangay, city, province, zip_code)
--    remain as plain text for query efficiency.
-- ──────────────────────────────────────

-- Fresh install: create table with bytea PII columns
CREATE TABLE IF NOT EXISTS public.addresses (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  full_name      bytea NOT NULL,       -- ★ encrypted
  mobile         bytea NOT NULL,       -- ★ encrypted
  street_address bytea NOT NULL,       -- ★ encrypted
  barangay       text NOT NULL,
  city           text NOT NULL,
  province       text NOT NULL,
  zip_code       text NOT NULL,
  created_at     timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── Migration: Encrypt any existing plain-text rows (safe to re-run) ──
DO $$
DECLARE
  v_key text;
BEGIN
  -- Only run if full_name column is still plain text (not yet encrypted)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'addresses'
      AND column_name  = 'full_name'
      AND data_type    = 'text'
  ) THEN
    v_key := private.get_enc_key();

    -- 1. Add temporary encrypted shadow columns
    ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS full_name_enc      bytea;
    ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS mobile_enc         bytea;
    ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS street_address_enc bytea;

    -- 2. Encrypt all existing rows into the shadow columns
    UPDATE public.addresses SET
      full_name_enc      = pgp_sym_encrypt(full_name,      v_key)::bytea,
      mobile_enc         = pgp_sym_encrypt(mobile,         v_key)::bytea,
      street_address_enc = pgp_sym_encrypt(street_address, v_key)::bytea;

    -- 3. Drop old plain-text columns
    ALTER TABLE public.addresses DROP COLUMN full_name;
    ALTER TABLE public.addresses DROP COLUMN mobile;
    ALTER TABLE public.addresses DROP COLUMN street_address;

    -- 4. Rename shadow columns to the original names
    ALTER TABLE public.addresses RENAME COLUMN full_name_enc      TO full_name;
    ALTER TABLE public.addresses RENAME COLUMN mobile_enc         TO mobile;
    ALTER TABLE public.addresses RENAME COLUMN street_address_enc TO street_address;

    -- 5. Restore NOT NULL constraints
    ALTER TABLE public.addresses ALTER COLUMN full_name      SET NOT NULL;
    ALTER TABLE public.addresses ALTER COLUMN mobile         SET NOT NULL;
    ALTER TABLE public.addresses ALTER COLUMN street_address SET NOT NULL;
  END IF;
END $$;

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies still guard row-level access; encryption guards column-level data
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);


-- ──────────────────────────────────────
-- 3. ORDERS TABLE
--    Sensitive columns stored as encrypted bytea:
--      • payment_method  — financial method (COD/GCash)
--      • address         — full delivery address snapshot (PII)
--    Non-sensitive columns (status, delivery_type, items, total)
--    remain as plain text/jsonb/numeric.
-- ──────────────────────────────────────

-- Fresh install: create table with bytea PII columns
CREATE TABLE IF NOT EXISTS public.orders (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  total          numeric NOT NULL,
  status         text NOT NULL,
  payment_method bytea NOT NULL,    -- ★ encrypted
  delivery_type  text NOT NULL,
  items          jsonb NOT NULL,
  address        bytea,             -- ★ encrypted (nullable — pickup orders have no address)
  created_at     timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ── Migration: Encrypt existing plain-text rows in orders (safe to re-run) ──
DO $$
DECLARE
  v_key text;
BEGIN
  -- Migrate payment_method if it is still a text column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'orders'
      AND column_name  = 'payment_method'
      AND data_type    = 'text'
  ) THEN
    v_key := private.get_enc_key();

    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method_enc bytea;
    UPDATE public.orders SET payment_method_enc = pgp_sym_encrypt(payment_method, v_key)::bytea;
    ALTER TABLE public.orders DROP COLUMN payment_method;
    ALTER TABLE public.orders RENAME COLUMN payment_method_enc TO payment_method;
    ALTER TABLE public.orders ALTER COLUMN payment_method SET NOT NULL;
  END IF;

  -- Migrate address if it is still a jsonb column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'orders'
      AND column_name  = 'address'
      AND data_type    = 'jsonb'
  ) THEN
    v_key := COALESCE(v_key, private.get_enc_key());

    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_enc bytea;
    UPDATE public.orders
      SET address_enc = pgp_sym_encrypt(address::text, v_key)::bytea
      WHERE address IS NOT NULL;
    ALTER TABLE public.orders DROP COLUMN address;
    ALTER TABLE public.orders RENAME COLUMN address_enc TO address;
    -- address remains nullable (pickup orders)
  END IF;
END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
CREATE POLICY "Users can delete their own orders" ON public.orders
  FOR DELETE USING (auth.uid() = user_id);


-- ──────────────────────────────────────
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, favorite_products, cart)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '[]'::jsonb,
    '[]'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ──────────────────────────────────────
-- 5. WAITLIST TABLE (Early Access signups)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text UNIQUE NOT NULL,
  signed_up_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous visitors) to insert
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only admins/service role can read the list (no public SELECT)
DROP POLICY IF EXISTS "No public reads on waitlist" ON public.waitlist;


-- ══════════════════════════════════════════════════════════════
-- 6. SECURE RPC FUNCTIONS
--
-- These are the ONLY interface the frontend should use to read or
-- write the encrypted tables. They are SECURITY DEFINER so they
-- can call private.get_enc_key() to retrieve the vault key, and
-- they enforce auth.uid() ownership checks internally.
--
-- The raw key NEVER leaves the database — only plaintext values
-- pass through to the caller after decryption.
-- ══════════════════════════════════════════════════════════════


-- ── 6a. ADDRESSES ──────────────────────────────────────────────

-- INSERT a new address with encrypted PII fields
-- Returns a JSON object { id: uuid } for the new row
CREATE OR REPLACE FUNCTION public.insert_address(
  p_full_name      text,
  p_mobile         text,
  p_street_address text,
  p_barangay       text,
  p_city           text,
  p_province       text,
  p_zip_code       text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_key text := private.get_enc_key();
  v_uid uuid := auth.uid();
  v_id  uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  INSERT INTO public.addresses (
    user_id, full_name, mobile, street_address,
    barangay, city, province, zip_code
  )
  VALUES (
    v_uid,
    pgp_sym_encrypt(p_full_name,      v_key)::bytea,
    pgp_sym_encrypt(p_mobile,         v_key)::bytea,
    pgp_sym_encrypt(p_street_address, v_key)::bytea,
    p_barangay, p_city, p_province, p_zip_code
  )
  RETURNING id INTO v_id;

  RETURN json_build_object('id', v_id);
END;
$$;

-- SELECT all addresses for the authenticated user, returning decrypted PII
CREATE OR REPLACE FUNCTION public.get_addresses()
RETURNS TABLE (
  id             uuid,
  full_name      text,
  mobile         text,
  street_address text,
  barangay       text,
  city           text,
  province       text,
  zip_code       text,
  created_at     timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_key text := private.get_enc_key();
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    pgp_sym_decrypt(a.full_name,      v_key),
    pgp_sym_decrypt(a.mobile,         v_key),
    pgp_sym_decrypt(a.street_address, v_key),
    a.barangay,
    a.city,
    a.province,
    a.zip_code,
    a.created_at
  FROM public.addresses a
  WHERE a.user_id = v_uid;
END;
$$;

-- UPDATE an address — re-encrypts the PII fields
CREATE OR REPLACE FUNCTION public.update_address(
  p_id             uuid,
  p_full_name      text,
  p_mobile         text,
  p_street_address text,
  p_barangay       text,
  p_city           text,
  p_province       text,
  p_zip_code       text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_key text := private.get_enc_key();
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  UPDATE public.addresses SET
    full_name      = pgp_sym_encrypt(p_full_name,      v_key)::bytea,
    mobile         = pgp_sym_encrypt(p_mobile,         v_key)::bytea,
    street_address = pgp_sym_encrypt(p_street_address, v_key)::bytea,
    barangay       = p_barangay,
    city           = p_city,
    province       = p_province,
    zip_code       = p_zip_code
  WHERE id = p_id AND user_id = v_uid;
END;
$$;

-- DELETE an address (ownership-checked internally)
CREATE OR REPLACE FUNCTION public.delete_address(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  DELETE FROM public.addresses
  WHERE id = p_id AND user_id = v_uid;
END;
$$;


-- ── 6b. ORDERS ─────────────────────────────────────────────────

-- INSERT a new order — encrypts payment_method and address snapshot
-- Returns JSON { id, created_at } for the newly created row
CREATE OR REPLACE FUNCTION public.insert_order(
  p_total          numeric,
  p_status         text,
  p_payment_method text,
  p_delivery_type  text,
  p_items          jsonb,
  p_address        jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_key     text := private.get_enc_key();
  v_uid     uuid := auth.uid();
  v_id      uuid;
  v_created timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  INSERT INTO public.orders (
    user_id, total, status, payment_method, delivery_type, items, address
  )
  VALUES (
    v_uid,
    p_total,
    p_status,
    pgp_sym_encrypt(p_payment_method, v_key)::bytea,
    p_delivery_type,
    p_items,
    CASE
      WHEN p_address IS NOT NULL
        THEN pgp_sym_encrypt(p_address::text, v_key)::bytea
      ELSE NULL
    END
  )
  RETURNING id, created_at INTO v_id, v_created;

  RETURN json_build_object('id', v_id, 'created_at', v_created);
END;
$$;

-- SELECT all orders for the authenticated user, returning decrypted fields
CREATE OR REPLACE FUNCTION public.get_orders()
RETURNS TABLE (
  id             uuid,
  total          numeric,
  status         text,
  payment_method text,
  delivery_type  text,
  items          jsonb,
  address        jsonb,
  created_at     timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_key text := private.get_enc_key();
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.total,
    o.status,
    pgp_sym_decrypt(o.payment_method, v_key),
    o.delivery_type,
    o.items,
    CASE
      WHEN o.address IS NOT NULL
        THEN pgp_sym_decrypt(o.address, v_key)::jsonb
      ELSE NULL
    END,
    o.created_at
  FROM public.orders o
  WHERE o.user_id = v_uid
  ORDER BY o.created_at DESC;
END;
$$;

-- DELETE an order (ownership-checked internally)
CREATE OR REPLACE FUNCTION public.delete_order(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[BrewsLee] Not authenticated';
  END IF;

  DELETE FROM public.orders
  WHERE id = p_id AND user_id = v_uid;
END;
$$;
