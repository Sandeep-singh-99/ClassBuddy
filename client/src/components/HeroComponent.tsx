import { Sparkles, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import img1 from '../assets/img.png';

export default function HeroComponent() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center pt-26 px-6 bg-gradient-to-br from-[#0c1729] via-[#13233f] to-[#0c1729] overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0,transparent_80%)] pointer-events-none" />

      {/* Content */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 flex items-center justify-center gap-3 tracking-tight animate-fade-in">
        <Sparkles className="text-yellow-400 w-12 h-12 animate-bounce" />
        ClassBuddy
      </h1>

      <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
        Meet your{" "}
        <span className="text-yellow-400 font-semibold">AI-powered study companion</span> — 
        create <span className="text-blue-400 font-medium">quizzes</span>, 
        get <span className="text-green-400 font-medium">summaries</span>, 
        and explore <span className="text-pink-400 font-medium">career paths</span>{" "}
        effortlessly.
      </p>

      <p className="text-sm text-gray-400 max-w-xl mx-auto mb-10">
        Trusted by <span className="text-yellow-400 font-semibold">10,000+ students </span> 
        worldwide to make studying smarter, faster and more engaging.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg rounded-xl px-8 py-6 text-lg flex items-center gap-2"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-gray-500 bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 px-8 py-6 text-lg flex items-center gap-2"
        >
          <PlayCircle className="w-5 h-5" /> Learn More
        </Button>
      </div>

      {/* Optional: Add Illustration / Mockup */}
      <div className="mt-14 relative w-full max-w-4xl">
        <img
          src={img1}
          alt="ClassBuddy Preview"
          className="rounded-xl shadow-2xl border border-gray-700"
          loading="lazy"
        />
      </div>

      
    </section>
  );
}
