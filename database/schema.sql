-- =====================================================
-- HemoScan AI - Complete Database Schema for Supabase
-- =====================================================
-- This script will:
-- 1. DROP all existing tables and functions (clean slate)
-- 2. CREATE all tables with proper relationships
-- 3. SET UP Row Level Security policies
-- 4. CREATE triggers and functions for automation
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL EXISTING TABLES (CLEAN UP)
-- =====================================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.recovery_paths CASCADE;
DROP TABLE IF EXISTS public.test_bookings CASCADE;
DROP TABLE IF EXISTS public.patient_reports CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_booking_reference() CASCADE;
DROP FUNCTION IF EXISTS get_report_history(UUID) CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- -----------------------------------------------------
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- -----------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS POLICIES FOR PROFILES
-- -----------------------------------------------------
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------
-- 2. PATIENT REPORTS TABLE
-- -----------------------------------------------------
CREATE TABLE public.patient_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient Information
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F', 'Other')),
  
  -- Blood Test Results
  hemoglobin DECIMAL(5,2) NOT NULL CHECK (hemoglobin >= 0 AND hemoglobin <= 30),
  mcv DECIMAL(5,2) NOT NULL CHECK (mcv >= 0 AND mcv <= 200),
  mch DECIMAL(5,2) NOT NULL CHECK (mch >= 0 AND mch <= 100),
  mchc DECIMAL(5,2) NOT NULL CHECK (mchc >= 0 AND mchc <= 100),
  
  -- Analysis Results
  classification TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
  analysis_summary TEXT,
  
  -- Lab Report Metadata
  report_file_url TEXT,
  report_file_type TEXT,
  
  -- Timestamps
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.patient_reports ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS POLICIES FOR PATIENT REPORTS
-- -----------------------------------------------------
CREATE POLICY "Users can view own reports" 
  ON public.patient_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" 
  ON public.patient_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" 
  ON public.patient_reports FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" 
  ON public.patient_reports FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_patient_reports_user_id ON public.patient_reports(user_id);
CREATE INDEX idx_patient_reports_test_date ON public.patient_reports(test_date DESC);

-- -----------------------------------------------------
-- 3. RECOVERY PATHS TABLE
-- -----------------------------------------------------
CREATE TABLE public.recovery_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES public.patient_reports(id) ON DELETE CASCADE NOT NULL,
  
  -- Recovery Information
  current_status TEXT NOT NULL CHECK (current_status IN ('Improving', 'Stable', 'Declining', 'Critical')),
  recommendations TEXT[] NOT NULL,
  dietary_suggestions TEXT[],
  medication_notes TEXT,
  lifestyle_changes TEXT[],
  follow_up_date DATE,
  
  -- Progress Tracking
  hemoglobin_trend TEXT CHECK (hemoglobin_trend IN ('Increasing', 'Stable', 'Decreasing')),
  overall_improvement_percentage DECIMAL(5,2),
  
  -- AI Generated Insights
  ai_insights TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.recovery_paths ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS POLICIES FOR RECOVERY PATHS
-- -----------------------------------------------------
CREATE POLICY "Users can view own recovery paths" 
  ON public.recovery_paths FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recovery paths" 
  ON public.recovery_paths FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery paths" 
  ON public.recovery_paths FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_recovery_paths_user_id ON public.recovery_paths(user_id);
CREATE INDEX idx_recovery_paths_report_id ON public.recovery_paths(report_id);

-- -----------------------------------------------------
-- 4. TEST BOOKINGS TABLE
-- -----------------------------------------------------
CREATE TABLE public.test_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Booking Information
  test_type TEXT NOT NULL,
  test_package TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  
  -- Location
  location_type TEXT NOT NULL CHECK (location_type IN ('Home Collection', 'Lab Visit')),
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  
  -- Contact
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  
  -- Booking Status
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  booking_reference TEXT UNIQUE,
  
  -- Payment
  price DECIMAL(10,2),
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  
  -- Additional Notes
  special_instructions TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.test_bookings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS POLICIES FOR TEST BOOKINGS
-- -----------------------------------------------------
CREATE POLICY "Users can view own bookings" 
  ON public.test_bookings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" 
  ON public.test_bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" 
  ON public.test_bookings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_test_bookings_user_id ON public.test_bookings(user_id);
CREATE INDEX idx_test_bookings_status ON public.test_bookings(status);
CREATE INDEX idx_test_bookings_date ON public.test_bookings(preferred_date);

