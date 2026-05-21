"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ==========================================
 * CALL STATUS ENUM  (matches tutor guide)
 * ========================================== */
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

/* ==========================================
 * SAVED MESSAGE TYPE
 * ========================================== */
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

/* ==========================================
 * AGENT COMPONENT
 * ========================================== */
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  /* ── State ── */
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [userPhotoURL, setUserPhotoURL] = useState<string | null>(null);

  /* ── Derived ── */
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  /* ── Fetch user photo for the "You" card ── */
  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import("@/lib/actions/auth.action");
        const user = await getCurrentUser();
        if (user?.photoURL) setUserPhotoURL(user.photoURL);
      } catch {
        /* silently ignore */
      }
    })();
  }, []);

  /* ── Simulated demo call handlers (replace with Vapi wiring) ── */
  const handleCall = async () => {
    if (callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED) {
      setCallStatus(CallStatus.CONNECTING);
      // TODO: await vapi.start(...)
      setTimeout(() => {
        setCallStatus(CallStatus.ACTIVE);
        setIsSpeaking(true);
        setMessages([
          {
            role: "assistant",
            content: `Hi ${userName}! I'm your AI interviewer today. Let's get started — tell me a bit about yourself.`,
          },
        ]);
      }, 1500);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    setIsSpeaking(false);
    // TODO: vapi.stop()
  };

  /* ──────────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col gap-8">
      {/* ── CALL VIEW ── */}
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/AI_Logo.png"
              alt="AI Interviewer"
              width={120}
              height={120}
              className="object-cover scale-[1.75] rounded-full"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Card */}
        <div className="card-border">
          <div className="card-content">
            {userPhotoURL ? (
              <Image
                src={userPhotoURL}
                alt="User avatar"
                width={120}
                height={120}
                unoptimized
                className="rounded-full object-cover size-[120px] ring-2 ring-primary-200/50"
              />
            ) : (
              /* Fallback generated avatar */
              <div className="size-[120px] rounded-full bg-gradient-to-br from-primary-200/30 to-primary-100/10 ring-2 ring-primary-200/50 flex items-center justify-center text-4xl font-bold text-primary-100 select-none">
                {userName?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* ── TRANSCRIPT ── */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── CALL CONTROLS ── */}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            {/* Ping animation when connecting */}
            <span
              className={cn(
                "absolute inset-0 animate-ping rounded-full opacity-75 bg-success-100",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span>
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
