import { mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const SIMPLEICONS_BASE = "https://cdn.simpleicons.org";

/** Maps a raw skill/tech string to its Devicon key, or returns null if unknown */
const normalizeTechName = (tech: string): string | null => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return (mappings as Record<string, string>)[key] ?? null;
};

/** Synchronously returns a list of technology logos and their fallback URLs */
export const getTechLogosSync = (techArray: string[]) => {
  return techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    const simpleSlug = tech.toLowerCase().replace(/\s+/g, "").replace(/\.js$/, "");
    const encoded = encodeURIComponent(tech.slice(0, 2).toUpperCase());

    const fallbacks: string[] = [];

    if (normalized) {
      fallbacks.push(`${DEVICON_BASE}/${normalized}/${normalized}-original.svg`);
      fallbacks.push(`${DEVICON_BASE}/${normalized}/${normalized}-plain.svg`);
    }

    fallbacks.push(`${SIMPLEICONS_BASE}/${simpleSlug}`);
    fallbacks.push(`https://ui-avatars.com/api/?name=${encoded}&background=6d28d9&color=fff&size=28&bold=true&rounded=true&format=svg`);

    return {
      tech,
      url: fallbacks[0],
      fallbacks: fallbacks.slice(1),
    };
  });
};

export const getRandomInterviewCover = (): string => {
  const covers = [
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1557682260-96773eb01377?auto=format&fit=crop&q=80&w=1000"
  ];
  return covers[Math.floor(Math.random() * covers.length)];
};
