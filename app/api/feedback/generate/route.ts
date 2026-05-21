import { adminDb as db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

/** Ordered model cascade: primary → fallbacks */
const MODEL_CASCADE = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
] as const;

/** Exponential back-off delays in ms for each retry attempt (index = attempt number, 0-based) */
const RETRY_DELAYS_MS = [2_000, 4_000, 8_000, 15_000, 30_000];
const MAX_RETRIES = RETRY_DELAYS_MS.length;

/** Hard timeout for each individual model call */
const CALL_TIMEOUT_MS = 40_000;

// ─────────────────────────────────────────────
// ZOD SCHEMA
// ─────────────────────────────────────────────

const FeedbackSchema = z.object({
    role: z.string(),
    company: z.string(),
    experienceLevel: z.string(),
    techStack: z.array(z.string()),
    interviewType: z.string(),
    duration: z.string(),
    overallScore: z.number().min(0).max(100),
    communicationScore: z.number().min(0).max(100),
    technicalScore: z.number().min(0).max(100),
    confidenceScore: z.number().min(0).max(100),
    problemSolvingScore: z.number().min(0).max(100),
    behavioralScore: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    improvementAreas: z.array(z.string()),
    recommendedTopics: z.array(z.string()),
    overallSummary: z.string(),
    questionFeedback: z.array(z.object({
        question: z.string(),
        userAnswer: z.string(),
        score: z.number().min(0).max(100),
        feedback: z.string(),
        improvementTip: z.string(),
    })),
    detailedFeedback: z.object({
        communication: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        technical: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        problemSolving: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        confidence: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        behavioral: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        clarity: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        leadership: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        systemDesign: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
        coding: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
    }),
    questionAnalysis: z.array(z.object({
        question: z.string(),
        candidateAnswer: z.string(),
        score: z.number().min(0).max(100),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        improvementTips: z.array(z.string()),
        idealAnswer: z.string(),
        aiFeedback: z.string(),
    })),
    aiInsights: z.object({
        communicationConfidence: z.string(),
        fillerWordUsage: z.string(),
        hesitationDetection: z.string(),
        technicalDepth: z.string(),
        clarityScore: z.number().min(0).max(100),
        speakingFluency: z.string(),
        leadershipIndicators: z.string(),
        problemSolvingPatterns: z.string(),
    }),
    performanceAnalysis: z.object({
        communication: z.string(),
        technicalKnowledge: z.string(),
        confidence: z.string(),
        clarity: z.string(),
        problemSolving: z.string(),
        behavioralSkills: z.string(),
    }),
    finalVerdict: z.string(),
    hiringRecommendation: z.string(),
    nextSteps: z.array(z.string()),
    improvementPlan: z.array(z.string()),
});

type FeedbackResult = z.infer<typeof FeedbackSchema>;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Sleep for `ms` milliseconds */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Race a promise against a timeout — throws if timeout wins */
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms);
    });
    try {
        const result = await Promise.race([promise, timeout]);
        return result;
    } finally {
        clearTimeout(timer!);
    }
}

/** Check whether an error is retryable (overload/rate-limit/server-side) */
function isRetryableError(err: any): boolean {
    const msg: string = (err?.message || err?.toString() || "").toLowerCase();
    const status: number = err?.status ?? err?.statusCode ?? 0;
    return (
        status === 503 ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 504 ||
        msg.includes("overloaded") ||
        msg.includes("high demand") ||
        msg.includes("rate limit") ||
        msg.includes("quota") ||
        msg.includes("timeout") ||
        msg.includes("503") ||
        msg.includes("429")
    );
}

/** Parse the raw transcript into structured segments for Firestore */
function parseTranscript(raw: string) {
    if (!raw) return [];
    const structured: { speaker: string; text: string; timestamp: string }[] = [];
    for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const match = trimmed.match(/^(AI|Candidate|User|Interviewer|AI Interviewer|Candidate Answer)\s*:\s*(.*)/i);
        const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (match) {
            const isAI = /ai|interviewer/i.test(match[1]);
            structured.push({ speaker: isAI ? "AI" : "Candidate", text: match[2].trim(), timestamp: ts });
        } else if (structured.length > 0) {
            structured[structured.length - 1].text += " " + trimmed;
        } else {
            structured.push({ speaker: "Candidate", text: trimmed, timestamp: ts });
        }
    }
    return structured;
}

