"use client";

import { BarChart3, TrendingUp, Target, Award, Clock } from "lucide-react";
import { useMemo } from "react";

export default function AnalyticsOverview({ interviews }: { interviews: any[] }) {
    const analytics = useMemo(() => {
        const completed = interviews.filter(i => i.latestScore != null || i.score != null);
        const total = completed.length;
        
        let avgScore = 0;
        let bestScore = 0;
        
        if (total > 0) {
            const sum = completed.reduce((acc, curr) => acc + (curr.latestScore ?? curr.score ?? 0), 0);
            avgScore = Math.round(sum / total);
            bestScore = Math.max(...completed.map(i => i.latestScore ?? i.score ?? 0));
        }

        return {
            totalInterviews: interviews.length,
            completedInterviews: total,
            avgScore,
            bestScore,
        };
    }, [interviews]);

    return (
        <section className="space-y-4 animate-fadeIn">
            <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-aurora font-semibold">Overview</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 text-white">Dashboard Analytics</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Interviews */}
                <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <Target className="h-5 w-5 text-violet-400" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sessions</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white">{analytics.totalInterviews}</div>
                </div>

                {/* Average Score */}
                <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-sky-400" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Score</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white">
                        {analytics.avgScore} <span className="text-lg text-muted-foreground font-medium">/ 100</span>
                    </div>
                </div>

                {/* Best Performance */}
                <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Award className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Best Score</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white">
                        {analytics.bestScore > 0 ? analytics.bestScore : "-"} <span className="text-lg text-muted-foreground font-medium">/ 100</span>
                    </div>
                </div>

                {/* Completed */}
                <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white">{analytics.completedInterviews}</div>
                </div>
            </div>
        </section>
    );
}
