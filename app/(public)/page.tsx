import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Mic, Zap, BarChart3, CheckCircle } from "lucide-react";
import { getRecentUsers, isAuthenticated } from "@/lib/actions/auth.action";
import HeroGraphic from "@/components/HeroGraphic";

export default async function LandingPage() {
  // Wrapped in try/catch: a transient Firestore ECONNRESET should never crash the landing page.
  let recentUsers: string[] = [];
  let isUserAuthenticated = false;

  try {
    [recentUsers, isUserAuthenticated] = await Promise.all([
      getRecentUsers(4),
      isAuthenticated(),
    ]);
  } catch {
    // Network hiccup — page still renders with fallback avatars and logged-out state
  }

  const displayAvatars =
    recentUsers.length > 0
      ? recentUsers
      : ["/avatars/dog.png", "/avatars/panda.png", "/avatars/robot.png", "/avatars/batman.png"];

  return (
    <main className="flex flex-col min-h-screen overflow-hidden" style={{ background: "#03001a" }}>
      
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {/* Radial glow top */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, transparent 65%)" }} />
        {/* Ambient orbs */}
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full blur-[120px] bg-violet-700/25" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full blur-[120px] bg-fuchsia-700/20" />
        <div className="absolute top-2/3 left-1/3 w-60 h-60 rounded-full blur-[100px] bg-cyan-700/10" />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 px-4 z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

            {/* Left: Copy */}
            <div className="flex-1 space-y-8 text-center lg:text-left" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
                style={{
                  background: "rgba(139,92,246,0.1)",
                  borderColor: "rgba(139,92,246,0.35)",
                  color: "#c4b5fd",
                  boxShadow: "0 0 30px rgba(139,92,246,0.15) inset",
                }}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Interview Coach</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.04] text-white">
                  Ace every interview
                  <br />
                  with{" "}
                  <span
                    className="relative inline-block"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc, #67e8f9)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    AI precision
                    {/* Underline glow */}
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #a78bfa, #f0abfc, #67e8f9)",
                        boxShadow: "0 0 20px rgba(167,139,250,0.8)",
                        animation: "shimmerLine 3s linear infinite",
                      }}
                    />
                  </span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                MockMateAI simulates real interviews with a conversational voice AI — then gives you instant, forensic feedback so you grow faster than any prep course.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href={isUserAuthenticated ? "/interview/new" : "/sign-up"}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-transform hover:scale-[1.03]"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                    boxShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.2)",
                  }}
                >
                  <span className="relative z-10">Start an Interview</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  {/* Inner shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)" }} />
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-2 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {displayAvatars.map((url, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 overflow-hidden"
                      style={{ borderColor: "#03001a", background: "#1a1a2e" }}
                    >
                      <Image src={url} alt="" width={36} height={36} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {"★★★★★"}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">10,000+ job seekers trained</p>
                </div>
              </div>
            </div>

            {/* Right: 3D Graphic */}
            <div className="w-full max-w-lg lg:max-w-none lg:flex-1">
              <HeroGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative z-10 border-y py-8" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Interviews Completed" },
              { value: "94%", label: "Success Rate" },
              { value: "50+", label: "Job Categories" },
              { value: "< 30s", label: "Questions Generated" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc)" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 relative z-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest"
              style={{ background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Zap className="h-3 w-3" /> Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Everything you need to{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg,#a78bfa,#f0abfc)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                succeed
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Our platform provides a comprehensive suite of tools designed to simulate real-world interviews and provide actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic className="h-6 w-6" />,
                color: "#7c3aed",
                glow: "rgba(124,58,237,0.35)",
                title: "Voice-First Experience",
                desc: "Practice exactly like a real interview. Speak naturally while our AI transcribes and analyses your responses in real-time.",
                perks: ["Real-time transcription", "Natural conversation flow"],
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                color: "#a855f7",
                glow: "rgba(168,85,247,0.35)",
                title: "Forensic Feedback",
                desc: "Get instant, detailed feedback on tone, clarity, and technical depth. Every answer is scored across multiple dimensions.",
                perks: ["Multi-dimension scoring", "Instant analysis"],
                featured: true,
              },
              {
                icon: <Zap className="h-6 w-6" />,
                color: "#06b6d4",
                glow: "rgba(6,182,212,0.35)",
                title: "Dynamic Questions",
                desc: "AI generates tailored questions for your specific role, industry, and level — with smart follow-ups based on your answers.",
                perks: ["Role-specific questions", "Adaptive follow-ups"],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="relative rounded-3xl p-8 overflow-hidden group transition-all duration-500 hover:scale-[1.02]"
                style={{
                  background: f.featured
                    ? `linear-gradient(135deg, rgba(168,85,247,0.15), rgba(139,92,246,0.08))`
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${f.featured ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: f.featured ? `0 0 60px ${f.glow}` : "none",
                }}
              >
                {f.featured && (
                  <div className="absolute top-5 right-5 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest text-purple-300"
                    style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)" }}>
                    Most Popular
                  </div>
                )}
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: f.glow }} />

                <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                  style={{ background: `${f.color}22`, border: `1px solid ${f.color}44`, color: f.color, boxShadow: `0 0 20px ${f.color}30`, width: 52, height: 52 }}>
                  {f.icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-5 relative z-10 text-sm">{f.desc}</p>

                <ul className="space-y-2 relative z-10">
                  {f.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: f.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative z-10 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          {/* Glow backdrop */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[300px] rounded-full blur-[120px] opacity-30"
              style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.6), transparent)" }} />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest mb-6"
              style={{ background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Sparkles className="h-3 w-3" /> Get Started Today
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-tight mb-6">
              Ready to ace your
              <br />
              <span style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc, #67e8f9)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                next interview?
              </span>
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10">
              Join thousands of job seekers who've levelled up their skills with MockMateAI.
            </p>

            <Link
              href={isUserAuthenticated ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold text-white text-lg transition-all hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                boxShadow: "0 0 50px rgba(168,85,247,0.5), 0 0 100px rgba(168,85,247,0.2)",
              }}
            >
              {isUserAuthenticated ? "Go to Dashboard" : "Start Practising Now"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 border-t text-center text-sm text-slate-600 relative z-10"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p>© {new Date().getFullYear()} MockMateAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
