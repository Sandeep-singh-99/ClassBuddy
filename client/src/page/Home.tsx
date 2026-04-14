import { lazy, Suspense } from "react";
import HeroComponent from "@/components/HeroComponent";
import RateLimitBanner from "@/components/RateLimitBanner";

const FeaturesComponents = lazy(
  () => import("@/components/FeaturesComponents")
);
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

import FeatureSkeleton from "@/components/skeletons/FeatureSkeleton";
import TestimonialSkeleton from "@/components/skeletons/TestimonialSkeleton";
import FAQSkeleton from "@/components/skeletons/FAQSkeleton";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0c1729] text-slate-900 dark:text-white selection:bg-primary/30 relative overflow-x-hidden transition-colors duration-300">
      {/* Top ambient glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] z-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(124,58,237,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(124,58,237,0.25),rgba(255,255,255,0))]" />
      
      <RateLimitBanner />
      <HeroComponent />

      <Suspense fallback={<FeatureSkeleton />}>
        <FeaturesComponents />
      </Suspense>

      <Suspense fallback={<TestimonialSkeleton />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>
    </main>
  );
}