// ─────────────────────────────────────────────
// FALLBACK: LOCAL FEEDBACK GENERATOR
// Used when ALL Gemini models fail after all retries.
// Produces a deterministic, transcript-aware report so
// the user always gets *something* meaningful.
// ─────────────────────────────────────────────

function generateLocalFallbackFeedback(
    transcript: string,
    interviewData: any
): FeedbackResult {
    const words = transcript.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Heuristic scores based on transcript characteristics
    const hasLongAnswers = wordCount > 200;
    const hasFillers = (transcript.match(/\b(um|uh|like|you know|basically|actually)\b/gi) || []).length;
    const fillerRatio = hasFillers / Math.max(wordCount, 1);
    const hasQuestions = (transcript.match(/\?/g) || []).length;
    const candidateLines = transcript.split("\n").filter(l => /^Candidate:/i.test(l.trim())).length;

    const communicationScore = Math.max(40, Math.min(80, 70 - Math.round(fillerRatio * 200)));
    const technicalScore    = Math.max(40, Math.min(80, hasLongAnswers ? 68 : 52));
    const confidenceScore   = Math.max(40, Math.min(80, 65 - Math.min(15, hasFillers)));
    const problemSolvingScore = Math.max(40, Math.min(80, candidateLines > 3 ? 65 : 50));
    const behavioralScore   = 60;
    const overallScore      = Math.round(
        (communicationScore * 0.25 + technicalScore * 0.35 +
         confidenceScore * 0.15 + problemSolvingScore * 0.25) 
    );

    const role    = interviewData?.role || "Software Engineer";
    const company = interviewData?.companyName || "the company";
    const level   = interviewData?.level || "mid-level";
    const stack   = interviewData?.techstack || [];

    const sectionTemplate = (score: number) => ({
        score,
        strengths: ["Attempted to address the question", "Showed willingness to engage"],
        weaknesses: ["Detailed AI analysis unavailable (service temporarily overloaded)"],
        improvementSuggestions: ["Review core concepts", "Practice structured STAR-format answers"],
    });

    return {
        role,
        company,
        experienceLevel: level,
        techStack: stack,
        interviewType: Array.isArray(interviewData?.type) ? interviewData.type.join(", ") : interviewData?.type || "Technical",
        duration: `${Math.max(5, Math.round(wordCount / 130))}m`,
        overallScore,
        communicationScore,
        technicalScore,
        confidenceScore,
        problemSolvingScore,
        behavioralScore,
        strengths: [
            "Participated actively in the interview session",
            "Demonstrated initiative by engaging with the AI interviewer",
            hasLongAnswers ? "Provided detailed responses showing depth of thought" : "Gave concise, focused answers",
        ],
        weaknesses: [
            fillerRatio > 0.05 ? "High usage of filler words detected" : "Some responses lacked structured depth",
            "Full AI evaluation was unavailable — please retry for detailed analysis",
        ],
        improvementAreas: [
            `Deep dive into ${stack.slice(0, 2).join(" and ") || "core technologies"}`,
            "Practice STAR-format behavioral responses",
            "Record yourself and eliminate filler words",
            "Solve 2-3 system design problems per week",
        ],
        recommendedTopics: [
            ...(stack.slice(0, 3)),
            "Data Structures & Algorithms",
            "System Design Fundamentals",
            "Behavioral Interview Techniques",
        ],
        overallSummary: `This is a fallback evaluation generated locally because the Gemini AI service was temporarily overloaded. The candidate completed an interview for the ${role} role at ${company}. Based on transcript analysis, the candidate scored ${overallScore}/100 overall. Please retry feedback generation for a full AI-powered report.`,
        questionFeedback: hasQuestions > 0 ? [{
            question: "Interview questions from the session",
            userAnswer: "Candidate responses recorded in transcript",
            score: overallScore,
            feedback: "Full per-question analysis requires AI evaluation — please retry.",
            improvementTip: "Practice structured responses using the STAR method.",
        }] : [],
        detailedFeedback: {
            communication: sectionTemplate(communicationScore),
            technical: sectionTemplate(technicalScore),
            problemSolving: sectionTemplate(problemSolvingScore),
            confidence: sectionTemplate(confidenceScore),
            behavioral: sectionTemplate(behavioralScore),
            clarity: sectionTemplate(Math.round((communicationScore + confidenceScore) / 2)),
            leadership: sectionTemplate(60),
            systemDesign: sectionTemplate(technicalScore),
            coding: sectionTemplate(technicalScore),
        },
        questionAnalysis: [],
        aiInsights: {
            communicationConfidence: fillerRatio > 0.05 ? "Moderate — filler words detected" : "Acceptable baseline",
            fillerWordUsage: `${hasFillers} filler words detected across ${wordCount} total words`,
            hesitationDetection: "Automated hesitation detection requires full AI analysis",
            technicalDepth: hasLongAnswers ? "Responses suggest reasonable technical depth" : "Shorter responses — depth analysis requires full AI evaluation",
            clarityScore: communicationScore,
            speakingFluency: "Full fluency analysis requires AI evaluation",
            leadershipIndicators: "Leadership assessment requires full AI evaluation",
            problemSolvingPatterns: "Pattern detection requires full AI evaluation",
        },
        performanceAnalysis: {
            communication: `Communication score: ${communicationScore}/100. ${fillerRatio > 0.05 ? "Elevated filler word usage detected." : "Baseline communication observed."}`,
            technicalKnowledge: `Technical score: ${technicalScore}/100. Full technical evaluation requires AI analysis.`,
            confidence: `Confidence score: ${confidenceScore}/100. ${hasFillers > 10 ? "Hesitation indicators detected." : "Baseline confidence observed."}`,
            clarity: `Clarity score: ${communicationScore}/100. Structural clarity analysis requires full AI review.`,
            problemSolving: `Problem solving score: ${problemSolvingScore}/100. Analytical depth assessment requires full AI review.`,
            behavioralSkills: `Behavioral score: ${behavioralScore}/100. Behavioral pattern analysis requires full AI review.`,
        },
        finalVerdict: `Fallback evaluation — score ${overallScore}/100. The Gemini AI service was temporarily unavailable. Retry for a full evaluation.`,
        hiringRecommendation: overallScore >= 70 ? "Leaning Hire" : overallScore >= 55 ? "No Hire" : "No Hire",
        nextSteps: [
            "Retry feedback generation for a full AI-powered report",
            `Study core ${stack[0] || "technology"} concepts in depth`,
            "Practice 3-5 mock interviews using the STAR method",
            "Review system design patterns relevant to the role",
        ],
        improvementPlan: [
            "Retry this feedback for detailed AI analysis",
            "Schedule daily 30-minute deep-dive sessions on weak areas",
            "Record practice answers and self-review for clarity",
            "Join a peer mock interview group",
        ],
    };
}

