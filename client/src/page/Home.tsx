import { lazy, Suspense } from "react";
import HeroComponent from "@/components/HeroComponent";
import RateLimitBanner from "@/components/RateLimitBanner";
import SocialProof from "@/components/SocialProof";

const FeaturesComponents = lazy(
  () => import("@/components/FeaturesComponents")
);
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const ProductShowcase = lazy(() => import("@/components/ProductShowcase"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const FinalCTA = lazy(() => import("@/components/FinalCTA"));

import FeatureSkeleton from "@/components/skeletons/FeatureSkeleton";
import TestimonialSkeleton from "@/components/skeletons/TestimonialSkeleton";
import FAQSkeleton from "@/components/skeletons/FAQSkeleton";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden transition-colors duration-300">
      <RateLimitBanner />
      
      {/* 2. Hero Section */}
      <HeroComponent />

      {/* 3. Social Proof & Metrics */}
      <SocialProof />

      {/* 4. Features Bento Grid */}
      <Suspense fallback={<FeatureSkeleton />}>
        <FeaturesComponents />
      </Suspense>

      {/* 5. How It Works - 3 Simple Steps */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted/20" />}>
        <HowItWorks />
      </Suspense>

      {/* 6. Showcase & Interactive Product Preview */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted/20" />}>
        <ProductShowcase />
      </Suspense>

      {/* 7. Pricing Section with Recommended Highlight */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted/20" />}>
        <PricingSection />
      </Suspense>

      {/* 8. Testimonials with Verified Badges */}
      <Suspense fallback={<TestimonialSkeleton />}>
        <Testimonials />
      </Suspense>

      {/* 9. FAQ Accordion */}
      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>

      {/* 10. Final Conversion Banner */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-muted/20" />}>
        <FinalCTA />
      </Suspense>
    </main>
  );
}
