"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: 199,
        period: "month",
        icon: Rocket,
        gradient: "from-sky-500 to-blue-600",
        border: "border-sky-500/20",
        bg: "from-sky-500/5 to-transparent",
        features: [
            "10 interviews per month",
            "Up to 10 questions per session",
            "Up to 30 min per interview",
            "Basic AI feedback & score",
            "Email support",
        ],
        notIncluded: ["Performance analytics", "Custom AI persona", "Recordings"],
        recommended: false,
        cta: "Get Starter",
    },
    {
        id: "pro",
        name: "Pro",
        price: 499,
        period: "month",
        icon: Zap,
        gradient: "from-violet-500 to-indigo-600",
        border: "border-aurora/40",
        bg: "from-aurora/10 to-transparent",
        features: [
            "Unlimited interviews",
            "Unlimited questions",
            "Unlimited duration",
            "Detailed AI feedback & scores",
            "Performance analytics dashboard",
            "Priority support",
            "All interview types",
        ],
        notIncluded: ["Custom AI persona", "Recordings"],
        recommended: true,
        cta: "Get Pro",
    },
    {
        id: "elite",
        name: "Elite",
        price: 999,
        period: "month",
        icon: Crown,
        gradient: "from-amber-500 to-orange-600",
        border: "border-amber-500/20",
        bg: "from-amber-500/5 to-transparent",
        features: [
            "Everything in Pro",
            "Custom AI interviewer persona",
            "Resume-based question generation",
            "Interview session recordings",
            "Dedicated account support",
            "Early access to new features",
            "Team features (coming soon)",
        ],
        notIncluded: [],
        recommended: false,
        cta: "Get Elite",
    },
];

const FREE_FEATURES = [
    "2 interviews total",
    "Up to 5 questions",
    "Up to 15 min per session",
    "Basic AI feedback",
];

interface Props {
    user: { uid: string; name: string; plan?: string; planExpiresAt?: string | null } | null;
}

