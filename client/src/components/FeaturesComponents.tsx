import {
  BookOpen,
  Brain,
  MessageSquareCode,
  ClipboardList,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function FeaturesComponents() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header with small uppercase label above bold headline */}
        <div className="text-left max-w-2xl space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // Core Architecture
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
            Engineered for depth, speed, and real retention.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Replace fragmented study tools with a unified operating system built for
            lecture synthesis, interactive testing, and classroom management.
          </p>
        </div>

        {/* Varied Bento Grid (2:1 and 1:1 modules) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Wide 2-Column Module — AI Notes Synthesizer */}
          <div className="lg:col-span-2 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-black/[0.06] dark:border-white/[0.06]">
                  Multi-Agent Pipeline
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  AI Lecture & Syllabus Synthesis
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
                  Ingests complex 80-page slide decks, syllabi, and research papers.
                  Extracts core formulas, builds hierarchy, and renders markdown summaries in seconds.
                </p>
              </div>
            </div>

            {/* Micro Visual inside Card 1 */}
            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase">Input Stage</span>
                <p className="font-semibold text-foreground truncate">PDF / Slides / Docs</p>
                <p className="text-[10px] text-muted-foreground">OCR + Layout Parsing</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1 text-primary">
                <span className="text-[10px] uppercase font-bold">Synthesizer</span>
                <p className="font-semibold truncate">Gemini 2.5 Flash</p>
                <p className="text-[10px]">LangGraph Workflow</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase">Output</span>
                <p className="font-semibold text-foreground truncate">Structured Notes</p>
                <p className="text-[10px] text-muted-foreground">Anki, PDF & Markdown</p>
              </div>
            </div>
          </div>

          {/* Card 2: 1-Column Square Module — Adaptive Quiz Arena */}
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-black/[0.06] dark:border-white/[0.06]">
                  Adaptive Drills
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Adaptive Quiz Generator
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Questions calibrate dynamically to your knowledge gaps, testing retention with instant rubric explanations.
                </p>
              </div>
            </div>

            {/* Micro Visual inside Card 2 */}
            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Retention Score</span>
                <span className="font-bold text-primary">98.4%</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Active Streak</span>
                <span className="font-bold text-foreground">12 Days 🔥</span>
              </div>
            </div>
          </div>

          {/* Card 3: 1-Column Square Module — Real-Time Mock Interviews */}
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-black/[0.06] dark:border-white/[0.06]">
                  Career Prep
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  AI Mock Technical Interviews
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Simulate interactive tech screenings and viva questions with instant feedback on clarity, accuracy, and depth.
                </p>
              </div>
            </div>

            {/* Micro Visual inside Card 3 */}
            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Simulation Type</span>
                  <span className="font-semibold text-foreground">Systems Viva</span>
                </div>
                <div className="flex gap-1 h-3 items-end">
                  <div className="w-1.5 h-full bg-primary rounded-full animate-pulse" />
                  <div className="w-1.5 h-2/3 bg-primary rounded-full" />
                  <div className="w-1.5 h-4/5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1/2 bg-primary rounded-full" />
                  <div className="w-1.5 h-full bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Wide 2-Column Module — Classroom Hub & Auto-Grading */}
          <div className="lg:col-span-2 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-black/[0.06] dark:border-white/[0.06]">
                  For Educators
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Automated Rubric Assignment Grading
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
                  Educators create classrooms, publish markdown assignments with deadlines,
                  and let AI evaluate submissions against customizable criteria. Saves 10+ hours every week.
                </p>
              </div>
            </div>

            {/* Micro Visual inside Card 4 */}
            <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Submissions Evaluated</span>
                  <span className="font-bold text-foreground">148 / 150 Papers</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Time Saved / Week</span>
                  <span className="font-bold text-primary">12.5 Hours</span>
                </div>
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
