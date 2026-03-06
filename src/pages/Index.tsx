import MeshBackground from "@/components/MeshBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import FounderSection from "@/components/FounderSection";
import DownloadSection from "@/components/DownloadSection";
import MeshFooter from "@/components/MeshFooter";

const Index = () => (
  <div className="relative min-h-screen">
    <MeshBackground />
    <Navbar />
    <HeroSection />
    <div className="glow-line" />
    <HowItWorks />
    <div className="glow-line" />
    <Features />
    <div className="glow-line" />
    <UseCases />
    <div className="glow-line" />
    <FounderSection />
    <div className="glow-line" />
    <DownloadSection />
    <MeshFooter />
  </div>
);

export default Index;
