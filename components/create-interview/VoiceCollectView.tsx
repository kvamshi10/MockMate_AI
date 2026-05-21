"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Play, Volume2 } from "lucide-react";

interface Props {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

type VoiceState = "idle" | "speaking" | "listening" | "processing" | "error" | "complete";

export const VoiceCollectView = ({ onSubmit, onBack }: Props) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [assistantText, setAssistantText] = useState<string>("Ready to start?");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Conversational state
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const currentDataRef = useRef<any>({});

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, onEnd?: () => void) => {
    setVoiceState("speaking");
    setAssistantText(text);
    
    // Add to history
    historyRef.current.push({ role: "assistant", content: text });

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to pick a natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (goodVoice) utterance.voice = goodVoice;

    utterance.rate = 1.05;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    // Edge case if speech synth gets stuck
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.cancel(); // clear queue
    window.speechSynthesis.speak(utterance);
  };

  const startConversation = () => {
    historyRef.current = [];
    currentDataRef.current = {};
    speak("Hi! I'm your AI setup assistant. What role are you interviewing for?", () => {
      startRecording();
    });
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setVoiceState("listening");
      setErrorMsg("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setVoiceState("error");
      setErrorMsg("Microphone access denied. Please allow mic permissions.");
    }
  };

  const stopRecordingManually = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setVoiceState("processing");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setVoiceState("processing");
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("history", JSON.stringify(historyRef.current));
      formData.append("currentData", JSON.stringify(currentDataRef.current));

      const response = await fetch("/api/ai/voice-form-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process voice");

      const data = await response.json();
      
      // Update state
      currentDataRef.current = data.formData;

      if (data.isComplete) {
        setVoiceState("complete");
        speak(data.nextQuestion || "Perfect, setting up your interview now!", () => {
           // Wait a second for smooth transition
           setTimeout(() => {
             if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
             }
             onSubmit(currentDataRef.current);
           }, 500);
        });
      } else {
        // Ask the next question and loop!
        speak(data.nextQuestion, () => {
          startRecording();
        });
      }

    } catch (err) {
      console.error("Error processing voice:", err);
      setVoiceState("error");
      setErrorMsg("Failed to understand. Please tap mic to try answering again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col gap-8 animate-fade-up">
        {/* Header */}
        <div className="text-center relative z-10">
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-white transition-colors mb-4 inline-flex items-center gap-1">
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-white">Voice Agent Setup</h2>
          
          {/* Conversational Bubble */}
          <div className="mt-6 p-6 rounded-3xl glass-strong border border-white/10 shadow-2xl relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aurora/20 text-aurora text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
               Assistant
             </div>
             <p className={`text-lg font-medium transition-opacity duration-300 ${voiceState === "speaking" ? "text-white animate-pulse" : "text-white/80"}`}>
               "{assistantText}"
             </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col items-center gap-6 mt-4 z-10">
          <div className="relative">
            {voiceState === "listening" && (
              <>
                <span className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                <span className="absolute inset-[-12px] rounded-full bg-cyan-500/10 animate-ping" style={{ animationDelay: "150ms" }} />
              </>
            )}
            {voiceState === "speaking" && (
               <span className="absolute inset-0 rounded-full bg-aurora/30 animate-pulse scale-125" />
            )}

            <button
              onClick={() => {
                if (voiceState === "idle") startConversation();
                else if (voiceState === "listening") stopRecordingManually();
                else if (voiceState === "error") startRecording();
              }}
              disabled={voiceState === "processing" || voiceState === "speaking" || voiceState === "complete"}
              className={`relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-[var(--shadow-glow)] ${
                voiceState === "listening"
                  ? "bg-gradient-to-br from-cyan-500 to-teal-600 scale-110"
                  : voiceState === "processing" || voiceState === "complete"
                  ? "bg-secondary cursor-not-allowed"
                  : voiceState === "speaking"
                  ? "bg-gradient-to-br from-aurora to-violet-600 shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                  : voiceState === "error"
                  ? "bg-gradient-to-br from-red-500 to-rose-700 hover:scale-105"
                  : "bg-gradient-to-br from-violet-600 to-indigo-700 hover:scale-105"
              }`}
            >
              {voiceState === "idle" ? (
                <Play className="h-14 w-14 text-white ml-2" />
              ) : voiceState === "listening" ? (
                <Mic className="h-14 w-14 text-white" />
              ) : voiceState === "processing" || voiceState === "complete" ? (
                <Loader2 className="h-14 w-14 text-white animate-spin" />
              ) : voiceState === "speaking" ? (
                <Volume2 className="h-14 w-14 text-white animate-pulse" />
              ) : (
                <Mic className="h-14 w-14 text-white" />
              )}
            </button>
          </div>

          {/* Voice state label */}
          <div className="text-center h-16 flex flex-col items-center justify-center">
            {voiceState === "idle" && <p className="text-sm text-muted-foreground">Tap Play to start conversation</p>}
            {voiceState === "speaking" && <p className="text-aurora text-sm font-medium animate-pulse">Assistant is speaking…</p>}
            {voiceState === "listening" && (
              <p className="text-cyan-400 animate-pulse text-sm font-medium">Listening… tap Mic when done</p>
            )}
            {voiceState === "processing" && (
              <p className="text-violet-400 text-sm font-medium animate-pulse">Thinking…</p>
            )}
            {voiceState === "complete" && (
              <p className="text-emerald-400 text-sm font-medium">All set! Redirecting…</p>
            )}
            {voiceState === "error" && (
              <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Voice waveform (decorative) */}
          {(voiceState === "listening" || voiceState === "speaking") && (
            <div className="flex items-end gap-1.5 h-12 animate-fadeIn">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all ${voiceState === "speaking" ? "bg-aurora" : "bg-cyan-400"}`}
                  style={{
                    height: `${12 + Math.abs(Math.sin(i * 0.8)) * 36}px`,
                    opacity: 0.5 + (i % 3) * 0.2,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCollectView;
