import { ArrowRight, PlayCircle, Star, BrainCircuit, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroComponent() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[95vh] text-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Premium Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[800px] md:h-[500px] opacity-40 dark:opacity-20 pointer-events-none z-0 blur-[100px] bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] opacity-30 dark:opacity-20 pointer-events-none z-0 blur-[120px] bg-gradient-to-l from-blue-500 to-cyan-400 rounded-full" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Announcement Badge */}
      <div className="group inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-full bg-white/60 dark:bg-white/5 border border-primary/20 dark:border-white/10 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/10 transition-all cursor-pointer select-none backdrop-blur-md shadow-sm hover:shadow-md hover:shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="tracking-tight">ClassBuddy AI 2.0 is now live</span>
        <ArrowRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Main Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight max-w-5xl mx-auto leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        Learn faster with your <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-primary to-cyan-500 pb-2 inline-block">
          AI Study Companion
        </span>
      </h1>

      {/* Subhead */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
        Transform your notes into quizzes, get precise summaries, and explore career paths in seconds. Trusted by <strong className="text-foreground">10,000+</strong> students globally.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 fill-mode-both">
        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(124,58,237,0.4)] rounded-full transition-all hover:scale-105 active:scale-95 group">
          Start Learning Free <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-border/50 bg-background/50 backdrop-blur-md hover:bg-muted/50 transition-all active:scale-95 group">
          <PlayCircle className="w-5 h-5 mr-2 text-primary group-hover:text-primary/80 transition-colors" /> See how it works
        </Button>
      </div>

      {/* Floating UI Elements (SaaS vibe) */}
      <div className="mt-20 relative w-full max-w-[850px] mx-auto hidden md:block animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700 fill-mode-both">
        {/* Decorative elements behind the mockup */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent blur-3xl rounded-full" />
        
        {/* Abstract App Mockup / Glass Card */}
        <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden leading-none ring-1 ring-foreground/5 dark:ring-white/10">
          {/* Header row */}
          <div className="w-full h-12 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background/60 h-6 w-full max-w-[300px] rounded-md border border-border/50 shadow-inner flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/80 font-mono tracking-wider">classbuddy.ai/dashboard</span>
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="p-8 grid grid-cols-3 gap-6 opacity-90">
            <div className="col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="h-2 w-16 bg-primary/40 rounded-full" />
                <div className="h-8 bg-foreground/10 rounded-lg w-3/4" />
              </div>
              <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/30">
                <div className="h-3 bg-foreground/15 rounded w-full" />
                <div className="h-3 bg-foreground/15 rounded w-5/6" />
                <div className="h-3 bg-foreground/15 rounded w-4/6" />
              </div>
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-28 bg-primary/20 rounded-lg border border-primary/20" />
                <div className="h-10 w-28 bg-violet-500/10 rounded-lg border border-violet-500/20" />
              </div>
            </div>
            <div className="col-span-1 space-y-4">
               <div className="h-[110px] bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border border-border/50 flex flex-col justify-center items-center gap-3 backdrop-blur-sm shadow-sm transition-transform hover:scale-[1.02]">
                 <BrainCircuit className="w-8 h-8 text-primary opacity-80" />
                 <div className="h-2 w-16 bg-foreground/20 rounded-full" />
               </div>
               <div className="h-[110px] bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl border border-border/50 flex flex-col justify-center items-center gap-3 backdrop-blur-sm shadow-sm transition-transform hover:scale-[1.02]">
                 <Zap className="w-8 h-8 text-yellow-500 opacity-80" />
                 <div className="h-2 w-20 bg-foreground/20 rounded-full" />
               </div>
            </div>
          </div>
          
          {/* Decor: Floating badges */}
          <div className="absolute -left-6 top-24 bg-background/90 backdrop-blur-xl border border-border/60 text-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce shadow-purple-500/10 [animation-duration:4s]">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/20"><BookOpen className="w-5 h-5 text-primary" /></div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold leading-tight">Quiz Ready</span>
              <span className="text-[11px] text-muted-foreground">Generated in 2s</span>
            </div>
          </div>
          <div className="absolute -right-8 bottom-16 bg-background/90 backdrop-blur-xl border border-border/60 text-foreground px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce shadow-blue-500/10 [animation-duration:5s]">
            <div className="bg-yellow-500/20 p-2 rounded-xl border border-yellow-500/20"><Star className="w-5 h-5 text-yellow-500" /></div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold leading-tight">A+ Score</span>
              <span className="text-[11px] text-muted-foreground">Excellent work!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
