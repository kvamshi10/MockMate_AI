import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";

const PLANS: Record<string, { amount: number; name: string }> = {
    starter: { amount: 19900, name: "MockMate Starter" },   // ₹199
    pro:     { amount: 49900, name: "MockMate Pro" },        // ₹499
    elite:   { amount: 99900, name: "MockMate Elite" },      // ₹999
};

export async function POST(req: Request) {
    try {
        const { planId, userId } = await req.json();

        // ── Enforce Server-Side Session Match ─────────────────────────────────
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.uid !== userId) {
            return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
        }

        const plan = PLANS[planId];
        if (!plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        // ── 2. Handle Upgrades: Deduct price of active plan ────────────────────
        let finalAmount = plan.amount;
        const currentPlan = currentUser.plan || "free";
        const isCurrentlyActive = currentUser.planExpiresAt && new Date(currentUser.planExpiresAt) > new Date();

        if (isCurrentlyActive && currentPlan !== "free") {
            const currentPlanData = PLANS[currentPlan];
            if (currentPlanData && plan.amount > currentPlanData.amount) {
                // It's an upgrade!
                finalAmount = plan.amount - currentPlanData.amount;
                console.log(`[Razorpay] Upgrade detected: ${currentPlan} -> ${planId}. New amount: ${finalAmount}`);
            } else if (currentPlan === planId) {
                // Renewal at full price
                finalAmount = plan.amount;
            } else {
                // Downgrade or same price - usually not allowed or just full price
                finalAmount = plan.amount;
            }
        }

        const isSandbox = !process.env.RAZORPAY_KEY_ID || 
                          process.env.RAZORPAY_KEY_ID === "" || 
                          process.env.RAZORPAY_KEY_ID.includes("PLACEHOLDER") ||
                          !process.env.RAZORPAY_KEY_SECRET || 
                          process.env.RAZORPAY_KEY_SECRET === "" ||
                          process.env.RAZORPAY_KEY_SECRET.includes("PLACEHOLDER");

        if (isSandbox) {
            console.log(`[Razorpay Sandbox] Creating mock order for plan ${planId} and user ${userId}`);
            return NextResponse.json({
                orderId: `order_mock_${Date.now()}`,
                amount: finalAmount,
                currency: "INR",
                planName: plan.name,
                sandbox: true,
            });
        }

        const auth = Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: finalAmount,
                currency: "INR",
                receipt: `mm_${userId}_${planId}_${Date.now()}`.slice(0, 40),
                notes: { userId, planId },
            }),
        });

        const order = await response.json();
        if (!response.ok) {
            throw new Error(order.error?.description || "Failed to create Razorpay order");
        }

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: plan.name,
        });
    } catch (error: any) {
        console.error("Razorpay create-order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
