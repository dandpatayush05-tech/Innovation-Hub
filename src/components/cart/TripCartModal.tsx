import React from 'react';
import { useTripCart } from '../../context/TripCartContext';
import { TripSummary } from './TripSummary';
import { X } from 'lucide-react';

export const TripCartModal: React.FC = () => {
  const { isCartOpen, setIsCartOpen } = useTripCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsCartOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 text-gray-500 hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close cart"
        >
          <X className="w-5 h-5" />
        </button>
        <TripSummary onClose={() => setIsCartOpen(false)} />
      </div>
    </div>
  );
};
