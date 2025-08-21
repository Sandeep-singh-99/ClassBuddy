import { Card, CardContent } from "@/components/ui/card";

export default function Testimonials() {
  return (
    <section className="py-16 px-6 bg-[#0f1d33]">
      <h2 className="text-3xl font-semibold text-center mb-10">
        What Students Say
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            name: "Aarav",
            quote:
              "ClassBuddy helped me prepare faster for exams with AI summaries.",
          },
          {
            name: "Meera",
            quote: "The quiz generator is a lifesaver for teachers like me!",
          },
          {
            name: "Karan",
            quote:
              "The career guidance feature showed me the exact skills to focus on.",
          },
        ].map((t, i) => (
          <Card key={i} className="bg-[#111b30] border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-300 italic mb-4">“{t.quote}”</p>
              <h4 className="font-semibold text-yellow-400">- {t.name}</h4>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
