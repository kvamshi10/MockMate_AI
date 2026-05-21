'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeSession } from '@/lib/actions/auth.action';
import { auth } from '@/firebase/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ==========================================
 * SECURE HYBRID LOGOUT DASHBOARD BUTTON
 * ==========================================
 * This component successfully destroys the memory of BOTH the Client and the Server.
 * If we only destroyed the Client, the Middlewares would still think we are logged in!
 */
export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // 1. Nuke the Client-side Firebase Auth memory
            await signOut(auth);
            
            // 2. Nuke the Server-side Session Cookie
            await removeSession();
            
            toast.success("Successfully logged out safely!");
            
            // 3. Kick the user strictly to the sign in page, which the Middleware now enforces.
            router.push('/sign-in');
        } catch (error) {
            toast.error("Failed to logout cleanly.");
            setIsLoading(false);
        }
    }

    return (
        <Button 
            onClick={handleLogout} 
            disabled={isLoading}
            variant="ghost" 
            className="text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 font-bold tracking-wide transition-all px-4 rounded-full"
        >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? 'Logging out...' : 'Sign Out'}
        </Button>
    )
}
