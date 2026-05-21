"use client";

import { useState, useRef, ReactNode } from "react";

export default function CardSpotlight({ children }: { children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl flex flex-col bg-[hsl(250_25%_9%)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/20 cursor-pointer h-full"
    >
      {/* Base border layer */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08] pointer-events-none z-10 transition-colors duration-300 group-hover:border-transparent" />
      
      {/* Mouse Spotlight Border Glow layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.7), transparent 40%)`,
        }}
      />
      
      {/* Inner dark background (covers the inner glow of the layer above, leaving only the border) */}
      <div className="absolute inset-[1px] rounded-[15px] bg-[hsl(250_25%_9%)] z-0 pointer-events-none" />

      {/* Subtle Inner Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.08), transparent 40%)`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full flex-1 overflow-hidden rounded-2xl">
         {children}
      </div>
    </div>
  );
}
