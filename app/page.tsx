import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { TemplatesSection } from "@/components/templates-section"
import { FeaturesSection } from "@/components/features-section"
import { ManagementSection } from "@/components/management-section"
import { DeliverySection } from "@/components/delivery-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <TemplatesSection />
        <FeaturesSection />
        <ManagementSection />
        <DeliverySection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