-- =====================================================
-- STEP 3: CREATE TRIGGERS & FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- TRIGGER FUNCTION: Auto-update updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_reports_updated_at
  BEFORE UPDATE ON public.patient_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recovery_paths_updated_at
  BEFORE UPDATE ON public.recovery_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_bookings_updated_at
  BEFORE UPDATE ON public.test_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- TRIGGER FUNCTION: Auto-generate booking reference
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference = 'HMO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to test_bookings table
CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON public.test_bookings
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION generate_booking_reference();

-- -----------------------------------------------------
-- FUNCTION: Get report history with trends
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION get_report_history(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  test_date TIMESTAMP WITH TIME ZONE,
  hemoglobin DECIMAL,
  mcv DECIMAL,
  mch DECIMAL,
  mchc DECIMAL,
  classification TEXT,
  risk_level TEXT,
  hemoglobin_change DECIMAL,
  trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_reports AS (
    SELECT 
      pr.id,
      pr.test_date,
      pr.hemoglobin,
      pr.mcv,
      pr.mch,
      pr.mchc,
      pr.classification,
      pr.risk_level,
      LAG(pr.hemoglobin) OVER (ORDER BY pr.test_date) as prev_hemoglobin,
      ROW_NUMBER() OVER (ORDER BY pr.test_date DESC) as rn
    FROM public.patient_reports pr
    WHERE pr.user_id = p_user_id
    ORDER BY pr.test_date DESC
  )
  SELECT 
    rr.id,
    rr.test_date,
    rr.hemoglobin,
    rr.mcv,
    rr.mch,
    rr.mchc,
    rr.classification,
    rr.risk_level,
    CASE 
      WHEN rr.prev_hemoglobin IS NOT NULL 
      THEN ROUND((rr.hemoglobin - rr.prev_hemoglobin)::DECIMAL, 2)
      ELSE NULL
    END as hemoglobin_change,
    CASE 
      WHEN rr.prev_hemoglobin IS NULL THEN 'N/A'
      WHEN rr.hemoglobin > rr.prev_hemoglobin THEN 'Improving'
      WHEN rr.hemoglobin < rr.prev_hemoglobin THEN 'Declining'
      ELSE 'Stable'
    END as trend
  FROM ranked_reports rr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: ADDITIONAL CONFIGURATIONS
-- =====================================================

-- -----------------------------------------------------
-- STORAGE BUCKET SETUP (Create in Supabase Dashboard)
-- -----------------------------------------------------
-- Note: Create this bucket manually in Supabase Dashboard -> Storage
-- Bucket name: lab-reports
-- Make it private with RLS policies
-- File path structure: {user_id}/{report_id}/{filename}

-- -----------------------------------------------------
-- HELPER FUNCTIONS
-- -----------------------------------------------------

-- Function to calculate health score
CREATE OR REPLACE FUNCTION calculate_health_score(
  p_hemoglobin DECIMAL,
  p_mcv DECIMAL,
  p_gender TEXT
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 100;
  normal_hb_min DECIMAL;
  normal_hb_max DECIMAL;
BEGIN
  -- Set normal hemoglobin range based on gender
  IF p_gender = 'M' THEN
    normal_hb_min := 13.5;
    normal_hb_max := 17.5;
  ELSIF p_gender = 'F' THEN
    normal_hb_min := 12.0;
    normal_hb_max := 15.5;
  ELSE
    normal_hb_min := 12.0;
    normal_hb_max := 16.0;
  END IF;

  -- Deduct points for abnormal hemoglobin
  IF p_hemoglobin < normal_hb_min THEN
    score := score - ROUND((normal_hb_min - p_hemoglobin) * 10);
  ELSIF p_hemoglobin > normal_hb_max THEN
    score := score - ROUND((p_hemoglobin - normal_hb_max) * 5);
  END IF;

  -- Deduct points for abnormal MCV
  IF p_mcv < 80 OR p_mcv > 100 THEN
    score := score - 10;
  END IF;

  -- Ensure score is between 0 and 100
  IF score < 0 THEN score := 0; END IF;
  IF score > 100 THEN score := 100; END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- Check if all tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Check if all policies were created
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ HemoScan AI Database Schema Created Successfully!';
  RAISE NOTICE '📋 Tables Created: profiles, patient_reports, recovery_paths, test_bookings';
  RAISE NOTICE '🔒 Row Level Security Enabled on All Tables';
  RAISE NOTICE '⚡ Triggers and Functions Created';
  RAISE NOTICE '🎉 Database is ready for use!';
END $$;
