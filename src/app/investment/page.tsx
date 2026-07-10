"use client";

// TODO(legal): consultar con un abogado salvadoreño si esta página (oferta de
// participación/inversión en Dubuu) requiere registro u observa restricciones bajo
// la Ley del Mercado de Valores de El Salvador (Superintendencia del Sistema
// Financiero - SSF) antes de publicarse o de usarse para captar capital.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/lib/i18n-context";
import esInvestment from "../../../public/locales/es/investment.json";
import enInvestment from "../../../public/locales/en/investment.json";

const CHART_COLORS = {
  neutral: "#52525b",
  volcanic: "#2A7350",
  sand: "#C9A24B",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-label text-base tracking-[1.5px] text-foreground/70 mb-2">
      {children}
    </h3>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6">
      {children}
    </div>
  );
}

export default function PartnerOrInvestPage() {
  const { language } = useLanguage();
  // Contenido importado estáticamente (no depende de un fetch async), así el texto
  // siempre está presente desde el primer render, incluso antes de hidratar.
  const data = language === "en" ? enInvestment : esInvestment;

  const financialData = data.financials.chart.years.map((year, index) => {
    const row = [
      { ingresos: 220000, gastos: 187000, beneficio: 33000 },
      { ingresos: 330000, gastos: 214500, beneficio: 115500 },
      { ingresos: 495000, gastos: 321750, beneficio: 173250 },
    ][index];
    return { name: year, ...row };
  });

  return (
    <div className="px-5 md:px-20 py-10 space-y-12">
      <div>
        <p className="font-label text-lg tracking-[2px] text-muted-foreground">
          {data.hero.eyebrow}
        </p>
        <h1 className="mt-1 font-display text-3xl md:text-5xl font-normal tracking-tight">
          {data.hero.titlePrefix}
          <em className="italic text-muted-foreground">
            {data.hero.titleEmphasis}
          </em>
          {data.hero.titleSuffix}
        </h1>
      </div>

      <InfoCard>
        <SectionLabel>{data.goal.label}</SectionLabel>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          {data.goal.content}
        </p>
      </InfoCard>

      <div>
        <SectionLabel>{data.problem.label}</SectionLabel>
        <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
          {data.problem.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <SectionLabel>{data.solution.label}</SectionLabel>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          {data.solution.content}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <SectionLabel>{data.features.label}</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.features.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <SectionLabel>{data.businessModel.label}</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.businessModel.items.map((item, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">
                  {item.title}
                </span>{" "}
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <SectionLabel>{data.financials.label}</SectionLabel>
        <InfoCard>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="ingresos"
                name={data.financials.chart.ingresos}
                fill={CHART_COLORS.neutral}
              />
              <Bar
                dataKey="gastos"
                name={data.financials.chart.gastos}
                fill={CHART_COLORS.sand}
              />
              <Bar
                dataKey="beneficio"
                name={data.financials.chart.beneficio}
                fill={CHART_COLORS.volcanic}
              />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">
            {data.financials.initialInvestmentTitle}
          </h4>
          <p className="mb-4 text-sm md:text-base text-muted-foreground">
            {data.financials.initialInvestmentText}
          </p>
          <h4 className="font-semibold mb-2">{data.financials.roiTitle}</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.financials.roiItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-1">
              {data.financials.riskNoticeTitle}
            </p>
            <p>{data.financials.riskNoticeText}</p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>{data.timeline.label}</SectionLabel>
        <InfoCard>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={data.timeline.items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name={data.timeline.valueAxisLabel}
                fill={CHART_COLORS.neutral}
              />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>
        <div className="mt-6 space-y-2">
          {data.timeline.items.map((item, index) => (
            <div key={index} className="text-sm md:text-base">
              <span className="font-semibold text-foreground">
                {item.name}:
              </span>{" "}
              <span className="text-muted-foreground">
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <SectionLabel>{data.market.label}</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.market.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <SectionLabel>{data.scalability.label}</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.scalability.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <SectionLabel>{data.advantages.label}</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            {data.advantages.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
