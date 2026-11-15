import { FileUp, Cpu, Award, ArrowRight } from "lucide-react";
import AuthComponent from "./AuthComponent";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const { user } = useAppSelector((state) => state.auth);
  const dashboardPath =
    user?.role === "teacher" ? "/t-dashboard/home" : "/dashboard-panel/home";

  const steps = [
    {
      step: "01",
      title: "Ingest Syllabus & Notes",
      description:
        "Upload lecture PDFs, textbook chapters, or syllabus outlines. If you are a student, join your educator's classroom group with a simple 6-character code.",
      icon: FileUp,
    },
    {
      step: "02",
      title: "Multi-Agent Synthesis",
      description:
        "LangGraph multi-agent models extract core formulas, outline hierarchy, generate flash notes, and assemble adaptive quiz banks in under 2 seconds.",
      icon: Cpu,
    },
    {
      step: "03",
      title: "Practice & Master",
      description:
        "Complete adaptive quizzes with line-by-line rubric explanations, simulate mock interviews, and submit assignments with instant grading feedback.",
      icon: Award,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-y border-black/[0.08] dark:border-white/[0.08] bg-muted/20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-left max-w-2xl space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // Workflow
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
            From raw lecture materials to exam mastery in three steps.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Zero tedious manual formatting. Everything links directly to your course syllabus.
          </p>
        </div>

        {/* 3 Steps with Connecting Line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-7 left-12 right-12 h-px bg-black/[0.08] dark:bg-white/[0.08] -z-0"
          />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col justify-between p-7 rounded-2xl bg-card border border-black/[0.08] dark:border-white/[0.08] shadow-xs space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-muted border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-foreground font-semibold">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Execution Time</span>
                  <span className="font-semibold text-foreground">&lt; 2.0s</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-left pt-2">
          {user ? (
            <Link to={dashboardPath}>
              <Button size="lg" className="h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs cursor-pointer">
                Enter your workspace <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <AuthComponent
              trigger={
                <Button size="lg" className="h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-xs cursor-pointer">
                  Start studying in 60s <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
