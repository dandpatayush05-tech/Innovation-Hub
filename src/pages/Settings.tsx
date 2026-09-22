import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Mail, Shield, Bell, Globe, 
  CreditCard, Check, Sparkles, Moon, Sun
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');
  const [name, setName] = useState(user?.name || 'Ayush Dandpat');
  const [email, setEmail] = useState(user?.email || 'traveler@yatrasetu.com');
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('English (IN)');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsDelayAlerts, setSmsDelayAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Account settings updated successfully!');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 pb-12 text-[#2A2A2A]">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C84B31] bg-[#C84B31]/10 px-2.5 py-0.5 rounded-full">
          Account Settings
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#2A2A2A] mt-2">
          Profile & Preferences
        </h1>
        <p className="text-sm text-[#2A2A2A]/70 mt-1">
          Manage your traveler profile, AI trip defaults, notification alerts, and security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#C84B31] text-white shadow-md shadow-[#C84B31]/20'
              : 'text-gray-600 hover:bg-black/5 hover:text-black'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-[#C84B31] text-white shadow-md shadow-[#C84B31]/20'
              : 'text-gray-600 hover:bg-black/5 hover:text-black'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Travel Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-[#C84B31] text-white shadow-md shadow-[#C84B31]/20'
              : 'text-gray-600 hover:bg-black/5 hover:text-black'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Disruption Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#C84B31] text-white shadow-md shadow-[#C84B31]/20'
              : 'text-gray-600 hover:bg-black/5 hover:text-black'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Role</span>
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="w-16 h-16 rounded-full bg-[#C84B31]/10 text-[#C84B31] border-2 border-[#C84B31]/20 flex items-center justify-center text-xl font-bold font-serif">
              {name.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2A2A2A]">{name}</h3>
              <span className="text-xs font-mono font-semibold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {user?.role || 'Traveler'} Member
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FDFBF7] border border-black/10 focus:border-[#C84B31] focus:bg-white focus:outline-none text-sm transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FDFBF7] border border-black/10 focus:border-[#C84B31] focus:bg-white focus:outline-none text-sm transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-black/5">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#C84B31] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#A63A25] active:scale-98 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#C84B31]/20"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Travel Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#2A2A2A]">Localization & AI Customization</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70">Preferred Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FDFBF7] border border-black/10 focus:border-[#C84B31] focus:bg-white focus:outline-none text-sm"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]/70">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FDFBF7] border border-black/10 focus:border-[#C84B31] focus:bg-white focus:outline-none text-sm"
              >
                <option value="English (IN)">English (India)</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#2A2A2A]">Live Trip & Disruption Alerts</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FDFBF7] border border-black/5 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[#2A2A2A]">WhatsApp & SMS Live Flight Reschedules</p>
                <p className="text-xs text-[#2A2A2A]/60">Instant AI proposals sent directly to your phone when flight delays occur.</p>
              </div>
              <input
                type="checkbox"
                checked={smsDelayAlerts}
                onChange={(e) => setSmsDelayAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#C84B31] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FDFBF7] border border-black/5 cursor-pointer">
              <div>
                <p className="text-sm font-bold text-[#2A2A2A]">Email Booking Summaries & Receipts</p>
                <p className="text-xs text-[#2A2A2A]/60">Receive GST-compliant invoices and check-in codes on trip confirmation.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#C84B31] rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#2A2A2A]">Role-Based Access & Security</h3>
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-black/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-gray-500">Current RBAC Role</span>
              <span className="text-xs font-bold uppercase text-[#C84B31] bg-[#C84B31]/10 px-3 py-1 rounded-full">
                {user?.role || 'Traveler'}
              </span>
            </div>
            <p className="text-xs text-[#2A2A2A]/70">
              Authenticated session active via custom JWT middleware with Supabase Realtime synchronization.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
