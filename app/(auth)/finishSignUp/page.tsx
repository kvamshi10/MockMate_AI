"use client";

import { useEffect, useState, Suspense } from "react";
import { isSignInWithEmailLink, signInWithEmailLink, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp, setSessionCookie } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, MailQuestion } from "lucide-react";

function FinishSignUpContent() {
  const router = useRouter();
  const [emailForSignIn, setEmailForSignIn] = useState<string>("");
  const [needsEmail, setNeedsEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if the link is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem("emailForSignIn");
      
      if (email) {
        // If we have the email, immediately sign in
        completeSignIn(email);
      } else {
        // We lack the email (e.g. opened on different device or private tab)
        setNeedsEmail(true);
        setIsLoading(false);
      }
    } else {
      // Invalid link
      toast.error("Invalid authentication link.");
      router.push("/sign-in");
    }
  }, [router]);

  const completeSignIn = async (email: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailLink(auth, email, window.location.href);
      // ==========================================
      // MAGIC LINK CACHE RETRIEVAL & SYNC
      // ==========================================
      // Magic links only verify the email. We temporarily stashed the user's intended
      // Name and Avatar in localStorage before they clicked the link in their inbox.
      const storedName = window.localStorage.getItem("nameForSignIn");
      const storedAvatar = window.localStorage.getItem("avatarForSignIn");
      
      // If we have cached profile data but the newly authenticated Firebase account lacks it, 
      // we permanently attach that data now using `updateProfile`.
      if ((storedName && !userCredential.user.displayName) || (storedAvatar && !userCredential.user.photoURL)) {
          try {
             await updateProfile(userCredential.user, { 
                 ...(storedName ? { displayName: storedName } : {}),
                 ...(storedAvatar ? { photoURL: storedAvatar } : {})
             });
          } catch(err) {
              console.error("Failed to append profile metadata locally.", err);
          }
      }

      if (userCredential.user) {
        // Officially register the user into our dedicated Firestore `users` collection.
        const result = await signUp({
          uid: userCredential.user.uid,
          name: storedName || userCredential.user.displayName,
          email: userCredential.user.email,
          photoURL: storedAvatar || userCredential.user.photoURL
        });

        
        if (!result?.success) {
            toast.error(result?.message || "Warning: Profile metadata sync failed.");
        }
        
        // Set the Next.js Session Cookie so Server Components know we are logged in
        const idToken = await userCredential.user.getIdToken(true);
        const sessionResult = await setSessionCookie(idToken);
        if (!sessionResult.success) {
            toast.error(sessionResult.message);
            // Optionally, handle failure here, but they are authenticated on client. 
        }
      }

      // SECURITY & CLEANUP: Discard the cached local variables to avoid leaking data to subsequent sessions
      window.localStorage.removeItem("emailForSignIn");
      window.localStorage.removeItem("nameForSignIn");
      window.localStorage.removeItem("avatarForSignIn");
      
      toast.success("Successfully verified email!");
      setIsSuccess(true);
      
      // Delay slightly for effect before redirecting
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (error: any) {
      console.error(error);
      toast.error(`Verification failed: ${error.message}`);
      router.push("/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForSignIn || !emailForSignIn.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    completeSignIn(emailForSignIn);
  };

  return (
    <div className="card-border lg:min-w-[566px] w-full max-w-md mx-auto mt-10">
      <div className="flex flex-col gap-6 card py-16 px-10 items-center justify-center min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-user-primary" />
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-serif text-gray-800">Verifying your link...</h2>
                <p className="text-gray-500 text-center max-w-xs">
                Please wait while we securely authenticate you via Firebase.
                </p>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold font-serif text-gray-800">Success!</h2>
                <p className="text-gray-500">You are securely signed in.</p>
            </div>
          </div>
        ) : needsEmail ? (
          <div className="flex flex-col items-center space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <MailQuestion className="w-10 h-10 text-user-primary" />
            </div>
            
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold font-serif text-gray-800">Confirm your email</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Because you opened this link on a different device or incognito mode, please confirm your email address to complete the secure sign-in.
              </p>
            </div>

            <form onSubmit={handleManualEmailSubmit} className="w-full space-y-5 pt-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={emailForSignIn}
                onChange={(e) => setEmailForSignIn(e.target.value)}
                className="h-12 border-gray-300 focus-visible:ring-user-primary"
                required
              />
              <Button type="submit" className="w-full h-12 text-md shadow-md btn">
                Complete Sign In
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function FinishSignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <Suspense fallback={<div>Loading verification module...</div>}>
            <FinishSignUpContent />
        </Suspense>
    </div>
  );
}
