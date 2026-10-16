import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Cómo funcionan los envíos en Panamá y qué empresas usan?",
      a: "Trabajamos con las principales empresas de encomienda del país: Transporte Ferguson (especialistas en provincias centrales y Chiriquí), Uno Express (con sucursales en todo el país) y Servientrega Panamá. Por lo general los envíos demoran 1 día hábil (24 horas) en llegar a su destino o sucursal de retiro.",
    },
    {
      q: "¿Cómo se realiza el pago de la orden?",
      a: "No necesitas ingresar tarjetas de crédito en la web. Al armar tu carrito, se genera tu orden de pedido oficial con todos los detalles y puedes pagar fácilmente por Yappy (Banco General), transferencia bancaria ACH o en efectivo al retirar tu encomienda en la agencia.",
    },
    {
      q: "¿Cómo funcionan las lámparas en días nublados o lluviosos?",
      a: "Nuestros paneles solares de silicio monocristalino de grado A captan tanto la radiación solar directa como la luz difusa que atraviesa las nubes. En días nublados o de lluvia tropical en Panamá, la carga alcanza entre el 70% y el 80% de su capacidad total, suficiente para ofrecer entre 8 y 10 horas continuas de luz.",
    },
    {
      q: "¿Necesito herramientas o un electricista para instalarlas?",
      a: "¡Para nada! Las lámparas para jardín vienen con sus accesorios de fijación para colocar en poste o pared en segundos. Incluyen sus tornillos con tarugos y abrazaderas, por lo que cualquier persona puede instalarlas en menos de 5 minutos sin tender cables.",
    },
    {
      q: "¿Puedo retirar mi pedido en una sucursal de encomienda?",
      a: "¡Sí, totalmente! En el formulario de la orden puedes indicar la sucursal de Transporte Ferguson, Uno Express o Servientrega que te quede más cercana en tu provincia (David, Chitré, Penonomé, Santiago, etc.) y retirar con tu cédula en cuanto llegue.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-b border-border bg-sand/50 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            Centro de Ayuda y Envíos en Panamá
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Todo lo que necesitas saber sobre envíos en 24h, pagos por Yappy y funcionamiento de tus lámparas solares.
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
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-serif text-sm sm:text-base font-bold text-foreground hover:text-solar transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-solar shrink-0 ml-3 transition-transform duration-300 ${
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
