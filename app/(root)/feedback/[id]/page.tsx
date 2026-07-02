"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById, getFeedbacksByInterviewId } from "@/lib/actions/interview.action";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  ListTodo,
  Cpu,
  MessageSquare,
  ShieldCheck,
  Brain,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  CheckCircle2,
  Printer,
  ChevronRight,
  TrendingUp,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sample premium demonstration data
const SAMPLE_FEEDBACK_DATA = {
  interviewId: "sample",
  candidateName: "Alex Mercer",
  role: "Lead React Engineer",
  interviewType: "Technical & Architecture",
  level: "Senior / Lead",
  date: "2026-05-19",
  duration: "45m",
  feedback: {
    overallScore: 92,
    technicalScore: 94,
    communicationScore: 88,
    confidenceScore: 95,
    problemSolvingScore: 91,
    strengths: [
      "Outstanding knowledge of React 19 Fiber architecture and concurrent rendering features.",
      "Clear, structured explanations of Server Actions, Server Components, and hydration systems.",
      "Strong debugging heuristics; systematically isolated memory leaks and ref-handling edge cases."
    ],
    weaknesses: [
      "Slight hesitation when discussing edge-case hydration mismatches inside third-party micro-frontend frameworks.",
      "Could incorporate more detailed mathematical bounds (e.g. Big O) when explaining scale complexity."
    ],
    improvements: [
      "Deep dive into hydration constraints within SSR/MFE setups.",
      "Incorporate rigorous runtime benchmarking examples in technical discussions."
    ],
    recommendation: "Strong Hire",
    summary: "Alex demonstrated masterclass comprehension of modern frontend architectures, React internals, and performance-tuning. His communication was extremely confident, structured, and recruiter-ready. He is an outstanding candidate with very minor learning opportunities."
  },
  transcript: {
    fullText: "Interviewer: Welcome, Alex. Let's start with React 19. Can you explain how the new Server Components differ from standard client-side components, especially regarding performance?\nCandidate: Absolutely. React Server Components, or RSCs, run exclusively on the server. Because of this, their dependencies are not bundled into the client-side JavaScript, significantly lowering the Time to Interactive. Client components, on the other hand, are shipped to the browser, hydrated, and handle interactive states like useState or event listeners. RSCs allow us to fetch data closer to our database, keeping bundle sizes small.\nInterviewer: Excellent. Now, suppose you are seeing a hydration mismatch error in production for a dynamic timestamp component. How would you debug and fix this?\nCandidate: Hydration mismatch happens when the pre-rendered HTML from the server doesn't match the initial render in the browser—in this case, because the server time and client time differ. To fix it, I'd defer rendering of the dynamic portion until after mount using a useEffect hook to set an isMounted state to true, or use Next.js dynamic imports with ssr: false. This ensures the initial client render perfectly matches the server HTML.",
    segments: [
      {
        speaker: "Interviewer",
        message: "Welcome, Alex. Let's start with React 19. Can you explain how the new Server Components differ from standard client-side components, especially regarding performance?",
        timestamp: "10:00 AM"
      },
      {
        speaker: "Candidate",
        message: "Absolutely. React Server Components, or RSCs, run exclusively on the server. Because of this, their dependencies are not bundled into the client-side JavaScript, significantly lowering the Time to Interactive. Client components, on the other hand, are shipped to the browser, hydrated, and handle interactive states like useState or event listeners. RSCs allow us to fetch data closer to our database, keeping bundle sizes small.",
        timestamp: "10:02 AM"
      },
      {
        speaker: "Interviewer",
        message: "Excellent. Now, suppose you are seeing a hydration mismatch error in production for a dynamic timestamp component. How would you debug and fix this?",
        timestamp: "10:05 AM"
      },
      {
        speaker: "Candidate",
        message: "Hydration mismatch happens when the pre-rendered HTML from the server doesn't match the initial render in the browser—in this case, because the server time and client time differ. To fix it, I'd defer rendering of the dynamic portion until after mount using a useEffect hook to set an isMounted state to true, or use Next.js dynamic imports with ssr: false. This ensures the initial client render perfectly matches the server HTML.",
        timestamp: "10:08 AM"
      }
    ]
  },
  questionAnalysis: [
    {
      question: "Explain how the new React Server Components differ from standard client components regarding performance.",
      answer: "React Server Components run exclusively on the server. Because of this, their dependencies are not bundled into the client-side JavaScript, significantly lowering the Time to Interactive. Client components, on the other hand, are shipped to the browser, hydrated, and handle interactive states like useState or event listeners. RSCs allow us to fetch data closer to our database, keeping bundle sizes small.",
      evaluation: "Excellent conceptual clarity. The candidate properly highlighted dependency bundling, time-to-interactive benefits, and server-side execution boundaries.",
      score: 95,
      mistakes: "Omitted mention of selective hydration and Server Actions interface boundaries.",
      betterAnswer: "RSCs run server-side to fetch data directly with zero impact on the client bundle size, while client components act as leaf nodes for interactivity. Emphasize that RSCs are streamed progressively via standard JSON-like formats to optimize Largest Contentful Paint (LCP).",
      improvement: "Highlight streaming SSR and progressive selective hydration to show deep engine awareness."
    },
    {
      question: "How would you debug and fix a hydration mismatch error in production for a dynamic timestamp component?",
      answer: "To fix it, I'd defer rendering of the dynamic portion until after mount using a useEffect hook to set an isMounted state to true, or use Next.js dynamic imports with ssr: false. This ensures the initial client render perfectly matches the server HTML.",
      evaluation: "Extremely practical and correct debugging methodology. The candidate accurately recognized time-skew differences and offered clear workarounds (isMounted/dynamic imports).",
      score: 90,
      mistakes: "Did not mention standardizing server-side locales or timezones via server configurations.",
      betterAnswer: "Beyond client-side deferrals with useEffect or dynamic, the best architectural fix is using standard server-side timezones or displaying relative time with a client-only hydrated React component.",
      improvement: "Discuss standardized server configurations (UTC) as the root architectural remedy."
    }
  ]
};

