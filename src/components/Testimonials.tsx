import React from "react";
import { Star, CheckCircle, Quote, MapPin } from "lucide-react";

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Valeria Santamaría",
      location: "San Francisco, Ciudad de Panamá",
      product: "Farola LED Solar Rolinger 1200W",
      rating: 5,
      date: "Hace 1 semana",
      comment:
        "Instalé la farola de 1200W en el portón de la entrada. La potencia es excelente y el sensor de radar detecta cuando el carro entra de noche y alumbra todo el patio. Ha aguantado los aguaceros más fuertes sin ningún problema.",
    },
    {
      name: "Rodrigo E. Castillo",
      location: "Costa del Este, Panamá",
      product: "Farola LED Solar Rolinger 800W",
      rating: 5,
      date: "Hace 2 semanas",
      comment:
        "Compré dos de 800W para los muros del patio. La instalación fue muy práctica usando un taladro con los tornillos y el soporte incluido, sin tener que cablear nada. Se encienden solas al caer la tarde.",
    },
    {
      name: "Mariana Gómez & Carlos",
      location: "Interior del País, Panamá",
      product: "Proyector LED Solar Rolinger 300W",
      rating: 5,
      date: "Hace 1 mes",
      comment:
        "El proyector de 300W con panel independiente nos resolvió la iluminación de la terraza techada. El panel lo fijamos afuera bajo el sol y el reflector adentro. El envío por encomienda llegó en perfecto estado.",
    },
  ];

  return (
    <section id="opiniones" className="border-b border-border bg-background py-24 px-4 sm:px-6 transition-colors duration-500 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-amber-500 mb-2.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-xs font-bold text-foreground font-mono">
              4.9 / 5.0 (+380 Reseñas en Panamá)
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Experiencias Reales de Clientes en Panamá
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Propietarios en todo Panamá que ya disfrutan de iluminación solar potente y autónoma.
          </p>
        </div>

        {/* Review Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="spring-card flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px]">{r.date}</span>
                </div>

                <Quote aria-hidden="true" className="h-7 w-7 text-solar-ink/40 mb-3" />
                <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-6 font-normal">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-border/70">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      {r.name}
                      <CheckCircle aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin aria-hidden="true" className="h-3 w-3 text-solar-ink" />
                      {r.location}
                    </p>
                  </div>
                </div>

                <div className="mt-3 inline-block rounded-lg bg-solar/15 text-solar-ink px-2.5 py-1 text-[11px] font-bold">
                  Modelo: {r.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
