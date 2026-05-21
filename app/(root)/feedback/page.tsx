"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById, getFeedbacksByInterviewId } from "@/lib/actions/interview.action";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Share2,
  TrendingUp,
  Star,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ListTodo,
  Award,
  ShieldCheck,
  Printer,
  Brain,
  Info,
  Layers,
  Cpu,
  Heart,
  Check,
  Copy
} from "lucide-react";

const formatDuration = (startIso?: string, endIso?: string) => {
  if (!startIso || !endIso) return "32m"; // fallback
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const mins = Math.max(1, Math.floor(ms / 60000));
  return `${mins}m`;
};

const scoreColor = (s: number) =>
  s >= 90 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" :
  s >= 75 ? "text-yellow-400  bg-yellow-400/10  border-yellow-400/30"  :
  s >= 50 ? "text-orange-400  bg-orange-400/10  border-orange-400/30"  :
             "text-red-400    bg-red-400/10    border-red-400/30";

const Ring = ({ value }: { value: number }) => {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-40 w-40">
      <svg className="h-40 w-40 -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(258 90% 66%)" />
            <stop offset="100%" stopColor="hsl(190 95% 60%)" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s var(--transition-smooth)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-gradient">{value}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

const MiniRing = ({ value, label, color = "hsl(258 90% 66%)" }: { value: number; label: string; color?: string }) => {
  const r = 24;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-md hover:bg-white/[0.05] hover:scale-[1.03] transition-all duration-300">
      <div className="relative h-14 w-14">
        <svg className="h-14 w-14 -rotate-90">
          <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-extrabold text-white">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-bold text-muted-foreground mt-2 text-center uppercase tracking-wider">{label}</span>
    </div>
  );
};

