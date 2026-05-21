import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

const PLAN_DURATIONS: Record<string, number> = {
    starter: 30,   // 30 days
    pro:     30,   // 30 days
    elite:   30,   // 30 days
};

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            planId,
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // ── 1. Enforce Server-Side Session Match ─────────────────────────────────
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isSandbox = !process.env.RAZORPAY_KEY_ID || 
                          process.env.RAZORPAY_KEY_ID === "" || 
                          process.env.RAZORPAY_KEY_ID.includes("PLACEHOLDER") ||
                          !process.env.RAZORPAY_KEY_SECRET || 
                          process.env.RAZORPAY_KEY_SECRET === "" ||
                          process.env.RAZORPAY_KEY_SECRET.includes("PLACEHOLDER");

        if (isSandbox && razorpay_order_id.startsWith("order_mock_")) {
            console.log(`[Razorpay Sandbox] Verifying mock payment for order ${razorpay_order_id}`);
            
            const secureUserId = userId || currentUser.uid;
            const securePlanId = planId || "pro";

            if (secureUserId !== currentUser.uid) {
                return NextResponse.json({ error: "Account mismatch for payment" }, { status: 403 });
            }

            if (!securePlanId || !PLAN_DURATIONS[securePlanId]) {
                return NextResponse.json({ error: "Invalid plan attached to order" }, { status: 400 });
            }

            const days = PLAN_DURATIONS[securePlanId];
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);

            await adminDb.collection("users").doc(secureUserId).update({
                plan: securePlanId,
                planExpiresAt: expiresAt.toISOString(),
                planActivatedAt: new Date().toISOString(),
                lastPaymentId: razorpay_payment_id,
                lastOrderId: razorpay_order_id,
            });

            console.log(`[Razorpay Sandbox] User ${secureUserId} mock upgraded to ${securePlanId} until ${expiresAt.toISOString()}`);
            return NextResponse.json({ success: true, plan: securePlanId, expiresAt: expiresAt.toISOString() });
        }

        // ── 2. Verify HMAC-SHA256 signature to confirm payment is genuine ────────
        const expectedSig = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSig !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        // ── 3. Fetch pristine Order data from Razorpay backend ───────────────────
        // WARNING: Never trust planId or userId from the client payload!
        // We fetch the tamper-proof `notes` attached during order creation.
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
        const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
            headers: { Authorization: `Basic ${auth}` }
        });
        
        if (!orderRes.ok) {
            return NextResponse.json({ error: "Failed to verify order details with gateway" }, { status: 502 });
        }
        
        const orderData = await orderRes.json();
        const secureUserId = orderData.notes?.userId;
        const securePlanId = orderData.notes?.planId;

        if (secureUserId !== currentUser.uid) {
            return NextResponse.json({ error: "Account mismatch for payment" }, { status: 403 });
        }

        if (!securePlanId || !PLAN_DURATIONS[securePlanId]) {
            return NextResponse.json({ error: "Invalid plan attached to order" }, { status: 400 });
        }

        // ── 4. Upgrade user plan in Firestore ────────────────────────────────────
        const days = PLAN_DURATIONS[securePlanId];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        await adminDb.collection("users").doc(secureUserId).update({
            plan: securePlanId,
            planExpiresAt: expiresAt.toISOString(),
            planActivatedAt: new Date().toISOString(),
            lastPaymentId: razorpay_payment_id,
            lastOrderId: razorpay_order_id,
        });

        console.log(`✅ User ${secureUserId} upgraded to ${securePlanId} plan until ${expiresAt.toISOString()}`);
        return NextResponse.json({ success: true, plan: securePlanId, expiresAt: expiresAt.toISOString() });
    } catch (error: any) {
        console.error("Razorpay verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
