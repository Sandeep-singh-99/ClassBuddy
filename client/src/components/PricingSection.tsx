import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthComponent from "./AuthComponent";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { user } = useAppSelector((state) => state.auth);
  const dashboardPath =
    user?.role === "teacher" ? "/t-dashboard/home" : "/dashboard-panel/home";

  const plans = [
    {
      name: "Starter",
      badge: "Free tier",
      priceMonthly: "₹0",
      priceAnnual: "₹0",
      period: "forever",
      description: "For individual learners getting started with AI study assistance.",
      features: [
        "15 Note syntheses per month",
        "30 Adaptive practice quizzes",
        "Join up to 3 classroom groups",
        "Standard Gemini 2.5 response speed",
        "Markdown & Anki exports",
      ],
      isPopular: false,
      ctaText: "Start free",
    },
    {
      name: "Pro Student",
      badge: "Recommended",
      priceMonthly: "₹199",
      priceAnnual: "₹159",
      period: "/ month",
      annualNote: "Billed annually at ₹1,908 / year (Save 20%)",
      description: "Unlimited synthesis, instant mock interview preparation, and priority speed.",
      features: [
        "Unlimited AI note synthesis & PDF parsing",
        "Unlimited adaptive practice quizzes",
        "Real-time AI mock interview simulations",
        "Personalized career roadmaps & guidance",
        "Join unlimited classroom groups",
        "Priority queue processing (< 1.5s latency)",
      ],
      isPopular: true,
      ctaText: "Upgrade to Pro",
    },
    {
      name: "Educator",
      badge: "For Teachers",
      priceMonthly: "₹499",
      priceAnnual: "₹399",
      period: "/ month",
      annualNote: "Billed annually at ₹4,788 / year (Save 20%)",
      description: "Complete classroom automation with AI rubric evaluations and group management.",
      features: [
        "Everything in Pro Student",
        "Create unlimited classroom groups",
        "Automated rubric assignment grading",
        "Cohort performance & retention analytics",
        "CSV grade export & student feedback portal",
        "Dedicated educator support & SLA",
      ],
      isPopular: false,
      ctaText: "Start Educator Plan",
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 border-t border-black/[0.08] dark:border-white/[0.08] bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with Monthly/Annual Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl text-left">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
              // Pricing Plans
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
              Predictable pricing. Free for individual learners.
            </h2>
          </div>

          {/* Toggle Button */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-card border border-black/[0.08] dark:border-white/[0.08] self-start md:self-auto text-xs font-mono">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-primary/10 text-primary font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards (Middle Plan Highlighted) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? "bg-card border-2 border-primary shadow-md dark:shadow-[0_0_40px_rgba(192,138,91,0.15)] md:-translate-y-2"
                  : "bg-card border border-black/[0.08] dark:border-white/[0.08] shadow-xs"
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      plan.isPopular
                        ? "bg-primary/10 text-primary border-primary/20 font-bold"
                        : "bg-muted text-muted-foreground border-black/[0.06] dark:border-white/[0.06]"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                      {billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  {billingCycle === "annual" && plan.annualNote && (
                    <p className="text-[11px] font-mono text-primary mt-1">
                      {plan.annualNote}
                    </p>
                  )}
                </div>

                {/* Feature Checklist */}
                <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Included Capabilities:
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
                {user ? (
                  <Link to={dashboardPath} className="w-full">
                    <Button
                      className={`w-full h-10 rounded-xl text-xs font-semibold cursor-pointer ${
                        plan.isPopular
                          ? "bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs"
                          : "bg-muted hover:bg-muted/80 text-foreground border border-black/[0.08] dark:border-white/[0.08]"
                      }`}
                    >
                      {plan.ctaText}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <AuthComponent
                    defaultTab="signup"
                    trigger={
                      <Button
                        className={`w-full h-10 rounded-xl text-xs font-semibold cursor-pointer ${
                          plan.isPopular
                            ? "bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs"
                            : "bg-muted hover:bg-muted/80 text-foreground border border-black/[0.08] dark:border-white/[0.08]"
                        }`}
                      >
                        {plan.ctaText}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
