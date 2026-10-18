import { createFileRoute } from "@tanstack/react-router";
import { PromoBanner } from "../components/PromoBanner";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ProductAnatomy } from "../components/ProductAnatomy";
import { ProductCatalog } from "../components/ProductCatalog";
import { ComparisonTable } from "../components/ComparisonTable";
import { DayNightSimulator } from "../components/DayNightSimulator";
import { Benefits } from "../components/Benefits";
import { ShipmentsAndInstallations } from "../components/ShipmentsAndInstallations";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { MobileQuickBar } from "../components/MobileQuickBar";
import { QuotationModal } from "../components/QuotationModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar y Hogar — Farolas LED y Proyectores Solares Rolinger en Panamá" },
      {
        name: "description",
        content:
          "Farolas solares Rolinger de 1200W y 800W con sensor de radar y proyector de 300W IP67 en Panamá. Cero cables, $0 en luz y despachos a todo Panamá por Ferguson, Uno Express y Servientrega.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-solar/30 selection:text-solar-foreground pb-12 md:pb-0">
      {/* Top Notification */}
      <PromoBanner />

      {/* Main Navigation */}
      <Navbar />

      <main>
        {/* Signature Brand Hero with 3D Tilt & Live Variant Switcher */}
        <Hero />

        {/* Product Anatomy: 5 Engineering Layers & Components */}
        <ProductAnatomy />

        {/* Product Catalog with Real Rolinger Models and Multi-Image Preview */}
        <ProductCatalog />

        {/* Technical Comparison Matrix */}
        <ComparisonTable />

        {/* Interactive Lighting Simulator */}
        <DayNightSimulator />

        {/* Value Proposition & Ecological Benefits */}
        <Benefits />

        {/* Real Customer Shipments and Installations (Photos & Videos) */}
        <ShipmentsAndInstallations />

        {/* Frequently Asked Questions */}
        <FAQ />
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Mobile-First Sticky Quick Purchase Bar */}
      <MobileQuickBar />

      {/* Official PDF Quotation Generator Modal */}
      <QuotationModal />
    </div>
  );
}
