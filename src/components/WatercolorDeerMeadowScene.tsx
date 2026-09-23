import React, { useEffect, useRef } from 'react';
import meadowBg from '../assets/watercolor/meadow_bg.jpg';

export const WatercolorDeerMeadowScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Minimal floating warm pollen & light dust spores
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      swaySpeed: number;
      swayAngle: number;
      opacity: number;
      color: string;
    }

    const particles: Particle[] = [];
    const count = 22; // Kept very light & minimal
    const colors = [
      'rgba(255, 243, 215, 0.75)', // warm sun dust
      'rgba(255, 218, 185, 0.65)', // peach spore
      'rgba(240, 247, 235, 0.6)'   // soft mist particle
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.2,
        speedX: Math.random() * 0.35 + 0.15,
        speedY: Math.random() * 0.2 + 0.05,
        swaySpeed: Math.random() * 0.015 + 0.008,
        swayAngle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.swayAngle += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.swayAngle) * 0.6;
        p.y += p.speedY;

        if (p.x > width + 10) p.x = -10;
        if (p.y > height + 10) p.y = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(255, 230, 180, 0.4)';
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#FAF7F2]">
      {/* 1. Seamless Minimalist Watercolor Meadow & Journey Road */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat watercolor-bg-drift scale-[1.02]"
        style={{ backgroundImage: `url(${meadowBg})` }}
      />

      {/* 2. Soft Watercolor Paper Texture Wash */}
      <svg className="absolute inset-0 w-full h-full opacity-10 mix-blend-multiply pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="subtlePaperNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#subtlePaperNoise)" />
      </svg>

      {/* 3. Soft Warm Sun Diffused Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-rose-300/10 mix-blend-soft-light sun-glow-pulse" />

      {/* 4. Minimal Floating Sun Dust & Light Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* CSS Animations */}
      <style>{`
        @keyframes watercolorBgDrift {
          0% { transform: scale(1.01) translate(0, 0); }
          50% { transform: scale(1.03) translate(-0.4%, -0.3%); }
          100% { transform: scale(1.01) translate(0, 0); }
        }
        .watercolor-bg-drift {
          animation: watercolorBgDrift 30s ease-in-out infinite;
        }

        @keyframes sunGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        .sun-glow-pulse {
          animation: sunGlow 10s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};