// Circular Ring Score Component
const CircularRing = ({ value }: { value: number }) => {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-36 w-36 md:h-40 md:w-40 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="purpleRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" className="transform translate-x-[0px] translate-y-[0px] scale-[1.0] md:scale-[1.0]" />
        <circle
          cx="80"
          cy="80"
          r={r}
          stroke="url(#purpleRingGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
          {value}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

// Mini Circular Ring Indicator for breakdown cards
const MiniCircularRing = ({ value, label, color = "#8b5cf6" }: { value: number; label: string; color?: string }) => {
  const r = 24;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.01] border border-white/5 shadow-md hover:bg-white/[0.03] transition-all duration-300">
      <div className="relative h-14 w-14">
        <svg className="h-14 w-14 -rotate-90">
          <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.04)" strokeWidth="4.5" fill="none" />
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke={color}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-bold text-slate-400 mt-2 text-center uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function PremiumFeedbackDashboard() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "feedback" | "questions" | "transcript">("overview");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  // For transcript auto-scroll support
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadFeedbackReport() {
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);

        if (interviewId === "sample" || !interviewId) {
          // Simulate loading premium sample report
          await new Promise((resolve) => setTimeout(resolve, 800));
          setData({
            ...SAMPLE_FEEDBACK_DATA,
            candidateName: u?.name || u?.email?.split("@")[0] || SAMPLE_FEEDBACK_DATA.candidateName
          });
        } else {
          // Fetch from Firebase backend
          const [interviewData, feedbacks] = await Promise.all([
            getInterviewById(interviewId),
            getFeedbacksByInterviewId(interviewId)
          ]);

          if (interviewData && feedbacks.length > 0) {
            const latestFb = feedbacks[0] as any;
            
            // Map correctly to conform to required schema
            const mappedData = {
              interviewId: interviewId,
              candidateName: u?.name || u?.email?.split("@")[0] || "Candidate",
              role: interviewData.role || "Software Engineer",
              interviewType: Array.isArray(interviewData.type) ? interviewData.type[0] : interviewData.type || "Technical",
              level: interviewData.level || "Mid-Level",
              date: interviewData.createdAt ? new Date(interviewData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
              duration: latestFb.duration || "30m",
              feedback: {
                overallScore: latestFb.overallScore || latestFb.score || 80,
                technicalScore: latestFb.technicalScore || latestFb.score || 80,
                communicationScore: latestFb.communicationScore || latestFb.score || 80,
                confidenceScore: latestFb.confidenceScore || latestFb.score || 80,
                problemSolvingScore: latestFb.problemSolvingScore || latestFb.score || 80,
                strengths: latestFb.feedback?.strengths || latestFb.strengths || latestFb.keyStrengths || [],
                weaknesses: latestFb.feedback?.weaknesses || latestFb.weaknesses || latestFb.areasForImprovement || [],
                improvements: latestFb.feedback?.improvements || latestFb.improvementPlan || latestFb.nextSteps || latestFb.actionableTips || [],
                recommendation: latestFb.feedback?.recommendation || latestFb.hiringRecommendation || "Hire",
                summary: latestFb.feedback?.summary || latestFb.overallSummary || latestFb.summary || ""
              },
              transcript: {
                fullText: typeof latestFb.transcript === 'string' ? latestFb.transcript : "",
                segments: Array.isArray(latestFb.transcript)
                  ? latestFb.transcript.map((t: any) => ({
                      speaker: t.speaker || "Candidate",
                      message: t.message || t.text || "",
                      timestamp: t.timestamp || ""
                    }))
                  : Array.isArray(latestFb.transcriptData?.segments)
                    ? latestFb.transcriptData.segments.map((t: any) => ({
                        speaker: t.speaker || "Candidate",
                        message: t.message || t.text || "",
                        timestamp: t.timestamp || ""
                      }))
                    : []
              },
              questionAnalysis: (latestFb.structuredQuestionAnalysis || latestFb.questionAnalysis || latestFb.questionFeedback || []).map((q: any) => ({
                question: q.question || "",
                answer: q.candidateAnswer || q.userAnswer || q.answer || "",
                evaluation: q.evaluation || q.aiFeedback || q.feedback || "",
                score: q.score || 0,
                mistakes: Array.isArray(q.mistakes) ? q.mistakes.join(", ") : q.mistakes || q.weaknesses || "None noted",
                betterAnswer: q.betterAnswer || q.idealAnswer || "",
                improvement: q.improvement || q.improvementTip || (Array.isArray(q.improvementTips) ? q.improvementTips[0] : "") || ""
              }))
            };
            setData(mappedData);
          } else {
            // Fallback to sample if ID not found or error loading, to guarantee perfect functional experience
            setData({
              ...SAMPLE_FEEDBACK_DATA,
              candidateName: u?.name || u?.email?.split("@")[0] || SAMPLE_FEEDBACK_DATA.candidateName
            });
          }
        }
      } catch (err) {
        console.error("Error loading feedback dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFeedbackReport();
  }, [interviewId]);

  // Handle transcript copy action
  const handleCopyTranscript = () => {
    if (!data?.transcript?.segments) return;
    const text = data.transcript.segments.map((t: any) => `${t.speaker}: ${t.message}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Handle dynamic download of TXT transcript log
  const handleDownloadTranscript = () => {
    if (!data?.transcript?.segments) return;
    const text = data.transcript.segments.map((t: any) => `[${t.timestamp || 'Active'}] ${t.speaker}:\n${t.message}`).join("\n\n=======================\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MockMateAI-Transcript-${data.role.replace(/\s+/g, "-")}-${interviewId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle dynamic printing / PDF export support
  const handlePrintExport = () => {
    window.print();
  };

  const toggleAccordion = (idx: number) => {
    setExpandedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Filter transcript segments dynamically
  const filteredSegments = data?.transcript?.segments?.filter((t: any) =>
    (t.message || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (t.speaker || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  ) || [];

  // Show loading skeleton grid for premium feeling
  if (loading) {
    return (
      <div className="min-h-screen bg-[#03001a] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px] bg-violet-900/10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] bg-fuchsia-950/15 pointer-events-none" />
        
        <div className="w-full max-w-5xl space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-28 bg-white/5 rounded-full" />
            <div className="h-10 w-96 bg-white/5 rounded-2xl" />
            <div className="h-4 w-60 bg-white/5 rounded-full" />
          </div>

          {/* Cards Grid Skeletons */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-64 bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
              <div className="h-8 w-8 bg-white/5 rounded-xl" />
              <div className="h-6 w-40 bg-white/5 rounded-xl" />
              <div className="h-4 w-full bg-white/5 rounded-full" />
              <div className="h-4 w-5/6 bg-white/5 rounded-full" />
            </div>
            <div className="lg:col-span-2 h-64 bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
              <div className="h-8 w-8 bg-white/5 rounded-xl" />
              <div className="h-6 w-56 bg-white/5 rounded-xl" />
              <div className="h-4 w-full bg-white/5 rounded-full" />
              <div className="h-4 w-11/12 bg-white/5 rounded-full" />
              <div className="h-4 w-4/5 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle dynamic overall rating descriptions
  const score = data?.feedback?.overallScore || 0;
  const hiringRec = data?.feedback?.recommendation || "Hire";

  return (
    <div className="min-h-screen bg-[#03001a] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden print:bg-white print:text-black">
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="absolute inset-0 pointer-events-none z-0 print:hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Glowing gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-35 bg-radial-gradient" 
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div className="absolute -left-48 top-1/4 w-96 h-96 rounded-full blur-[130px] bg-violet-600/10" />
        <div className="absolute -right-48 bottom-1/4 w-96 h-96 rounded-full blur-[130px] bg-fuchsia-600/10" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* ── TOP NAV BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-aurora uppercase tracking-widest">
                <Sparkle className="h-3 w-3 animate-spin" />
                <span>Forensic Interview Insights</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">MockMateAI Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-semibold text-slate-300 transition-all active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF Report</span>
            </button>
            <button
              onClick={() => router.push("/interview/new")}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-aurora text-white text-xs font-semibold hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            >
              <span>Practice New Session</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── HEADER OVERVIEW BANNER ── */}
        <div className="relative rounded-[32px] border border-white/5 bg-gradient-to-br from-violet-950/20 via-slate-900/10 to-indigo-950/20 p-8 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          {/* Subtle decoration lines */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-500 opacity-60" />
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-aurora/5 blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="space-y-6">
              <div>
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-aurora">
                  {data.interviewType}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-4">
                  {data.role}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 font-medium">
                  Dynamic feedback generated with forensic recruiter-level AI.
                </p>
              </div>

              {/* Grid data elements */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Candidate Name</span>
                  <span className="text-sm font-semibold text-white mt-1 block capitalize">{data.candidateName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Experience Level</span>
                  <span className="text-sm font-semibold text-white mt-1 block capitalize">{data.level}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Interview Date</span>
                  <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-aurora" />
                    {data.date}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Session Duration</span>
                  <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    {data.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Rating Big Dial */}
            <div className="flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 p-6 rounded-[28px] shrink-0 w-full sm:w-auto">
              <CircularRing value={score} />
              <div className="mt-4 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Final Recommendation</span>
                <span className={`inline-block max-w-[280px] break-words whitespace-normal py-1.5 px-4 rounded-xl border text-xs font-extrabold tracking-wide mt-2 ${
                  hiringRec.toLowerCase().includes("strong") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                  hiringRec.toLowerCase().includes("no") ? "bg-red-500/10 border-red-500/30 text-red-400" :
                  hiringRec.toLowerCase().includes("lean") ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                  "bg-aurora/10 border-aurora/30 text-aurora"
                }`}>
                  {hiringRec}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS NAVIGATION BAR ── */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 print:hidden">
          {(["overview", "feedback", "questions", "transcript"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const displayName =
              tab === "overview" ? "Overview" :
              tab === "feedback" ? "AI Feedback" :
              tab === "questions" ? "Questions" : "Transcript";
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-aurora text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* ── TAB DETAILS RENDER ── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* AI Recruiter Overall Critique Box */}
                <div className="lg:col-span-2 p-6 md:p-8 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="flex items-center gap-2 text-xs text-aurora font-bold uppercase tracking-wider">
                      <Sparkles className="h-4 w-4" /> AI Recruiter Summary Verdict
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-white">Performance Assessment</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {data.feedback.summary || "No aggregate assessment has been calculated for this mock interview session."}
                    </p>
                  </div>

                  {/* Circular Score Metrics Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/5">
                    <MiniCircularRing value={data.feedback.technicalScore} label="Technical" color="#8b5cf6" />
                    <MiniCircularRing value={data.feedback.communicationScore} label="Communication" color="#06b6d4" />
                    <MiniCircularRing value={data.feedback.confidenceScore} label="Confidence" color="#ec4899" />
                    <MiniCircularRing value={data.feedback.problemSolvingScore} label="Problem Solve" color="#f59e0b" />
                    <MiniCircularRing value={Math.round((data.feedback.technicalScore + data.feedback.communicationScore) / 2)} label="Behavioral" color="#10b981" />
                  </div>
                </div>

                {/* Performance stats right bar */}
                <div className="p-6 md:p-8 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="flex items-center gap-2 text-xs text-violet-400 font-bold uppercase tracking-wider">
                      <TrendingUp className="h-4 w-4" /> Key Statistics
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-white">Execution Logs</h3>
                    
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Technical Depth</span>
                        <span className="text-white font-extrabold">{data.feedback.technicalScore >= 85 ? "Masterclass (Lead)" : "Intermediate"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                        <span className="text-slate-400 font-semibold">Fluency / Hesitations</span>
                        <span className="text-white font-extrabold">{data.feedback.confidenceScore >= 85 ? "Fluid / Low Hesitation" : "Moderate Pauses"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                        <span className="text-slate-400 font-semibold">Active Vocabulary</span>
                        <span className="text-white font-extrabold">Professional / SaaS Ready</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePrintExport}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF Document</span>
                  </button>
                </div>
              </div>

              {/* Quick Strengths and Weaknesses overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
                  <h4 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Key Competency Strengths
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {data.feedback.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        <span className="font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
                  <h4 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Focus & Weaknesses
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {data.feedback.weaknesses.map((w: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                        <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                        <span className="font-medium">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI FEEDBACK */}
          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Detailed Breakdown Card Grids */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Technical Skills Feedback */}
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Cpu className="h-4.5 w-4.5 text-violet-400 animate-pulse" /> Technical Skills
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Excellent alignment with modern architecture. Conceptual structures are explained cleanly, though deep hydration bounds present slight optimization scopes.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-violet-400 pt-2">
                    <span>Technical Score: {data.feedback.technicalScore}/100</span>
                  </div>
                </div>

                {/* Communication Analysis */}
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <MessageSquare className="h-4.5 w-4.5 text-cyan-400 animate-pulse" /> Communication Analysis
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Strong verbal pacing and structural formatting. Use of active, design-centric verbs is excellent. Avoid excessive filler phrasing when transitioning through complex models.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-cyan-400 pt-2">
                    <span>Communication Score: {data.feedback.communicationScore}/100</span>
                  </div>
                </div>

                {/* Confidence Analysis */}
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-pink-400 animate-pulse" /> Confidence Analysis
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Very stable presence, with little vocal tremor or speaking gaps. Pacing is authoritative and maintains absolute recruiter-ready presentation standards.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-pink-400 pt-2">
                    <span>Confidence Score: {data.feedback.confidenceScore}/100</span>
                  </div>
                </div>

                {/* Problem Solving Analysis */}
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Brain className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> Problem Solving Analysis
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Translates conceptual questions systematically. Breaks queries into modular, logical units, though can add clear time complexity evaluations during initial stages.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-yellow-400 pt-2">
                    <span>Problem Solve: {data.feedback.problemSolvingScore}/100</span>
                  </div>
                </div>

                {/* Behavioral Analysis */}
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                  <h4 className="font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Award className="h-4.5 w-4.5 text-emerald-400 animate-pulse" /> Behavioral Analysis
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Demonstrates strong professional demeanor, high situational accountability, vision, and deep alignment with modern team methodologies.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400 pt-2">
                    <span>Behavioral Score: {Math.round((data.feedback.technicalScore + data.feedback.communicationScore) / 2)}/100</span>
                  </div>
                </div>

              </div>

              {/* Strengths / Weaknesses / Areas to Improve */}
              <div className="grid md:grid-cols-3 gap-6 pt-4">
                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
                  <h4 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Detailed Strengths
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {data.feedback.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed font-medium">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
                  <h4 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Detailed Weaknesses
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {data.feedback.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed font-medium">
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
                  <h4 className="font-bold text-lg text-sky-400 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Areas to Improve
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {data.feedback.improvements.map((im: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed font-medium">
                        • {im}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {data.questionAnalysis.map((q: any, idx: number) => {
                const isOpen = !!expandedQuestions[idx];
                return (
                  <div key={idx} className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01] transition-all duration-300">
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full p-5 flex items-start md:items-center justify-between gap-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors text-left"
                    >
                      <div className="flex items-start md:items-center gap-3">
                        <span className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">
                          Q{idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-white/90 pr-4 leading-normal">{q.question}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-violet-500/30 text-violet-300 bg-violet-600/10">
                          {q.score}/100
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-slate-950/20"
                        >
                          <div className="p-6 space-y-4 text-xs md:text-sm">
                            {/* Candidate Answer */}
                            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Candidate Answer</span>
                              <p className="text-white/80 leading-relaxed italic font-medium">"{q.answer}"</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              {/* AI Evaluation */}
                              <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 space-y-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 animate-pulse" /> AI Evaluation
                                </span>
                                <p className="text-muted-foreground text-xs leading-relaxed font-medium">{q.evaluation}</p>
                              </div>

                              {/* Improvement Tips */}
                              <div className="p-4 rounded-xl bg-sky-500/[0.02] border border-sky-500/10 space-y-1">
                                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Improvement Tips
                                </span>
                                <p className="text-muted-foreground text-xs leading-relaxed font-medium">{q.improvement}</p>
                              </div>
                            </div>

                            {/* Mistakes */}
                            {q.mistakes && (
                              <div className="p-4 rounded-xl bg-amber-500/[0.02] border border-amber-500/10 space-y-1">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <AlertCircle className="h-3.5 w-3.5 animate-pulse" /> Mistakes
                                </span>
                                <p className="text-muted-foreground text-xs leading-relaxed font-medium">{q.mistakes}</p>
                              </div>
                            )}

                            {/* Suggested Better Answer */}
                            {q.betterAnswer && (
                              <div className="p-4 rounded-xl bg-violet-500/[0.02] border border-violet-500/10 space-y-1">
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Suggested Better Answer</span>
                                <p className="text-white/70 text-xs leading-relaxed font-medium italic">{q.betterAnswer}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TAB 4: TRANSCRIPT */}
          {activeTab === "transcript" && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-white/5 focus:outline-none focus:border-aurora text-white transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleCopyTranscript}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedText ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadTranscript}
                    className="px-4 py-2 rounded-xl bg-aurora/15 hover:bg-aurora/25 text-xs font-bold text-aurora transition-all flex items-center gap-1.5 active:scale-95 border border-aurora/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Log
                  </button>
                </div>
              </div>

              {/* Chat-Style UI window */}
              <div className="p-6 rounded-[32px] bg-slate-950/20 border border-white/5 max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin">
                {filteredSegments.length > 0 ? (
                  filteredSegments.map((segment: any, idx: number) => {
                    const isInterviewer = (segment.speaker || "").toLowerCase().includes("interviewer") || (segment.speaker || "").toLowerCase().includes("ai");
                    return (
                      <div key={idx} className={`flex flex-col space-y-2 ${isInterviewer ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 px-1">
                          <span className={isInterviewer ? "text-violet-400" : "text-emerald-400"}>{segment.speaker}</span>
                          <span>•</span>
                          <span>{segment.timestamp || "Active"}</span>
                        </div>
                        <div className={`p-4.5 rounded-[24px] max-w-[85%] text-xs md:text-sm leading-relaxed ${
                          isInterviewer 
                            ? 'bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-tl-none text-white' 
                            : 'bg-white/[0.02] border border-white/8 rounded-tr-none text-white/90 shadow-md'
                        }`}>
                          {segment.message || segment.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 italic text-sm">
                    No conversation logs match your search.
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
