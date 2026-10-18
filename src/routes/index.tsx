import { createFileRoute } from "@tanstack/react-router";
import { PromoBanner } from "../components/PromoBanner";
import { Navbar } from "../components/Navbar";
import { MainBrandHero } from "../components/MainBrandHero";
import { BrandDepartments } from "../components/BrandDepartments";
import { GeneralFeaturedProducts } from "../components/GeneralFeaturedProducts";
import { SolarDepartmentView } from "../components/SolarDepartmentView";
import { HomeDepartmentView } from "../components/HomeDepartmentView";
import { Footer } from "../components/Footer";
import { MobileQuickBar } from "../components/MobileQuickBar";
import { useCart } from "../context/CartContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar y Hogar — Iluminación Solar, Muebles y Soluciones para el Hogar en Panamá" },
      {
        name: "description",
        content:
          "Transforma tu hogar en Panamá con energía solar autónoma sin cables ni facturas de luz, y próximas líneas de mobiliario y accesorios para el hogar. Despachos a todo Panamá.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { activeDepartment, setActiveDepartment } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-solar/30 selection:text-solar-foreground pb-12 md:pb-0">
      {/* Top Notification */}
      <PromoBanner />

      {/* Main Navigation */}
      <Navbar />

      <main>
        {activeDepartment === "general" && (
          <div className="animate-in fade-in duration-300">
            {/* 1. Main Brand Presentation Landing Hero */}
            <MainBrandHero onSelectDepartment={setActiveDepartment} />

            {/* 2. Brand Departments Navigator */}
            <BrandDepartments
              onSelectDepartment={setActiveDepartment}
              activeDepartment={activeDepartment}
            />

            {/* 3. Featured Products of Each Department (Real Solar Models + Upcoming Home Teaser) */}
            <GeneralFeaturedProducts onSelectDepartment={setActiveDepartment} />
          </div>
        )}

        {activeDepartment === "solar" && (
          <SolarDepartmentView onBackToGeneral={() => setActiveDepartment("general")} />
        )}

        {(activeDepartment === "muebles" || activeDepartment === "accesorios") && (
          <HomeDepartmentView
            department={activeDepartment}
            onBackToGeneral={() => setActiveDepartment("general")}
            onGoToSolar={() => setActiveDepartment("solar")}
          />
        )}
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Mobile-First Sticky Quick Purchase Bar */}
      <MobileQuickBar />
    </div>
  );
}
