import React, { useState } from 'react';
import { supabase, TestBooking } from '../services/supabaseClient';

interface BookTestProps {
  userId: string;
  onBookingComplete: () => void;
}

const BookTest: React.FC<BookTestProps> = ({ userId, onBookingComplete }) => {
  const [formData, setFormData] = useState({
    testType: 'Complete Blood Count (CBC)',
    testPackage: 'Standard',
    preferredDate: '',
    preferredTime: '09:00',
    locationType: 'Home Collection' as 'Home Collection' | 'Lab Visit',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialInstructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testTypes = [
    'Complete Blood Count (CBC)',
    'Hemoglobin Test',
    'Iron Studies Panel',
    'Vitamin B12 & Folate',
    'Full Anemia Panel',
    'Comprehensive Health Check',
  ];

  const testPackages = {
    'Standard': 499,
    'Advanced': 999,
    'Premium': 1499,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const price = testPackages[formData.testPackage as keyof typeof testPackages];

      const { data, error } = await supabase
        .from('test_bookings')
        .insert([
          {
            user_id: userId,
            test_type: formData.testType,
            test_package: formData.testPackage,
            preferred_date: formData.preferredDate,
            preferred_time: formData.preferredTime,
            location_type: formData.locationType,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            pincode: formData.pincode || null,
            contact_name: formData.contactName,
            contact_phone: formData.contactPhone,
            contact_email: formData.contactEmail || null,
            special_instructions: formData.specialInstructions || null,
            price: price,
          },
        ])
        .select();

      if (error) throw error;

      setMessage(`Booking confirmed! Reference: ${data[0].booking_reference}`);
      setTimeout(() => {
        onBookingComplete();
      }, 2000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full"></div>
        
        <div className="mb-10 relative z-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Schedule Blood Test</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional Laboratory Services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {/* Test Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">1</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Test Selection</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Test Type *
                </label>
                <select
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                  required
                >
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Package *
                </label>
                <select
                  name="testPackage"
                  value={formData.testPackage}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                  required
                >
                  {Object.entries(testPackages).map(([pkg, price]) => (
                    <option key={pkg} value={pkg}>
                      {pkg} - ₹{price}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">2</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Appointment Time</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={minDate}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Type */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">3</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Collection Type</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, locationType: 'Home Collection' }))}
                className={`px-8 py-6 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-wide ${
                  formData.locationType === 'Home Collection'
                    ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 shadow-lg shadow-rose-100'
                    : 'border-slate-200 hover:border-rose-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                🏠 Home Collection
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, locationType: 'Lab Visit' }))}
                className={`px-8 py-6 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-wide ${
                  formData.locationType === 'Lab Visit'
                    ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 shadow-lg shadow-rose-100'
                    : 'border-slate-200 hover:border-rose-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                🏥 Lab Visit
              </button>
            </div>
          </div>

          {/* Address Fields (show for Home Collection) */}
          {formData.locationType === 'Home Collection' && (
            <div className="space-y-6 p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-[2rem] border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Collection Address</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                  required={formData.locationType === 'Home Collection'}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                    required={formData.locationType === 'Home Collection'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                    required={formData.locationType === 'Home Collection'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit code"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                    required={formData.locationType === 'Home Collection'}
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">4</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Contact Details</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">5</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Additional Information</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Special Instructions (Optional)
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm resize-none"
                placeholder="Any special requirements, allergies, or notes..."
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-6 rounded-2xl border-2 font-bold text-center ${
              message.includes('confirmed')
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-800'
                : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 text-sm"
          >
            {loading ? 'Processing...' : `Book Now - ₹${testPackages[formData.testPackage as keyof typeof testPackages]}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookTest;
