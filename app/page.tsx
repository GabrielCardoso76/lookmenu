import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { BeforeAfterSection } from "@/components/before-after-section"
import { TemplatesSection } from "@/components/templates-section"
import { FeaturesSection } from "@/components/features-section"
import { QrCodeSection } from "@/components/qr-code-section"
import { ManagementSection } from "@/components/management-section"
import { DeliverySection } from "@/components/delivery-section"
import { SupportSection } from "@/components/support-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { WaveDivider } from "@/components/wave-divider"
import { FloatingIngredients } from "@/components/floating-ingredients"

export default function Page() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden">
        <FloatingIngredients />
        <Hero />
        <SocialProof />
        <WaveDivider />
        <BeforeAfterSection />
        <TemplatesSection />
        <WaveDivider flip />
        <FeaturesSection />
        <QrCodeSection />
        <WaveDivider />
        <ManagementSection />
        <DeliverySection />
        <WaveDivider flip />
        <SupportSection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
