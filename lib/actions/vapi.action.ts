'use server'

import { getVapiAssistant } from "@/lib/vapi.admin";

/**
 * ==========================================
 * VERIFY VAPI ASSISTANT
 * ==========================================
 * Uses the private VAPI_API_KEY on the server to check if the assistant is valid.
 * This helps diagnose "Meeting has ended" errors.
 */
export async function verifyAssistant(assistantId: string) {
    const assistant = await getVapiAssistant(assistantId);
    
    if (!assistant) {
        return {
            success: false,
            message: "Assistant not found. Please check your NEXT_PUBLIC_VAPI_ASSISTANT_ID."
        };
    }

    // You could also check for credit balance or other flags here if Vapi API supports it
    return {
        success: true,
        name: assistant.name,
        model: assistant.model?.model
    };
}
