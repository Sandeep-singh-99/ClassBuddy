import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Compass, ClipboardList, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FeaturesComponents() {
  const features = [
    {
      icon: BookOpen,
      title: "AI Notes Generator",
      description:
        "Teachers upload study materials, and AI instantly generates clean, structured study notes and summaries for joined student groups.",
      badge: "Study Repository",
      accent: "from-blue-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      borderHover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
      highlights: ["Instant Summaries", "Group Access", "PDF & Docs"],
    },
    {
      icon: Brain,
      title: "AI Quiz & Interview Prep",
      description:
        "Interactive practice quizzes and real-time AI mock interviews generated directly from course topics to boost student confidence.",
      badge: "Interactive Practice",
      accent: "from-violet-500/10 via-purple-500/5 to-transparent",
      iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      borderHover: "hover:border-violet-500/40 hover:shadow-violet-500/10",
      highlights: ["Mock Interviews", "Adaptive Quizzes", "Score Analytics"],
    },
    {
      icon: Compass,
      title: "Career Guidance Bot",
      description:
        "Personalized career roadmaps and AI skill advice helping students navigate tech specializations and future job market readiness.",
      badge: "Career Growth",
      accent: "from-cyan-500/10 via-teal-500/5 to-transparent",
      iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      borderHover: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
      highlights: ["Skill Assessment", "Career Roadmaps", "Industry Insights"],
    },
    {
      icon: ClipboardList,
      title: "Assignments & Auto-Grading",
      description:
        "Teachers publish interactive assignments with deadline controls, markdown questions, and instant AI-driven grade feedback.",
      badge: "Smart Evaluation",
      accent: "from-fuchsia-500/10 via-pink-500/5 to-transparent",
      iconBg: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
      borderHover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10",
      highlights: ["Markdown Editor", "Automated Feedback", "Progress Tracking"],
    },
  ];

  return (
    <section className="w-full relative bg-background text-foreground border-y border-border/50 py-20 sm:py-28 overflow-hidden">
      {/* Background Decorative Mesh Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-primary/5 dark:bg-primary/10 blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Superpowers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Everything You Need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-primary to-cyan-500">
              Smarter Learning
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            ClassBuddy bridges teachers and students with an all-in-one AI ecosystem — from study materials to automated assignments and career guidance.
          </p>
        </div>

        {/* Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-xl shadow-xs hover:shadow-xl transition-all duration-500 ${feature.borderHover}`}
              >
                {/* Top Ambient Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <CardContent className="p-8 sm:p-10 flex flex-col justify-between h-full space-y-8 relative z-10">
                  <div className="space-y-6">
                    {/* Header Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs group-hover:scale-110 transition-transform duration-500 ${feature.iconBg}`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      <Badge
                        variant="secondary"
                        className="text-[11px] font-semibold px-3 py-1 bg-secondary text-secondary-foreground"
                      >
                        {feature.badge}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Tags */}
                  <div className="pt-4 border-t border-border/40 flex items-center gap-2 flex-wrap">
                    {feature.highlights.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-muted/50 text-foreground border border-border/40"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
