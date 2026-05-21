'use server'

import { adminDb as db } from "@/firebase/admin";

/**
 * ==========================================
 * FETCH INTERVIEW BY ID (SERVER ONLY)
 * ==========================================
 * Bypasses client-side security rules to safely fetch interview details.
 */
export async function getInterviewById(id: string) {
    try {
        if (!id) return null;
        
        const docRef = db.collection("interviews").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data();
        
        // Return serializable data — use explicit shape for type safety
        return {
            id: docSnap.id,
            userId: (data?.userId as string) || "",
            role: (data?.role as string) || "",
            type: data?.type || [],
            techstack: data?.techstack || [],
            companyName: data?.companyName || "",
            level: data?.level || "",
            createdAt: data?.createdAt || null,
            ...(data as Record<string, any>),
        };
    } catch (error) {
        console.error("Error fetching interview:", error);
        return null;
    }
}

/**
 * ==========================================
 * FETCH FEEDBACKS FOR AN INTERVIEW
 * ==========================================
 */
export async function getFeedbacksByInterviewId(interviewId: string) {
    try {
        if (!interviewId) return [];
        
        const feedbackSnap = await db.collection("feedbacks")
            .where("interviewId", "==", interviewId)
            .get();

        const feedbacks = feedbackSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return feedbacks;
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        return [];
    }
}
