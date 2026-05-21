"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Star, ArrowRight, X } from "lucide-react";
import { Suspense, useState } from "react";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import CompanyLogo from "@/components/CompanyLogo";
import CardSpotlight from "@/components/CardSpotlight";

const getRoleIcon = (role: string = "", type: string = "") => {
  const r = role.toLowerCase();
  const t = type.toLowerCase();
  let emoji = "💼"; // default: Briefcase

  if (r.includes("engineer") || r.includes("developer") || t.includes("technical")) {
    emoji = "💻";
  } else if (r.includes("design") || t.includes("creative")) {
    emoji = "🎨";
  } else if (r.includes("data") || r.includes("analy") || t.includes("scientific")) {
    emoji = "📊";
  } else if (r.includes("manager") || r.includes("product") || t.includes("managerial")) {
    emoji = "🎯";
  } else if (r.includes("hr") || r.includes("human") || t.includes("behavioral")) {
    emoji = "🤝";
  } else if (r.includes("market") || r.includes("sale")) {
    emoji = "📣";
  }

  return <span className="text-2xl select-none" role="img" aria-label={role}>{emoji}</span>;
};

export type Interview = {
  id: string;
  role: string;
  type: string | string[];
  techstack: string[];
  createdAt: string;
  score?: number | null;
  cover?: string;
  coverGradient?: string;
  companyName?: string;
  latestScore?: number | null;
  attemptCount?: number;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date} • ${time}`;
};

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const scoreColor = (s: number) =>
  s >= 90 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" :
  s >= 75 ? "text-yellow-400  bg-yellow-400/10  border-yellow-400/30"  :
  s >= 50 ? "text-orange-400  bg-orange-400/10  border-orange-400/30"  :
             "text-red-400    bg-red-400/10    border-red-400/30";

const scoreLabel = (s: number) =>
  s >= 90 ? "Excellent" : s >= 75 ? "Good" : s >= 50 ? "Average" : "Needs Work";

const InterviewCard = ({ interview }: { interview: Interview }) => {
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const score    = interview.latestScore ?? interview.score;
  const sessionLogs = (interview as any).sessionLogs || [];
  const rawAttempts = interview.attemptCount || 0;
  const logAttempts = Array.isArray(sessionLogs) ? sessionLogs.length : 0;
  const attempts = Math.max(rawAttempts, logAttempts, score != null ? 1 : 0);

  const taken    = attempts > 0 || 
                   score != null || 
                   (Array.isArray(sessionLogs) && sessionLogs.length > 0);
  const typeStr  = Array.isArray(interview.type) ? interview.type[0] : interview.type;
  const company  = interview.companyName?.trim() || "";

  return (
    <CardSpotlight>
      {taken && score != null && (
        <div className="absolute top-3 right-3 z-20 group/star cursor-help">
          <div className="relative flex items-center justify-center h-12 w-12 hover:scale-110 transition-transform">
            <Star className={`h-10 w-10 fill-current ${
              score >= 90 ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" :
              score >= 75 ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" :
              score >= 50 ? "text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]" :
              "text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]"
            }`} />
            <span className="absolute text-[11px] font-bold text-[hsl(250_25%_9%)] pt-0.5 pointer-events-none">
              {score}
            </span>
          </div>

          {/* Hover Tooltip explaining ranges */}
          <div className="absolute top-12 right-0 w-44 p-3 rounded-xl bg-[hsl(250_25%_15%)] border border-white/10 shadow-2xl opacity-0 translate-y-2 group-hover/star:opacity-100 group-hover/star:translate-y-0 transition-all pointer-events-none z-30">
             <div className="text-xs font-semibold text-white mb-2">Score Scale</div>
             <div className="space-y-1.5 text-[10px]">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]"></div><span className="text-muted-foreground">90-100 Excellent</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_#facc15]"></div><span className="text-muted-foreground">75-89 Good</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_5px_#fb923c]"></div><span className="text-muted-foreground">50-74 Average</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_5px_#f87171]"></div><span className="text-muted-foreground">&lt; 50 Needs Work</span></div>
             </div>
          </div>
        </div>
      )}

      {/* ── Top accent line ── */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity relative z-10" />

      {/* ── Header: logo + company name + type badge ── */}
      <div className="p-5 pb-3 flex items-start gap-3 justify-between">

        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo container without white background */}
          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl">
            {interview.cover ? (
              <div className={`h-full w-full ${interview.coverGradient || "bg-gradient-to-br from-violet-500 to-indigo-600"} flex items-center justify-center shadow-inner drop-shadow-md`}>
                <span className="text-2xl select-none" role="img">{interview.cover}</span>
              </div>
            ) : company ? (
              <CompanyLogo name={company} fallbackNode={getRoleIcon(interview.role, typeStr)} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-inner drop-shadow-md">
                {getRoleIcon(interview.role, typeStr)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {/* Company name */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-aurora truncate">
              {company || "Independent"}
            </p>
            {/* Role */}
            <div className="relative group/role inline-block max-w-full">
              <h3 className="text-[15px] font-bold text-white capitalize leading-snug truncate mt-0.5 cursor-help hover:text-aurora transition-colors">
                {interview.role} Interview
              </h3>
              
              {/* Gorgeous Tooltip for Full Role Title */}
              <div className="absolute top-full left-0 mt-1.5 w-max max-w-[260px] p-2.5 rounded-xl bg-[hsl(250_25%_12%)]/95 backdrop-blur-md border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.5)] opacity-0 scale-95 origin-top-left group-hover/role:opacity-100 group-hover/role:scale-100 transition-all duration-200 pointer-events-none z-30">
                <div className="text-[9px] font-bold text-aurora uppercase tracking-wider mb-1">Full Position Title</div>
                <p className="text-xs font-semibold text-white capitalize leading-normal">
                  {interview.role} Interview
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Type badge */}
        <span className="flex-shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-muted-foreground font-medium">
          {typeStr}
        </span>
      </div>

      {/* ── Date + score row ── */}
      <div className="px-5 pb-3 flex items-center gap-3 flex-wrap relative">
        <button
          onClick={() => taken && setShowTelemetryModal(true)}
          disabled={!taken}
          className={`flex items-center gap-1.5 text-xs text-muted-foreground transition-all duration-200 ${
            taken ? "hover:text-white cursor-pointer active:scale-95" : "cursor-default"
          }`}
        >
          <Calendar className="h-3 w-3 flex-shrink-0" />
          {formatDate(interview.createdAt)}
          {taken && (
            <span className="text-[9px] uppercase tracking-wider bg-aurora/10 text-aurora border border-aurora/20 rounded px-1.5 py-0.5 ml-1 animate-pulse font-semibold">
              View History
            </span>
          )}
        </button>

        {score != null ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 flex-shrink-0" />
            Completed
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 flex-shrink-0" />
            {taken ? "Completed" : "Not taken"}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-auto h-px bg-white/[0.05]" />

      {/* ── Footer: tech icons + CTA ── */}
      <div className="p-4 pt-3 flex items-center justify-between gap-3">
        <Suspense fallback={<div className="h-7 w-24 rounded-full bg-white/5 animate-pulse" />}>
          <DisplayTechIcons techstack={interview.techstack ?? []} />
        </Suspense>

        <div className="flex items-center gap-2 flex-shrink-0">
          {taken && (
            <Link
              href={`/feedback?id=${interview.id}`}
              className="text-[10px] uppercase tracking-wider px-4 py-2 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/40 hover:text-white transition-all font-bold"
            >
              View Full Report
            </Link>
          )}
          <Link
            href={`/interview/new?id=${interview.id}`}
            className="inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full bg-aurora text-white font-semibold hover:scale-[1.04] active:scale-[0.98] transition-transform shadow-[0_0_14px_rgba(139,92,246,0.4)]"
          >
            {taken ? "Try again" : "Take it"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Telemetry History Modal ── */}
      {showTelemetryModal && (
        <div 
          onClick={() => setShowTelemetryModal(false)}
          className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md my-auto rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            style={{ background: "linear-gradient(135deg, hsl(250 30% 8%) 0%, hsl(260 25% 11%) 100%)" }}
          >
            {/* Top shimmer accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/40 to-transparent" />

            {/* Glowing violet orb in background */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-aurora/10 blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-aurora uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-aurora animate-pulse"></span>
                  Interview History
                </p>
                <h3 className="text-lg font-bold text-white mt-1 capitalize leading-snug">{interview.role}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{company || "Independent"} Interview</p>
              </div>
              <button 
                onClick={() => setShowTelemetryModal(false)}
                className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Grid Stats */}
            <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
              {/* Total Attempts */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Attempts</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">{attempts}</span>
                  <span className="text-xs text-muted-foreground">{attempts === 1 ? 'try' : 'tries'}</span>
                </div>
              </div>

              {/* Last Duration */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Last Duration</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">
                    {(interview as any).lastDurationSeconds != null && (interview as any).lastDurationSeconds > 0 
                      ? formatDuration((interview as any).lastDurationSeconds)
                      : "00:00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed History */}
            <div className="relative z-10 space-y-4">
              {/* Last Session Timestamp */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">Last Session Timestamp</span>
                <div className="flex items-center gap-2 text-xs text-white">
                  <Calendar className="h-4 w-4 text-aurora shrink-0" />
                  <span className="font-semibold">
                    {((interview as any).latestAttemptAt || (interview as any).lastSessionAt) != null
                      ? formatDate((interview as any).latestAttemptAt || (interview as any).lastSessionAt)
                      : formatDate(interview.createdAt)}
                  </span>
                </div>
              </div>

              {/* Attached Materials */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-3">Loaded Documents (Sent to Vapi)</span>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Resume / CV:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${(interview as any).resumeText ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-muted-foreground"}`}>
                      {(interview as any).resumeText ? "Uploaded" : "Not Provided"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Job Description:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${(interview as any).jdText ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-muted-foreground"}`}>
                      {(interview as any).jdText ? "Uploaded" : "Not Provided"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prep Material:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${(interview as any).prepText ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-muted-foreground"}`}>
                      {(interview as any).prepText ? "Uploaded" : "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="px-6 py-2 rounded-full bg-aurora text-white text-xs font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </CardSpotlight>
  );
};

export default InterviewCard;
