import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Users } from "lucide-react";

export default function FeaturesComponents() {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-10">Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-[#111b30] border-gray-700 hover:border-2">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold mb-2">
              AI Study Assistant
            </h3>
            <p className="text-gray-400">
              Upload PDFs → Get summaries + practice questions instantly.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111b30] border-gray-700 hover:border-2">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Quiz Generator
            </h3>
            <p className="text-gray-400">
              Teachers upload material → AI creates quizzes automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111b30] border-gray-700 hover:border-2">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold mb-2">
              Career Guidance Bot
            </h3>
            <p className="text-gray-400">
              AI suggests career paths + skills to learn for your future.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
