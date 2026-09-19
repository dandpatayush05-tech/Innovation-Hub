import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onReveal?: () => void;
  overlayColor?: string;
  brushSize?: number;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  width,
  height,
  children,
  onReveal,
  overlayColor = '#8a94a6',
  brushSize = 30
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill overlay
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add text on top
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch to Reveal', width / 2, height / 2);
  }, [width, height, overlayColor]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    scratch(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    scratch(e);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    checkReveal();
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkReveal = () => {
    if (isRevealed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    const totalPixels = pixels.length / 4;
    if (transparentPixels / totalPixels > 0.5) {
      setIsRevealed(true);
      // Clear the rest
      ctx.clearRect(0, 0, width, height);
      if (onReveal) onReveal();
    }
  };

  return (
    <div className="relative inline-block" style={{ width, height, userSelect: 'none' }}>
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-green-500 rounded-lg text-white font-bold shadow-inner">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`absolute inset-0 z-10 cursor-pointer rounded-lg transition-opacity duration-300 ${isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
