"use client";

import { Mic, FileText, Sparkles, Zap, Brain } from "lucide-react";
import { useState } from "react";

interface Props {
  userName: string;
  onSelect: (path: "form" | "voice") => void;
}

export const ChoiceModal = ({ userName, onSelect }: Props) => {
  const [hovered, setHovered] = useState<"form" | "voice" | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden" style={{ background: "#03001a" }}>
      
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.6) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-40 left-1/4 w-80 h-80 rounded-full blur-[120px] bg-fuchsia-800/20" />
        <div className="absolute top-1/3 -right-20 w-60 h-60 rounded-full blur-[100px] bg-violet-800/20" />
      </div>

      {/* Header */}
      <div className="text-center mb-14 relative z-10" style={{ animation: "fadeSlideUp 0.7s ease both" }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
          <Sparkles className="h-3.5 w-3.5" />
          New Interview Session
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
          Hey {userName}! 👋
          <br />
          <span style={{
            backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc, #67e8f9)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}>
            Let's get you interview-ready
          </span>
        </h1>

        <p className="mt-5 text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
          Taking this step already shows your dedication. Choose how you'd like to set up your practice session.
        </p>
      </div>

      {/* Choice Cards */}
      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl relative z-10" style={{ animation: "fadeSlideUp 0.9s ease both" }}>
        
        {/* ── Form Card (ACTIVE) ── */}
        <button
          onClick={() => onSelect("form")}
          onMouseEnter={() => setHovered("form")}
          onMouseLeave={() => setHovered(null)}
          className="group relative rounded-3xl p-8 text-left overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03]"
          style={{
            background: hovered === "form"
              ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(139,92,246,0.1))"
              : "rgba(255,255,255,0.04)",
            border: hovered === "form"
              ? "1px solid rgba(139,92,246,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: hovered === "form"
              ? "0 0 60px rgba(139,92,246,0.25), 0 20px 60px rgba(0,0,0,0.4)"
              : "0 8px 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* Corner glow */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] transition-opacity duration-500"
            style={{ background: "rgba(124,58,237,0.3)", opacity: hovered === "form" ? 1 : 0 }} />

          <div className="relative z-10">
            {/* Icon */}
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
              style={{
                background: hovered === "form" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)",
                border: hovered === "form" ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: hovered === "form" ? "0 0 30px rgba(124,58,237,0.5)" : "none",
              }}>
              <FileText className="h-7 w-7 transition-colors duration-300" style={{ color: hovered === "form" ? "#a78bfa" : "#6b7280" }} />
            </div>

            <h3 className="text-xl font-bold mb-3 transition-colors duration-300"
              style={{ color: hovered === "form" ? "#ffffff" : "#d1d5db" }}>
              Fill the Form
            </h3>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Type in your role, skills, and optionally upload your resume or job description. Quick and precise.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Role & Skills", "File Upload", "Custom Level"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-3 py-1 rounded-full font-medium transition-all duration-300"
                  style={{
                    background: hovered === "form" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                    border: hovered === "form" ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: hovered === "form" ? "#c4b5fd" : "#6b7280",
                  }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Arrow CTA */}
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold transition-all duration-300"
              style={{ color: hovered === "form" ? "#a78bfa" : "#4b5563" }}>
              <span>Get started</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </button>

        {/* ── Voice Card (Coming Soon) ── */}
        <button
          disabled
          type="button"
          className="group relative rounded-3xl p-8 text-left overflow-hidden cursor-not-allowed transition-all duration-500 opacity-60"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          }}
        >
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
            Coming Soon
          </div>

          <div className="relative z-10 grayscale">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
              <Mic className="h-7 w-7 text-slate-500" />
            </div>

            <h3 className="text-xl font-bold mb-3 text-slate-300">
              Use Voice Agent
            </h3>
            <p className="text-sm leading-relaxed mb-6 text-slate-500">
              Tell our AI assistant about your interview needs. Just speak naturally — it'll handle the rest.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Hands-Free", "AI Powered", "Quick Setup"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-3 py-1 rounded-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "#6b7280",
                  }}>
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Arrow CTA */}
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span>Temporarily disabled</span>
            </div>
          </div>
        </button>
      </div>

      {/* Trust note */}
      <div className="mt-12 flex items-center gap-2 text-xs text-slate-600 relative z-10" style={{ animation: "fadeSlideUp 1.1s ease both" }}>
        <Brain className="h-3.5 w-3.5" />
        AI generates personalised questions in under 30 seconds
        <Zap className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChoiceModal;
