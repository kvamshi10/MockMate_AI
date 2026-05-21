import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, Shield, Zap, Sparkles, FileText } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-aurora mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Our Story
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Democratizing <span className="text-gradient">Interview Preparation</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          MockMateAI was built with a simple conviction: everyone deserves a fair shot at their dream job. We provide highly realistic, AI-driven mock interviews that simulate the pressure and unpredictability of real technical and behavioral screens, allowing you to practice, fail safely, and learn rapidly.
        </p>
      </section>

      {/* Mission & Goals Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* Box 1 */}
        <div className="glass-strong p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[60px] group-hover:bg-violet-500/20 transition-colors duration-500" />
          <div className="relative w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-6 border border-violet-500/20 group-hover:scale-110 transition-transform duration-300">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="relative text-xl font-semibold text-white mb-3">Our Mission</h3>
          <p className="relative text-muted-foreground leading-relaxed text-sm">
            To eliminate interview anxiety by providing a private, infinitely patient AI interviewer that gives objective, actionable feedback tailored to your exact industry and experience level.
          </p>
        </div>

        {/* Box 2 */}
        <div className="glass-strong p-8 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-colors duration-500" />
          <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
            <Shield className="h-7 w-7" />
          </div>
          <h3 className="relative text-xl font-semibold text-white mb-3">Unbiased Assessment</h3>
          <p className="relative text-muted-foreground leading-relaxed text-sm">
            We believe feedback should be purely based on merit, clarity, and structural soundness. Our AI evaluates your answers without the cognitive biases inherent in human-led interviews.
          </p>
        </div>

        {/* Box 3 */}
        <div className="glass-strong p-8 rounded-3xl border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[60px] group-hover:bg-fuchsia-500/20 transition-colors duration-500" />
          <div className="relative w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 mb-6 border border-fuchsia-500/20 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-7 w-7" />
          </div>
          <h3 className="relative text-xl font-semibold text-white mb-3">Continuous Growth</h3>
          <p className="relative text-muted-foreground leading-relaxed text-sm">
            Your career is a marathon, not a sprint. We track your performance over time, highlighting specific technical or behavioral weak points so you know exactly where to focus your prep.
          </p>
        </div>
      </section>

      {/* NBY Resume Builder CTA */}
      <section className="mt-20">
        <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-white/10 bg-secondary/30">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-aurora/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white">
                <FileText className="h-3.5 w-3.5" /> Platform Ecosystem
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-14 w-auto rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-white/5 p-1">
                  <Image src="/Ecosystem/logo.jpg" alt="NBY Logo" width={180} height={56} className="object-contain w-full h-full" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Build a Resume that gets you the interview.
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-lg">
                MockMateAI prepares you for the conversation, but your resume is what gets you in the room. We also built <strong>NBY Resume Builder</strong> — an intuitive platform with 10+ professional templates and AI-powered writing assistance designed to bypass ATS filters.
              </p>
              
              <a 
                href="https://nby-resumebuilder-frontend.onrender.com/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] mt-2"
              >
                Try NBY Resume Builder <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            <div className="flex-1 w-full flex justify-center perspective-1000">
              {/* Decorative Resume Stack Graphic */}
              <div className="relative w-full max-w-sm aspect-[3/4] group cursor-pointer">
                {/* Back Resume Image (was front) */}
                <div className="absolute inset-0 transform rotate-6 translate-x-4 shadow-2xl transition-all duration-500 group-hover:rotate-12 group-hover:translate-x-12 rounded-2xl overflow-hidden border border-white/20 z-0">
                  <Image src="/Ecosystem/resume1.png" alt="Resume Template 1" fill className="object-cover object-top opacity-80" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                
                {/* Front Resume Image (was back) */}
                <div className="absolute inset-0 transform -rotate-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-105 group-hover:-rotate-6 rounded-2xl overflow-hidden border border-white/20 z-10">
                  <Image src="/Ecosystem/resume2.png" alt="Resume Template 2" fill className="object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
