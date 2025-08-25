import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Users } from "lucide-react";

export default function FeaturesComponents() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
          Powerful Features
        </h2>
        <p className="text-gray-400 text-lg md:text-xl">
          Everything you need to study smarter: summaries, quizzes, and future guidance — all in one AI-powered tool.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-[#111b30] border border-gray-700 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/10 transition-all duration-300 rounded-xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-2xl text-white font-semibold mb-3">
              AI Study Assistant
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Upload PDFs or notes and instantly generate <span className="text-yellow-400 font-medium">summaries</span> and <span className="text-yellow-400 font-medium">practice questions</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111b30] border border-gray-700 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/10 transition-all duration-300 rounded-xl">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-3">
              Smart Quiz Generator
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Teachers upload material, and the AI creates <span className="text-yellow-400 font-medium">quizzes automatically</span> — saving hours of work.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111b30] border border-gray-700 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/10 transition-all duration-300 rounded-xl">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-2xl text-white font-semibold mb-3">
              Career Guidance Bot
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Get personalized <span className="text-yellow-400 font-medium">career advice</span> and discover the <span className="text-yellow-400 font-medium">right skills</span> to prepare for your future.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
