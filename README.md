# 🪐 MockMate AI - AI-Powered Mock Interview Platform

MockMate AI is a premium, production-grade SaaS application designed to help job seekers master their interview skills. The platform simulates realistic, real-time conversational voice interviews tailored to specific roles, tech stacks, experience levels, and target companies. 

Following each live call, candidates receive a highly detailed, multi-dimensional performance report card powered by advanced Google Gemini models.

---

## ✨ Key Features

*   **🎙️ Live Voice Interview Room**: A seamless split-screen interview environment featuring real-time, interactive WebRTC voice conversations with our empathetic AI interviewer, MockMate.
*   **⏱️ Dynamic Time & Question Caps**: Interviews are strictly governed by custom duration limits and question counts. The agent gracefully allows candidates to finish speaking their final answer before concluding the session.
*   **🧠 Gemini AI Feedback Engine**: Multi-dimensional evaluation checking technical depth, communication structure, confidence, pace, filler word ratio, and behavioral indicators using a robust model cascade.
*   **📊 Interactive Dashboard & Analytics**: Candidates can track their progress, view historical scores, and download structured STAR-method improvement roadmaps.
*   **🔒 Secure authentication & Cloud Backend**: Full integration with Firebase Auth and Firestore with optimized cache revalidation tags for seamless data updates.

---

## 🛠️ Technology Stack

*   **Core Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Styling & Motion**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **WebRTC Voice Interface**: [Vapi AI Web Client SDK](https://vapi.ai/) & [Daily-JS (WebRTC)](https://www.daily.co/)
*   **Evaluation Model Cascade**: Google Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`) integrated via Vercel's [AI SDK](https://sdk.vercel.ai/docs).
*   **Database & Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) & [Google Cloud Firestore](https://firebase.google.com/docs/firestore).

---

## ⚙️ Environment Configuration

To run the project, create a `.env.local` file in the root directory and add the following keys:

``
# ── OPTIMIZATIONS ─────────────────────────────────────────────────────
FIRESTORE_PREFER_REST="true"
GRPC_DNS_RESOLVER="native"
```

---

## 🚀 Getting Started

### 1. Clone the repository & Install dependencies
```bash
git clone https://github.com/your-username/MockMateAI.git
cd MockMateAI
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to launch the application.

### 3. Build for Production
To build a production bundle and run the compiler checks:
```bash
npm run build
```
To run compiler typecheck verification:
```bash
npx tsc --noEmit
```

---

## 🔒 Security & Performance Features

*   **Model Cascade with Backoff**: The feedback generation routes cascade from premium to legacy Google generative models with an exponential retry delay (`2s`, `4s`, `8s`) if Google's services hit high-load rate limits.
*   **Local Fallback Analysis**: If all Gemini models are exhausted, the platform generates a deterministic local heuristic report using transcript parameters, ensuring the user is never left without feedback.
*   **Cache Tag Busting**: Bypasses traditional cache delays by using server-side Next.js revalidation tags (`interviews-[userId]`) to immediately refresh dashboard states upon session completion.
