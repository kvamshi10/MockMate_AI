import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Parse the incoming state
    const historyString = formData.get("history") as string;
    const currentDataString = formData.get("currentData") as string;
    const audioFile = formData.get("audio") as File | null;

    const history = historyString ? JSON.parse(historyString) : [];
    const currentData = currentDataString ? JSON.parse(currentDataString) : {};

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY");
    }

    // Prepare contents array for Google Gemini API natively
    const contents: any[] = [];

    // Gemini STRICTLY requires the first message in contents to be from the 'user'.
    // Since our history starts with the assistant, we must prepend a dummy user message.
    contents.push({
      role: "user",
      parts: [{ text: "I am ready to start the interview setup. Please begin." }]
    });

    // Add conversation history
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    // Add the latest audio input if provided
    if (audioFile && audioFile.size > 0) {
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");
      
      // Gemini strict MIME type format (cannot contain codecs like "audio/webm;codecs=opus")
      let mimeType = audioFile.type || "audio/webm";
      if (mimeType.includes(";")) {
        mimeType = mimeType.split(";")[0];
      }
      
      contents.push({
        role: "user",
        parts: [
          { text: "Here is my voice response:" },
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType,
            }
          }
        ]
      });
    } else {
      // If no audio, just prompt the user
      contents.push({
        role: "user",
        parts: [{ text: "I did not speak." }]
      });
    }

    const systemInstruction = `You are a friendly, concise AI assistant helping a user set up a mock interview.
Your goal is to collect the following REQUIRED information:
- role (e.g., Frontend Developer, Data Scientist, Product Manager)
- interviewTypes (e.g., Technical, Behavioral, HR, Managerial)

Optional fields you can collect if naturally mentioned (do not explicitly ask for them unless necessary):
- companyName
- level (Internship, Junior, Mid, Senior, Lead)
- duration (minutes, e.g., 15, 30, 45, 60)

Here is the data collected so far:
${JSON.stringify(currentData, null, 2)}

Instructions:
1. Examine the user's latest input (audio or text).
2. Extract any newly mentioned preferences and merge them with the current data.
3. If 'role' and 'interviewTypes' are NOT both provided, set 'isComplete' to false, and write a short, friendly, conversational question in 'nextQuestion' to ask for the missing information. Ask only ONE thing at a time.
4. If 'role' and 'interviewTypes' ARE both provided, set 'isComplete' to true, and set 'nextQuestion' to a short confirmation like "Perfect, I have everything I need. Setting up your interview now!".`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            formData: {
              type: "OBJECT",
              description: "The fully merged state of all collected interview preferences so far.",
              properties: {
                companyName: { type: "STRING" },
                role: { type: "STRING" },
                level: { type: "STRING" },
                interviewTypes: { type: "ARRAY", items: { type: "STRING" } },
                duration: { type: "NUMBER", nullable: true }
              }
            },
            nextQuestion: {
              type: "STRING",
              description: "The exact text the assistant will say next out loud to the user."
            },
            isComplete: {
              type: "BOOLEAN",
              description: "True if both 'role' and 'interviewTypes' have been successfully collected."
            }
          },
          required: ["formData", "nextQuestion", "isComplete"]
        }
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No text returned from Gemini");
    }

    let cleanText = resultText.trim();
    if (cleanText.startsWith("\`\`\`json")) {
      cleanText = cleanText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    } else if (cleanText.startsWith("\`\`\`")) {
      cleanText = cleanText.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
    }

    const object = JSON.parse(cleanText);

    return NextResponse.json(object, { status: 200 });
  } catch (error) {
    console.error("Voice chat parsing error:", error);
    return NextResponse.json({ error: "Failed to process conversational audio" }, { status: 500 });
  }
}
