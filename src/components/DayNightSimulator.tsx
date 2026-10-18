import React, { useState } from "react";
import { Sun, Moon, Sparkles, BatteryCharging, Clock, Flame } from "lucide-react";

export const DayNightSimulator: React.FC = () => {
  // 0 = Full Noon, 50 = Sunset, 100 = Midnight
  const [timeValue, setTimeValue] = useState<number>(85);

  // Derived telemetry metrics
  const isNight = timeValue > 48;
  const lampBrightness = Math.round(Math.max(0, (timeValue - 42) * 1.72));
  const chargeRate = Math.round(Math.max(0, (52 - timeValue) * 2.08));
  const lumensOutput = Math.round((lampBrightness / 100) * 1200);

  const getTimeLabel = () => {
    if (timeValue < 25) return "12:00 PM • Sol Cenital Intenso";
    if (timeValue < 45) return "3:30 PM • Tarde Soleada";
    if (timeValue < 65) return "6:15 PM • Ocaso Dorado en el Pacífico";
    if (timeValue < 85) return "8:30 PM • Velada Nocturna";
    return "11:00 PM • Noche Profunda";
  };

  return (
    <section id="simulador" className="relative border-b border-border bg-background py-20 px-4 sm:px-6 transition-colors duration-500">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-solar-foreground shadow-sm">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Laboratorio Interactivo
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl tracking-tight">
            Simulador de Iluminación Día / Noche
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Experimenta en tiempo real cómo nuestros sensores crepusculares activan las luminarias al ponerse el sol sin intervención manual.
          </p>
        </div>

        {/* Interactive Lighting Stage Box */}
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 shadow-2xl transition-all duration-700 min-h-[440px] flex flex-col justify-between p-6 sm:p-8">
          {/* Dynamic Sky Background Reacting to Slider */}
          <div
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              background:
                timeValue < 38
                  ? "linear-gradient(180deg, #60a5fa 0%, #93c5fd 40%, #dbeafe 100%)"
                  : timeValue < 62
                  ? "linear-gradient(180deg, #1e1b4b 0%, #854d0e 45%, #d97706 75%, #f59e0b 100%)"
                  : "linear-gradient(180deg, #030712 0%, #061e14 50%, #0d281e 100%)",
            }}
          />

          {/* Stars Field at Night */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{ opacity: isNight ? 0.75 : 0 }}
          >
            <div className="absolute top-8 left-16 h-1 w-1 rounded-full bg-white animate-pulse" />
            <div className="absolute top-14 left-1/3 h-1.5 w-1.5 rounded-full bg-amber-200 animate-ping" />
            <div className="absolute top-20 right-1/4 h-1 w-1 rounded-full bg-white" />
            <div className="absolute top-12 right-20 h-1.5 w-1.5 rounded-full bg-amber-100" />
            <div className="absolute top-28 left-2/3 h-1 w-1 rounded-full bg-white opacity-80" />
          </div>

          {/* Celestial Body: Sun / Moon with physics trajectory */}
          <div
            className="absolute pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: `${12 + timeValue * 0.76}%`,
              top: `${16 + Math.sin((timeValue / 100) * Math.PI) * -8}%`,
            }}
          >
            {isNight ? (
              <div className="relative flex items-center justify-center">
                <Moon aria-hidden="true" className="h-14 w-14 text-amber-100 drop-shadow-[0_0_28px_rgba(254,243,199,0.8)]" />
                <span className="absolute mt-20 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-200 backdrop-blur-md border border-white/10">
                  Modo Noche Activo
                </span>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <Sun aria-hidden="true" className="h-16 w-16 text-amber-400 drop-shadow-[0_0_38px_rgba(251,191,36,0.95)]" />
                <span className="absolute mt-22 whitespace-nowrap rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-950 backdrop-blur-md shadow-sm">
                  Células Fotovoltaicas Cargando
                </span>
              </div>
            )}
          </div>

          {/* Foreground Showcase with Simulated Lamp Fixtures */}
          <div className="relative z-10 mt-auto flex items-end justify-center gap-6 sm:gap-20 pb-4 pt-16">
            {/* Lamp 1: Farola 1200W */}
            <div className="relative flex flex-col items-center group">
              <div
                className="absolute -top-14 h-48 w-48 rounded-full blur-3xl pointer-events-none transition-all duration-300"
                style={{
                  backgroundColor: `rgba(245, 158, 11, ${lampBrightness / 110})`,
                  transform: `scale(${0.4 + (lampBrightness / 100) * 1.1})`,
                }}
              />
              <img
                src="/products/lampara-1200w/image-1.jpg"
                alt="Farola LED Solar de Calle Rolinger 1200W"
                loading="lazy"
                className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl object-cover shadow-2xl border border-white/20 transition-all duration-300 group-hover:scale-102"
                style={{
                  filter: `brightness(${0.55 + (lampBrightness / 100) * 0.55}) drop-shadow(0 0 ${lampBrightness * 0.28}px rgba(245, 158, 11, 0.85))`,
                }}
              />
              <span className="mt-2.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md border border-white/10 shadow-sm text-center">
                Farola Rolinger 1200W (Radar)
              </span>
            </div>

            {/* Lamp 2: Proyector 300W */}
            <div className="relative flex flex-col items-center group">
              <div
                className="absolute -top-14 h-48 w-48 rounded-full blur-3xl pointer-events-none transition-all duration-300"
                style={{
                  backgroundColor: `rgba(245, 158, 11, ${lampBrightness / 110})`,
                  transform: `scale(${0.4 + (lampBrightness / 100) * 1.1})`,
                }}
              />
              <img
                src="/products/reflector-solar/image-1.jpg"
                alt="Proyector LED Solar Rolinger 300W IP67"
                loading="lazy"
                className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl object-cover shadow-2xl border border-white/20 transition-all duration-300 group-hover:scale-102"
                style={{
                  filter: `brightness(${0.55 + (lampBrightness / 100) * 0.55}) drop-shadow(0 0 ${lampBrightness * 0.28}px rgba(245, 158, 11, 0.85))`,
                }}
              />
              <span className="mt-2.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md border border-white/10 shadow-sm text-center">
                Proyector Rolinger 300W (IP67)
              </span>
            </div>
          </div>

          {/* Telemetry Glass HUD */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black/65 p-4 sm:p-5 backdrop-blur-xl border border-white/15 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar/20 text-solar">
                <Clock aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Condición Atmosférica
                </p>
                <p className="text-xs sm:text-sm font-bold text-white font-serif">{getTimeLabel()}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2.5">
                <BatteryCharging aria-hidden="true" className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase">Captación Solar</p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-400">{chargeRate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Flame aria-hidden="true" className="h-5 w-5 text-solar" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase">Brillo Nocturno</p>
                  <p className="text-xs sm:text-sm font-extrabold text-solar">
                    {lampBrightness}% <span className="font-normal text-[11px] text-white/60">({lumensOutput} W eq.)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Tactile Presets */}
        <div className="mt-6 rounded-3xl bg-card p-6 border border-border shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <label htmlFor="time-slider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sun aria-hidden="true" className="h-4 w-4 text-solar" />
              Arrastra para cambiar la hora del día:
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTimeValue(15)}
                className={`pressable rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer border transition-colors ${
                  timeValue < 35
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                12:00 PM (Día Soleado)
              </button>

              <button
                type="button"
                onClick={() => setTimeValue(55)}
                className={`pressable rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer border transition-colors ${
                  timeValue >= 35 && timeValue < 75
                    ? "bg-solar text-solar-foreground border-solar font-bold shadow-sm"
                    : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                6:15 PM (Atardecer Dorado)
              </button>

              <button
                type="button"
                onClick={() => setTimeValue(90)}
                className={`pressable rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer border transition-colors ${
                  timeValue >= 75
                    ? "bg-forest text-white border-forest font-bold shadow-sm"
                    : "border-border text-foreground hover:bg-secondary"
                }`}
              >
                9:30 PM (Noche Activa)
              </button>
            </div>
          </div>

          <div className="relative py-2">
            <input
              id="time-slider"
              type="range"
              min="0"
              max="100"
              value={timeValue}
              onChange={(e) => setTimeValue(Number(e.target.value))}
              aria-label="Selector interactivo de hora del día"
              className="w-full h-2.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-solar focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
