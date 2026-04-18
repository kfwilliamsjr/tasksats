import {
  CallToAction,
  DomainSection,
  GrowthSection,
  HeroSection,
  HowItWorksSection,
  PaymentFlowSection,
  PricingSection,
  ProductSection,
  RoadmapSection,
  SiteFooter,
  SiteHeader,
  TrustStrip,
  WhyTaskSatsSection,
} from "../components";

export function HomePage() {
  return (
    <main className="page-shell">
      <div className="site-shell">
        <SiteHeader />
        <HeroSection />
        <TrustStrip />
        <WhyTaskSatsSection />
        <ProductSection />
        <PricingSection />
        <HowItWorksSection />
        <PaymentFlowSection />
        <DomainSection />
        <GrowthSection />
        <RoadmapSection />
        <CallToAction />
        <SiteFooter />
      </div>
    </main>
  );
}