// ─────────────────────────────────────────────
// CORE: GENERATE WITH CASCADE + RETRY
// Tries each model in MODEL_CASCADE with up to MAX_RETRIES
// per model before moving to the next one.
// ─────────────────────────────────────────────

async function generateWithCascade(
    prompt: string
): Promise<{ aiAnalysis: FeedbackResult; modelUsed: string; isFallback: false }> {
    let lastError: any;

    for (const modelId of MODEL_CASCADE) {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                console.log(`[Feedback] Trying model=${modelId} attempt=${attempt + 1}/${MAX_RETRIES}`);

                const { object } = await withTimeout(
                    generateObject({
                        model: google(modelId),
                        schema: FeedbackSchema,
                        prompt,
                        temperature: 0.3,
                        maxRetries: 0, // Disable AI SDK's own retry loop — our cascade handles retries
                    }),
                    CALL_TIMEOUT_MS,
                    `generateObject(${modelId})`
                );

                console.log(`[Feedback] ✅ Success — model=${modelId} attempt=${attempt + 1}`);
                return { aiAnalysis: object, modelUsed: modelId, isFallback: false };

            } catch (err: any) {
                lastError = err;
                const status = err?.status ?? err?.statusCode ?? "?";
                const msg    = err?.message || String(err);

                console.error(
                    `[Feedback] ❌ model=${modelId} attempt=${attempt + 1}/${MAX_RETRIES} ` +
                    `status=${status} error="${msg.slice(0, 200)}"`
                );

                // If this wasn't a retryable error (e.g. auth failure), skip retries for this model
                if (!isRetryableError(err)) {
                    console.warn(`[Feedback] Non-retryable error on ${modelId} — skipping remaining retries`);
                    break;
                }

                // Wait before next retry (skip on last attempt of this model)
                const isLastAttemptForModel = attempt === MAX_RETRIES - 1;
                if (!isLastAttemptForModel) {
                    const delay = RETRY_DELAYS_MS[attempt];
                    console.log(`[Feedback] Waiting ${delay}ms before retry...`);
                    await sleep(delay);
                }
            }
        }
        console.warn(`[Feedback] All retries exhausted for model=${modelId} — trying next model`);
    }

    // All models failed
    throw lastError ?? new Error("All Gemini models failed after full retry cascade");
}

