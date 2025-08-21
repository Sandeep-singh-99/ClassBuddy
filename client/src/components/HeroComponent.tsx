import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroComponent() {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 flex items-center justify-center gap-3 tracking-tight">
          <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" />
          ClassBuddy
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Your{" "}
          <span className="text-yellow-400 font-semibold">
            AI-powered study companion
          </span>{" "}
          — create quizzes, get summaries, and explore career paths
          effortlessly.
        </p>

        <div className="flex gap-4">
          <Button
            size="lg"
            className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg rounded-xl px-8 py-6 text-lg"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-500 text-white hover:bg-gray-800 px-8 py-6 text-lg"
          >
            Learn More
          </Button>
        </div>
      </section>
  )
}
