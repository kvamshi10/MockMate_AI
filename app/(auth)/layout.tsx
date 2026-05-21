import { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  // ==========================================
  // REVERSE AUTHENTICATION GUARD
  // ==========================================
  // If a user is ALREADY logged in, we must strictly forbid them from accessing 
  // the Sign-In or Sign-Up pages. This layer catches them and bounces them to the dashboard.
  const isUserAuthenticated = await isAuthenticated();

  if (isUserAuthenticated) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-zinc-100 p-4">
      {children}
    </div>
  );
};

export default AuthLayout;
