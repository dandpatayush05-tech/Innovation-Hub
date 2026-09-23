import React, { useEffect, useRef } from 'react';
import meadowBg from '../assets/watercolor/meadow_bg.jpg';
import deerGrazing from '../assets/watercolor/deer_grazing.jpg';
import deerStanding from '../assets/watercolor/deer_standing.jpg';
import deerFawn from '../assets/watercolor/deer_fawn.jpg';

export const WatercolorDeerMeadowScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating pollen, light dust, and pastel petals
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

    // Particle definition: petals and luminous pollen
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      swaySpeed: number;
      swayAngle: number;
      swayRadius: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      type: 'petal' | 'pollen' | 'leaf';
      color: string;
    }

    const particles: Particle[] = [];
    const count = 35;
    const colors = [
      'rgba(255, 182, 193, 0.65)', // pink petal
      'rgba(255, 218, 185, 0.6)',  // peach
      'rgba(255, 239, 180, 0.7)',  // golden pollen
      'rgba(200, 230, 201, 0.55)', // soft green leaf
      'rgba(255, 255, 255, 0.7)'   // white dandelion seed
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 0.6 + 0.3,
        speedY: Math.random() * 0.4 + 0.1,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAngle: Math.random() * Math.PI * 2,
        swayRadius: Math.random() * 2 + 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.6 + 0.3,
        type: i % 4 === 0 ? 'petal' : i % 5 === 0 ? 'leaf' : 'pollen',
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.swayAngle += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.swayAngle) * p.swayRadius * 0.4;
        p.y += p.speedY + Math.cos(p.swayAngle) * 0.2;
        p.rotation += p.rotSpeed;

        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'pollen') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.quadraticCurveTo(p.size, 0, 0, p.size * 1.5);
          ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 1.5);
          ctx.fill();
        }

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
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#fbf8f2]">
      {/* 1. Base Painted Watercolor Meadow with Gentle Ken-Burns Camera Pan */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat watercolor-bg-drift scale-[1.03]"
        style={{ backgroundImage: `url(${meadowBg})` }}
      />

      {/* 2. Paper Grain & Watercolor Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-15 mix-blend-multiply pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="watercolorNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#watercolorNoise)" />
      </svg>

      {/* 3. Soft Warm Sun Diffused Lighting Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-rose-200/20 mix-blend-soft-light sun-glow-pulse" />

      {/* 4. Hanging Watercolor Foliage & Willow Branches (Top Left & Top Right) */}
      <div className="absolute -top-6 -left-6 w-[220px] md:w-[320px] h-[180px] md:h-[260px] hanging-branch-left opacity-90">
        <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Main Branch */}
          <path d="M 0 0 C 80 40 160 30 250 100" stroke="#5A4632" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <path d="M 60 25 C 100 70 140 120 180 190" stroke="#5A4632" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          <path d="M 120 28 C 170 80 200 130 230 180" stroke="#5A4632" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          
          {/* Watercolor Leaves & Blossoms (Top-Left) */}
          <g fill="#7A9A60" opacity="0.8">
            <ellipse cx="70" cy="50" rx="14" ry="7" transform="rotate(35 70 50)" />
            <ellipse cx="100" cy="80" rx="16" ry="8" transform="rotate(45 100 80)" fill="#8FA874" />
            <ellipse cx="130" cy="115" rx="15" ry="7" transform="rotate(50 130 115)" />
            <ellipse cx="160" cy="150" rx="14" ry="7" transform="rotate(60 160 150)" fill="#6B8E4E" />
            <ellipse cx="180" cy="190" rx="12" ry="6" transform="rotate(65 180 190)" />
            <ellipse cx="190" cy="70" rx="16" ry="8" transform="rotate(30 190 70)" fill="#8FA874" />
            <ellipse cx="230" cy="95" rx="15" ry="7" transform="rotate(40 230 95)" />
            <ellipse cx="250" cy="100" rx="13" ry="6" transform="rotate(25 250 100)" fill="#6B8E4E" />
          </g>
          {/* Pastel Floral Buds */}
          <g fill="#E5989B" opacity="0.85">
            <circle cx="85" cy="65" r="4" />
            <circle cx="118" cy="98" r="5" />
            <circle cx="150" cy="135" r="4.5" />
            <circle cx="215" cy="88" r="4" />
          </g>
        </svg>
      </div>

      <div className="absolute -top-6 -right-6 w-[220px] md:w-[320px] h-[180px] md:h-[260px] hanging-branch-right opacity-90">
        <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm scale-x-[-1]">
          {/* Main Branch */}
          <path d="M 0 0 C 80 40 160 30 250 100" stroke="#5A4632" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <path d="M 60 25 C 100 70 140 120 180 190" stroke="#5A4632" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          
          {/* Watercolor Leaves & Blossoms */}
          <g fill="#7A9A60" opacity="0.8">
            <ellipse cx="70" cy="50" rx="14" ry="7" transform="rotate(35 70 50)" />
            <ellipse cx="100" cy="80" rx="16" ry="8" transform="rotate(45 100 80)" fill="#8FA874" />
            <ellipse cx="130" cy="115" rx="15" ry="7" transform="rotate(50 130 115)" />
            <ellipse cx="160" cy="150" rx="14" ry="7" transform="rotate(60 160 150)" fill="#6B8E4E" />
            <ellipse cx="180" cy="190" rx="12" ry="6" transform="rotate(65 180 190)" />
            <ellipse cx="230" cy="95" rx="15" ry="7" transform="rotate(40 230 95)" />
          </g>
          <g fill="#F4A261" opacity="0.85">
            <circle cx="85" cy="65" r="4" />
            <circle cx="120" cy="100" r="5" />
            <circle cx="150" cy="135" r="4" />
          </g>
        </svg>
      </div>

      {/* 5. Particle Canvas: Floating gentle breeze, petals & pollen */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 6. Spotted Deer Herd - Storybook Grazing & Alert Animation Loop */}
      
      {/* Deer Group Container (Bottom Left to Center Meadow) */}
      <div className="absolute bottom-[2%] md:bottom-[6%] left-[3%] md:left-[8%] z-10 flex items-end">
        
        {/* --- Primary Spotted Deer 1 (Mother Doe): Grazing <-> Heads Lifted Alert Loop --- */}
        <div className="relative w-[150px] sm:w-[190px] md:w-[230px] h-[160px] sm:h-[200px] md:h-[240px] deer-body-sway">
          
          {/* Grazing Pose (Heads lowered, nibbling grass with chewing motion) */}
          <div className="absolute inset-0 deer-pose-grazing mix-blend-multiply">
            <img 
              src={deerGrazing} 
              alt="Deer grazing peacefully"
              className="w-full h-full object-contain filter contrast-110 saturate-95 drop-shadow-sm deer-head-nibble"
            />
          </div>

          {/* Standing Alert Pose (Lifts head, ears twitching, looks toward camera) */}
          <div className="absolute inset-0 deer-pose-standing mix-blend-multiply">
            <img 
              src={deerStanding} 
              alt="Deer standing alert and calm" 
              className="w-full h-full object-contain filter contrast-110 saturate-95 drop-shadow-sm deer-alert-breathe"
            />
          </div>
        </div>

        {/* --- Baby Fawn (Resting peacefully in wildflowers, sweet eyes, subtle ear flick) --- */}
        <div className="relative w-[100px] sm:w-[125px] md:w-[150px] h-[95px] sm:h-[120px] md:h-[145px] -ml-6 md:-ml-8 mb-1 fawn-gentle-breathe">
          <img 
            src={deerFawn} 
            alt="Little baby fawn resting" 
            className="w-full h-full object-contain mix-blend-multiply filter contrast-110 saturate-95 drop-shadow-sm"
          />
        </div>

      </div>

      {/* --- Secondary Deer 2 (Right Meadow Ridge, slightly in distance) --- */}
      <div className="absolute bottom-[6%] md:bottom-[10%] right-[4%] md:right-[10%] z-10 hidden sm:block">
        <div className="relative w-[120px] md:w-[170px] h-[130px] md:h-[180px] -scale-x-100 deer-body-sway-delayed">
          
          {/* Secondary Grazing Pose (Delayed cycle) */}
          <div className="absolute inset-0 deer-pose-grazing-secondary mix-blend-multiply">
            <img 
              src={deerGrazing} 
              alt="Spotted deer grazing"
              className="w-full h-full object-contain filter contrast-105 saturate-90 deer-head-nibble"
            />
          </div>

          {/* Secondary Standing Alert Pose (Delayed cycle) */}
          <div className="absolute inset-0 deer-pose-standing-secondary mix-blend-multiply">
            <img 
              src={deerStanding} 
              alt="Spotted deer looking ahead" 
              className="w-full h-full object-contain filter contrast-105 saturate-90 deer-alert-breathe"
            />
          </div>
        </div>
      </div>

      {/* 7. Foreground Grass & Wildflowers (Swaying in gentle breeze) */}
      <div className="absolute bottom-0 inset-x-0 h-16 md:h-24 pointer-events-none overflow-hidden flex justify-between items-end opacity-85">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Layered Watercolor Grass Tufts */}
          <g fill="#88A86C" opacity="0.65" className="grass-sway-slow">
            <path d="M 0 120 Q 30 60 50 120 Q 80 40 110 120 Q 140 70 170 120 Q 220 30 260 120 Q 310 50 350 120 Q 420 40 470 120 Q 530 60 580 120 Q 640 30 690 120 Q 750 50 800 120 Q 870 40 920 120 Q 990 60 1040 120 Q 1110 30 1160 120 L 1200 120 L 0 120 Z" />
          </g>
          <g fill="#6C8D50" opacity="0.8" className="grass-sway-fast">
            <path d="M 20 120 Q 60 50 90 120 Q 150 30 190 120 Q 240 60 280 120 Q 360 40 400 120 Q 490 50 540 120 Q 610 35 660 120 Q 720 55 770 120 Q 830 35 880 120 Q 940 50 990 120 Q 1060 45 1110 120 Q 1170 30 1200 120 L 1200 120 L 0 120 Z" />
          </g>
          {/* Dappled Wildflowers */}
          <g fill="#E07A5F" opacity="0.9">
            <circle cx="110" cy="70" r="4.5" />
            <circle cx="280" cy="85" r="4" />
            <circle cx="540" cy="75" r="5" />
            <circle cx="770" cy="80" r="4.5" />
            <circle cx="990" cy="70" r="5" />
          </g>
          <g fill="#F2CC8F" opacity="0.95">
            <circle cx="190" cy="60" r="5" />
            <circle cx="400" cy="65" r="4.5" />
            <circle cx="660" cy="55" r="5.5" />
            <circle cx="880" cy="60" r="4" />
            <circle cx="1110" cy="65" r="5" />
          </g>
        </svg>
      </div>

      {/* CSS Storybook Animation Styles */}
      <style>{`
        /* Slow camera drift / Ken-Burns effect for background */
        @keyframes watercolorBgDrift {
          0% { transform: scale(1.02) translate(0, 0); }
          50% { transform: scale(1.05) translate(-0.8%, -0.5%); }
          100% { transform: scale(1.02) translate(0, 0); }
        }
        .watercolor-bg-drift {
          animation: watercolorBgDrift 28s ease-in-out infinite;
        }

        /* Diffused sun glow pulse */
        @keyframes sunGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .sun-glow-pulse {
          animation: sunGlow 8s ease-in-out infinite alternate;
        }

        /* Hanging branch gentle breeze oscillation */
        @keyframes branchSwayLeft {
          0% { transform: rotate(0deg) skewX(0deg); }
          50% { transform: rotate(2.5deg) skewX(1deg); }
          100% { transform: rotate(0deg) skewX(0deg); }
        }
        @keyframes branchSwayRight {
          0% { transform: rotate(0deg) skewX(0deg); }
          50% { transform: rotate(-2deg) skewX(-1.2deg); }
          100% { transform: rotate(0deg) skewX(0deg); }
        }
        .hanging-branch-left {
          transform-origin: top left;
          animation: branchSwayLeft 7s ease-in-out infinite;
        }
        .hanging-branch-right {
          transform-origin: top right;
          animation: branchSwayRight 8.5s ease-in-out infinite;
        }

        /* Deer gentle body sway */
        @keyframes deerSway {
          0% { transform: rotate(-1deg) translateY(0px); }
          50% { transform: rotate(1deg) translateY(-2px); }
          100% { transform: rotate(-1deg) translateY(0px); }
        }
        .deer-body-sway {
          transform-origin: bottom center;
          animation: deerSway 5s ease-in-out infinite;
        }
        .deer-body-sway-delayed {
          transform-origin: bottom center;
          animation: deerSway 6.2s ease-in-out infinite 2s;
        }

        /* Grazing Nibble chewing and subtle head movement */
        @keyframes nibbleGrass {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(2px) rotate(0.8deg); }
          50% { transform: translateY(-1px) rotate(-0.5deg); }
          75% { transform: translateY(3px) rotate(1deg); }
        }
        .deer-head-nibble {
          animation: nibbleGrass 2.4s ease-in-out infinite;
          transform-origin: 30% 70%;
        }

        /* Standing Alert gentle breathing & ear twitch */
        @keyframes alertBreathe {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.015) translateY(-2px); }
          70% { transform: scale(1.015) translateY(-2px) rotate(0.6deg); }
        }
        .deer-alert-breathe {
          animation: alertBreathe 3.5s ease-in-out infinite;
          transform-origin: bottom center;
        }

        /* Fawn gentle breathing */
        @keyframes fawnBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02) translateY(-1px); }
        }
        .fawn-gentle-breathe {
          transform-origin: bottom center;
          animation: fawnBreathe 4s ease-in-out infinite;
        }

        /* --- DEER 1 STORY CYCLE (16s Looping Sequence) ---
           0s - 7s: Grazing peacefully, head down, chewing
           7s - 9s: Transition (lifts head, ears twitch)
           9s - 14s: Standing calm standstill, looking at camera
           14s - 16s: Lowers head back down to graze
        */
        @keyframes deerPoseGrazing1 {
          0%, 42% { opacity: 1; visibility: visible; }
          48%, 88% { opacity: 0; visibility: hidden; }
          94%, 100% { opacity: 1; visibility: visible; }
        }
        @keyframes deerPoseStanding1 {
          0%, 42% { opacity: 0; visibility: hidden; }
          48%, 88% { opacity: 1; visibility: visible; }
          94%, 100% { opacity: 0; visibility: hidden; }
        }
        .deer-pose-grazing {
          animation: deerPoseGrazing1 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transition: opacity 1.2s ease-in-out;
        }
        .deer-pose-standing {
          animation: deerPoseStanding1 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transition: opacity 1.2s ease-in-out;
        }

        /* --- DEER 2 STORY CYCLE (Offset by 5s for natural herd dynamics) --- */
        @keyframes deerPoseGrazing2 {
          0%, 30% { opacity: 1; visibility: visible; }
          36%, 76% { opacity: 0; visibility: hidden; }
          82%, 100% { opacity: 1; visibility: visible; }
        }
        @keyframes deerPoseStanding2 {
          0%, 30% { opacity: 0; visibility: hidden; }
          36%, 76% { opacity: 1; visibility: visible; }
          82%, 100% { opacity: 0; visibility: hidden; }
        }
        .deer-pose-grazing-secondary {
          animation: deerPoseGrazing2 18s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
        }
        .deer-pose-standing-secondary {
          animation: deerPoseStanding2 18s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
        }

        /* Grass wind swaying */
        @keyframes grassWaveSlow {
          0%, 100% { transform: skewX(0deg) scaleY(1); }
          50% { transform: skewX(2.5deg) scaleY(1.02); }
        }
        @keyframes grassWaveFast {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(-3deg); }
        }
        .grass-sway-slow {
          transform-origin: bottom center;
          animation: grassWaveSlow 4.5s ease-in-out infinite;
        }
        .grass-sway-fast {
          transform-origin: bottom center;
          animation: grassWaveFast 3.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
