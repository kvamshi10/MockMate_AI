import { adminDb as db } from "@/firebase/admin";
import { NextResponse } from "next/server";

// Helper to retry transient network operations (e.g. Firebase ECONNRESET/ETIMEDOUT)
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries <= 0) throw error;
        
        const isTransient = 
            error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' || 
            error.code === 'ECONNREFUSED' ||
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('read ECONNRESET') ||
            error.message?.includes('socket hang up') ||
            error.message?.includes('FetchError') ||
            error.message?.includes('ETIMEDOUT');
            
        if (isTransient) {
            console.warn(`[Retry] Transient network error encountered (${error.code || error.message}). Retrying in ${delay}ms... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

/**
 * POST /api/vapi/session
 * Saves interview session metadata (startedAt, endedAt, duration, questions) 
 * to the interview document after a call ends.
 */
export async function POST(req: Request) {
    try {
        const { interviewId, startedAt, endedAt, durationSeconds, questionsCovered, transcriptText } = await req.json();

        if (!interviewId) {
            return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });
        }

        const docRef = db.collection("interviews").doc(interviewId);
        
        // Wrap Firebase reads in the retry helper
        const doc = await retryWithBackoff(() => docRef.get());
        if (!doc.exists) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        const interviewData = doc.data();
        const userId = interviewData?.userId;

        const { FieldValue } = require("firebase-admin/firestore");

        const updateData: any = {};
        
        if (endedAt) {
            updateData.sessionLogs = FieldValue.arrayUnion({
                startedAt:        startedAt        || null,
                endedAt:          endedAt          || null,
                durationSeconds:  durationSeconds  || 0,
                questionsCovered: questionsCovered || 0,
                recordedAt:       new Date().toISOString(),
            });
            updateData.lastSessionAt = endedAt;
            updateData.lastDurationSeconds = durationSeconds || 0;
            updateData.attemptCount = FieldValue.increment(1);
        }

        if (transcriptText) {
            updateData.transcript = transcriptText;
        }

        if (Object.keys(updateData).length > 0) {
            // Wrap Firebase writes in the retry helper
            await retryWithBackoff(() => docRef.update(updateData));
        }

        // ── ⚡ REVALIDATE CACHE ──────────────────────────────────────────────
        // Bust the server-side cache for this specific user so the dashboard 
        // updates 'Not taken' -> 'Completed' immediately.
        if (userId) {
            try {
                const { revalidateTag } = await import("next/cache");
                revalidateTag(`interviews-${userId}`, "");
                console.log(`[Session] Cache busted for user: ${userId}`);
            } catch (err) {
                console.warn("[Session] Cache revalidation failed (expected in some environments)");
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Session save error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
