"use client";

import { useState } from "react";
import { X, CheckCircle, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: 199,
        icon: Rocket,
        gradient: "from-sky-500 to-blue-600",
        border: "border-sky-500/30",
        bg: "bg-sky-500/5",
        features: [
            "10 interviews / month",
            "Up to 10 questions each",
            "Up to 30 min duration",
            "Basic AI feedback",
            "Email support",
        ],
        recommended: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: 499,
        icon: Zap,
        gradient: "from-violet-500 to-indigo-600",
        border: "border-aurora/40",
        bg: "bg-aurora/5",
        features: [
            "Unlimited interviews",
            "Unlimited questions",
            "Unlimited duration",
            "Detailed AI feedback & scores",
            "Performance analytics",
            "Priority support",
        ],
        recommended: true,
    },
    {
        id: "elite",
        name: "Elite",
        price: 999,
        icon: Crown,
        gradient: "from-amber-500 to-orange-600",
        border: "border-amber-500/30",
        bg: "bg-amber-500/5",
        features: [
            "Everything in Pro",
            "Custom AI interviewer persona",
            "Resume-based question gen",
            "Interview recordings",
            "Dedicated account support",
            "Team features (coming soon)",
        ],
        recommended: false,
    },
];

interface Props {
    userId: string;
    onClose: () => void;
    onSuccess: (planId: string) => void;
}

export default function PaywallModal({ userId, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async (planId: string) => {
        setLoading(planId);
        setError(null);
        try {
            // 1. Create Razorpay order on server
            const orderRes = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, userId }),
            });
            const { orderId, amount, currency, sandbox, error: orderErr } = await orderRes.json();
            if (orderErr) throw new Error(orderErr);

            if (sandbox) {
                const confirmed = window.confirm(`[Sandbox Mode] Would you like to simulate a successful payment of ₹${amount / 100} for the ${planId} plan?`);
                if (!confirmed) {
                    setLoading(null);
                    return;
                }

                // Verify mock payment on server
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpay_order_id: orderId,
                        razorpay_payment_id: `pay_mock_${Date.now()}`,
                        razorpay_signature: "mock_signature",
                        userId,
                        planId,
                    }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    onSuccess(planId);
                } else {
                    setError("Sandbox payment verification failed.");
                    setLoading(null);
                }
                return;
            }

            // 2. Load Razorpay checkout.js dynamically
            await new Promise<void>((resolve, reject) => {
                if ((window as any).Razorpay) { resolve(); return; }
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Failed to load Razorpay script"));
                document.body.appendChild(script);
            });

            // 3. Open Razorpay checkout modal
            const rzp = new (window as any).Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency,
                order_id: orderId,
                name: "MockMate AI",
                description: `${PLANS.find(p => p.id === planId)?.name} Plan — 30 Days`,
                image: "/AI_Logo.png",
                theme: { color: "#7c3aed" },
                handler: async (response: any) => {
                    // 4. Verify payment on server
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId,
                            planId,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        onSuccess(planId);
                    } else {
                        setError("Payment verification failed. Contact support.");
                    }
                },
                modal: { ondismiss: () => setLoading(null) },
            });
            rzp.open();
        } catch (err: any) {
            console.error("Payment error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsl(250 30% 8%) 0%, hsl(260 25% 11%) 100%)" }}
            >
                {/* Top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/40 to-transparent" />

                {/* Glow blob */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

                <div className="relative p-8">
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aurora/30 bg-aurora/10 text-xs font-medium text-aurora mb-4">
                            <Zap className="h-3 w-3" />
                            Free tier limit reached
                        </div>
                        <h2 className="text-2xl font-bold text-white">Unlock Unlimited Interviews</h2>
                        <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
                            You&apos;ve used your 2 free interviews. Choose a plan to keep practicing and land your dream job.
                        </p>
                    </div>

                    {/* Plans */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border ${plan.border} ${plan.bg} p-5 flex flex-col`}
                            >
                                {plan.recommended && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-aurora text-white whitespace-nowrap">
                                        Most Popular
                                    </span>
                                )}

                                {/* Icon + name */}
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3`}>
                                    <plan.icon className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{plan.name}</p>
                                <div className="mt-1 mb-4 flex items-end gap-1">
                                    <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                                    <span className="text-muted-foreground text-xs mb-1">/month</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5 mb-5 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <CheckCircle className="h-3 w-3 text-aurora shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={!!loading}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                        plan.id === "starter"
                                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-[1.02]"
                                            : plan.id === "elite"
                                            ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-[1.02]"
                                            : plan.recommended
                                            ? "bg-aurora text-white shadow-[var(--shadow-glow)] hover:scale-[1.02]"
                                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading === plan.id ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Processing…
                                        </span>
                                    ) : (
                                        <>Get {plan.name} <ArrowRight className="h-3.5 w-3.5" /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <p className="mt-4 text-center text-xs text-red-400">{error}</p>
                    )}

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Secure payments via Razorpay · 30-day access · Cancel anytime ·{" "}
                        <Link href="/pricing" className="text-aurora hover:underline">
                            View full plan details
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
