import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Calendar, Users, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createAutoBooking } from '../api/auto';
import { Checkout } from '../components/Checkout';

export const AutoTransport = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    pickup_location: '',
    dropoff_location: '',
    start_date: '',
    passenger_count: 1,
    vehicle_type: 'car',
    additional_instructions: ''
  });

  // Calculate estimated fare (mocked based on vehicle type)
  const estimatedFare = {
    car: '$45 - $60',
    suv: '$65 - $80',
    van: '$90 - $120',
    auto_rickshaw: '$15 - $25'
  }[formData.vehicle_type] || '$50';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createAutoBooking({
        ...formData,
        passenger_count: Number(formData.passenger_count),
        // Ensure valid ISO date format
        start_date: new Date(formData.start_date).toISOString()
      });
      setBookingId(res.booking.id);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit transport request');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#2A2A2A] flex items-center gap-3">
          <Car className="w-8 h-8 text-[#C84B31]" />
          Book Local Transport
        </h1>
        <p className="text-[#2A2A2A]/60 mt-2">Request a ride for your upcoming journey.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C84B31]" /> Pickup Location
                </label>
                <input
                  type="text"
                  name="pickup_location"
                  required
                  value={formData.pickup_location}
                  onChange={handleChange}
                  placeholder="e.g. Airport Terminal 1"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C84B31]" /> Dropoff Location
                </label>
                <input
                  type="text"
                  name="dropoff_location"
                  required
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  placeholder="e.g. Grand Hotel Paris"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C84B31]" /> Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C84B31]" /> Passengers
                </label>
                <input
                  type="number"
                  name="passenger_count"
                  min="1"
                  required
                  value={formData.passenger_count}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#C84B31]" /> Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31] bg-white"
                >
                  <option value="car">Standard Car</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="auto_rickshaw">Auto Rickshaw</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C84B31]" /> Additional Instructions
              </label>
              <textarea
                name="additional_instructions"
                value={formData.additional_instructions}
                onChange={handleChange}
                placeholder="Flight numbers, child seat requirements, etc."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-[#C84B31]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-[#333] transition-colors flex justify-center items-center gap-2"
            >
              Review Request <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-black/5">
              <h3 className="text-lg font-medium text-[#2A2A2A] mb-4">Route Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[#2A2A2A]/60">From</span>
                  <span className="font-medium text-[#2A2A2A]">{formData.pickup_location}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[#2A2A2A]/60">To</span>
                  <span className="font-medium text-[#2A2A2A]">{formData.dropoff_location}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[#2A2A2A]/60">Date & Time</span>
                  <span className="font-medium text-[#2A2A2A]">{new Date(formData.start_date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-4">
                  <span className="text-[#2A2A2A]/60">Vehicle</span>
                  <span className="font-medium text-[#2A2A2A] capitalize">{formData.vehicle_type.replace('_', ' ')} ({formData.passenger_count} Pax)</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#2A2A2A] font-medium">Estimated Fare</span>
                  <span className="text-2xl font-serif text-[#C84B31]">{estimatedFare}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-4 rounded-xl font-medium border border-black/10 hover:bg-black/5 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-[#C84B31] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#A63A25] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Confirm & Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && bookingId && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-lg mx-auto py-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-[#2A2A2A]">Secure Payment</h3>
              <p className="text-sm text-[#2A2A2A]/60 mt-1">Complete your transaction to reserve your transport.</p>
            </div>
            
            <Checkout 
              bookingId={bookingId}
              bookingType="auto"
              onSuccess={() => setStep(4)}
              onCancel={() => setStep(2)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-serif text-[#2A2A2A] mb-2">Transport Confirmed</h2>
            <p className="text-[#2A2A2A]/60 mb-8 max-w-md mx-auto">
              Your transport request has been paid for and sent to our local partners. We will notify you once a driver is assigned.
            </p>
            <div className="bg-[#FDFBF7] border border-black/5 rounded-xl p-4 inline-block mb-8">
              <span className="text-sm text-[#2A2A2A]/60 uppercase tracking-wide">Status</span>
              <p className="font-medium text-[#2A2A2A] mt-1 text-lg">Confirmed</p>
            </div>
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-[#333] transition-colors"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
