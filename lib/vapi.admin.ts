/**
 * ==========================================
 * VAPI ADMIN SDK (SERVER-SIDE)
 * ==========================================
 * This file handles server-side communication with Vapi using the private API Key.
 * This is used for managing assistants, fetching call reports, etc.
 */

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = "https://api.vapi.ai";

export async function getVapiAssistant(assistantId: string) {
    if (!VAPI_API_KEY) {
        console.error("VAPI_API_KEY is missing from environment variables.");
        return null;
    }

    try {
        const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
            headers: {
                "Authorization": `Bearer ${VAPI_API_KEY}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Vapi API Error:", error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch Vapi assistant:", error);
        return null;
    }
}
