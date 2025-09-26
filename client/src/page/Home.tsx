import { lazy, Suspense } from "react";
import HeroComponent from "@/components/HeroComponent";

const FeaturesComponents = lazy(() => import("@/components/FeaturesComponents"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0c1729] text-white">
      <HeroComponent />

      <Suspense fallback={<div className="text-center py-10">Loading features...</div>}>
        <FeaturesComponents />
      </Suspense>

      <Suspense fallback={<div className="text-center py-10">Loading testimonials...</div>}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<div className="text-center py-10">Loading FAQs...</div>}>
        <FAQSection />
      </Suspense>
    </main>
  );
}
