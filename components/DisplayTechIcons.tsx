"use client";

import { getTechLogosSync } from "@/lib/utils";
import { useState } from "react";

interface DisplayTechIconsProps {
  techstack: string[];
}

function SafeTechIcon({ tech, url, fallbacks, className }: { tech: string; url: string; fallbacks: string[]; className?: string }) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleError = () => {
    if (fallbackIndex < fallbacks.length) {
      setCurrentUrl(fallbacks[fallbackIndex]);
      setFallbackIndex(fallbackIndex + 1);
    }
  };

  return (
    <img
      src={currentUrl}
      alt={tech}
      onError={handleError}
      className={className}
    />
  );
}

export default function DisplayTechIcons({ techstack }: DisplayTechIconsProps) {
  const logos = getTechLogosSync(techstack);

  return (
    <div className="flex -space-x-2">
      {logos.slice(0, 4).map(({ tech, url, fallbacks }, index) => (
        <div
          key={index}
          className="relative group/tech z-10 hover:z-20"
        >
          {/* Icon Circle */}
          <div
            title={tech}
            className="h-7 w-7 rounded-full bg-secondary ring-2 ring-card flex items-center justify-center overflow-hidden p-1 transition-all duration-200 group-hover/tech:ring-aurora/60 group-hover/tech:scale-110 group-hover/tech:shadow-[0_0_12px_rgba(139,92,246,0.4)]"
          >
            <SafeTechIcon tech={tech} url={url} fallbacks={fallbacks} className="h-full w-full object-contain" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 pointer-events-none opacity-0 -translate-y-1 group-hover/tech:opacity-100 group-hover/tech:translate-y-0 transition-all duration-200 ease-out">
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary/90 border-r border-b border-white/10 rotate-45" />
            {/* Label */}
            <div className="relative bg-secondary/90 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] whitespace-nowrap flex items-center gap-2">
              <SafeTechIcon tech={tech} url={url} fallbacks={fallbacks} className="h-3.5 w-3.5 object-contain shrink-0" />
              <span className="text-xs font-semibold text-white">{tech}</span>
            </div>
          </div>
        </div>
      ))}
      {logos.length > 4 && (
        <div className="relative group/more z-10 hover:z-20">
          <span className="h-7 w-7 rounded-full bg-secondary ring-2 ring-card flex items-center justify-center text-[10px] text-muted-foreground transition-all duration-200 group-hover/more:ring-aurora/40 group-hover/more:scale-110 cursor-default">
            +{logos.length - 4}
          </span>
          {/* Overflow Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 pointer-events-none opacity-0 -translate-y-1 group-hover/more:opacity-100 group-hover/more:translate-y-0 transition-all duration-200 ease-out">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary/90 border-r border-b border-white/10 rotate-45" />
            <div className="relative bg-secondary/90 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] whitespace-nowrap">
              <span className="text-xs font-semibold text-white">
                {logos.slice(4).map(l => l.tech).join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
