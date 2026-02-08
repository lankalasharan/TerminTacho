-- Add userId field to Report for tracking submissions (optional, can remain null for anonymity)
ALTER TABLE "Report" ADD COLUMN "userId" TEXT;

-- Add userId field to Review for tracking submissions
ALTER TABLE "Review" ADD COLUMN "userId" TEXT;

-- Create indexes on userId for performance
CREATE INDEX "idx_report_userId" ON "Report"("userId");
CREATE INDEX "idx_review_userId" ON "Review"("userId");

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Office table - Public read, service_role write
ALTER TABLE "Office" ENABLE ROW LEVEL SECURITY;

-- ProcessType table - Public read, service_role write
ALTER TABLE "ProcessType" ENABLE ROW LEVEL SECURITY;

-- Report table - Public read, service_role + users can write their own
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;

-- Review table - Public read, service_role + users can write their own
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Account table - Users can only see their own
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Session table - Users can only see their own
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- User table - Users can only see their own
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES FOR Office (Public Read)
-- ==========================================

CREATE POLICY "Public can read offices"
  ON "Office"
  FOR SELECT
  TO public, authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage offices"
  ON "Office"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- POLICIES FOR ProcessType (Public Read)
-- ==========================================

CREATE POLICY "Public can read process types"
  ON "ProcessType"
  FOR SELECT
  TO public, authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage process types"
  ON "ProcessType"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- POLICIES FOR Report (Public Read, Restricted Write)
-- ==========================================

CREATE POLICY "Public can read reports"
  ON "Report"
  FOR SELECT
  TO public, authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can submit reports"
  ON "Report"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can only insert reports with their own userId
    userId = auth.uid()
  );

CREATE POLICY "Authenticated users can update their own reports"
  ON "Report"
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can only update if userId matches
    userId = auth.uid()
  )
  WITH CHECK (
    -- Prevent changing userId
    userId = auth.uid()
  );

CREATE POLICY "Authenticated users can delete their own reports"
  ON "Report"
  FOR DELETE
  TO authenticated
  USING (
    -- Users can only delete if userId matches
    userId = auth.uid()
  );

CREATE POLICY "Service role can manage all reports"
  ON "Report"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

-- Allow anonymous submissions (for backward compatibility)
CREATE POLICY "Anon can submit reports without userId"
  ON "Report"
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Anon users can insert with null userId
    userId IS NULL
  );

-- ==========================================
-- POLICIES FOR Review (Public Read, Restricted Write)
-- ==========================================

CREATE POLICY "Public can read reviews"
  ON "Review"
  FOR SELECT
  TO public, authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can submit reviews"
  ON "Review"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    userId = auth.uid()
  );

CREATE POLICY "Authenticated users can update their own reviews"
  ON "Review"
  FOR UPDATE
  TO authenticated
  USING (
    userId = auth.uid()
  )
  WITH CHECK (
    userId = auth.uid()
  );

CREATE POLICY "Authenticated users can delete their own reviews"
  ON "Review"
  FOR DELETE
  TO authenticated
  USING (
    userId = auth.uid()
  );

CREATE POLICY "Service role can manage all reviews"
  ON "Review"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

-- Allow anonymous submissions
CREATE POLICY "Anon can submit reviews without userId"
  ON "Review"
  FOR INSERT
  TO anon
  WITH CHECK (
    userId IS NULL
  );

-- ==========================================
-- POLICIES FOR Auth Tables (Protect User Data)
-- ==========================================

CREATE POLICY "Users can read their own account"
  ON "Account"
  FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Service role can manage accounts"
  ON "Account"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own session"
  ON "Session"
  FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Service role can manage sessions"
  ON "Session"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own profile"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can manage users"
  ON "User"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- HELPER FUNCTION: Check if user owns report
-- ==========================================

CREATE OR REPLACE FUNCTION can_manage_report(report_id TEXT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Report"
    WHERE id = report_id
    AND (userId = auth.uid() OR auth.role() = 'service_role')
  );
$$;

GRANT EXECUTE ON FUNCTION can_manage_report(TEXT) TO authenticated, service_role;

-- ==========================================
-- HELPER FUNCTION: Check if user owns review
-- ==========================================

CREATE OR REPLACE FUNCTION can_manage_review(review_id TEXT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "Review"
    WHERE id = review_id
    AND (userId = auth.uid() OR auth.role() = 'service_role')
  );
$$;

GRANT EXECUTE ON FUNCTION can_manage_review(TEXT) TO authenticated, service_role;
