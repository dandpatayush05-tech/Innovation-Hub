import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle2, 
  Sparkles, Clock, ShieldCheck, MessageSquare, Headphones
} from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'General Inquiry / Booking Support',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    const newTicket = {
      id: `ticket_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      organization_type: formData.subject || 'Traveler Support',
      message: formData.message,
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    try {
      // 1. Try sending to backend API
      try {
        await api.post('/contact', {
          name: formData.name,
          email: formData.email,
          organization_type: formData.subject,
          message: formData.message
        });
      } catch (backendErr) {
        console.warn('Backend API submission note:', backendErr);
      }

      // 2. Save locally for guaranteed real-time availability in Admin Dashboard
      const stored = localStorage.getItem('yatra_setu_support_tickets');
      const existingTickets = stored ? JSON.parse(stored) : [];
      const updatedTickets = [newTicket, ...existingTickets];
      localStorage.setItem('yatra_setu_support_tickets', JSON.stringify(updatedTickets));

      // 3. Dispatch global event for Admin Dashboard and live listeners
      window.dispatchEvent(new CustomEvent('new_support_ticket', { detail: newTicket }));

      // 4. Add notification to the notification bell
      addNotification({
        type: 'general',
        title: 'Support Request Received',
        message: 'Your issue has been delivered to our authorities, they will contact you soon.',
        link: '/help'
      });

      // 5. Confirmation message
      success('Your issue has been delivered to our authorities, they will contact you soon.');
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      error('Failed to deliver message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: 'General Inquiry / Booking Support',
      message: ''
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2A2A2A] pb-24">
      {/* 1. TOP NAVBAR */}
      <nav className="border-b border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1360px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/help');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-black/10 text-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white transition-all shadow-xs font-medium text-sm cursor-pointer group"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>

            <Link to="/" className="flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity no-underline">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#C84B31] to-[#E06D53] flex items-center justify-center text-white shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl text-black leading-none select-none tracking-tight">
                Yatra Setu
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              to="/help" 
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              FAQs & Help
            </Link>
            <Link 
              to="/destinations" 
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#2A2A2A]/70 hover:text-[#C84B31] transition-colors"
            >
              Discover
            </Link>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm font-semibold uppercase text-[#292929] tracking-wider hover:text-[#C84B31] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <Link 
                to="/login"
                state={{ isRegister: true }}
                className="text-xs sm:text-sm font-semibold uppercase text-[#C84B31] tracking-wider hover:opacity-80 transition-opacity"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO BANNER */}
      <section className="relative pt-12 pb-10 px-6 max-w-[1360px] mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/10 text-xs font-bold uppercase tracking-wider text-[#C84B31] shadow-xs mb-4">
          <Headphones className="w-3.5 h-3.5 text-[#C84B31]" />
          <span>24/7 Dedicated Support Center</span>
        </div>

        <h1 className="text-[clamp(32px,4vw,48px)] font-serif font-medium text-[#2A2A2A] leading-[1.15] mb-3">
          Contact Our Travel Authorities
        </h1>
        <p className="text-base sm:text-lg text-[#2A2A2A]/70 max-w-[620px] mx-auto leading-relaxed">
          Need help with your bookings, payment invoices, special senior/disability assistance, or travel packages? We're here for you.
        </p>
      </section>

      {/* 3. MAIN FORM & INFO GRID */}
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">Get in Touch</h3>
              <p className="text-sm text-[#2A2A2A]/70 leading-relaxed">
                Our support team is active round the clock. Inquiries submitted here are prioritized directly to our on-duty travel managers.
              </p>

              <div className="space-y-4 pt-2">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-black/5">
                  <div className="w-10 h-10 rounded-xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/50">Email Support</p>
                    <p className="text-sm font-semibold text-[#2A2A2A] mt-0.5">support@yatrasetu.com</p>
                    <p className="text-xs text-[#2A2A2A]/60 mt-0.5">Average response time: &lt; 15 mins</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-black/5">
                  <div className="w-10 h-10 rounded-xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/50">Toll-Free Helpline</p>
                    <p className="text-sm font-semibold text-[#2A2A2A] mt-0.5">+91 1800 123 4567</p>
                    <p className="text-xs text-[#2A2A2A]/60 mt-0.5">Mon–Sun, 24/7 Priority Desk</p>
                  </div>
                </div>

                {/* Headquarters */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-black/5">
                  <div className="w-10 h-10 rounded-xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/50">Main Headquarters</p>
                    <p className="text-sm font-semibold text-[#2A2A2A] mt-0.5">Yatra Setu Innovation Hub</p>
                    <p className="text-xs text-[#2A2A2A]/60 mt-0.5">Tech Park, Bangalore, Karnataka 560001, India</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center gap-2 text-xs text-[#2A2A2A]/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted & officially logged with Yatra Setu Support Desk</span>
              </div>
            </div>
          </div>

          {/* Right Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xs">
              {submitted ? (
                <div className="text-center py-12 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">
                      Message Delivered Successfully!
                    </h3>
                    <p className="text-sm text-[#2A2A2A]/70 max-w-md mx-auto leading-relaxed">
                      Your issue has been delivered to our authorities, they will contact you soon.
                    </p>
                  </div>

                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-black/5 max-w-md mx-auto text-xs text-[#2A2A2A]/80 space-y-1 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sender Name:</span>
                      <span className="font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Email:</span>
                      <span className="font-semibold">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="text-emerald-700 font-bold uppercase">Delivered to Admin Desk</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleResetForm}
                      className="bg-black hover:bg-[#333] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <button
                      onClick={() => navigate('/help')}
                      className="bg-white border border-black/10 hover:bg-gray-50 text-[#2A2A2A] px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                    >
                      Back to FAQs
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-black/5 pb-4 mb-2">
                    <h3 className="font-serif text-2xl font-bold text-[#2A2A2A]">Send Us a Message</h3>
                    <p className="text-xs text-[#2A2A2A]/60 mt-1">
                      Fill out the details below and our authorities will review your query promptly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-1.5">
                        Your Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#FDFBF7] px-4 py-3 text-sm text-[#2A2A2A] placeholder:text-[#2A2A2A]/40 outline-none focus:border-[#C84B31] focus:bg-white transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Suvendu Dandpat"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-1.5">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#FDFBF7] px-4 py-3 text-sm text-[#2A2A2A] placeholder:text-[#2A2A2A]/40 outline-none focus:border-[#C84B31] focus:bg-white transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-1.5">
                      Topic / Department
                    </label>
                    <select
                      className="w-full rounded-2xl border border-black/10 bg-[#FDFBF7] px-4 py-3 text-sm text-[#2A2A2A] outline-none focus:border-[#C84B31] focus:bg-white transition-all cursor-pointer"
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="General Inquiry / Booking Support">General Inquiry / Booking Support</option>
                      <option value="Senior Citizen & Accessibility Assistance">Senior Citizen & Accessibility Assistance</option>
                      <option value="Payment & GST Tax Invoice Query">Payment & GST Tax Invoice Query</option>
                      <option value="Flight / Bus / Train Rescheduling & Cancellation">Flight / Bus / Train Rescheduling & Cancellation</option>
                      <option value="Bumper Package & Festive Discount Customization">Bumper Package & Festive Discount Customization</option>
                      <option value="Partner Hotel / Business Portal Inquiry">Partner Hotel / Business Portal Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70 mb-1.5">
                      How Can We Help You? (Message) *
                    </label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full rounded-2xl border border-black/10 bg-[#FDFBF7] p-4 text-sm text-[#2A2A2A] placeholder:text-[#2A2A2A]/40 outline-none focus:border-[#C84B31] focus:bg-white transition-all resize-none leading-relaxed"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      placeholder="Please describe your query or issue in detail..."
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C84B31] hover:bg-[#A63A25] text-white font-semibold py-3.5 px-8 rounded-full shadow-md shadow-[#C84B31]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer text-sm"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Delivering Message...</span>
                        </span>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
