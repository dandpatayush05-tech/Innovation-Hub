import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-wandor-text tracking-[0.04em] transition-opacity hover:opacity-55"
    >
      {children}
    </button>
  );
};

export const Hero: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePlanTripClick = () => {
    navigate('/itineraries/generate');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  };

  const handleDiscoverClick = () => {
    navigate('/destinations');
  };

  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      {/* Background video (z-0) */}
      <video
        src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top gradient overlay (z-1) */}
      <div 
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* Content wrapper (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto">
        {/* Navigation bar */}
        <nav className="flex items-center justify-between px-20 max-md:px-6 pt-6 max-md:pt-5 pb-4">
          <span className="font-display text-[38px] max-md:text-[30px] text-black leading-none select-none tracking-tight">
            Yatra Setu
          </span>

          <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 max-md:hidden">
            <NavButton onClick={handleDiscoverClick}>Discover</NavButton>
            <NavButton onClick={() => navigate('/help')}>FAQs</NavButton>
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <button 
                onClick={handleDashboardClick}
                className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] transition-opacity hover:opacity-55 max-md:hidden"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] transition-opacity hover:opacity-55 max-md:hidden"
              >
                Login
              </button>
            )}
            <button 
              onClick={handlePlanTripClick}
              className="bg-wandor-dark text-[#fafafa] border-none cursor-pointer font-sans text-[15px] font-medium uppercase tracking-[0.04em] px-5 py-3.5 rounded-full transition-all hover:bg-[#333] active:scale-95"
            >
              Plan My Trip
            </button>
          </div>
        </nav>

        {/* Hero body */}
        <div className="flex flex-col items-center px-6 pt-16 pb-24 text-center">
          <h1 className="font-sans text-[clamp(40px,6vw,68px)] font-medium text-wandor-text leading-[1.08] tracking-[-0.04em] max-w-[900px] mb-8">
            One destination.<br />Endless possibilities.
          </h1>

          {/* Liquid glass prompt card */}
          <div className="relative w-[701px] max-md:w-[calc(100vw-48px)] min-h-[208px] bg-white/[0.06] border-[3px] border-white rounded-[44px] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-[20px]">
            <p className="absolute left-[29px] top-[57px] -translate-y-1/2 w-[609px] max-md:w-[calc(100%-58px)] font-sans text-xl max-md:text-[17px] font-medium text-wandor-prompt leading-relaxed break-words text-left">
              I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds....
            </p>

            <button 
              onClick={handlePlanTripClick}
              className="absolute bottom-[21px] right-[21px] w-[156px] h-14 bg-black border-none rounded-[44px] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-center font-sans text-base font-medium text-[#fafafa] uppercase tracking-[0.02em] transition-all hover:bg-[#333] active:scale-95"
            >
              Plan My Trip
            </button>

            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*,.pdf" 
              className="hidden" 
            />

            <button 
              onClick={handleUploadClick}
              aria-label="Upload inspiration"
              className="absolute left-[21px] top-[137px] w-11 h-11 bg-transparent border border-white/70 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-[14px] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Upload className="w-[18px] h-[18px] text-wandor-text flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
