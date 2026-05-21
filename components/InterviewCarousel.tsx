"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface InterviewCarouselProps {
  children: React.ReactNode[];
}

export default function InterviewCarousel({ children }: InterviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = children.length;

  // Track which card is in view using IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || count === 0) return;

    const cards = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cards.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.55, // card must be >55% visible to be "active"
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [count]);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  if (count === 0) return null;

  return (
    <div className="space-y-5">
      {/* Cards track — hidden native scrollbar */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto py-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:-mx-8 md:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="min-w-[320px] max-w-[380px] flex-shrink-0 snap-start"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot indicators — only show when there are multiple cards */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to interview ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2.5 bg-aurora shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                  : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
