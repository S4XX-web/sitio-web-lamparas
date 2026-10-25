import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Cómo funcionan los envíos a todo Panamá y qué empresas usan?",
      a: "Realizamos despachos a todo Panamá trabajando con las principales empresas de encomienda del país: Transporte Ferguson, Uno Express y Servientrega Panamá. El tiempo de entrega depende de la ubicación de destino y de la agencia seleccionada (por lo general toma entre 1 y 3 días hábiles, aunque en ciertas zonas puede demorar un poco más). Transporte Ferguson y Uno Express operan mediante retiro en sucursal, mientras que Servientrega es la única empresa que ofrece entregas puerta a puerta (a domicilio) además de retiro en agencia.",
    },
    {
      q: "¿Cómo se realiza el pago de la orden?",
      a: "No necesitas ingresar tarjetas de crédito en la web. Al armar tu carrito, se genera tu orden de pedido oficial con todos los detalles y puedes realizar tu pago de forma rápida y segura por Yappy (Banco General) o mediante transferencia bancaria ACH.",
    },
    {
      q: "¿Cómo funcionan las lámparas en días nublados o lluviosos?",
      a: "Nuestros paneles solares captan tanto la radiación solar directa como la luz difusa que atraviesa las nubes. En días muy nublados o lluviosos en Panamá, el panel alcanza una carga aproximada de entre el 40% y el 60% de su capacidad. Gracias a su modo de ahorro inteligente con sensor de movimiento (que mantiene la luminaria al 30% y sube al 100% al detectar presencia), esa carga brinda entre 6 y 8 horas de iluminación nocturna, mientras que en días soleados de carga completa ofrece entre 10 y 12 horas de autonomía.",
    },
    {
      q: "¿Necesito herramientas o un electricista para instalarlas?",
      a: "No necesitas contratar un electricista ni romper paredes, ya que son 100% autónomas y no requieren cableado a la red eléctrica. Su instalación es muy práctica e incluyen sus tornillos y accesorios de soporte, pero sí necesitarás herramientas básicas (como taladro, destornillador o llave) para fijar la base firmemente en la pared, techo o poste. El montaje toma alrededor de 15 a 25 minutos dependiendo de la superficie.",
    },
    {
      q: "¿Puedo retirar mi pedido en una sucursal de encomienda?",
      a: "¡Sí, totalmente! En el formulario de la orden puedes indicar la sucursal de Transporte Ferguson, Uno Express o Servientrega que te quede más cercana en cualquier punto del país y retirar tu paquete presentando tu cédula en cuanto llegue. Si prefieres recibir el pedido puerta a puerta en tu domicilio, debes elegir exclusivamente la opción de Servientrega Panamá.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-b border-border bg-sand/50 py-20 px-4 sm:px-6 scroll-mt-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
            Centro de Ayuda y Envíos en Panamá
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Todo lo que necesitas saber sobre despachos a todo Panamá, pagos por Yappy o ACH e instalación de tus lámparas solares.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-serif text-sm sm:text-base font-bold text-foreground hover:text-solar-ink transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 text-solar-ink shrink-0 ml-3 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
