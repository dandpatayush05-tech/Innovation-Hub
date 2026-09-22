import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { Footer } from '../components/layout/Footer';

export const HomeLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
