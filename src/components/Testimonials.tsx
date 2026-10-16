import React from "react";
import { Star, CheckCircle, Quote, Sparkles, MapPin } from "lucide-react";

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Valeria Santamaría",
      location: "San Francisco, Ciudad de Panamá",
      product: "Lámpara Solar Élite 1200W",
      rating: 5,
      date: "Hace 1 semana",
      comment:
        "Instalé la lámpara de 1200W en el portón de la entrada. La potencia es impresionante y el sensor de radar detecta cuando el carro entra de noche y alumbra todo el patio. Ha aguantado los aguaceros más fuertes sin ningún problema.",
    },
    {
      name: "Rodrigo E. Castillo",
      location: "Costa del Este, Panamá",
      product: "Lámpara Solar Pro 800W",
      rating: 5,
      date: "Hace 2 semanas",
      comment:
        "Compré dos de 800W para los muros del jardín. Se instalaron en 3 minutos con los tornillos y el soporte incluido. La luz es agradable, se encienden solas al caer la tarde y duran encendidas toda la noche.",
    },
    {
      name: "Mariana Gómez & Carlos",
      location: "Boquete, Chiriquí",
      product: "Reflector Solar (Panel Separado 5m)",
      rating: 5,
      date: "Hace 1 mes",
      comment:
        "El reflector con panel separado nos resolvió la iluminación de la terraza techada. El panel lo pusimos en el techo bajo sol directo y el reflector dentro. El despacho por Transporte Ferguson llegó al día siguiente impecable.",
    },
  ];

  return (
    <section id="opiniones" className="border-b border-border bg-background py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-amber-500 mb-2.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-xs font-bold text-foreground font-mono">
              4.9 / 5.0 (+380 Reseñas en Panamá)
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Experiencias Reales de Clientes en Panamá
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Propietarios en la capital y el interior que ya disfrutan de iluminación solar potente y autónoma.
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
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px]">{r.date}</span>
                </div>

                <Quote className="h-7 w-7 text-solar/40 mb-3" />
                <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed mb-6 font-normal">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-border/70">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      {r.name}
                      <CheckCircle className="h-3.5 w-3.5 text-primary" title="Comprador verificado en Panamá" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-solar" />
                      {r.location}
                    </p>
                  </div>
                </div>

                <div className="mt-3 inline-block rounded-lg bg-solar/15 text-solar px-2.5 py-1 text-[10px] font-bold">
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
