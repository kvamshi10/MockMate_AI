export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050505]">
            
            {/* Custom Float Animation injected strictly for this page */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes vibrant-cycle {
                    0%   { background: #ff33a1; box-shadow: 0 0 25px rgba(255,51,161,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                    20%  { background: #00e5ff; box-shadow: 0 0 25px rgba(0,229,255,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                    40%  { background: #4dff00; box-shadow: 0 0 25px rgba(77,255,0,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                    60%  { background: #ffea00; box-shadow: 0 0 25px rgba(255,234,0,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                    80%  { background: #bf00ff; box-shadow: 0 0 25px rgba(191,0,255,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                    100% { background: #ff33a1; box-shadow: 0 0 25px rgba(255,51,161,0.95), inset 2px 2px 5px rgba(255,255,255,0.9); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .glass-layer {
                    /* Intense glass feel across the entire screen */
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(80px);
                    -webkit-backdrop-filter: blur(80px);
                }
            `}</style>

            {/* ========================================== */}
            {/* 1. HOLI COLORS BACKGROUND BLOBS            */}
            {/* ========================================== */}
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-rose-600/50 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
            <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-cyan-500/50 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-yellow-500/40 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[20%] left-[15%] w-[45vw] h-[45vw] bg-violet-600/50 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-emerald-500/20 rounded-full blur-[150px] mix-blend-screen" />

            {/* ========================================== */}
            {/* 2. FULL SCREEN TRANSLUCENT GLASS FEEL      */}
            {/* ========================================== */}
            {/* We lay a heavy glass layer right over the wild colors to diffuse them beautifully */}
            <div className="absolute inset-0 z-10 glass-layer border border-white/10" />

            {/* ========================================== */}
            {/* 3. CENTER CONTENT (LIGHTS & LOGO)          */}
            {/* ========================================== */}
            <div className="relative z-20 flex flex-col items-center justify-center">
                
                {/* Glossy Lights Circling the Logo! */}
                {/* Scaled up the spin container to orbit around the larger logo */}
                <div className="absolute w-[420px] h-[420px] sm:w-[550px] sm:h-[550px] lg:w-[650px] lg:h-[650px] animate-[spin_5s_linear_infinite]">
                    {/* Glowing Orb 1 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-300 rounded-full blur-[30px] opacity-90 shadow-[0_0_50px_rgba(147,197,253,0.8)]" />
                    {/* Glowing Orb 2 */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-pink-400 rounded-full blur-[30px] opacity-90 shadow-[0_0_50px_rgba(244,114,182,0.8)]" />
                    {/* Glowing Orb 3 */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-20 h-20 bg-yellow-300 rounded-full blur-[30px] opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.8)]" />
                    {/* Glowing Orb 4 */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-20 h-20 bg-emerald-400 rounded-full blur-[30px] opacity-90 shadow-[0_0_50px_rgba(52,211,153,0.8)]" />
                </div>

                {/* The Logo Image (Floating smoothly in the middle - Massively enlarged) */}
                <div className="relative w-80 h-80 sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] z-30 animate-float drop-shadow-[0_0_100px_rgba(255,255,255,0.15)]">
                    <img 
                        src="/AIMockMateLogo.jpeg" 
                        alt="MockMate Loading" 
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Synchronous Bouncing Hand-Curated Glossy Neon Loader */}
                <div className="mt-10 sm:mt-12 flex items-center justify-center gap-4 z-30 relative">
                    <span className="animate-bounce">
                        <span className="block w-4 h-4 sm:w-5 sm:h-5 rounded-full" style={{ animation: 'vibrant-cycle 4s infinite linear 0s' }} />
                    </span>
                    <span className="animate-bounce">
                        <span className="block w-4 h-4 sm:w-5 sm:h-5 rounded-full" style={{ animation: 'vibrant-cycle 4s infinite linear 1.33s' }} />
                    </span>
                    <span className="animate-bounce">
                        <span className="block w-4 h-4 sm:w-5 sm:h-5 rounded-full" style={{ animation: 'vibrant-cycle 4s infinite linear 2.66s' }} />
                    </span>
                </div>

            </div>
        </div>
    );
}