// ─────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────

export async function POST(req: Request) {
    // ── 1. Parse & validate input ────────────────────────────────────────────
    let interviewId: string, userId: string | undefined, transcript: string;
    try {
        const body = await req.json();
        interviewId = body.interviewId;
        userId      = body.userId;
        transcript  = body.transcript;
    } catch {
        return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    if (!interviewId) {
        return NextResponse.json({ success: false, error: "Missing interviewId" }, { status: 400 });
    }
    if (!transcript || transcript.trim().length < 15) {
        return NextResponse.json({
            success: false,
            error: "Transcript is empty or too short. Please speak during the interview to generate feedback.",
        }, { status: 400 });
    }

    // ── 2. Fetch interview document ──────────────────────────────────────────
    let interviewData: any;
    const docRef = db.collection("interviews").doc(interviewId);
    try {
        const doc = await docRef.get();
        if (!doc.exists) {
            return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
        }
        interviewData = doc.data();
    } catch (err: any) {
        console.error("[Feedback] Firestore fetch error:", err.message);
        return NextResponse.json({ success: false, error: "Failed to load interview data" }, { status: 500 });
    }

    // ── 3. Build prompt ──────────────────────────────────────────────────────
    const prompt = `
You are an expert HR interviewer and senior technical evaluator.
You just conducted a mock interview for the role of "${interviewData?.role || "Software Engineer"}" at "${interviewData?.companyName || "a company"}".
Target skill level: ${interviewData?.level || "mid-level"}.
Technologies: ${interviewData?.techstack?.join(", ") || "general software engineering"}.
Interview type: ${Array.isArray(interviewData?.type) ? interviewData.type.join(", ") : interviewData?.type || "technical"}.

Candidate context:
- Resume: ${(interviewData?.resumeText || "Not provided").slice(0, 800)}
- Job Description: ${(interviewData?.jdText || "Not provided").slice(0, 500)}
- Prep Material: ${(interviewData?.prepText || "Not provided").slice(0, 400)}

Interview transcript:
${transcript.slice(0, 8000)}

Provide a comprehensive, constructive feedback report in the required JSON schema. Be specific and actionable.
`.trim();

    // ── 4. Generate feedback (AI cascade → local fallback) ───────────────────
    let aiAnalysis: FeedbackResult;
    let modelUsed: string;
    let usedLocalFallback = false;

    try {
        const result = await generateWithCascade(prompt);
        aiAnalysis = result.aiAnalysis;
        modelUsed  = result.modelUsed;
    } catch (err: any) {
        console.error("[Feedback] 🔴 All AI models failed. Generating local fallback feedback.", err.message);
        aiAnalysis       = generateLocalFallbackFeedback(transcript, interviewData);
        modelUsed        = "local-fallback";
        usedLocalFallback = true;
    }

    // ── 5. Persist to Firestore ──────────────────────────────────────────────
    const structuredTranscript = parseTranscript(transcript);
    const score = aiAnalysis.overallScore;
    const now   = new Date().toISOString();

    const feedbackData = {
        interviewId,
        userId: userId || interviewData?.userId || "anonymous",
        role: aiAnalysis.role || interviewData?.role || "Software Engineer",
        company: aiAnalysis.company || interviewData?.companyName || "Target Company",
        experienceLevel: aiAnalysis.experienceLevel || interviewData?.level || "mid-level",
        techStack: aiAnalysis.techStack || interviewData?.techstack || [],
        interviewType: aiAnalysis.interviewType || "technical",
        duration: aiAnalysis.duration || "30m",
        createdAt: now,

        // Core scores
        overallScore: score,
        communicationScore: aiAnalysis.communicationScore,
        technicalScore: aiAnalysis.technicalScore,
        confidenceScore: aiAnalysis.confidenceScore,
        problemSolvingScore: aiAnalysis.problemSolvingScore,
        behavioralScore: aiAnalysis.behavioralScore,

        // Top-level arrays
        strengths: aiAnalysis.strengths,
        weaknesses: aiAnalysis.weaknesses,
        improvementAreas: aiAnalysis.improvementAreas,
        recommendedTopics: aiAnalysis.recommendedTopics,
        overallSummary: aiAnalysis.overallSummary,

        // Detailed sections
        questionFeedback: aiAnalysis.questionFeedback,
        detailedFeedback: aiAnalysis.detailedFeedback,
        questionAnalysis: aiAnalysis.questionAnalysis,
        aiInsights: aiAnalysis.aiInsights,
        performanceAnalysis: aiAnalysis.performanceAnalysis,
        finalVerdict: aiAnalysis.finalVerdict,
        hiringRecommendation: aiAnalysis.hiringRecommendation,
        nextSteps: aiAnalysis.nextSteps,
        improvementPlan: aiAnalysis.improvementPlan,

        // Transcript
        transcript,
        transcriptData: {
            fullText: transcript,
            segments: structuredTranscript,
        },

        // Nested feedback block (dashboard compatibility)
        feedback: {
            author: usedLocalFallback ? "Local Fallback" : "AI Interviewer",
            timestamp: now,
            tags: interviewData?.techstack || [],
            overallScore: score,
            technicalScore: aiAnalysis.technicalScore,
            communicationScore: aiAnalysis.communicationScore,
            confidenceScore: aiAnalysis.confidenceScore,
            problemSolvingScore: aiAnalysis.problemSolvingScore,
            strengths: aiAnalysis.strengths,
            weaknesses: aiAnalysis.weaknesses,
            improvements: aiAnalysis.improvementPlan || aiAnalysis.nextSteps || [],
            recommendation: aiAnalysis.hiringRecommendation,
            summary: aiAnalysis.overallSummary,
        },
        structuredQuestionAnalysis: aiAnalysis.questionAnalysis.map((q) => ({
            question: q.question,
            answer: q.candidateAnswer,
            evaluation: q.aiFeedback,
            score: q.score,
            mistakes: q.weaknesses || [],
            betterAnswer: q.idealAnswer,
            improvement: q.improvementTips?.[0] || "",
        })),

        // Metadata
        modelUsed,
        isLocalFallback: usedLocalFallback,

        // Legacy dashboard fields
        score,
        summary: aiAnalysis.overallSummary,
        keyStrengths: aiAnalysis.strengths,
        areasForImprovement: aiAnalysis.improvementAreas,
        actionableTips: aiAnalysis.nextSteps,
        recordingUrl: "",
    };

    try {
        const feedbackRef = db.collection("feedbacks").doc();

        await Promise.all([
            // Primary feedbacks collection
            feedbackRef.set(feedbackData),

            // interview_feedbacks collection
            db.collection("interview_feedbacks").doc().set({
                interviewId,
                userId: feedbackData.userId,
                role: feedbackData.role,
                company: feedbackData.company,
                interviewType: feedbackData.interviewType,
                duration: feedbackData.duration,
                overallScore: score,
                transcript: structuredTranscript,
                detailedFeedback: aiAnalysis.detailedFeedback,
                questionAnalysis: aiAnalysis.questionAnalysis,
                aiInsights: aiAnalysis.aiInsights,
                hiringRecommendation: aiAnalysis.hiringRecommendation,
                improvementPlan: aiAnalysis.improvementPlan,
                createdAt: now,
                modelUsed,
                isLocalFallback: usedLocalFallback,
            }),

            // Update parent interview document
            docRef.update({
                latestScore: score,
                latestAttemptAt: now,
                status: "ended",
                transcript,
                feedbackData,
            }),
        ]);

        // Cache invalidation
        const finalUserId = userId || interviewData?.userId;
        if (finalUserId) {
            try {
                const { revalidateTag } = await import("next/cache");
                revalidateTag(`interviews-${finalUserId}`, "max");
                console.log(`[Feedback] Cache busted for user: ${finalUserId}`);
            } catch {
                // Safe to ignore — revalidateTag may not work outside request context
            }
        }

        console.log(
            `[Feedback] ✅ Saved — feedbackId=${feedbackRef.id} score=${score} ` +
            `model=${modelUsed} fallback=${usedLocalFallback}`
        );

        return NextResponse.json({
            success: true,
            feedbackId: feedbackRef.id,
            score,
            modelUsed,
            isLocalFallback: usedLocalFallback,
            // Let the frontend know so it can show a "retry for full AI report" banner
            ...(usedLocalFallback && {
                warning: "Feedback generated using local fallback. Retry for full AI-powered analysis.",
            }),
        });

    } catch (err: any) {
        // Firestore write failed — still return the analysis data so it's not lost
        console.error("[Feedback] Firestore write error:", err.message);
        return NextResponse.json({
            success: false,
            error: "Feedback generated but could not be saved. Please retry.",
        }, { status: 500 });
    }
}
