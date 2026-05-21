"use client";

import { useState } from "react";

/**
 * Maps known company names to their exact domain for reliable logo lookup.
 * Cleared over the generic domain-guesser for well-known companies.
 */
const KNOWN_DOMAINS: Record<string, string> = {
  cognizant: "cognizant.com",
  "cognizant technology": "cognizant.com",
  tcs: "tcs.com",
  "tata consultancy": "tcs.com",
  infosys: "infosys.com",
  wipro: "wipro.com",
  accenture: "accenture.com",
  ibm: "ibm.com",
  microsoft: "microsoft.com",
  google: "google.com",
  amazon: "amazon.com",
  meta: "meta.com",
  facebook: "facebook.com",
  apple: "apple.com",
  netflix: "netflix.com",
  uber: "uber.com",
  linkedin: "linkedin.com",
  salesforce: "salesforce.com",
  oracle: "oracle.com",
  sap: "sap.com",
  capgemini: "capgemini.com",
  hcl: "hcltech.com",
  "tech mahindra": "techmahindra.com",
  deloitte: "deloitte.com",
  pwc: "pwc.com",
  ey: "ey.com",
  kpmg: "kpmg.com",
  flipkart: "flipkart.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  paytm: "paytm.com",
  razorpay: "razorpay.com",
  zoho: "zoho.com",
  freshworks: "freshworks.com",
  byju: "byjus.com",
  ola: "olacabs.com",
  meesho: "meesho.com",
  nykaa: "nykaa.com",
  cred: "cred.club",
  mphasis: "mphasis.com",
  hexaware: "hexaware.com",
  mindtree: "mindtree.com",
  ltimindtree: "ltimindtree.com",
  persistent: "persistent.com",
  coforge: "coforge.com",
  samsung: "samsung.com",
  sony: "sony.com",
  dell: "dell.com",
  hp: "hp.com",
  intel: "intel.com",
  amd: "amd.com",
  nvidia: "nvidia.com",
  twitter: "twitter.com",
  x: "twitter.com",
};

/** Converts company name to best-guess domain */
function domainFromName(name: string): string {
  const lower = name.toLowerCase().trim();

  // Check known mapping first (exact match)
  if (KNOWN_DOMAINS[lower]) return KNOWN_DOMAINS[lower];

  // Check if any known key is a substring of the input
  for (const [key, domain] of Object.entries(KNOWN_DOMAINS)) {
    if (lower.includes(key)) return domain;
  }

  // Generic fallback: strip corporate suffixes, append .com
  const cleaned = lower
    .replace(/\b(technologies|technology|solutions|limited|ltd|pvt|private|inc|corp|corporation|group|global|systems|services|digital|tech|software|consulting|international|india|americas|us|llc|llp)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return `${cleaned}.com`;
}

const GENERIC_KEYWORDS = new Set([
  "senior", "junior", "lead", "staff", "principal", "fresher", "intern", "entry", "mid",
  "software", "engineer", "developer", "manager", "architect", "analyst", "systems", "tech",
  "technical", "general", "mock", "practice", "test", "interview", "none", "na", "company"
]);

export default function CompanyLogo({ name, fallbackNode }: { name: string; fallbackNode?: React.ReactNode }) {
  const domain = domainFromName(name);
  const lowerName = name.toLowerCase().trim();
  const isGeneric = GENERIC_KEYWORDS.has(lowerName) || lowerName.split(/\s+/).every(word => GENERIC_KEYWORDS.has(word));

  const sources = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  const [srcIdx, setSrcIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [useFallbackNode, setUseFallbackNode] = useState(isGeneric);

  // If using fallback node, render it with a beautiful background
  if (useFallbackNode && fallbackNode) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 shadow-inner drop-shadow-md">
        {fallbackNode}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* EXTREME VISIBILITY SKELETON */}
      {!loaded && !useFallbackNode && (
        <div className="absolute inset-0 z-10 bg-slate-100 flex flex-col items-center justify-center animate-pulse">
          <div className="w-5 h-5 border-[2.5px] border-violet-200 border-t-violet-600 rounded-full animate-spin shadow-sm" />
          <span className="text-[7px] font-bold text-violet-700 mt-1 uppercase tracking-tighter">Loading</span>
        </div>
      )}
      {!useFallbackNode && (
        <img
          key={sources[srcIdx]}
          src={sources[srcIdx]}
          alt={name}
          className={`w-9 h-9 object-contain transition-all duration-700 ease-out ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
          onLoad={(e) => {
            const img = e.currentTarget;
            // Skip Google's 16px globe fallback (usually a grey globe)
            if (srcIdx === 1 && img.naturalWidth <= 16) {
              setUseFallbackNode(true);
              return;
            }
            setLoaded(true);
          }}
          onError={() => {
            if (srcIdx < sources.length - 1) {
              setSrcIdx((prev) => prev + 1);
              setLoaded(false);
            } else {
              setUseFallbackNode(true);
            }
          }}
        />
      )}
    </div>
  );
}
