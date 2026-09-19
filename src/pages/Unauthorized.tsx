import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-black/5">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-serif text-[#2A2A2A] mb-2">Access Denied</h1>
        <p className="text-[#2A2A2A]/60 mb-8 leading-relaxed">
          You don't have the required permissions to view this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#C84B31] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A53A23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};
