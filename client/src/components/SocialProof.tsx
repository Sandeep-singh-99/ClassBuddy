export default function SocialProof() {
  const stats = [
    { value: "10,000+", label: "Active Students", sub: "Globally registered" },
    { value: "450+", label: "Classroom Groups", sub: "Managed by educators" },
    { value: "98.4%", label: "Concept Retention", sub: "Adaptive question drills" },
    { value: "2.5M+", label: "Questions Solved", sub: "Instant rubric feedback" },
  ];

  const standards = [
    "Stanford AI Lab Standards",
    "Cambridge Tripos Alignment",
    "IIT & NIT Engineering Curricula",
    "RFC 7636 PKCE OAuth 2.0",
    "Redis Pub/Sub Distributed Cache",
  ];

  return (
    <section className="py-14 border-y border-black/[0.08] dark:border-white/[0.08] bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Curricula and Institutional Alignment (Grayscale Minimalist Cloud) */}
        <div className="text-center space-y-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by students & educators preparing for top standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-[13px] font-mono text-muted-foreground/80">
            {standards.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 4 Precision Stats in Clean Editorial Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
          {stats.map((item, idx) => (
            <div key={idx} className="text-left space-y-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-foreground">
                {item.label}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
