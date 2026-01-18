-- ============================================================================
-- UPDATE RLS POLICIES FOR CUSTOMERS TABLES TO USE garage_uid
-- ============================================================================

-- Drop existing policies on customers table
DROP POLICY IF EXISTS "Allow read customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers for own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow update customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow service role full access on customers" ON public.customers;

-- Policy: Users can read customers from their garage only
CREATE POLICY "Allow read customers from own garage"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can insert customers for their garage only
CREATE POLICY "Allow insert customers for own garage"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can update customers from their garage only
CREATE POLICY "Allow update customers from own garage"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  )
  WITH CHECK (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Service role can do anything
CREATE POLICY "Allow service role full access on customers"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- UPDATE RLS POLICIES FOR CUSTOMER_VEHICLES TABLE
-- ============================================================================

-- Drop existing policies on customer_vehicles table
DROP POLICY IF EXISTS "Allow read vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow insert vehicles for own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow service role full access on vehicles" ON public.customer_vehicles;

-- Policy: Users can read vehicles from their garage only
CREATE POLICY "Allow read vehicles from own garage"
  ON public.customer_vehicles
  FOR SELECT
  TO authenticated
  USING (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can insert vehicles for their garage only
CREATE POLICY "Allow insert vehicles for own garage"
  ON public.customer_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can update vehicles from their garage only
CREATE POLICY "Allow update vehicles from own garage"
  ON public.customer_vehicles
  FOR UPDATE
  TO authenticated
  USING (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  )
  WITH CHECK (
    garage_uid IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Service role can do anything
CREATE POLICY "Allow service role full access on vehicles"
  ON public.customer_vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify the policies were created successfully
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('customers', 'customer_vehicles')
ORDER BY tablename, policyname;
