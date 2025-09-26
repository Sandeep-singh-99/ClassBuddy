import FAQSection from "@/components/FAQSection";
import FeaturesComponents from "@/components/FeaturesComponents";
import HeroComponent from "@/components/HeroComponent";
import Testimonials from "@/components/Testimonials";


export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c1729] text-white">

      <HeroComponent />

      <FeaturesComponents />

      <Testimonials />

      <FAQSection />
      </div>
  );
}
