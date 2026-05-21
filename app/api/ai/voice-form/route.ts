import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Call Gemini 2.5 Flash to parse the audio and extract interview parameters
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        companyName: z.string().describe("The name of the company or organization the user is applying to. If not mentioned, leave empty."),
        role: z.string().describe("The job role or position the user is interviewing for."),
        level: z.string().describe("The seniority level, e.g., 'Internship', 'Junior', 'Mid', 'Senior', 'Lead'. If not mentioned, default to 'Mid'."),
        interviewTypes: z.array(z.string()).describe("The type(s) of interview, e.g., 'Technical', 'Behavioral', 'HR', 'Managerial', 'Scientific', 'Creative'."),
        techStack: z.array(z.string()).describe("List of technologies, frameworks, or skills mentioned by the user."),
        amountMode: z.enum(["time", "questions"]).describe("Whether the user specified a preference for duration (time) or number of questions (questions). Default to 'time'."),
        duration: z.number().nullable().describe("Duration of the interview in minutes, e.g., 15, 30, 45, 60. Default to 15 if not specified."),
        questionCount: z.number().nullable().describe("Number of questions if amountMode is questions, e.g., 5, 10, 15. Null otherwise."),
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Listen to the user's audio and extract their interview preferences to fill out a setup form. Map their words to the required schema fields as accurately as possible.",
            },
            {
              type: "file",
              data: audioBuffer,
              mediaType: audioFile.type || "audio/wav",
            },
          ],
        },
      ],
    });

    return NextResponse.json({ formData: object }, { status: 200 });
  } catch (error) {
    console.error("Voice parsing error:", error);
    return NextResponse.json({ error: "Failed to parse audio" }, { status: 500 });
  }
}
