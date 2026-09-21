import React from 'react';
import fawnGrazing from '../assets/landing/fawn_grazing.jpg';
import fawnStanding from '../assets/landing/fawn_standing.jpg';

export const LandingBackgroundScene = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#F4EFE4]">
      {/* 1. Paper Grain Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-10 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>

      {/* 2. Doodle Layer (Sepia outlines, mix-blend-multiply) */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply text-[#8B7355]">
        
        {/* Top Right Cloud */}
        <div className="absolute top-[10%] right-[10%] w-[120px] opacity-80 hidden md:block">
          <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M 20 40 C 10 40 10 25 20 20 C 25 10 45 5 55 15 C 70 5 90 15 90 30 C 90 40 80 40 70 40 L 20 40 Z" />
          </svg>
        </div>

        {/* Lower Left Cloud */}
        <div className="absolute bottom-[30%] left-[8%] w-[80px] opacity-60">
          <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M 20 35 C 15 35 15 25 25 25 C 28 15 45 15 50 25 C 60 20 75 25 75 35 L 20 35 Z" />
          </svg>
        </div>

        {/* Airplane & Trail (Drifting) */}
        <div className="absolute top-[20%] left-[-10%] w-[200px] plane-drift opacity-70 hidden md:block">
          <svg viewBox="0 0 200 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Trail */}
            <path d="M 0 30 Q 50 40 100 25 T 160 20" strokeDasharray="4 6" opacity="0.6" />
            {/* Paper Plane */}
            <path d="M 160 20 L 190 10 L 170 30 L 160 20 Z" />
            <path d="M 160 20 L 165 35 L 170 30" />
            <path d="M 160 20 L 175 20" />
          </svg>
        </div>

        {/* Birds */}
        <div className="absolute top-[15%] right-[25%] w-[30px] opacity-70">
          <svg viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 5 20 Q 15 10 25 20 Q 35 10 45 20" />
          </svg>
        </div>
        <div className="absolute top-[12%] right-[20%] w-[20px] opacity-60 rotate-12">
          <svg viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 5 20 Q 15 10 25 20 Q 35 10 45 20" />
          </svg>
        </div>
        <div className="absolute top-[18%] right-[18%] w-[25px] opacity-50 -rotate-12">
          <svg viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 5 20 Q 15 10 25 20 Q 35 10 45 20" />
          </svg>
        </div>

      </div>

      {/* 3. Deer Illustrations (Bottom left cluster) */}
      <div className="absolute bottom-[2%] md:bottom-[5%] left-[2%] md:left-[5%] flex items-end space-x-[-20px] mix-blend-multiply opacity-90 deer-cluster">
        
        {/* Deer 1 (Grazing) */}
        <div className="relative w-[80px] md:w-[120px] z-10 deer-sway-1">
          <img src={fawnGrazing} alt="" className="w-full h-auto rounded-lg object-contain mix-blend-multiply filter contrast-125 saturate-50" />
        </div>

        {/* Deer 2 (Standing, further back) */}
        <div className="relative w-[60px] md:w-[90px] mb-4 z-0 deer-sway-2 -scale-x-100">
          <img src={fawnStanding} alt="" className="w-full h-auto rounded-lg object-contain mix-blend-multiply filter contrast-125 saturate-50" />
        </div>

      </div>

      {/* CSS Animations */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .plane-drift {
            animation: drift 20s linear infinite;
          }
          .deer-sway-1 {
            animation: sway 4.5s ease-in-out infinite alternate;
            transform-origin: bottom center;
          }
          .deer-sway-2 {
            animation: sway 5.2s ease-in-out infinite alternate-reverse;
            transform-origin: bottom center;
          }
        }
        
        @keyframes drift {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateX(50vw); opacity: 0; }
        }
        
        @keyframes sway {
          0% { transform: rotate(-1.5deg); }
          100% { transform: rotate(1.5deg); }
        }
      `}</style>
    </div>
  );
};
