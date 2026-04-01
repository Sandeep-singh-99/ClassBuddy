import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Users, ClipboardList } from "lucide-react";

export default function FeaturesComponents() {
  return (
    <section className="w-full relative bg-white dark:bg-[#08101F] border-y border-border/40">
      {/* Background glow lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-primary to-cyan-500 pb-2">
            Powerful Superpowers
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            A complete AI-powered platform for teachers and students — from study
            materials to quizzes, assignments, and career growth.
          </p>
        </div>

      {/* Cards - Bento style */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Notes from Teacher Docs */}
        <Card className="group bg-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/40 hover:bg-card/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-primary/5">
          <CardContent className="p-10 flex flex-col h-full bg-gradient-to-br from-transparent via-transparent to-primary/[0.03] group-hover:to-primary/[0.08] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl text-foreground font-bold mb-4">
              AI Notes Generator
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Teachers upload study material, and AI instantly creates{" "}
              <span className="text-foreground font-semibold">
                summarized notes{" "}
              </span>
              for students. Access is available when students{" "}
              <span className="text-foreground font-semibold">join a group</span>.
            </p>
          </CardContent>
        </Card>

        {/* Practice & Interview Quizzes */}
        <Card className="group bg-card/40 backdrop-blur-xl border border-border/50 hover:border-violet-500/40 hover:bg-card/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-violet-500/5 mt-0 md:mt-12">
          <CardContent className="p-10 flex flex-col h-full bg-gradient-to-br from-transparent via-transparent to-violet-500/[0.03] group-hover:to-violet-500/[0.08] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-8 border border-violet-500/20 group-hover:scale-110 transition-transform duration-500">
              <Brain className="w-7 h-7 text-violet-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              AI Quiz & Interview Prep
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Students can{" "}
              <span className="text-foreground font-semibold">
                practice interviews
              </span>{" "}
              and AI will generate{" "}
              <span className="text-foreground font-semibold">quizzes</span> based
              on the uploaded content.
            </p>
          </CardContent>
        </Card>

        {/* Career Guidance */}
        <Card className="group bg-card/40 backdrop-blur-xl border border-border/50 hover:border-cyan-500/40 hover:bg-card/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-cyan-500/5">
          <CardContent className="p-10 flex flex-col h-full bg-gradient-to-br from-transparent via-transparent to-cyan-500/[0.03] group-hover:to-cyan-500/[0.08] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-2xl text-foreground font-bold mb-4">
              Career Guidance Bot
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Personalized{" "}
              <span className="text-foreground font-semibold">career advice</span>{" "}
              to help students identify{" "}
              <span className="text-foreground font-semibold">
                skills for the future{" "}
              </span>
              and career paths.
            </p>
          </CardContent>
        </Card>

        {/* Teacher Assignments */}
        <Card className="group bg-card/40 backdrop-blur-xl border border-border/50 hover:border-fuchsia-500/40 hover:bg-card/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-fuchsia-500/5 mt-0 md:mt-12">
          <CardContent className="p-10 flex flex-col h-full bg-gradient-to-br from-transparent via-transparent to-fuchsia-500/[0.03] group-hover:to-fuchsia-500/[0.08] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-8 border border-fuchsia-500/20 group-hover:scale-110 transition-transform duration-500">
              <ClipboardList className="w-7 h-7 text-fuchsia-500" />
            </div>
            <h3 className="text-2xl text-foreground font-bold mb-4">
              Assignments & Tasks
            </h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Teachers can{" "}
              <span className="text-foreground font-semibold">assign tasks </span>
              and track student progress — making learning{" "}
              <span className="text-foreground font-semibold">
                interactive & structured
              </span>
              .
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </section>
  );
}
