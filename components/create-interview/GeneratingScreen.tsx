"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import PaywallModal from "@/components/PaywallModal";

interface Props {
  role: string;
  formData?: any;
  userId?: string | null;
  onReadyToJoin: (interviewId: string) => void;
}

const TIPS = [
  {
    title: "Structure Your Answers",
    body: "Use the STAR method — Situation, Task, Action, Result — for behavioural questions.",
  },
  {
    title: "Pause Before Answering",
    body: "It's perfectly fine to say \"Let me think about that for a moment.\" Interviewers respect thoughtful answers.",
  },
  {
    title: "Ask Clarifying Questions",
    body: "If a question is ambiguous, ask for clarification before diving in — it shows strong communication skills.",
  },
  {
    title: "Think Out Loud",
    body: "Walk the interviewer through your reasoning. They care about how you think, not just what you know.",
  },
  {
    title: "Be Specific",
    body: "Concrete examples with real numbers and outcomes are far more persuasive than vague generalisations.",
  },
  {
    title: "Show Enthusiasm",
    body: "Genuine excitement about the role and company is one of the most underrated factors in interview success.",
  },
];

const QUOTES = [
  { q: "The secret to getting ahead is getting started.", a: "Mark Twain" },
  { q: "Success is where preparation and opportunity meet.", a: "Bobby Unser" },
  { q: "Your future is created by what you do today.", a: "Robert Kiyosaki" },
  { q: "Believe you can and you're halfway there.", a: "T. Roosevelt" },
];

export const GeneratingScreen = ({ role, formData, userId, onReadyToJoin }: Props) => {
  const [tipIdx, setTipIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [interviewId, setInterviewId] = useState<string>("");
  const [showPaywall, setShowPaywall] = useState(false);

  // 🔒 Guard against React 18 Strict Mode double-invocation.
  // Without this, generate() fires twice in development → 2 Firestore docs → 2 cards.
  const hasRun = useRef(false);

  // Rotate tip every 4s
  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Rotate quote every 6s
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // API Call and Progress
  useEffect(() => {
    // ✅ Only ever run once — prevents duplicate interview creation
    if (hasRun.current) return;
    hasRun.current = true;
    let currentProgress = 0;

    // Smooth progress up to 90% while waiting for API
    const progressId = setInterval(() => {
      currentProgress = Math.min(90, currentProgress + 1);
      setProgress(currentProgress);
    }, 100);

    const generate = async () => {
      try {
        if (!formData) throw new Error("No form data");

        const res = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: formData.companyName,
            role: formData.role,
            type: formData.interviewTypes,
            level: formData.level,
            techstack: formData.techStack,
            amountMode: formData.amountMode,
            duration: formData.duration,
            questionCount: formData.questionCount,
            userid: userId,
            // ✅ Parsed file contents — personalizes AI questions
            resumeText: formData.resumeText || "",
            jdText: formData.jdText || "",
            prepText: formData.prepText || "",
          }),
        });

        const data = await res.json();

        // Server-side free-tier limit check
        if (false) {
          setShowPaywall(true);
          clearInterval(progressId);
          return;
        }

        if (data.interviewId) {
          setInterviewId(data.interviewId);
        }
      } catch (err) {
        console.error("Error generating:", err);
      } finally {
        clearInterval(progressId);
        setProgress(100);
        setTimeout(() => setIsReady(true), 600);
      }
    };

    generate();

    return () => {
      clearInterval(progressId);
    };
  }, [formData, userId]);


  // Orbit animation (CSS would be cleaner, but JS gives us control)
  useEffect(() => {
    const id = setInterval(() => setOrbitAngle((a) => (a + 2) % 360), 30);
    return () => clearInterval(id);
  }, []);

  const tip = TIPS[tipIdx];
  const quote = QUOTES[quoteIdx];

  return (
    <>
      {/* Paywall shown when free tier limit is hit */}
      {showPaywall && userId && (
        <PaywallModal
          userId={userId}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            // Payment succeeded — reset and let them proceed
            setShowPaywall(false);
            hasRun.current = false;
            // Re-trigger generate by briefly clearing then restoring formData flag
            window.location.reload();
          }}
        />
      )}
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-60 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-aurora opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-700/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">
        {/* ── Status header ── */}
        {isReady ? (
          <div className="text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Interview Ready!
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Your questions are all set 🎉
            </h2>
            <p className="text-muted-foreground mt-3">
              We've crafted personalised questions for your <span className="text-white font-medium">{role}</span> interview. Ready to shine?
            </p>
          </div>
        ) : (
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs text-muted-foreground mb-4">
              <Sparkles className="h-3.5 w-3.5 text-aurora animate-pulse" />
              AI is crafting your questions…
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Generating your <span className="text-aurora">{role}</span> interview
            </h2>
            <p className="text-muted-foreground mt-3">
              Sit tight! We're tailoring questions just for you. Use this time to
              mentally prepare.
            </p>
          </div>
        )}

        {/* ── Animated AI orb ── */}
        <div className="relative h-40 w-40 flex items-center justify-center">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-aurora opacity-20 blur-2xl animate-pulse-glow" />
          {/* Core */}
          <div className="relative h-28 w-28 rounded-full glass-strong border border-white/10 flex items-center justify-center z-10">
            {isReady ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-fadeIn" />
            ) : (
              <Zap className="h-10 w-10 text-aurora" />
            )}
          </div>
          {/* Orbiting dot */}
          {!isReady && (
            <div
              className="absolute h-4 w-4 rounded-full bg-aurora shadow-[0_0_12px_rgba(139,92,246,0.8)]"
              style={{
                top: `calc(50% + ${Math.sin((orbitAngle * Math.PI) / 180) * 60}px - 8px)`,
                left: `calc(50% + ${Math.cos((orbitAngle * Math.PI) / 180) * 60}px - 8px)`,
              }}
            />
          )}
        </div>

        {/* ── Progress bar ── */}
        {!isReady && (
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Generating questions</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-aurora rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── CTA (when ready) ── */}
        {isReady && (
          <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
            <button
              onClick={() => onReadyToJoin(interviewId)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-aurora text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.03] transition-transform"
            >
              Connect to Call
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full glass-strong hover:ring-glow transition-all text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* ── Tips carousel ── */}
        {!isReady && (
          <div className="w-full rounded-3xl glass-strong border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-aurora opacity-10 blur-2xl" />
            <p className="text-xs uppercase tracking-widest text-aurora font-semibold mb-4">
              Interview Tip #{tipIdx + 1}
            </p>
            <div key={tipIdx} className="animate-fadeIn">
              <h4 className="text-base font-semibold text-white mb-2">{tip.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-5">
              {TIPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === tipIdx ? "w-5 bg-aurora" : "w-1.5 bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Motivational quote (always visible while not ready) ── */}
        {!isReady && (
          <div key={quoteIdx} className="text-center animate-fadeIn px-4">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{quote.q}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">— {quote.a}</p>
          </div>
        )}

        {/* ── Dashboard link (always visible) ── */}
        {!isReady && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard — interview card will appear there shortly
          </Link>
        )}
      </div>
    </div>
    </>
  );
};

export default GeneratingScreen;
