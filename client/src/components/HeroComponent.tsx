import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroComponent() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center pt-26 px-6 overflow-hidden">
      {/* Background Glow Effects - Simplified */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Content */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 flex items-center justify-center gap-3 tracking-tight animate-fade-in">
        <Sparkles className="text-yellow-400 w-12 h-12" />
        ClassBuddy
      </h1>

      <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
        Meet your{" "}
        <span className="text-yellow-600 font-bold">
          AI-powered study companion
        </span>{" "}
        — create <span className="text-blue-600 font-bold">quizzes</span>, get{" "}
        <span className="text-green-600 font-bold">summaries</span>, and explore{" "}
        <span className="text-pink-600 font-bold">career paths</span>{" "}
        effortlessly.
      </p>

      <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10">
        Trusted by{" "}
        <span className="text-yellow-600 font-bold">10,000+ students </span>
        worldwide to make studying smarter, faster and more engaging.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 rounded-xl px-8 py-6 text-lg flex items-center gap-2"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-8 py-6 text-lg flex items-center gap-2 shadow-sm"
        >
          <PlayCircle className="w-5 h-5" /> Learn More
        </Button>
      </div>

      {/* Optional: Add Illustration / Mockup */}
      {/* <div className="mt-14 relative w-full max-w-4xl">
        <img
          src={img1}
          alt="ClassBuddy Preview"
          className="rounded-xl shadow-2xl border border-gray-200"
          loading="lazy"
        />
      </div> */}
    </section>
  );
}
