import React, { useState, useEffect } from 'react';
import { supabase, Profile, PatientReportDB, TestBooking, RecoveryPath } from '../services/supabaseClient';

interface UserProfileProps {
  userId: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<PatientReportDB[]>([]);
  const [bookings, setBookings] = useState<TestBooking[]>([]);
  const [recoveryPaths, setRecoveryPaths] = useState<RecoveryPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'bookings' | 'recovery'>('overview');

  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '' as 'M' | 'F' | 'Other' | '',
    address: '',
    emergency_contact: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        emergency_contact: profileData.emergency_contact || '',
      });

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('test_bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch recovery paths
      const { data: recoveryData, error: recoveryError } = await supabase
        .from('recovery_paths')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (recoveryError) throw recoveryError;
      setRecoveryPaths(recoveryData || []);

    } catch (error: any) {
      console.error('Error fetching profile data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('id', userId);

      if (error) throw error;

      setEditMode(false);
      fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{profile?.full_name || 'User Profile'}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-10 relative z-10">
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-[2rem] p-6 border border-rose-100">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Total Reports</p>
            <p className="text-4xl font-black text-slate-900">{reports.length}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-[2rem] p-6 border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Active Bookings</p>
            <p className="text-4xl font-black text-slate-900">
              {bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[2rem] p-6 border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Recovery Plans</p>
            <p className="text-4xl font-black text-slate-900">{recoveryPaths.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        {(['overview', 'reports', 'bookings', 'recovery'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-black uppercase tracking-widest text-xs rounded-2xl transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personal Information</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                />
              ) : (
                <p className="px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100">{profile?.full_name || 'Not set'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
              {editMode ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                />
              ) : (
                <p className="px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100">{profile?.phone || 'Not set'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  value={editData.date_of_birth}
                  onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                />
              ) : (
                <p className="px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100">
                  {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
              {editMode ? (
                <select
                  value={editData.gender}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value as any })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100">{profile?.gender || 'Not set'}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile?.address || 'Not set'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.emergency_contact}
                  onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile?.emergency_contact || 'Not set'}</p>
              )}
            </div>
          </div>

          {editMode && (
            <button
              onClick={handleUpdateProfile}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{report.name}</h3>
                    <p className="text-gray-600">
                      {new Date(report.test_date).toLocaleDateString()} • {report.age} years • {report.gender}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    report.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                    report.risk_level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    report.risk_level === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.risk_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Hemoglobin</p>
                    <p className="text-lg font-bold">{report.hemoglobin} g/dL</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">MCV</p>
                    <p className="text-lg font-bold">{report.mcv} fL</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">MCH</p>
                    <p className="text-lg font-bold">{report.mch} pg</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">MCHC</p>
                    <p className="text-lg font-bold">{report.mchc} g/dL</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">{report.classification}</p>
                  <p className="text-sm text-blue-800 mt-1">{report.analysis_summary}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{booking.test_type}</h3>
                    <p className="text-gray-600">Ref: {booking.booking_reference}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(booking.preferred_date).toLocaleDateString()} at {booking.preferred_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{booking.location_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-semibold">{booking.contact_name} - {booking.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">₹{booking.price}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'recovery' && (
        <div className="space-y-4">
          {recoveryPaths.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No recovery paths found</p>
            </div>
          ) : (
            recoveryPaths.map(recovery => (
              <div key={recovery.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Recovery Plan</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    recovery.current_status === 'Improving' ? 'bg-green-100 text-green-800' :
                    recovery.current_status === 'Stable' ? 'bg-blue-100 text-blue-800' :
                    recovery.current_status === 'Declining' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recovery.current_status}
                  </span>
                </div>

                {recovery.recommendations && recovery.recommendations.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {recovery.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recovery.ai_insights && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-purple-900">AI Insights</p>
                    <p className="text-purple-800 mt-1">{recovery.ai_insights}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
