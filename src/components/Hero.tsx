import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Testimonials } from './Testimonials';

const NavButton = ({ children, to }: { children: React.ReactNode, to?: string }) => {
  const className = "bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-vstara-text tracking-[0.04em] transition-opacity hover:opacity-55 no-underline";
  
  if (to) {
    return <Link to={to} className={className}>{children}</Link>;
  }
  
  return (
    <button className={className}>
      {children}
    </button>
  );
};

export const Hero = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

      {/* Top gradient overlay (z-[1]) */}
      <div 
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* Content wrapper (z-[2]) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto">
        {/* Navigation bar */}
        <nav className="flex items-center justify-between px-20 max-md:px-6 pt-6 max-md:pt-5 pb-4">
          <div className="flex items-center -space-x-4">
            <img src="/logo.png" alt="Vstara Logo" className="w-24 h-24 object-contain mix-blend-multiply scale-125" />
            <span className="font-display text-[40px] max-md:text-[32px] text-black leading-none select-none mt-2 relative z-10">
              Vstara
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 max-md:hidden">
            <NavButton to="/destinations">Discover</NavButton>
            <NavButton>Pricing</NavButton>
            <NavButton>FAQs</NavButton>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/login" className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] transition-opacity hover:opacity-55 max-md:hidden">
              Login
            </Link>
            <Link to="/itineraries/generate" className="bg-vstara-dark text-[#fafafa] border-none cursor-pointer font-sans text-[15px] font-medium uppercase tracking-[0.04em] px-5 py-3.5 rounded-full transition-all hover:bg-[#333] active:scale-95 no-underline">
              Plan My Trip
            </Link>
          </div>
        </nav>

        {/* Hero body */}
        <div className="flex flex-col items-center px-6 pt-16 pb-24 text-center">
          <h1 className="font-sans text-[clamp(40px,6vw,68px)] font-medium text-vstara-text leading-[1.05] tracking-[-0.04em] max-w-[820px] mb-5">
            Your Yatra Beyond Limits with Endless Possibilities
          </h1>
          <p className="font-sans text-xl font-medium text-vstara-muted leading-relaxed max-w-[500px] mb-10">
            Tell our AI where you're going and what you love. We'll create a personalized itinerary for you.
          </p>

          {/* Liquid-glass prompt card */}
          <div className="relative w-[701px] max-md:w-[calc(100vw-48px)] min-h-[208px] bg-white/[0.06] border-[3px] border-white rounded-[44px] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-[20px]">
            <p className="absolute left-[29px] top-[57px] -translate-y-1/2 w-[609px] max-md:w-[calc(100%-58px)] font-sans text-xl max-md:text-[17px] font-medium text-vstara-prompt leading-relaxed break-words text-left">
              I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds....
            </p>

            <Link to="/itineraries/generate" className="absolute bottom-[21px] right-[21px] w-[156px] h-14 bg-black border-none rounded-[44px] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-center font-sans text-base font-medium text-[#fafafa] uppercase tracking-[0.02em] transition-all hover:bg-[#333] active:scale-95 no-underline">
              Plan My Trip
            </Link>

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
              <Upload className="w-[18px] h-[18px] text-vstara-text flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Testimonials Section */}
        <Testimonials />
      </div>
    </section>
  );
};
