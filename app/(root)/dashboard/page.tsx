import { getCurrentUser, getInterviewsByUserId } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { availableInterviews } from "@/constants/interviews";
import DashboardRefreshTrigger from "@/components/DashboardRefreshTrigger";
import DashboardClientView from "@/components/DashboardClientView";

export default async function DashboardRoot() {
    const user = await getCurrentUser();
    if (!user) redirect('/sign-in');

    const userInterviews = await getInterviewsByUserId(user.uid);

    return (
        <>
            <DashboardRefreshTrigger />
            <DashboardClientView 
                user={user} 
                userInterviews={userInterviews as any[]} 
                availableInterviews={availableInterviews as any[]} 
            />
        </>
    );
}
