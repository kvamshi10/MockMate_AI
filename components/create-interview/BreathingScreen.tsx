"use client";

import { useEffect, useRef, useState } from "react";
import { Wind } from "lucide-react";

type Phase = "inhale" | "hold" | "exhale" | "done";

interface Props {
  durationSeconds?: number; // total time before auto-proceed
  onComplete: () => void;
}

const BREATH_CYCLE = 10; // inhale 4s + hold 2s + exhale 4s

const phaseConfig: Record<Exclude<Phase, "done">, { label: string; sub: string; duration: number; scale: number }> = {
  inhale:  { label: "Inhale",  sub: "Breathe in slowly…",    duration: 4, scale: 1.35 },
  hold:    { label: "Hold",    sub: "Hold it gently…",       duration: 2, scale: 1.35 },
  exhale:  { label: "Exhale",  sub: "Release all tension…",  duration: 4, scale: 1.0 },
};

export const BreathingScreen = ({ durationSeconds = 40, onComplete }: Props) => {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [countdown, setCountdown] = useState(durationSeconds);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [currentScale, setCurrentScale] = useState(1.0);
  const phaseRef = useRef<Phase>("inhale");
  const phaseElapsedRef = useRef(0);

  useEffect(() => {
    phaseRef.current = "inhale";
    phaseElapsedRef.current = 0;

    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(tick); setPhase("done"); onComplete(); return 0; }
        return c - 1;
      });

      phaseElapsedRef.current += 1;
      const cur = phaseRef.current as Exclude<Phase, "done">;
      const cfg = phaseConfig[cur];

      setPhaseTimer(phaseElapsedRef.current);
      setCurrentScale(cfg.scale);

      if (phaseElapsedRef.current >= cfg.duration) {
        phaseElapsedRef.current = 0;
        const next: Exclude<Phase, "done"> =
          cur === "inhale" ? "hold" : cur === "hold" ? "exhale" : "inhale";
        phaseRef.current = next;
        setPhase(next);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [durationSeconds, onComplete]);

  const phaseInfo = phase !== "done" ? phaseConfig[phase] : null;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-background to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-aurora opacity-5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm text-center">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
            <Wind className="h-3.5 w-3.5" />
            Before we begin…
          </div>
          <h2 className="text-3xl font-bold text-white">Take a breath</h2>
          <p className="text-muted-foreground mt-2">
            A calm mind is your greatest interview asset.
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center">
          {/* SVG countdown ring */}
          <svg className="absolute" width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke="url(#breathGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (countdown / durationSeconds)}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(258 90% 66%)" />
                <stop offset="100%" stopColor="hsl(190 95% 60%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Main expanding orb */}
          <div
            className="h-36 w-36 rounded-full flex items-center justify-center transition-transform"
            style={{
              transform: `scale(${currentScale})`,
              transitionDuration: phase === "inhale" ? "4000ms" : phase === "hold" ? "200ms" : "4000ms",
              transitionTimingFunction: "ease-in-out",
              background: "radial-gradient(circle, hsl(258 90% 66% / 0.5), hsl(190 95% 60% / 0.2))",
              boxShadow: "0 0 60px hsl(258 90% 66% / 0.4), inset 0 0 40px hsl(190 95% 60% / 0.2)",
            }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {phaseInfo?.label}
              </p>
            </div>
          </div>
        </div>

        {/* Sub label */}
        <div className="h-6">
          <p key={phase} className="text-sm text-muted-foreground animate-fadeIn">
            {phaseInfo?.sub}
          </p>
        </div>

        {/* Countdown */}
        <p className="text-xs text-muted-foreground">
          Connecting in <span className="text-white font-semibold">{countdown}s</span>
        </p>

        {/* Skip */}
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-4"
        >
          Skip — I'm ready now
        </button>

        {/* Tips */}
        <div className="w-full rounded-2xl glass border border-white/5 p-4 text-left">
          <p className="text-xs font-semibold text-white mb-2">Before you start:</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {[
              "Speak clearly and at a comfortable pace",
              "It's okay to pause and think before answering",
              "Structure your answers: Situation → Action → Result",
              "Be honest — the AI adapts to your level",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-aurora flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreathingScreen;
