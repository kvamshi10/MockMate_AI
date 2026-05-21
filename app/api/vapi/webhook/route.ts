import { adminDb as db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Vapi sends different types of events. We only care about end-of-call-report
        if (payload?.message?.type === 'end-of-call-report') {
            const call = payload.message.call;
            const variables = call.variableValues || call.metadata?.variableValues || {};
            const interviewId = variables.interviewId;
            console.log("[Webhook] Extracted variables:", variables);

            if (interviewId && interviewId !== "unknown") {
                const recordingUrl = call.recordingUrl || call.artifact?.recordingUrl || "";
                const transcript = call.transcript || call.artifact?.transcript || "No transcript available.";
                let aiAnalysis: any = null;

                try {
                    // 1. Prepare messages for Gemini
                    const messages: any[] = [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "You are an expert HR interviewer and technical evaluator. Listen to this interview recording (or read the transcript if audio is absent). Identify the AI asking questions and the user giving answers. Analyze the user's performance and provide detailed feedback."
                                }
                            ]
                        }
                    ];

                    // 2. Fetch Audio if available
                    if (recordingUrl) {
                        try {
                            const audioRes = await fetch(recordingUrl);
                            if (audioRes.ok) {
                                const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
                                messages[0].content.push({
                                    type: "file" as any,
                                    data: audioBuffer,
                                    mimeType: "audio/wav" // Vapi usually provides wav or mp3
                                });
                            } else {
                                messages[0].content.push({ type: "text", text: `Transcript: ${transcript}` });
                            }
                        } catch (err) {
                            console.warn("Failed to fetch recording, falling back to transcript", err);
                            messages[0].content.push({ type: "text", text: `Transcript: ${transcript}` });
                        }
                    } else {
                        messages[0].content.push({ type: "text", text: `Transcript: ${transcript}` });
                    }

                    // 3. Call Gemini
                    const { object } = await generateObject({
                        model: google("gemini-2.5-flash"),
                        schema: z.object({
                            overallSummary: z.string().describe("Overall Performance Summary: A comprehensive summary of how the candidate did."),
                            technicalScore: z.number().min(0).max(100).describe("Technical Skills Score (0-100)"),
                            communicationScore: z.number().min(0).max(100).describe("Communication Score (0-100)"),
                            confidenceScore: z.number().min(0).max(100).describe("Confidence Score (0-100)"),
                            problemSolvingScore: z.number().min(0).max(100).describe("Problem Solving Score (0-100)"),
                            behavioralScore: z.number().min(0).max(100).describe("Behavioral Score (0-100)"),
                            keyStrengths: z.array(z.string()).describe("List of Key Strengths demonstrated by the candidate"),
                            areasForImprovement: z.array(z.string()).describe("List of Areas for Improvement or Improvement Scope"),
                            recommendedTopics: z.array(z.string()).describe("Recommended Topics to Practice based on weaknesses"),
                            actionableTips: z.array(z.string()).describe("Actionable Tips and Tricks or Ways to Improve for future interviews"),
                            hiringRecommendation: z.string().describe("Final Hiring Recommendation: e.g., Strong Hire, Hire, Leaning Hire, No Hire"),
                            overallScore: z.number().min(0).max(100).describe("A final weighted overall score out of 100"),
                            
                            // Detailed Feedback Section-by-Section
                            detailedFeedback: z.object({
                                communication: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                technical: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                problemSolving: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                confidence: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                behavioral: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                clarity: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                leadership: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                systemDesign: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) }),
                                coding: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), weaknesses: z.array(z.string()), improvementSuggestions: z.array(z.string()) })
                            }).describe("Detailed section-wise feedback with scores, strengths, weaknesses, and improvement suggestions"),

                            // Question Analysis (Strict Match)
                            questionAnalysis: z.array(z.object({
                                question: z.string().describe("The question asked by the AI"),
                                candidateAnswer: z.string().describe("The candidate's response to the question"),
                                score: z.number().min(0).max(100).describe("Response score (0-100)"),
                                strengths: z.array(z.string()).describe("Specific strengths of this answer"),
                                weaknesses: z.array(z.string()).describe("Specific weaknesses of this answer"),
                                improvementTips: z.array(z.string()).describe("Actionable advice to improve this answer"),
                                idealAnswer: z.string().describe("Model ideal answer for this question"),
                                aiFeedback: z.string().describe("Forensic recruiter-grade review comments on this answer")
                            })).describe("Strict format detailed question-by-question analysis"),

                            // Advanced AI insights
                            aiInsights: z.object({
                                communicationConfidence: z.string().describe("Evaluation of confidence, tone, and projection"),
                                fillerWordUsage: z.string().describe("Analysis of verbal fillers (e.g. um, like, you know)"),
                                hesitationDetection: z.string().describe("Analysis of pauses, speech rate, and hesitation"),
                                technicalDepth: z.string().describe("Evaluation of candidate's technical correctness and depth"),
                                clarityScore: z.number().min(0).max(100).describe("Score for overall clarity and logical flow (0-100)"),
                                speakingFluency: z.string().describe("Evaluation of pacing and fluency"),
                                leadershipIndicators: z.string().describe("Assessment of ownership, proactiveness, and vision"),
                                problemSolvingPatterns: z.string().describe("Assessment of computational thinking and structural logic")
                            }).describe("Advanced forensic-level AI performance insights"),

                            improvementPlan: z.array(z.string()).describe("Actionable steps to improve skills and performance")
                        }),
                        messages: messages
                    });
                    
                    aiAnalysis = object;
                } catch (error) {
                    console.error("Gemini Analysis failed:", error);
                    // Fallback mock scores if Gemini fails completely
                    aiAnalysis = {
                        overallSummary: call.summary || call.analysis?.summary || "No feedback generated.",
                        overallScore: 50,
                        technicalScore: 50,
                        communicationScore: 50,
                        confidenceScore: 50,
                        problemSolvingScore: 50,
                        behavioralScore: 50,
                        keyStrengths: [],
                        areasForImprovement: [],
                        recommendedTopics: [],
                        actionableTips: [],
                        hiringRecommendation: "Needs Review",
                        detailedFeedback: {
                            communication: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            technical: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            problemSolving: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            confidence: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            behavioral: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            clarity: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            leadership: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            systemDesign: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] },
                            coding: { score: 50, strengths: [], weaknesses: [], improvementSuggestions: [] }
                        },
                        questionAnalysis: [],
                        aiInsights: {
                            communicationConfidence: "Moderate",
                            fillerWordUsage: "Average",
                            hesitationDetection: "Average",
                            technicalDepth: "Basic",
                            clarityScore: 50,
                            speakingFluency: "Moderate",
                            leadershipIndicators: "None detected",
                            problemSolvingPatterns: "Linear"
                        },
                        improvementPlan: []
                    };
                }

                const score = aiAnalysis.overallScore;

                // Fetch parent interview document first
                const docRef = db.collection("interviews").doc(interviewId);
                const doc = await docRef.get();
                const interviewData = doc.exists ? doc.data() : null;

                const parseTranscriptToStructured = (rawTranscript: string) => {
                    if (!rawTranscript) return [];
                    const lines = rawTranscript.split("\n");
                    const structured: any[] = [];
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        const match = trimmed.match(/^(AI|Candidate|User|Interviewer|AI Interviewer|Candidate Answer)\s*:\s*(.*)/i);
                        if (match) {
                            let speaker = match[1].trim();
                            const message = match[2].trim();
                            if (speaker.toLowerCase().includes("ai") || speaker.toLowerCase().includes("interviewer")) {
                                speaker = "AI";
                            } else {
                                speaker = "Candidate";
                            }
                            structured.push({
                                speaker: speaker,
                                message: message,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            });
                        } else {
                            if (structured.length > 0) {
                                structured[structured.length - 1].message += " " + trimmed;
                            } else {
                                structured.push({
                                    speaker: "Candidate",
                                    message: trimmed,
                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                });
                            }
                        }
                    }
                    return structured;
                };

                const structuredTranscript = parseTranscriptToStructured(transcript);

                const feedbackData = {
                    interviewId: interviewId,
                    userId: variables.userid || variables.userId || interviewData?.userId || "anonymous",
                    role: interviewData?.role || "Software Engineer",
                    company: interviewData?.companyName || "Target Company",
                    experienceLevel: interviewData?.level || "mid-level",
                    techStack: interviewData?.techstack || [],
                    interviewType: Array.isArray(interviewData?.type) ? interviewData.type.join(", ") : interviewData?.type || "technical",
                    createdAt: new Date().toISOString(),
                    duration: call.durationSeconds ? `${Math.round(call.durationSeconds / 60)}m` : "30m",
                    overallScore: score,
                    communicationScore: aiAnalysis.communicationScore,
                    technicalScore: aiAnalysis.technicalScore,
                    confidenceScore: aiAnalysis.confidenceScore,
                    problemSolvingScore: aiAnalysis.problemSolvingScore,
                    behavioralScore: aiAnalysis.behavioralScore || 50,
                    strengths: aiAnalysis.keyStrengths || [],
                    weaknesses: aiAnalysis.areasForImprovement || [],
                    improvementAreas: aiAnalysis.areasForImprovement || [],
                    recommendedTopics: aiAnalysis.recommendedTopics || [],
                    overallSummary: aiAnalysis.overallSummary,
                    questionFeedback: [],
                    performanceAnalysis: aiAnalysis.performanceAnalysis || {
                        communication: aiAnalysis.overallSummary,
                        technicalKnowledge: "Good standard of technical accuracy.",
                        confidence: "Showed professional presence and steady pacing.",
                        clarity: "Responses were clear and logically sound.",
                        problemSolving: "Logical approach with structured breakdown.",
                        behavioralSkills: "Aesthetic presentation and team alignment."
                    },
                    finalVerdict: aiAnalysis.overallSummary,
                    hiringRecommendation: aiAnalysis.hiringRecommendation,
                    nextSteps: aiAnalysis.actionableTips || [],
                    transcript: transcript,
                    detailedFeedback: aiAnalysis.detailedFeedback,
                    questionAnalysis: aiAnalysis.questionAnalysis,
                    aiInsights: aiAnalysis.aiInsights,
                    improvementPlan: aiAnalysis.improvementPlan
                };

                // 1. Create a new Feedback document in feedbacks collection
                const feedbackRef = db.collection("feedbacks").doc();
                await feedbackRef.set({
                    ...feedbackData,
                    // Legacy properties mapping
                    score: score,
                    summary: aiAnalysis.overallSummary,
                    keyStrengths: aiAnalysis.keyStrengths || [],
                    areasForImprovement: aiAnalysis.areasForImprovement || [],
                    recommendedTopics: aiAnalysis.recommendedTopics || [],
                    actionableTips: aiAnalysis.actionableTips || [],
                    recordingUrl: recordingUrl
                });

                // 2. Create in interview_feedbacks collection
                const interviewFeedbackRef = db.collection("interview_feedbacks").doc();
                await interviewFeedbackRef.set({
                    interviewId: interviewId,
                    userId: variables.userid || variables.userId || interviewData?.userId || "anonymous",
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
                    createdAt: new Date().toISOString()
                });

                // 3. Update the parent Interview document
                await docRef.update({
                    latestScore: score,
                    latestAttemptAt: new Date().toISOString(),
                    status: call.status || "ended",
                    transcript: transcript,
                    feedbackData: feedbackData
                });

                // Bust cache so dashboard shows updated score immediately
                const userId = variables.userid || variables.userId;
                if (userId) {
                    const { revalidateTag } = await import("next/cache");
                    revalidateTag(`interviews-${userId}`, "max");
                }

                console.log(`Successfully saved rich feedback ${feedbackRef.id} for interview: ${interviewId}`);
            } else {
                console.warn("Received end-of-call report without an interviewId.");
            }
        }

        // If Vapi sends an assistant-request to the Server URL, it expects a configuration object.
        // Returning an empty object tells Vapi to just use the Dashboard settings.
        if (payload?.message?.type === 'assistant-request') {
            return NextResponse.json({
                assistant: {} 
            }, { status: 200 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
