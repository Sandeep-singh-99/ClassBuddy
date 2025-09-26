import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Aarav",
      quote: "ClassBuddy helped me prepare faster for exams with AI summaries.",
    },
    {
      name: "Meera",
      quote: "The quiz generator is a lifesaver for teachers like me!",
    },
    {
      name: "Karan",
      quote: "The career guidance feature showed me the exact skills to focus on.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#0f1d33] relative overflow-hidden">
      {/* Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-4xl md:text-5xl tracking-wider p-4 font-extrabold  bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
          What Students Say
        </h2>
        <p className="text-gray-400 text-lg">
          Loved by learners & educators. Here’s how ClassBuddy is making a difference.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <Card
            key={i}
            className="bg-[#111b30] border border-gray-700 rounded-xl shadow-lg hover:shadow-yellow-400/10 hover:scale-[1.02] transition-transform duration-300"
          >
            <CardContent className="p-8 text-center flex flex-col items-center">
              {/* Fake Avatar Placeholder (optional) */}
              <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
                <span className="text-yellow-400 font-bold text-xl">
                  {t.name[0]}
                </span>
              </div>

              {/* Quote */}
              <p className="text-gray-300 italic mb-6 leading-relaxed">
                “{t.quote}”
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Name */}
              <h4 className="font-semibold text-yellow-400 tracking-wide">
                – {t.name}
              </h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decorative Glow */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
    </section>
  );
}
