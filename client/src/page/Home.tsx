import { lazy, Suspense } from "react";
import HeroComponent from "@/components/HeroComponent";
import RateLimitBanner from "@/components/RateLimitBanner";

const FeaturesComponents = lazy(
  () => import("@/components/FeaturesComponents")
);
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

// bg-[#0c1729] text-white

import FeatureSkeleton from "@/components/skeletons/FeatureSkeleton";
import TestimonialSkeleton from "@/components/skeletons/TestimonialSkeleton";
import FAQSkeleton from "@/components/skeletons/FAQSkeleton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background text-foreground">
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
