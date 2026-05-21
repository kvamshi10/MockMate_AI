"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Calendar, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Play, 
  FileText, 
  RotateCcw, 
  Filter, 
  Sliders,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnalyticsOverview from "@/components/AnalyticsOverview";
import DisplayTechIcons from "@/components/DisplayTechIcons";

type Interview = {
  id: string;
  interviewId?: string;
  role: string;
  type: string | string[];
  techstack: string[];
  createdAt: string;
  score?: number | null;
  latestScore?: number | null;
  attemptCount?: number;
  companyName?: string;
  level?: string;
  lastDurationSeconds?: number;
  sessionLogs?: any[];
};

interface DashboardClientViewProps {
  user: {
    uid: string;
    name: string;
    email?: string;
    photoURL?: string | null;
  };
  userInterviews: Interview[];
  availableInterviews: Interview[];
}

const getRoleEmoji = (role: string = "", type: string = "") => {
  const r = role.toLowerCase();
  const t = typeof type === 'string' ? type.toLowerCase() : "";
  if (r.includes("engineer") || r.includes("developer") || t.includes("technical")) return "💻";
  if (r.includes("design") || t.includes("creative")) return "🎨";
  if (r.includes("data") || r.includes("analy") || t.includes("scientific")) return "📊";
  if (r.includes("manager") || r.includes("product") || t.includes("managerial")) return "🎯";
  if (r.includes("hr") || r.includes("human") || t.includes("behavioral")) return "🤝";
  return "💼";
};

const formatDate = (iso: string) => {
  if (!iso) return { date: "N/A", time: "N/A" };
  const d = new Date(iso);
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  
  let hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' is '12'
  
  return { 
    date: `${month} ${day}, ${year}`, 
    time: `${String(hours).padStart(2, "0")}:${minutes} ${ampm} UTC` 
  };
};

