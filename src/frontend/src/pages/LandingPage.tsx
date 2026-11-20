import { BcvRateCard } from "@/components/landing/BcvRateCard";
import { CoverageSummary } from "@/components/landing/CoverageSummary";
import { FiberEmblem } from "@/components/landing/FiberEmblem";
import { PublicHeader } from "@/components/layout/PublicHeader";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/shared/ActionButtons";
import { ReliefCard } from "@/components/shared/ReliefCard";
import { ToneBadge } from "@/components/shared/StatusBadge";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CreditCard,
  Gauge,
  Headphones,
  MapPinned,
  Wifi,
} from "lucide-react";

const pillars = [
  {
    icon: Wifi,
    tone: "primary" as const,
    label: "Servicio",
    title: "Fibra FTTH simétrica",
    body: "Red de fibra óptica propia con planes de 50 a 300 Mbps, instalación profesional y router incluido.",
  },
  {
    icon: MapPinned,
    tone: "success" as const,
    label: "Cobertura",
    title: "Todo el Municipio Cajigal",
    body: "Parroquias, pueblos y sectores de Yaguaraparo conectados con tendido aéreo y empalmes certificados.",
  },
  {
    icon: CreditCard,
    tone: "warning" as const,
    label: "Pagos y soporte",
    title: "Paga como te convenga",
    body: "Pago Móvil, transferencia en bolívares, Zelle, divisas o USDT. Reporta tu pago y recibe tu recibo al instante.",
  },
];

const supportPoints = [
  { icon: Gauge, text: "Estado de cuenta y megas contratadas en tu panel" },
  {
    icon: Headphones,
    text: "Tickets de falla con seguimiento del equipo técnico",
  },
];

/** Public landing: 3D emblem, entry actions, service pillars and BCV rate. */
export function LandingPage() {
  return (
    <div data-ocid="landing.page" className="flex flex-col">
      <PublicHeader />

      <section className="relative mt-1 overflow-hidden rounded-[30px] border border-border/60 bg-gradient-glow px-5 pb-7 pt-6 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        <FiberEmblem />

        <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-none tracking-tight text-foreground">
          Cajigal<span className="text-accent">net</span>
        </h1>
        <p className="mx-auto mt-2 max-w-[19rem] text-balance text-sm leading-relaxed text-muted-foreground">
          Fibra óptica del Municipio Cajigal · Yaguaraparo
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ToneBadge tone="success">
            <span className="size-1.5 rounded-full bg-success" />
            Red activa
          </ToneBadge>
          <ToneBadge tone="primary">FTTH 300 Mbps</ToneBadge>
        </div>

        <div className="mt-6 space-y-2.5">
          <PrimaryButton asChild data-ocid="landing.signin_button">
            <Link to="/ingresar">
              Ingresar
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </PrimaryButton>
          <SecondaryButton asChild data-ocid="landing.install_button">
            <Link to="/instalacion">Solicitar Instalación</Link>
          </SecondaryButton>
          <Link
            to="/recuperar"
            data-ocid="landing.recovery_link"
            className="block py-1.5 text-center text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Recuperar Contraseña
          </Link>
        </div>
      </section>

      <BcvRateCard className="mt-4" />

      <section className="mt-7" data-ocid="landing.services_section">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Por qué Cajigalnet
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              Internet que se siente
            </h2>
          </div>
        </div>

        <ul className="space-y-3">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <ReliefCard className="p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-accent">
                    <pillar.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <ToneBadge tone={pillar.tone} className="mb-1.5">
                      {pillar.label}
                    </ToneBadge>
                    <p className="text-[15px] font-semibold leading-snug text-foreground">
                      {pillar.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {pillar.body}
                    </p>
                  </div>
                </div>
                {pillar.label === "Cobertura" ? (
                  <CoverageSummary className="mt-3.5" />
                ) : null}
              </ReliefCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7" data-ocid="landing.support_section">
        <ReliefCard className="overflow-hidden p-0">
          <div className="bg-gradient-primary px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/80">
              Tu cuenta, siempre a mano
            </p>
            <p className="mt-0.5 font-display text-base font-bold text-primary-foreground">
              Consulta, paga y reporta desde el móvil
            </p>
          </div>
          <ul className="space-y-2.5 p-4">
            {supportPoints.map((point) => (
              <li key={point.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                  <point.icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {point.text}
                </p>
              </li>
            ))}
          </ul>
        </ReliefCard>
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        Yaguaraparo, Municipio Cajigal · Estado Sucre
      </p>
    </div>
  );
}
