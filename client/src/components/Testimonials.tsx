import { CheckCircle2 } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Aarav Sharma",
      role: "B.Tech Computer Science, IIT Roorkee",
      initials: "AS",
      quote:
        "ClassBuddy condensed 60-page slide decks into structured markdown notes with instant practice quizzes. It helped me land the highest score in our distributed systems cohort.",
    },
    {
      name: "Dr. Meera Iyer",
      role: "Associate Professor, Delhi University",
      initials: "MI",
      quote:
        "Automated rubric grading saves me 10+ hours every single week. My students receive line-by-line feedback within minutes instead of waiting two weeks for manual paper reviews.",
    },
    {
      name: "Karan Malhotra",
      role: "Software Engineer Intern @ FinTech",
      initials: "KM",
      quote:
        "The real-time AI mock interview practice gave me the exact confidence I needed. The constructive critique on algorithms and system design directly helped me land my dream internship.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 border-t border-black/[0.08] dark:border-white/[0.08] bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-left max-w-2xl space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // Feedback
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
            Trusted by learners and educators at scale.
          </h2>
        </div>

        {/* 3 Editorial Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card flex flex-col justify-between space-y-6 shadow-xs hover:border-black/[0.15] dark:hover:border-white/[0.15] transition-all"
            >
              <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                "{rev.quote}"
              </p>

              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted text-foreground flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {rev.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground truncate">
                      {rev.name}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {rev.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