const formatDuration = (s: number) => {
  if (!s) return "00:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default function DashboardClientView({
  user,
  userInterviews,
  availableInterviews
}: DashboardClientViewProps) {
  // 1. Deduplicate interviews
  const uniqueInterviews = useMemo(() => {
    return userInterviews.filter(
      (item, index, self) =>
        index === self.findIndex(
          (t) => (t.interviewId || t.id) === (item.interviewId || item.id)
        )
    );
  }, [userInterviews]);

  // States for search and filtering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [pageSize, setPageSize] = useState(10);

  // Get dynamic unique roles for filtering dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    uniqueInterviews.forEach(i => {
      if (i.role) roles.add(i.role.trim());
    });
    return Array.from(roles);
  }, [uniqueInterviews]);

  // Compute status for each interview
  const interviewWithStatus = useMemo(() => {
    return uniqueInterviews.map(i => {
      const score = i.latestScore ?? i.score;
      const sessionLogs = i.sessionLogs || [];
      const rawAttempts = i.attemptCount || 0;
      const logAttempts = Array.isArray(sessionLogs) ? sessionLogs.length : 0;
      const attempts = Math.max(rawAttempts, logAttempts, score != null ? 1 : 0);
      const taken = attempts > 0 || score != null || (Array.isArray(sessionLogs) && sessionLogs.length > 0);
      
      let status: "Completed" | "In Progress" | "Not Taken" = "Not Taken";
      if (score != null) {
        status = "Completed";
      } else if (taken) {
        status = "In Progress";
      }

      return {
        ...i,
        attempts,
        status,
        score
      };
    });
  }, [uniqueInterviews]);

  // Filter & Sort list
  const filteredInterviews = useMemo(() => {
    let result = [...interviewWithStatus];

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.role?.toLowerCase().includes(q) || 
        i.companyName?.toLowerCase().includes(q) || 
        (Array.isArray(i.type) ? i.type.join(" ") : i.type)?.toLowerCase().includes(q) ||
        i.techstack?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter(i => i.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Role Filter
    if (roleFilter !== "all") {
      result = result.filter(i => i.role === roleFilter);
    }

    // Sort order
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [interviewWithStatus, searchQuery, statusFilter, roleFilter, sortOrder]);

  // Paginated list
  const paginatedInterviews = useMemo(() => {
    return filteredInterviews.slice(0, pageSize);
  }, [filteredInterviews, pageSize]);

  return (
    <main className="container mx-auto py-10 px-4 md:px-8 space-y-12 animate-fade-in-up">
      {!mounted ? (
        <>
          {/* Hero banner placeholder */}
          <section className="relative rounded-[32px] overflow-hidden border border-white/8 p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, hsl(250 30% 8%) 0%, hsl(260 25% 11%) 100%)" }}
          >
            <div className="max-w-xl space-y-6">
              <div className="h-6 w-48 rounded-full bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
                <div className="h-10 w-2/3 rounded-xl bg-white/5 animate-pulse" />
              </div>
              <div className="h-12 w-40 rounded-full bg-white/5 animate-pulse" />
            </div>
          </section>

          {/* Analytics overview placeholder */}
          <section className="space-y-4">
            <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01] h-32 animate-pulse" />
              ))}
            </div>
          </section>

          {/* History placeholder */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
              </div>
            </div>

            {/* Sticky filter bar skeleton */}
            <div className="p-4 rounded-[24px] border border-white/5 bg-slate-950/60 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="h-10 w-full md:max-w-xs rounded-xl bg-white/5 animate-pulse" />
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <div className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* Rows skeleton */}
            <div className="space-y-3.5">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="p-5 rounded-[24px] border border-white/5 bg-white/[0.01] h-24 animate-pulse" />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* ── HERO CTA CARD (Without View Full Feedback button) ── */}
          <section className="relative rounded-[32px] overflow-hidden border border-white/8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.5)]"
            style={{ background: "linear-gradient(135deg, hsl(250 30% 8%) 0%, hsl(260 25% 11%) 50%, hsl(240 30% 9%) 100%)" }}
          >
        {/* Ambient glow blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/25 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 right-8 h-72 w-72 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 p-8 md:p-12 items-center">
          <div className="max-w-xl space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-aurora/30 bg-aurora/10 text-xs font-semibold text-aurora/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 animate-spin" />
              AI-powered interview practice &amp; metrics
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                Get interview-ready with
              </h1>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                AI practice &amp; feedback
              </h1>
            </div>

            {/* Sub */}
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md font-medium">
              Practice real interview questions with a voice-first AI coach and get
              instant, forensic feedback on every answer. Secure reports are centralized down below.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/interview/new"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm text-white shadow-[0_0_25px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, hsl(263 70% 55%), hsl(245 75% 60%))" }}
              >
                <Zap className="h-4 w-4" />
                Start an Interview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Robot image */}
          <div className="hidden md:flex items-end justify-end self-end">
            <Image
              src="/robot.png"
              alt="MockMate AI robot"
              width={380}
              height={380}
              priority
              className="w-[280px] xl:w-[320px] drop-shadow-[0_20px_50px_hsl(258_90%_55%/0.45)] animate-float"
            />
          </div>
        </div>
      </section>

      {/* ── ANALYTICS SECTION ── */}
      {uniqueInterviews.length > 0 && (
        <AnalyticsOverview interviews={uniqueInterviews} />
      )}

      {/* ── REDESIGNED INTERVIEW HISTORY & WORKSPACE ── */}
      <section id="your-interviews" className="scroll-mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-aurora font-bold">Workspace</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white">Interview History</h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
            {filteredInterviews.length} Records
          </span>
        </div>

        {/* ── STICKY GLASSMORPHIC SEARCH & FILTERS BAR ── */}
        <div className="sticky top-4 z-40 p-4 rounded-[24px] border border-white/5 bg-slate-950/60 backdrop-blur-md shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/5 focus:outline-none focus:border-aurora text-white transition-all font-medium"
            />
          </div>

          {/* Filters dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Filter by Status */}
            <div className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-bold text-slate-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-white pr-2 cursor-pointer font-bold"
              >
                <option value="all" className="bg-slate-950 text-white">All Statuses</option>
                <option value="completed" className="bg-slate-950 text-white">Completed</option>
                <option value="in progress" className="bg-slate-950 text-white">In Progress</option>
                <option value="not taken" className="bg-slate-950 text-white">Not Taken</option>
              </select>
            </div>

            {/* Filter by Role */}
            {uniqueRoles.length > 0 && (
              <div className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-bold text-slate-300">
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs text-white pr-2 cursor-pointer font-bold max-w-[140px]"
                >
                  <option value="all" className="bg-slate-950 text-white">All Roles</option>
                  {uniqueRoles.map((role, idx) => (
                    <option key={idx} value={role} className="bg-slate-950 text-white capitalize">{role}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sorting order */}
            <div className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-bold text-slate-300">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent focus:outline-none text-xs text-white pr-2 cursor-pointer font-bold"
              >
                <option value="latest" className="bg-slate-950 text-white">Latest First</option>
                <option value="oldest" className="bg-slate-950 text-white">Oldest First</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── LIST LAYOUT MATRIX ── */}
        {!filteredInterviews.length ? (
          <div className="rounded-[32px] border border-white/5 bg-white/[0.01] p-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <span className="text-4xl">🔎</span>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-white">No matches found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                We couldn't find any interviews matching your search terms or filters. Try adjusting your selections above.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Table Header for larger screens */}
            <div className="hidden lg:grid grid-cols-[1.2fr_1fr_1.1fr] gap-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div>Role &amp; Competency Info</div>
              <div className="text-center">Timeline &amp; Assessment Log</div>
              <div className="text-right">Action Gateway</div>
            </div>

            {/* List Rows */}
            <div className="space-y-3.5">
              {paginatedInterviews.map((interview, index) => {
                const dateData = formatDate(interview.createdAt);
                const typeStr = Array.isArray(interview.type) ? interview.type[0] : interview.type || "Technical";
                const company = interview.companyName?.trim() || "Independent";

                return (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.4) }}
                    className="p-5 rounded-[24px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 hover:bg-white/[0.02] shadow-sm transition-all duration-300 grid lg:grid-cols-[1.2fr_1fr_1.1fr] gap-6 items-center"
                  >
                    
                    {/* LEFT COLUMN: Logo, Role, Type, Stack */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        {getRoleEmoji(interview.role, typeStr)}
                      </div>
                      
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] font-bold text-aurora uppercase tracking-wider truncate">
                            {company}
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400 capitalize">
                            {interview.level || "Mid-Level"}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-extrabold text-white truncate capitalize leading-tight">
                          {interview.role} Interview
                        </h3>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-aurora/10 border border-aurora/20 text-aurora uppercase tracking-wider">
                            {typeStr}
                          </span>
                          <DisplayTechIcons techstack={interview.techstack || []} />
                        </div>
                      </div>
                    </div>

                    {/* CENTER COLUMN: Date, Time, Duration, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-4 text-xs font-semibold text-slate-300 lg:text-center">
                      
                      {/* Timeline */}
                      <div className="space-y-1 min-w-[120px]">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Session Date</span>
                        <div className="flex items-center gap-1.5 lg:justify-center text-xs">
                          <Calendar className="h-3.5 w-3.5 text-violet-400" />
                          <span suppressHydrationWarning>{dateData.date}</span>
                        </div>
                        <span suppressHydrationWarning className="text-[10px] text-slate-400 block lg:text-center mt-0.5">{dateData.time}</span>
                      </div>

                      {/* Duration */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Duration</span>
                        <div className="flex items-center gap-1.5 lg:justify-center text-xs">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>
                            {interview.lastDurationSeconds ? formatDuration(interview.lastDurationSeconds) : "30m"}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Status</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          interview.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          interview.status === "In Progress" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            interview.status === "Completed" ? "bg-emerald-400" :
                            interview.status === "In Progress" ? "bg-amber-400 animate-pulse" :
                            "bg-slate-400"
                          }`} />
                          {interview.status}
                        </span>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Status-Aware Dynamic Actions */}
                    <div className="flex items-center gap-2.5 justify-end flex-wrap">
                      
                      {/* COMPLETED STATUS */}
                      {interview.status === "Completed" && (
                        <>
                          <Link
                            href={`/feedback/${interview.id}`}
                            className="px-4 py-2 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Full Report</span>
                          </Link>
                          <Link
                            href={`/interview/new?id=${interview.id}`}
                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                            <span>Retry</span>
                          </Link>
                        </>
                      )}

                      {/* IN PROGRESS STATUS */}
                      {interview.status === "In Progress" && (
                        <Link
                          href={`/interview?id=${interview.id}`}
                          className="px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Resume Interview</span>
                        </Link>
                      )}

                      {/* NOT TAKEN STATUS */}
                      {interview.status === "Not Taken" && (
                        <Link
                          href={`/interview/new?id=${interview.id}`}
                          className="px-5 py-2.5 rounded-full bg-aurora text-white text-xs font-bold uppercase tracking-wider hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Take Interview</span>
                        </Link>
                      )}

                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* Pagination / Dynamic Load More */}
            {filteredInterviews.length > pageSize && (
              <div className="pt-4 flex justify-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPageSize(prev => prev + 10)}
                  onKeyDown={(e) => e.key === 'Enter' && setPageSize(prev => prev + 10)}
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer select-none"
                >
                  Show More Records
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* ── REDESIGNED TAKABLE / AVAILABLE INTERVIEWS ── */}
      <section className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-aurora font-bold">Discover</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white">Available Practice Roles</h2>
        </div>

        {availableInterviews.length ? (
          <div className="space-y-3.5">
            {availableInterviews.map((i, index) => {
              const typeStr = Array.isArray(i.type) ? i.type[0] : i.type || "Technical";
              
              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.05 + 0.1, 0.4) }}
                  className="p-5 rounded-[24px] border border-white/5 bg-white/[0.01] hover:border-aurora/30 hover:bg-white/[0.02] shadow-sm transition-all duration-300 grid lg:grid-cols-[1.5fr_1fr] gap-6 items-center"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600/15 to-indigo-600/15 border border-white/10 flex items-center justify-center text-lg shrink-0 shadow-inner">
                      {getRoleEmoji(i.role, typeStr)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-base font-extrabold text-white truncate capitalize leading-tight">
                        {i.role} Practice Session
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-aurora/10 border border-aurora/20 text-[9px] font-bold text-aurora uppercase tracking-wider">
                          {typeStr}
                        </span>
                        <DisplayTechIcons techstack={i.techstack || []} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    <Link
                      href={`/interview/new?id=${i.id}`}
                      className="px-6 py-2.5 rounded-full bg-aurora text-white text-xs font-bold uppercase tracking-wider hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.35)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Configure Practice</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-10 text-center text-muted-foreground">
            There are no pre-configured interviews currently available. You can construct dynamic custom configurations.
          </div>
        )}
      </section>
        </>
      )}
    </main>
  );
}
