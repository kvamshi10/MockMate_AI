import Vapi from '@vapi-ai/web';

const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (typeof window !== 'undefined' && !token) {
  console.warn("⚠️ Vapi Web Token is missing! Ensure NEXT_PUBLIC_VAPI_WEB_TOKEN is set in .env.local");
}

export const vapi = new Vapi(token || "");

