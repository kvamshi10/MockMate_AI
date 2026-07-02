import { Mail, MapPin, MessageSquare, Send } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-8 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left: Contact Info */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-aurora mb-6">
              <MessageSquare className="h-3.5 w-3.5" /> Reach Out
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Let's build the <span className="text-gradient">future of prep.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question about MockMateAI, found a bug, or just want to say hi? We're always looking for feedback to make our platform better for everyone.
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-aurora/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-aurora" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email us directly</p>
                <a href="mailto:bridulrmunoth123@klebcahubli.in" className="text-muted-foreground hover:text-aurora transition-colors">
                  bridulrmunoth123@klebcahubli.in
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-muted-foreground leading-relaxed text-sm pr-4">
                  KLE Society’s Bachelor of Computer Application (BCA)<br />
                  P.C.Jabin Science College Campus, Vidyanagar Hubballi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Glassmorphic Contact Form */}
        <div className="relative">
          <div className="absolute inset-0 bg-aurora/20 rounded-[3rem] blur-3xl transform rotate-3" />
          
          <div className="relative p-8 md:p-10 rounded-3xl glass-strong border border-white/10 shadow-[var(--shadow-glow)]">
            <h3 className="text-xl font-semibold text-white mb-6">Send a Message</h3>
            
            <form action="mailto:bridulrmunoth123@klebcahubli.in" method="POST" encType="text/plain" className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">Your Name</label>
                <input 
                  type="text" 
                  name="Name"
                  required
                  placeholder="John Doe" 
                  className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-aurora/50 transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">Email Address</label>
                <input 
                  type="email" 
                  name="Email"
                  required
                  placeholder="john@example.com" 
                  className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-aurora/50 transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">Your Message</label>
                <textarea 
                  name="Message"
                  required
                  rows={4}
                  placeholder="How can we help you today?" 
                  className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-aurora/50 transition-all resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 h-12 rounded-xl bg-aurora text-primary-foreground font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Send via Email App <Send className="h-4 w-4 ml-1" />
              </button>
              <p className="text-center text-[10px] text-muted-foreground mt-3">
                This will open your default email client to send the message securely.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
