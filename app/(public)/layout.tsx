import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/actions/auth.action";

const PublicLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      {children}
    </div>
  );
};

export default PublicLayout;
