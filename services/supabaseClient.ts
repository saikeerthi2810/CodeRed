import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? 'Present' : 'MISSING'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Present' : 'MISSING'}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'M' | 'F' | 'Other' | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientReportDB {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  hemoglobin: number;
  mcv: number;
  mch: number;
  mchc: number;
  classification: string;
  confidence_score: number;
  risk_level: string;
  analysis_summary: string | null;
  report_file_url: string | null;
  report_file_type: string | null;
  test_date: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryPath {
  id: string;
  user_id: string;
  report_id: string;
  current_status: 'Improving' | 'Stable' | 'Declining' | 'Critical';
  recommendations: string[];
  dietary_suggestions: string[] | null;
  medication_notes: string | null;
  lifestyle_changes: string[] | null;
  follow_up_date: string | null;
  hemoglobin_trend: 'Increasing' | 'Stable' | 'Decreasing' | null;
  overall_improvement_percentage: number | null;
  ai_insights: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestBooking {
  id: string;
  user_id: string;
  test_type: string;
  test_package: string | null;
  preferred_date: string;
  preferred_time: string;
  location_type: 'Home Collection' | 'Lab Visit';
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  booking_reference: string | null;
  price: number | null;
  payment_status: 'Pending' | 'Paid' | 'Failed';
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}
