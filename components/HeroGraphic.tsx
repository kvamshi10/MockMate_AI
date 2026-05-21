"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Mic, Star } from "lucide-react";

export default function HeroGraphic() {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Animate bars every 800ms
    const barInterval = setInterval(() => setTick(t => t + 1), 800);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setRotateY(x * 12);  // Subtle rotation
      setRotateX(y * -8);
    };

    const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(barInterval);
    };
  }, []);

  // Random bar heights that animate
  const barHeights = mounted
    ? [0.3, 0.8, 0.5, 1, 0.6, 0.9, 0.4].map((base) =>
        Math.max(0.15, (base + Math.sin(tick * 0.7 + base * 3)) * 0.5 + 0.2)
      )
    : [0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3];

  return (
    <div
      ref={containerRef}
      className="flex-1 relative flex justify-center items-center z-10 select-none"
      style={{ perspective: "1200px" }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-500/15 blur-[60px]" />
      </div>

      {/* 3D rotating scene */}
      <div
        className="relative w-full max-w-[480px] aspect-square"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Deep orbital ring — far back in Z space */}
        <div
          className="absolute inset-0 rounded-full border border-violet-400/15"
          style={{
            transform: "translateZ(-120px) rotateX(72deg)",
            animation: "spin 22s linear infinite",
          }}
        />
        {/* Second orbital ring */}
        <div
          className="absolute inset-[10%] rounded-full border border-fuchsia-400/20"
          style={{
            transform: "translateZ(-60px) rotateX(55deg) rotateZ(30deg)",
            animation: "spin 14s linear infinite reverse",
          }}
        />
        {/* Inner shimmer ring */}
        <div
          className="absolute inset-[20%] rounded-full border border-cyan-400/10"
          style={{
            transform: "translateZ(-20px) rotateX(40deg) rotateZ(-20deg)",
            animation: "spin 9s linear infinite",
          }}
        />

        {/* Reflected base plate — sits deep behind robot */}
        <div
          className="absolute inset-[5%] rounded-full"
          style={{
            transform: "translateZ(-30px) rotateX(80deg) translateY(140px)",
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* Extrusion depth layers — create real 3D thickness */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`extrude-${i}`}
            className="absolute inset-0"
            style={{ transform: `translateZ(${i * 3}px)`, transformStyle: "preserve-3d" }}
          >
            <Image
              src="/robot.png"
              alt=""
              fill
              sizes="480px"
              className="object-contain"
              style={{
                filter: `brightness(${0.3 - i * 0.01}) saturate(0)`,
                opacity: 0.4 - i * 0.03,
                mixBlendMode: "multiply",
              }}
            />
          </div>
        ))}

        {/* Main illuminated robot face — brought forward */}
        <div
          className="absolute inset-0"
          style={{ transform: "translateZ(38px)", transformStyle: "preserve-3d" }}
        >
          <Image
            src="/robot.png"
            alt="AI Interviewer Robot"
            fill
            sizes="480px"
            priority
            className="object-contain"
            style={{
              filter:
                "drop-shadow(0 30px 60px rgba(139,92,246,0.55)) drop-shadow(0 0 30px rgba(217,70,239,0.3))",
            }}
          />
        </div>

        {/* ── Floating UI Cards ── */}

        {/* TOP RIGHT: Score badge */}
        <div
          className="absolute top-[12%] -right-8 z-40"
          style={{
            transform: "translateZ(100px)",
            transformStyle: "preserve-3d",
            animation: "floatY 5s ease-in-out infinite",
          }}
        >
          <div className="bg-[#0e0f1a]/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none mb-0.5">Great answer!</p>
                <p className="text-xs text-emerald-400 tracking-wide font-medium">+15 confidence score</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT: Listening indicator */}
        <div
          className="absolute bottom-[14%] -left-8 z-40"
          style={{
            transform: "translateZ(130px)",
            transformStyle: "preserve-3d",
            animation: "floatY2 6s ease-in-out infinite 1.5s",
          }}
        >
          <div className="bg-[#0e0f1a]/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Mic className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                {/* Animated audio bars */}
                <div className="flex items-end gap-[3px] h-5 mb-1">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-violet-400"
                      style={{
                        height: `${h * 100}%`,
                        transition: "height 0.4s ease-in-out",
                        boxShadow: "0 0 6px rgba(139,92,246,0.8)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  Listening...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP LEFT: Rating */}
        <div
          className="absolute top-[30%] -left-6 z-40"
          style={{
            transform: "translateZ(70px)",
            transformStyle: "preserve-3d",
            animation: "floatY3 7s ease-in-out infinite 0.8s",
          }}
        >
          <div className="bg-[#0e0f1a]/90 backdrop-blur-xl border border-amber-500/20 rounded-xl px-3 py-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-white">98/100</span>
            </div>
            <p className="text-[9px] text-amber-400/80 uppercase tracking-wider mt-0.5">Top Performer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
