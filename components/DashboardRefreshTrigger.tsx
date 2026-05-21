"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Periodically refreshes the page data every 15 seconds.
 * This ensures that when a background webhook (like Vapi) updates an interview score,
 * the dashboard reflects it without a manual user refresh.
 */
export default function DashboardRefreshTrigger() {
  const router = useRouter();

  useEffect(() => {
    // 1. Check for upgrade success param — ONLY on the dashboard page
    if (window.location.pathname === "/dashboard") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("upgrade") === "success") {
        import("sonner").then(({ toast }) => {
          toast.success("Welcome to Pro!", {
            description: "Your account has been upgraded. Enjoy unlimited interviews!",
            duration: 6000,
          });
        });
        // Remove param from URL without refresh
        window.history.replaceState({}, "", "/dashboard");
      }
    }

    // 2. Refresh the current route's data every 15 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [router]);

  return null; // Invisible component
}