export default function PricingClient({ user }: Props) {
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentPlan = user?.plan || "free";
    const isActive = user?.planExpiresAt && new Date(user.planExpiresAt) > new Date();

    const handlePurchase = async (planId: string) => {
        if (!user) {
            router.push("/sign-in?callbackUrl=/pricing");
            return;
        }

        // Prevent purchasing the same or lower plan if already active
        const targetPlan = PLANS.find(p => p.id === planId);
        const activePlan = PLANS.find(p => p.id === currentPlan);
        
        if (isActive && activePlan && targetPlan && targetPlan.price <= activePlan.price) {
            if (planId === currentPlan) {
                // Allow renewal maybe? Or just skip for now.
            } else {
                return; // Prevent downgrade through this UI
            }
        }

        setLoadingPlan(planId);
        setError(null);

        try {
            // 1. Create Razorpay order on server
            const orderRes = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId, userId: user.uid }),
            });
            const { orderId, amount, currency, sandbox, error: orderErr } = await orderRes.json();
            if (orderErr) throw new Error(orderErr);

            if (sandbox) {
                const confirmed = window.confirm(`[Sandbox Mode] Would you like to simulate a successful payment of ₹${amount / 100} for the ${planId} plan?`);
                if (!confirmed) {
                    setLoadingPlan(null);
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
                        userId: user.uid,
                        planId,
                    }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    router.push("/dashboard?upgrade=success");
                } else {
                    setError("Sandbox payment verification failed.");
                    setLoadingPlan(null);
                }
                return;
            }

            // 2. Load Razorpay checkout.js
            await new Promise<void>((resolve, reject) => {
                if ((window as any).Razorpay) { resolve(); return; }
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve();
                script.onerror = () => reject(new Error("Failed to load Razorpay script"));
                document.body.appendChild(script);
            });

            // 3. Open Checkout
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
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user.uid,
                            planId,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        router.push("/dashboard?upgrade=success");
                    } else {
                        setError("Payment verification failed.");
                    }
                },
                modal: { ondismiss: () => setLoadingPlan(null) },
            });
            rzp.open();
        } catch (err: any) {
            console.error("Pricing purchase error:", err);
            setError(err.message || "Something went wrong.");
            setLoadingPlan(null);
        }
    };

    return (
        <main className="container mx-auto py-16 px-4 md:px-8 space-y-16 animate-fade-in-up">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-aurora/30 bg-aurora/10 text-xs font-medium text-aurora">
                    <Zap className="h-3 w-3" />
                    Simple, transparent pricing
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Invest in your
                    <span className="block bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                        interview success
                    </span>
                </h1>
                <p className="text-muted-foreground text-lg">
                    {isActive ? `You are currently on the ${currentPlan} plan.` : "Start free. Upgrade when you need more. Cancel anytime."}
                </p>
                {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {PLANS.map((plan) => {
                    const isCurrent = Boolean(isActive && currentPlan === plan.id);
                    const activePlanData = PLANS.find(p => p.id === currentPlan);
                    const isUpgrade = Boolean(isActive && activePlanData && plan.price > activePlanData.price);
                    const isDowngrade = Boolean(isActive && activePlanData && plan.price < activePlanData.price);
                    const upgradePrice = isUpgrade ? plan.price - (activePlanData?.price || 0) : plan.price;

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-3xl border ${isCurrent ? "border-aurora ring-2 ring-aurora/20" : plan.border} overflow-hidden flex flex-col transition-all duration-300 hover:translate-y-[-4px]`}
                            style={{ background: `linear-gradient(160deg, hsl(250 30% 9%) 0%, hsl(260 25% 11%) 100%)` }}
                        >
                            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${plan.bg} pointer-events-none`} />
                            {plan.recommended && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-aurora to-transparent" />}
                            
                            {isCurrent && (
                                <div className="absolute top-4 right-4 z-20">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-aurora/20 border border-aurora/30 text-[10px] font-bold text-aurora uppercase tracking-wider">
                                        <CheckCircle className="h-3 w-3" />
                                        Active
                                    </div>
                                </div>
                            )}

                            <div className="relative p-7 flex flex-col flex-1">
                                {plan.recommended && !isCurrent && (
                                    <span className="self-start mb-4 px-3 py-0.5 rounded-full text-[11px] font-bold bg-aurora text-white">
                                        Most Popular
                                    </span>
                                )}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                    <plan.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
                                <div className="mt-2 mb-6 flex items-end gap-1">
                                    <div className="flex flex-col">
                                        {isUpgrade && (
                                            <span className="text-xs text-muted-foreground line-through opacity-50">₹{plan.price}</span>
                                        )}
                                        <span className="text-4xl font-bold text-white">₹{isUpgrade ? upgradePrice : plan.price}</span>
                                    </div>
                                    <span className="text-muted-foreground text-sm mb-1">/{plan.period}</span>
                                    {isUpgrade && (
                                        <span className="text-[10px] font-bold text-emerald-400 ml-1 mb-1.5">Upgrade Price</span>
                                    )}
                                </div>
                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                                            <CheckCircle className="h-4 w-4 text-aurora shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                    {plan.notIncluded.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through">
                                            <CheckCircle className="h-4 w-4 text-white/10 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => !isCurrent && !isDowngrade && handlePurchase(plan.id)}
                                    disabled={loadingPlan === plan.id || isCurrent || isDowngrade}
                                    className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                        isCurrent
                                            ? "bg-secondary/50 text-muted-foreground cursor-default border border-white/5"
                                            : isDowngrade
                                            ? "bg-secondary/30 text-muted-foreground/50 cursor-not-allowed border border-white/5"
                                            : plan.id === "starter"
                                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-[1.02]"
                                            : plan.id === "elite"
                                            ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-[1.02]"
                                            : plan.recommended
                                            ? "bg-aurora text-white shadow-[var(--shadow-glow)] hover:scale-[1.02]"
                                            : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    } disabled:opacity-50`}
                                >
                                    {loadingPlan === plan.id ? (
                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : isCurrent ? (
                                        "Current Plan"
                                    ) : isDowngrade ? (
                                        "Plan Active"
                                    ) : isUpgrade ? (
                                        <>Upgrade Now <ArrowRight className="h-4 w-4" /></>
                                    ) : (
                                        <>{plan.cta} <ArrowRight className="h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="max-w-5xl mx-auto rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Free Plan — Always Available</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {FREE_FEATURES.map((f) => (
                                <span key={f} className="flex items-center gap-1.5 text-sm text-white/70">
                                    <CheckCircle className="h-3.5 w-3.5 text-white/30" />
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white transition-all"
                    >
                        Start for free <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                    Secure payments via <span className="text-white">Razorpay</span> · 30-day access per payment · All major cards, UPI &amp; net banking accepted
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Questions? Reach us at <span className="text-aurora">support@mockmate.ai</span>
                </p>
            </div>
        </main>
    );
}