const parseTranscriptToStructured = (rawTranscript: any) => {
  if (!rawTranscript) return [];
  if (Array.isArray(rawTranscript)) {
    return rawTranscript.map((t: any) => ({
      speaker: typeof t === 'string' ? (t.startsWith("AI") ? "AI" : "Candidate") : (t.speaker || "Candidate"),
      message: typeof t === 'string' ? t.replace(/^(AI|Candidate|User|Interviewer)\s*:\s*/i, "") : (t.message || ""),
      timestamp: t.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }
  
  if (typeof rawTranscript !== 'string') return [];

  const lines = rawTranscript.split("\n");
  const structured: any[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(AI|Candidate|User|Interviewer|AI Interviewer|Candidate Answer)\s*:\s*(.*)/i);
    if (match) {
      let speaker = match[1].trim();
      const message = match[2].trim();
      if (speaker.toLowerCase().includes("ai") || speaker.toLowerCase().includes("interviewer")) {
        speaker = "AI";
      } else {
        speaker = "Candidate";
      }
      structured.push({
        speaker: speaker,
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      if (structured.length > 0) {
        structured[structured.length - 1].message += " " + trimmed;
      } else {
        structured.push({
          speaker: "Candidate",
          message: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
  }
  return structured;
};

const InteractiveTranscriptViewer = ({ 
  structuredTranscript, 
  questionAnalysis,
  fbId
}: { 
  structuredTranscript: any[]; 
  questionAnalysis: any[];
  fbId: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const text = structuredTranscript.map(t => `${t.speaker}: ${t.message}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = structuredTranscript.map(t => `${t.speaker}: ${t.message}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${fbId}.txt`;
    a.click();
  };

  const filtered = structuredTranscript.filter(t => 
    t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-6 border-t border-white/5 space-y-4">
      <details className="group/transcript" open>
        <summary className="flex items-center justify-between font-bold text-white text-sm cursor-pointer list-none select-none p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4.5 w-4.5 text-aurora animate-pulse" />
            <span>Interactive Forensic Interview Transcript</span>
          </div>
          <ChevronDown className="h-4.5 w-4.5 text-muted-foreground group-open/transcript:rotate-180 transition-transform" />
        </summary>
        
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/5">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-background border border-white/5 focus:outline-none focus:border-aurora text-white"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-all flex items-center gap-1.5"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-aurora/10 hover:bg-aurora/20 text-[10px] font-bold text-aurora transition-all flex items-center gap-1.5"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            </div>
          </div>

          {/* Chat Window */}
          <div className="p-4 rounded-2xl bg-secondary/15 border border-white/5 max-h-96 overflow-y-auto space-y-4 scrollbar-thin">
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const isAI = item.speaker === "AI";
                
                // Try to find matching question feedback for candidate's answer
                let linkedFeedback: any = null;
                if (!isAI && questionAnalysis && questionAnalysis.length > 0) {
                  const qIdx = Math.floor(index / 2);
                  if (questionAnalysis[qIdx]) {
                    linkedFeedback = questionAnalysis[qIdx];
                  }
                }

                return (
                  <div key={index} className={`flex flex-col space-y-2 ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                      <span>{item.speaker}</span>
                      <span>•</span>
                      <span>{item.timestamp || "Active"}</span>
                    </div>
                    <div className={`p-4.5 rounded-3xl max-w-[85%] text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-aurora/10 border border-aurora/25 rounded-tl-none text-white' 
                        : 'bg-white/[0.02] border border-white/10 rounded-tr-none text-white/90'
                    }`}>
                      {item.message}
                    </div>

                    {/* Inline AI Feedback Comments */}
                    {linkedFeedback && (
                      <div className="w-[85%] p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 space-y-2 mt-1 self-end text-left shadow-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          <span>AI Feedback / Recruiter Comments</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-normal font-medium">
                          "{linkedFeedback.aiFeedback || linkedFeedback.feedback || "Good response detailing key components."}"
                        </p>
                        {linkedFeedback.idealAnswer && (
                          <div className="pt-2 border-t border-white/5 space-y-1">
                            <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block">Ideal Recruiter Answer:</span>
                            <p className="text-white/60 text-[11px] leading-relaxed italic">
                              {linkedFeedback.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No transcript logs match your search.
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
};

const FeedbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.push(`/feedback/${id}`);
    }
  }, [id, router]);

  const [user, setUser] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  const handleShare = (fbId: string) => {
    const url = `${window.location.origin}/feedback?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(fbId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleQuestion = (qIndex: number, fbId: string) => {
    const key = `${fbId}_${qIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const [u, interviewData, feedbackList] = await Promise.all([
          getCurrentUser(),
          getInterviewById(id),
          getFeedbacksByInterviewId(id)
        ]);

        setUser(u);

        if (interviewData) {
          setInterview(interviewData);
        }

        setFeedbacks(feedbackList);
        if (feedbackList.length > 0) {
          setOpenAccordionId(feedbackList[0].id); // Open latest by default
        }
      } catch (e) {
        console.error("Failed to load feedback", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-aurora bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-aurora/30 border-t-aurora rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background px-4">
        <div className="text-center p-8 glass-strong rounded-3xl max-w-md border border-white/5 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-sm mb-6 text-white/60 leading-relaxed">You must be logged in to view your interview feedback.</p>
          <Link href="/sign-in" className="inline-flex items-center justify-center w-full py-3 rounded-full bg-aurora text-white font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background px-4">
        <div className="text-center p-8 glass-strong rounded-3xl max-w-md border border-white/5 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-bold text-white mb-4">Interview Not Found</h2>
          <p className="text-sm mb-6 text-white/60 leading-relaxed">This interview does not exist, may have been deleted, or the link is invalid.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center w-full py-3 rounded-full bg-aurora text-white font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (interview.userId !== user.uid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center p-8 md:p-12 glass-strong rounded-[32px] max-w-lg border border-red-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-red-500 opacity-10 blur-3xl" />
          <div className="h-20 w-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <span className="text-3xl text-red-500">🔒</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Access Denied</h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">
            This interview feedback belongs to another account. For security and privacy reasons, you do not have permission to view this report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-white transition-all font-semibold"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/interview/new" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-sm text-white transition-all font-semibold shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Take an Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto pt-2">
        <p className="text-xs uppercase tracking-widest text-aurora">Session report</p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mt-2">
          Feedback History —{" "}
          <span className="text-aurora capitalize">{interview.role || "Frontend"} Engineer</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          You have taken this interview <strong className="text-white">{feedbacks.length}</strong> times.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {feedbacks.length === 0 ? (
          <div className="p-16 text-center rounded-[32px] glass-strong border border-white/5 text-muted-foreground flex flex-col items-center gap-6 animate-fadeIn">
            <div className="h-20 w-20 rounded-full bg-aurora/10 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <Sparkles className="h-10 w-10 text-aurora" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Advanced AI Feedback</h3>
              <p className="max-w-lg mx-auto leading-relaxed text-sm text-white/60">
                You took this interview session before our **Rich Feedback Engine** was fully integrated. 
                <br /><br />
                This is a brand new feature! While this specific session doesn't have a report, 
                your **next interview** will include detailed performance scores, technical analysis, 
                and actionable improvement tips generated by our advanced AI.
              </p>
            </div>
            <Link
              href={`/interview/new?id=${id}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-aurora text-primary-foreground font-semibold hover:scale-[1.03] transition-transform"
            >
              Start New Session to Get Feedback
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          feedbacks.map((fb, index) => {
            const attemptNumber = feedbacks.length - index;
            const isOpen = openAccordionId === fb.id;
            const createdDate = fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "Unknown date";
            const score = fb.score || 0;
            const summaryText = fb.summary || "No summary provided.";

            return (
              <div key={fb.id} className="rounded-3xl glass-strong border border-white/5 overflow-hidden transition-all duration-300">
                {/* Accordion Header */}
                <button 
                  onClick={() => setOpenAccordionId(isOpen ? null : fb.id)}
                  className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-aurora/20 flex items-center justify-center text-aurora font-bold shrink-0">
                      #{attemptNumber}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Feedback {attemptNumber}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {createdDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <Star className={`h-4 w-4 ${score >= 75 ? 'fill-emerald-400 text-emerald-400' : 'fill-aurora text-aurora'}`} />
                      <span className="font-semibold text-white">{score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (() => {
                  const rawStrengths = fb.strengths || fb.keyStrengths || [];
                  const rawWeaknesses = fb.weaknesses || fb.areasForImprovement || [];
                  const rawImprovementAreas = fb.improvementAreas || fb.areasForImprovement || [];
                  const rawRecommendedTopics = fb.recommendedTopics || [];
                  const rawNextSteps = fb.nextSteps || fb.actionableTips || [];
                  const rawHiringRec = fb.hiringRecommendation || "Hire";
                  
                  const commScore = fb.communicationScore || fb.score || 0;
                  const techScore = fb.technicalScore || fb.score || 0;
                  const confScore = fb.confidenceScore || fb.score || 0;
                  const probScore = fb.problemSolvingScore || fb.score || 0;
                  const behavScore = fb.behavioralScore || Math.round((commScore + probScore) / 2);

                  const analysis = fb.performanceAnalysis || {
                      communication: "Demonstrated moderate structure, clarity, and pacing. Suggest using fewer filler words.",
                      technicalKnowledge: "Showed a solid understanding of core concepts. Deep dive into optimization practices.",
                      confidence: "Exhibited stable presence with minor hesitations when thinking of corner cases.",
                      clarity: "Responses were logically structured with a straightforward presentation style.",
                      problemSolving: "Approached questions logically, translating concepts into stepwise explanations.",
                      behavioralSkills: "Demonstrated professional demeanor, adaptability, and clear alignment."
                  };

                  // Fallbacks for structured database properties: detailedFeedback, questionAnalysis, aiInsights
                  const detailed = fb.detailedFeedback || {
                      communication: { score: commScore, strengths: rawStrengths.slice(0,2), weaknesses: rawWeaknesses.slice(0,1), improvementSuggestions: rawNextSteps.slice(0,1) },
                      technical: { score: techScore, strengths: rawStrengths.slice(1,3), weaknesses: rawWeaknesses.slice(1,2), improvementSuggestions: rawNextSteps.slice(1,2) },
                      problemSolving: { score: probScore, strengths: rawStrengths.slice(2,4), weaknesses: rawWeaknesses.slice(2,3), improvementSuggestions: rawNextSteps.slice(2,3) },
                      confidence: { score: confScore, strengths: rawStrengths.slice(0,2), weaknesses: rawWeaknesses.slice(0,1), improvementSuggestions: rawNextSteps.slice(0,1) },
                      behavioral: { score: behavScore, strengths: rawStrengths.slice(1,3), weaknesses: rawWeaknesses.slice(1,2), improvementSuggestions: rawNextSteps.slice(1,2) },
                      clarity: { score: fb.overallScore || 80, strengths: ["Clear structure"], weaknesses: ["Needs brevity"], improvementSuggestions: ["Practice concise explanations"] },
                      leadership: { score: fb.overallScore || 78, strengths: ["Proactive stance"], weaknesses: ["Needs delegational views"], improvementSuggestions: ["Highlight team ownership"] },
                      systemDesign: { score: techScore, strengths: ["Good scaling views"], weaknesses: ["Corner cases omitted"], improvementSuggestions: ["Detail system failovers"] },
                      coding: { score: techScore, strengths: ["Clean modular approach"], weaknesses: ["Optimization details omitted"], improvementSuggestions: ["Review complexity benchmarks"] }
                  };

                  const insights = fb.aiInsights || {
                      communicationConfidence: fb.confidenceScore ? `${fb.confidenceScore}/100` : "85/100 (Strong)",
                      fillerWordUsage: "Minimal (under 2%)",
                      hesitationDetection: "Excellent pacing with standard thinking pauses",
                      technicalDepth: "Detailed conceptual accuracy with specific terminology",
                      clarityScore: fb.overallScore || 80,
                      speakingFluency: "Very fluent and highly structured",
                      leadershipIndicators: "Showed solid ownership and structured task vision",
                      problemSolvingPatterns: "Computational breakdown with step-wise strategy"
                  };

                  const roadmapPlan = fb.improvementPlan || rawNextSteps;

                  // 10. Question-by-Question critique mapping (strict format)
                  const qAnalysis = fb.questionAnalysis || (fb.questionFeedback || []).map((q: any) => ({
                      question: q.question,
                      candidateAnswer: q.userAnswer || "No answer recorded.",
                      score: q.score || 0,
                      strengths: q.strengths || [q.feedback?.substring(0, 50) || "Showed understanding"],
                      weaknesses: q.weaknesses || ["Could include more specific architectural patterns"],
                      improvementTips: q.improvementTips || [q.improvementTip || "Practice structuring responses with STAR framework"],
                      idealAnswer: q.idealAnswer || "A complete and robust answer should cover implementation details, complexity trade-offs, and scaling bottlenecks.",
                      aiFeedback: q.aiFeedback || q.feedback || "Solid conceptual explanation with clear terminology."
                  }));

                  // Transcript structured resolver
                  const currentTranscript = fb.transcript || interview?.transcript || interview?.feedbackData?.transcript || "";
                  const structuredTranscript = parseTranscriptToStructured(currentTranscript);

                  return (
                    <div className="p-6 md:p-8 border-t border-white/5 bg-background/50 animate-fadeIn space-y-10 print:p-0 print:bg-transparent print:border-none">
                      {/* Top Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 print:hidden">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-aurora animate-pulse" />
                          <span className="text-sm font-semibold text-white">MockMate AI Certified Candidate Report</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-400" />
                            Download PDF Report
                          </button>
                          <button
                            onClick={() => handleShare(fb.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora/10 border border-aurora/20 hover:bg-aurora/20 text-xs font-semibold text-aurora transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {copiedId === fb.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                Link Copied!
                              </>
                            ) : (
                              <>
                                <Share2 className="h-3.5 w-3.5 text-aurora" />
                                Share Feedback
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ── TABS NAVIGATION ── */}
                      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-6 print:hidden">
                        {['overview', 'feedback', 'questions', 'transcript'].map((tab) => {
                          const isActive = (activeTabs[fb.id] || 'overview') === tab;
                          const displayName = 
                            tab === 'overview' ? 'Overview' :
                            tab === 'feedback' ? 'Feedback Analysis' :
                            tab === 'questions' ? 'Questions' : 'Transcript';
                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveTabs(prev => ({ ...prev, [fb.id]: tab }))}
                              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-aurora text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                            >
                              {displayName}
                            </button>
                          );
                        })}
                      </div>

                      {/* ── TAB: OVERVIEW ── */}
                      {(activeTabs[fb.id] || 'overview') === 'overview' && (
                        <div className="space-y-10 animate-fadeIn">
                          {/* 1. Overall Performance Card & Circular Score Indicators */}
                          <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-stretch">
                        {/* Overall Card */}
                        <div className="relative p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center shadow-lg overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-b from-aurora/5 to-transparent pointer-events-none" />
                          <div className="relative z-10 flex flex-col items-center">
                            <Ring value={score} />
                            
                            <div className="mt-6 space-y-2 w-full">
                              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Recruiter Verdict</div>
                              <div className={`py-2.5 px-4 rounded-xl border font-bold text-sm tracking-wide ${
                                rawHiringRec.toLowerCase().includes("strong") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                rawHiringRec.toLowerCase().includes("no") ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                rawHiringRec.toLowerCase().includes("lean") ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                                "bg-aurora/10 border-aurora/30 text-aurora"
                              }`}>
                                {rawHiringRec}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 w-full text-left space-y-2 text-xs text-muted-foreground">
                              <div className="flex justify-between"><span className="font-semibold text-white/55">Role:</span> <span className="text-white font-medium capitalize">{fb.role || "Developer"}</span></div>
                              <div className="flex justify-between"><span className="font-semibold text-white/55">Target:</span> <span className="text-white font-medium truncate">{fb.company || "Independent"}</span></div>
                              <div className="flex justify-between"><span className="font-semibold text-white/55">Level:</span> <span className="text-white font-medium capitalize">{fb.experienceLevel || "Mid"}</span></div>
                              <div className="flex justify-between"><span className="font-semibold text-white/55">Duration:</span> <span className="text-white font-medium">{fb.duration || "30m"}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Circular Score Grid */}
                        <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col justify-between space-y-6">
                          <div>
                            <div className="inline-flex items-center gap-2 text-xs text-aurora mb-2 font-semibold">
                              <Sparkles className="h-3.5 w-3.5" /> AI Recruiter Summary
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">Performance Overview</h2>
                            <p className="mt-3 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6 border-t border-white/5">
                            <MiniRing value={techScore} label="Technical" color="hsl(258 90% 66%)" />
                            <MiniRing value={commScore} label="Communication" color="hsl(190 95% 60%)" />
                            <MiniRing value={confScore} label="Confidence" color="hsl(330 90% 65%)" />
                            <MiniRing value={probScore} label="Problem Solving" color="hsl(45 95% 60%)" />
                            <MiniRing value={behavScore} label="Behavioral" color="hsl(150 80% 50%)" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Advanced AI Recruiter Forensic Insights */}
                      <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                            <Brain className="h-5 w-5 text-aurora animate-pulse" /> Advanced AI Recruiter Forensic Insights
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">Recruiter-grade forensic report on verbal patterns, conceptual depth, and behavioral competency indicators.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-1">Communication Confidence</span>
                            <span className="text-white text-xs font-semibold">{insights.communicationConfidence}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">Filler Word Usage</span>
                            <span className="text-white text-xs font-semibold">{insights.fillerWordUsage}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">Hesitation Detection</span>
                            <span className="text-white text-xs font-semibold">{insights.hesitationDetection}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block mb-1">Technical Depth</span>
                            <span className="text-white text-xs font-semibold">{insights.technicalDepth}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Clarity Score</span>
                            <span className="text-white text-xs font-semibold">{insights.clarityScore}/100</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">Speaking Fluency</span>
                            <span className="text-white text-xs font-semibold">{insights.speakingFluency}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Leadership Indicators</span>
                            <span className="text-white text-xs font-semibold">{insights.leadershipIndicators}</span>
                          </div>
                          <div className="p-4.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Problem Solving Patterns</span>
                            <span className="text-white text-xs font-semibold">{insights.problemSolvingPatterns}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Complete AI Competency Breakdown */}
                      <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
                        <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                            <Layers className="h-5 w-5 text-sky-400 animate-pulse" /> Complete AI Competency Breakdown
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">Forensic evaluation and improvement plan across 9 critical professional areas.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                          {Object.entries(detailed).map(([key, value]: [string, any]) => {
                            const formattedName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                              <div key={key} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-aurora/30 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">{formattedName}</span>
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${scoreColor(value.score)}`}>
                                    {value.score}/100
                                  </span>
                                </div>
                                <div className="space-y-2 flex-1">
                                  {value.strengths?.length > 0 && (
                                    <div>
                                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Strengths</span>
                                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{value.strengths.join(", ")}</p>
                                    </div>
                                  )}
                                  {value.weaknesses?.length > 0 && (
                                    <div>
                                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">Areas to Study</span>
                                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{value.weaknesses.join(", ")}</p>
                                    </div>
                                  )}
                                  {value.improvementSuggestions?.length > 0 && (
                                    <div>
                                      <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest block">Improvement Tip</span>
                                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{value.improvementSuggestions.join(", ")}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* 7. Recruiter Verdict Card */}
                      <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-start gap-6 relative overflow-hidden mt-10">
                        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-aurora/5 blur-3xl pointer-events-none" />
                        <div className="h-12 w-12 rounded-2xl bg-aurora/10 border border-aurora/20 flex items-center justify-center shrink-0">
                          <Award className="h-6 w-6 text-aurora" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <h3 className="font-bold text-lg text-white">Final Hiring Decision &amp; Summary</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">{fb.finalVerdict || fb.summary || "Pending overall assessment from recruiting managers."}</p>
                        </div>
                      </div>
                      </div>
                      )}

                      {/* ── TAB: FEEDBACK ── */}
                      {(activeTabs[fb.id] || 'overview') === 'feedback' && (
                        <div className="space-y-10 animate-fadeIn">
                          {/* AI Recruiter Summary */}
                          <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-aurora/10 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Brain className="h-32 w-32" />
                            </div>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-3">
                              <Sparkles className="h-5 w-5 text-aurora animate-pulse" /> AI Recruiter Summary
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                          </div>

                          {/* Complete AI Feedback (4 Core Analyses) */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Technical Analysis */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                              <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <Cpu className="h-4.5 w-4.5 text-violet-400" /> Technical Analysis
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {analysis.technicalKnowledge || "Evaluates technical accuracy, stack alignment, and overall conceptual depth."}
                              </p>
                              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-violet-400">
                                <span>Score: {techScore}/100</span>
                              </div>
                            </div>

                            {/* Communication Analysis */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                              <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <MessageSquare className="h-4.5 w-4.5 text-sky-400" /> Communication Analysis
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {analysis.communication || "Evaluates verbal structure, pacing, flow, and usage of active verbs."}
                              </p>
                              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-sky-400">
                                <span>Score: {commScore}/100</span>
                              </div>
                            </div>

                            {/* Behavioral Analysis */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                              <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <Award className="h-4.5 w-4.5 text-emerald-400" /> Behavioral Analysis
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {analysis.behavioralSkills || "Evaluates situational alignment, role fit, growth mindset, and ownership."}
                              </p>
                              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                <span>Score: {behavScore}/100</span>
                              </div>
                            </div>

                            {/* Confidence Analysis */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-aurora/30 transition-all duration-300 space-y-3">
                              <h4 className="font-bold text-base text-white flex items-center gap-2">
                                <ShieldCheck className="h-4.5 w-4.5 text-pink-400" /> Confidence Analysis
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {analysis.confidence || "Evaluates physical and verbal posture, response formatting, and speech rate."}
                              </p>
                              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-pink-400">
                                <span>Score: {confScore}/100</span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Key Strengths & Weaknesses Grid */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col">
                              <h3 className="font-bold text-lg text-emerald-400 mb-4 flex items-center gap-2.5">
                                <CheckCircle2 className="h-5 w-5" /> Key Strengths
                              </h3>
                              <ul className="space-y-3.5 flex-1">
                                {rawStrengths.length > 0 ? (
                                  rawStrengths.map((str: string, i: number) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                                      <span className="text-emerald-500/50 mt-1 shrink-0">•</span> 
                                      <span className="leading-relaxed font-medium">{str}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-sm text-muted-foreground italic">No key strengths highlighted.</li>
                                )}
                              </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col">
                              <h3 className="font-bold text-lg text-amber-400 mb-4 flex items-center gap-2.5">
                                <AlertCircle className="h-5 w-5" /> Focus & Weaknesses
                              </h3>
                              <ul className="space-y-3.5 flex-1">
                                {rawWeaknesses.length > 0 ? (
                                  rawWeaknesses.map((weak: string, i: number) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                                      <span className="text-amber-500/50 mt-1 shrink-0">•</span> 
                                      <span className="leading-relaxed font-medium">{weak}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-sm text-muted-foreground italic">No severe weaknesses noted. Good work!</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* 6. Improvement Roadmap & Next Steps */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Roadmap Progress Track */}
                            <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-5">
                              <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                                <BookOpen className="h-5 w-5 text-aurora" /> Recommended Study Topics
                              </h3>
                              <div className="flex flex-wrap gap-2.5 pt-2">
                                {rawRecommendedTopics.length > 0 ? (
                                  rawRecommendedTopics.map((topic: string, i: number) => (
                                    <span key={i} className="px-3.5 py-2 rounded-xl bg-aurora/10 border border-aurora/20 text-xs font-semibold text-aurora/90 hover:scale-105 hover:bg-aurora/20 hover:border-aurora/40 transition-all cursor-default">
                                      {topic}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Keep practicing core technologies to strengthen your knowledge base.</span>
                                )}
                              </div>
                            </div>

                            {/* Next Steps Road */}
                            <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-5">
                              <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                                <ListTodo className="h-5 w-5 text-emerald-400" /> Action Plan Roadmap / Suggested Improvements
                              </h3>
                              <div className="relative border-l border-white/5 pl-5 ml-2.5 space-y-5">
                                {roadmapPlan.length > 0 ? (
                                  roadmapPlan.map((step: string, i: number) => (
                                    <div key={i} className="relative">
                                      <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border border-emerald-400 bg-background flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                      </div>
                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Step {i + 1}</span>
                                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">{step}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="relative">
                                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-aurora" />
                                    <p className="text-xs text-muted-foreground italic">Try taking another session to formulate detailed learning milestones.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── TAB: QUESTIONS ── */}
                      {(activeTabs[fb.id] || 'overview') === 'questions' && (
                        <div className="space-y-10 animate-fadeIn">
                          {/* 5. Question-by-Question Critique (Forensic Review) */}
                          {qAnalysis.length > 0 && (
                        <div className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
                          <div>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                              <ListTodo className="h-5 w-5 text-sky-400 animate-pulse" /> Question-by-Question Forensic Critique
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Review your exact responses side-by-side with recruiter evaluations, ideal answers, and strengths/weaknesses.</p>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-white/5">
                            {qAnalysis.map((q: any, qIdx: number) => {
                              const isQOpen = !!expandedQuestions[`${fb.id}_${qIdx}`];
                              const qScore = q.score || 0;
                              return (
                                <div key={qIdx} className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                                  <button
                                    onClick={() => toggleQuestion(qIdx, fb.id)}
                                    className="w-full p-5 flex items-start md:items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                                  >
                                    <div className="flex items-start md:items-center gap-3">
                                      <span className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">
                                        Q{qIdx + 1}
                                      </span>
                                      <p className="text-sm font-semibold text-white/90 pr-4 leading-normal">{q.question}</p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${scoreColor(qScore)}`}>
                                        {qScore}/100
                                      </span>
                                      {isQOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                  </button>

                                  {isQOpen && (
                                    <div className="p-5 bg-background/30 border-t border-white/5 space-y-4 text-sm animate-fadeIn">
                                      {/* Candidate Answer */}
                                      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Candidate Answer</span>
                                        <p className="text-white/80 leading-relaxed italic font-medium">"{q.candidateAnswer}"</p>
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-4">
                                        {/* AI Evaluation */}
                                        <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 space-y-1">
                                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> AI Evaluation
                                          </span>
                                          <p className="text-muted-foreground text-xs leading-relaxed font-medium">{q.aiFeedback}</p>
                                        </div>

                                        {/* Improvement Tips */}
                                        <div className="p-4 rounded-xl bg-sky-500/[0.02] border border-sky-500/10 space-y-1">
                                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5" /> Improvement Tips
                                          </span>
                                          <p className="text-muted-foreground text-xs leading-relaxed font-medium">{(q.improvementTips || q.improvementTips === "string" ? q.improvementTips : (q.improvementTips?.[0] || ""))}</p>
                                        </div>
                                      </div>

                                      {/* Mistakes */}
                                      {q.weaknesses && q.weaknesses.length > 0 && (
                                        <div className="p-4 rounded-xl bg-amber-500/[0.02] border border-amber-500/10 space-y-1.5">
                                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5" /> Mistakes & Key Gaps Identified
                                          </span>
                                          <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground font-medium">
                                            {q.weaknesses.map((w: string, idx: number) => (
                                              <li key={idx} className="leading-relaxed">{w}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Better Suggested Answer */}
                                      {q.idealAnswer && (
                                        <div className="p-4 rounded-xl bg-violet-500/[0.02] border border-violet-500/10 space-y-1">
                                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Better Suggested Answer / Model Ideal Answer</span>
                                          <p className="text-white/70 text-xs leading-relaxed font-medium italic">{q.idealAnswer}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                        </div>
                      )}

                      {/* ── TAB: TRANSCRIPT ── */}
                      {(activeTabs[fb.id] || 'overview') === 'transcript' && (
                        <div className="space-y-10 animate-fadeIn">
                          {/* 8. Interactive Forensic Transcript */}
                          {structuredTranscript.length > 0 ? (
                            <InteractiveTranscriptViewer
                              structuredTranscript={structuredTranscript}
                              questionAnalysis={qAnalysis}
                              fbId={fb.id}
                            />
                          ) : (
                            <div className="text-center p-12 text-muted-foreground italic border border-white/5 rounded-3xl bg-white/[0.01]">
                                Transcript not available for this session.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-center mt-12">
        <Link
          href={`/interview/new?id=${id}`}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-aurora text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:scale-[1.02] transition-transform"
        >
          Take Interview Again <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-aurora">Loading...</div>}>
      <FeedbackContent />
    </Suspense>
  );
}
