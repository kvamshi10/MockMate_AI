import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // ==========================================
  // GLOBAL LAYOUT SECURITY GUARD (SINGLE FETCH)
  // ==========================================
  // We fetch the full user ONCE here on the server. If unauthenticated,
  // we redirect. If authenticated, we pass the user down to Navbar so the
  // Navbar does NOT need to make its own separate Firestore round-trip.
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      {children}
    </div>
  );
};

export default RootLayout;
