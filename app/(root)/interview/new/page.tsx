"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentUser, getUserPlanAndCount } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/interview.action";

import ChoiceModal from "@/components/create-interview/ChoiceModal";
import { InterviewFormWizard } from "@/components/create-interview/InterviewFormWizard";
import VoiceCollectView from "@/components/create-interview/VoiceCollectView";
import GeneratingScreen from "@/components/create-interview/GeneratingScreen";
import BreathingScreen from "@/components/create-interview/BreathingScreen";
import PaywallModal from "@/components/PaywallModal";

type Screen = "choice" | "form" | "voice" | "generating" | "breathing" | "interview";

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-aurora">Preparing interview...</div>}>
      <NewInterviewContent />
    </Suspense>
  );
}

function NewInterviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [screen, setScreen]           = useState<Screen>("choice");
  const [role, setRole]               = useState("your");
  const [userName, setUserName]       = useState("there");
  const [userId, setUserId]           = useState<string | null>(null);
  const [formData, setFormData]       = useState<any>(null);
  const [interviewId, setInterviewId] = useState<string>(id || "");

  // ── Free-tier gate state ───────────────────────────────────────────────────
  const [isFree, setIsFree]               = useState(false);   // is user on free plan?
  const [showPaywall, setShowPaywall]     = useState(false);   // show upgrade modal?
  const [planChecked, setPlanChecked]     = useState(false);   // loading flag
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      if (!u) return;
      if (u.name) setUserName(u.name.split(" ")[0]);
      setUserId(u.uid);

      // ✅ Check plan + count UPFRONT before anything is shown
      const { isPremium, interviewCount } = await getUserPlanAndCount(u.uid);
      const onFreeTier = !isPremium;
      setIsFree(onFreeTier);

      // If free user already has ≥2 interviews, show paywall immediately
      if (onFreeTier && interviewCount >= 2 && !id) {
        setShowPaywall(true);
      }

      setPlanChecked(true);

      if (id) {
        getInterviewById(id).then((data) => {
          if (data && data.userId === u.uid) {
            setRole(data.role || "your");
            setInterviewId(data.id);
            setScreen("breathing");
          } else {
            // Check if it's a preset interview from constants
            const { availableInterviews } = require("@/constants/interviews");
            const preset = availableInterviews.find((i: any) => i.id === id);
            if (preset) {
              setRole(preset.role);
              setFormData({
                role: preset.role,
                companyName: preset.companyName || "",
                interviewTypes: Array.isArray(preset.type) ? preset.type : [preset.type],
                techStack: preset.techstack || [],
                level: preset.level || "Mid-level",
                amountMode: "questions",
                questionCount: 5,
              });
              setScreen("generating");
            } else {
              setScreen("choice");
            }
          }
        });
      } else {
        setScreen("choice");
      }
    });
  }, [id]);

  const handleFormSubmit = (data: any) => {
    setRole(data?.role || "your");
    setFormData(data);
    setScreen("generating");
  };

  const handleVoiceSubmit = (parsedData: any) => {
    setFormData(parsedData);
    setRole(parsedData?.role || "your");
    if (isFree) {
      // Free users bypass file upload because it's a premium feature
      setScreen("generating");
    } else {
      // Premium/Elite users go to the file upload step (Step 4, which is index 4)
      setScreen("form");
    }
  };

  const handleReadyToJoin = (id: string) => {
    setInterviewId(id);
    setScreen("breathing");
  };

  const handleBreathingDone = () => {
    window.location.href = `/interview${interviewId ? `?id=${interviewId}` : ""}`;
  };

  // Loading state while plan check is in-flight (only for non-id routes)
  if (!planChecked && !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-aurora/30 border-t-aurora rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Checking your account…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Paywall modal — shown immediately if free limit reached */}
      {showPaywall && userId && (
        <PaywallModal
          userId={userId}
          onClose={() => {
            setShowPaywall(false);
            // Send them to dashboard instead of a broken form
            window.location.href = "/dashboard";
          }}
          onSuccess={() => {
            setShowPaywall(false);
            setIsFree(false);
            // Reload so plan state is refreshed
            window.location.reload();
          }}
        />
      )}

      {screen === "choice" && !showPaywall && (
        <ChoiceModal
          userName={userName}
          onSelect={(path) => setScreen(path)}
        />
      )}

      {screen === "form" && (
        <InterviewFormWizard
          userName={userName}
          isFree={isFree}
          initialStep={formData && !isFree ? 4 : 0} // If coming from voice as Elite, start at Files
          initialData={formData || {}}
          onSubmit={handleFormSubmit}
          onBack={() => setScreen("choice")}
        />
      )}

      {screen === "voice" && (
        <VoiceCollectView
          onSubmit={handleVoiceSubmit}
          onBack={() => setScreen("choice")}
        />
      )}

      {screen === "generating" && (
        <GeneratingScreen
          role={role}
          formData={formData}
          userId={userId}
          onReadyToJoin={handleReadyToJoin}
        />
      )}

      {screen === "breathing" && (
        <BreathingScreen
          durationSeconds={40}
          onComplete={handleBreathingDone}
        />
      )}
    </main>
  );
}
