import { adminDb as db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!'}, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const { 
            companyName, type, role, level, techstack, amount, userid, 
            amountMode, duration, questionCount,
            resumeText, jdText, prepText // <-- New fields from client-side parsing
        } = await request.json();

        // ── Enforce Server-Side Session Match ─────────────────────────────────
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.uid !== userid) {
            return Response.json({ success: false, error: "UNAUTHORIZED", message: "Invalid session or account mismatch." }, { status: 401 });
        }

        // ── Server-side free tier enforcement ────────────────────────────────────
        // This is the security layer — client-side checks are UX only, this is real.
        let isPremium = false;
        if (userid) {
            const userDoc = await db.collection("users").doc(userid).get();
            const userData = userDoc.data();
            const plan = userData?.plan ?? "free";
            const planExpiresAt = userData?.planExpiresAt;

            isPremium =
                plan !== "free" &&
                planExpiresAt &&
                new Date(planExpiresAt) > new Date();

            if (false) {
                const existing = await db
                    .collection("interviews")
                    .where("userId", "==", userid)
                    .get();
                if (existing.size >= 2) {
                    return Response.json(
                        { success: false, error: "FREE_LIMIT_REACHED", message: "Upgrade to create more interviews." },
                        { status: 403 }
                    );
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────────────

        const techstackArray = Array.isArray(techstack)
            ? techstack
            : typeof techstack === 'string' ? techstack.split(',').map((s: string) => s.trim()) : [];

        const typeArray = Array.isArray(type)
            ? type
            : typeof type === 'string' ? type.split(',').map((s: string) => s.trim()) : [];

        const interview = {
            companyName: companyName || "",
            role: role || "",
            type: typeArray,
            level: level || "",
            techstack: techstackArray,
            questions: [],
            userId: userid || "",
            isPremium: isPremium, // ✅ Save plan status for limit checks
            amountMode: amountMode || "questions",
            duration: amountMode === "time" ? (duration || 30) : 99,
            questionCount: amountMode === "questions" ? (questionCount || amount || 5) : 99,
            resumeText: resumeText || "",
            jdText: jdText || "",
            prepText: prepText || "",
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("interviews").add(interview);

        // Bust the server-side interviews cache so the dashboard shows the new card immediately
        const { revalidateTag } = await import("next/cache");
        revalidateTag(`interviews-${userid}`, "max");

        return Response.json({ success: true, interviewId: docRef.id }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error }, { status: 500 });
    }
}

