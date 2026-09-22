import React from 'react';
import { TripSummary } from '../components/cart/TripSummary';
import { useNavigate } from 'react-router-dom';

export const TripCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <TripSummary onCheckoutComplete={() => navigate('/dashboard/bookings')} />
    </div>
  );
};
