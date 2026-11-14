import { ArrowRight, Play, Sparkles, BookOpen, CheckCircle2, Terminal, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthComponent from "./AuthComponent";
import { useAppSelector } from "@/hooks/hooks";
import { Link } from "react-router-dom";

export default function HeroComponent() {
  const { user } = useAppSelector((state) => state.auth);
  const dashboardPath =
    user?.role === "teacher" ? "/t-dashboard/home" : "/dashboard-panel/home";

  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Subtle radial ambient light behind hero (Linear style, single brown accent) */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--hero-glow)] blur-[140px] rounded-full pointer-events-none -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 dot-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_60%,transparent_100%)]"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Monolithic Announcement Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-black/[0.08] dark:border-white/[0.08] shadow-xs text-[11px] sm:text-xs font-medium text-foreground hover:border-foreground/20 transition-all cursor-default max-w-[92vw]">
          <span className="flex h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <span className="text-muted-foreground shrink-0">ClassBuddy 2.4</span>
          <span className="text-foreground/30">•</span>
          <span className="text-foreground truncate">Adaptive AI Study Workspace</span>
        </div>

        {/* Hero Title: 28px on mobile (375px), 52px on tablet, 76px on desktop */}
        <h1 className="text-[28px] sm:text-5xl lg:text-[76px] font-bold tracking-[-0.03em] text-foreground leading-[1.12] sm:leading-[1.05] max-w-4xl mx-auto">
          The AI workspace for serious learners & educators.
        </h1>

        {/* Crisp one-line subtext */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Synthesize complex lecture slides into structured study guides, generate
          exam-ready quizzes, and run automated rubric grading in seconds.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link to={dashboardPath} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Open Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <AuthComponent
              defaultTab="signup"
              trigger={
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl text-sm font-semibold bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start studying free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          )}

          <a href="#showcase" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-medium border border-black/[0.08] dark:border-white/[0.08] bg-card/60 hover:bg-card text-foreground transition-all cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 mr-2 text-muted-foreground fill-current" />
              Interactive demo
            </Button>
          </a>
        </div>

        {/* Micro guarantees */}
        <div className="pt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Free forever tier
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> No card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 60s setup
          </span>
        </div>
      </div>

      {/* High-Fidelity Linear-Grade Workspace Mockup */}
      <div className="mt-14 max-w-5xl mx-auto relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden text-left">
        {/* App Window Chrome */}
        <div className="h-10 bg-muted/40 border-b border-black/[0.06] dark:border-white/[0.06] px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20 inline-block" />
            <div className="ml-4 flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              <span>classbuddy.ai/workspace/cs204-distributed-systems</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">Gemini 2.5 Flash</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        {/* Inner 3-Column Studio Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06] dark:divide-white/[0.06]">
          {/* Left Navigation Tree */}
          <div className="lg:col-span-3 p-4 bg-muted/10 space-y-3 hidden sm:block">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Course Library
            </p>
            <div className="space-y-1 text-xs">
              <div className="p-2 rounded-lg bg-primary/10 text-primary font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>08_Raft_Consensus.pdf</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer transition-colors">
                <FileText className="w-3.5 h-3.5" />
                <span>07_Two_Phase_Commit.pdf</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Midterm Exam Flashcards</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="p-2.5 rounded-xl bg-card border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Syllabus Covered</span>
                  <span className="font-mono font-semibold text-foreground">84%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="w-[84%] h-full bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Center: Synthesized Note Stream */}
          <div className="lg:col-span-6 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Lecture 08: Raft Leader Election & Heartbeats
                </span>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">Synthesized in 1.4s</span>
            </div>

            <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-muted-foreground font-mono">
              <p className="text-foreground font-bold font-sans">
                Summary & State Machine Invariants:
              </p>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Election Safety:</span>
                </div>
                <p className="text-xs pl-3.5">
                  At most one leader can be elected in a given term. If a follower
                  receives no communication over electionTimeout, it transitions to Candidate.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Log Matching Property:</span>
                </div>
                <p className="text-xs pl-3.5">
                  If two logs contain an entry with the same index and term, the logs are identical up to that point.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Quiz Verification Card */}
          <div className="lg:col-span-3 p-5 bg-muted/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Active Quiz
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                Hard
              </span>
            </div>

            <p className="text-xs font-medium text-foreground leading-snug">
              What prevents split-brain during simultaneous network partitions in Raft?
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/40 text-primary font-medium flex items-center justify-between">
                <span>Quorum Majority (N/2 + 1)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-black/[0.06] dark:border-white/[0.06] text-muted-foreground opacity-75">
                <span>Clock synchronization</span>
              </div>
              <div className="p-2.5 rounded-xl bg-card border border-black/[0.06] dark:border-white/[0.06] text-muted-foreground opacity-75">
                <span>Round-robin leader rotation</span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-mono">Response Latency</span>
              <span className="font-mono font-bold text-foreground">42ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
