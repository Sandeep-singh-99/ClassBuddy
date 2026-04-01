import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Aarav",
      quote: "ClassBuddy helped me prepare faster for exams with AI summaries. The interactive quizzes are game-changing.",
    },
    {
      name: "Meera",
      quote: "The quiz generator is a lifesaver for teachers like me! It saves me hours of manual work every week.",
    },
    {
      name: "Karan",
      quote:
        "The career guidance feature showed me the exact skills to focus on. Highly recommend to any student planning their future.",
    },
  ];

  return (
    <section className="w-full relative bg-slate-50 dark:bg-[#0c1729] overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        {/* Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl tracking-tight pb-2 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
          What Students Say
        </h2>
        <p className="text-muted-foreground text-lg font-medium">
          Loved by learners & educators. Here’s how ClassBuddy is making a
          difference globally.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
        {testimonials.map((t, i) => (
          <Card
            key={i}
            className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
          >
            <CardContent className="p-8 text-center flex flex-col items-center h-full justify-between">
              <div className="flex flex-col items-center">
                {/* Fake Avatar Placeholder (optional) */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-foreground font-bold text-lg">
                    {t.name[0]}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-muted-foreground mb-8 leading-relaxed text-[15px]">
                  "{t.quote}"
                </p>
              </div>

              <div>
                {/* Star Rating */}
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>

                {/* Name */}
                <h4 className="font-semibold text-foreground tracking-wide">
                  {t.name}
                </h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </section>
  );
}
