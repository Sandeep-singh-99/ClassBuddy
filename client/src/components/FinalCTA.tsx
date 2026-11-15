import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthComponent from "./AuthComponent";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  const { user } = useAppSelector((state) => state.auth);
  const dashboardPath =
    user?.role === "teacher" ? "/t-dashboard/home" : "/dashboard-panel/home";

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 lg:p-16 border border-black/[0.08] dark:border-white/[0.08] bg-card text-center relative overflow-hidden shadow-xl">
        {/* Subtle Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[var(--hero-glow)] blur-[130px] rounded-full pointer-events-none"
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // Get Started
          </p>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-foreground leading-[1.1]">
            Supercharge your academic performance today.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Join over 10,000 students and educators turning complex lectures into
            retained knowledge. Free forever tier, no card required.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link to={dashboardPath} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-sm cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Enter Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <AuthComponent
                  defaultTab="signup"
                  trigger={
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start studying free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  }
                />
                <AuthComponent
                  defaultTab="signup"
                  trigger={
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-medium border border-black/[0.08] dark:border-white/[0.08] bg-muted/40 hover:bg-muted text-foreground cursor-pointer"
                    >
                      Educator Onboarding
                    </Button>
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
