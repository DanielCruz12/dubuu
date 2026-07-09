"use client";

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
  const financialData = [
    { name: "Año 1", ingresos: 220000, gastos: 187000, beneficio: 33000 },
    { name: "Año 2", ingresos: 330000, gastos: 214500, beneficio: 115500 },
    { name: "Año 3", ingresos: 495000, gastos: 321750, beneficio: 173250 },
  ];

  const timelineData = [
    {
      name: "Mes 1-2",
      value: 2,
      description: "Investigación y planeación detallada",
    },
    {
      name: "Mes 3-6",
      value: 4,
      description: "Desarrollo de la plataforma MVP",
    },
    {
      name: "Mes 7-8",
      value: 2,
      description: "Pruebas beta con negocios seleccionados",
    },
    {
      name: "Mes 9",
      value: 1,
      description: "Lanzamiento oficial con campañas de marketing",
    },
  ];

  return (
    <div className="px-5 md:px-20 py-10 space-y-12">
      <div>
        <p className="font-label text-lg tracking-[2px] text-muted-foreground">
          Dubuu
        </p>
        <h1 className="mt-1 font-display text-3xl md:text-5xl font-normal tracking-tight">
          Sé un socio o{" "}
          <em className="italic text-muted-foreground">invierte</em> en
          nuestra plataforma
        </h1>
      </div>

      <InfoCard>
        <SectionLabel>Objetivo</SectionLabel>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          Conectamos negocios locales con clientes nacionales mediante una
          plataforma que facilita la promoción y reserva de servicios
          turísticos, impulsando la economía local y mejorando la experiencia
          del cliente.
        </p>
      </InfoCard>

      <div>
        <SectionLabel>Problema detectado</SectionLabel>
        <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
          <li>
            Negocios locales enfrentan dificultades para promocionarse
            eficientemente en el mercado digital.
          </li>
          <li>
            Falta de una plataforma integral que concentre servicios
            turísticos y de ocio locales en un solo lugar.
          </li>
          <li>
            Clientes buscan opciones centralizadas para planificar
            actividades y obtener servicios.
          </li>
          <li>
            Baja visibilidad de negocios pequeños y medianos en el sector
            turístico.
          </li>
        </ul>
      </div>

      <div>
        <SectionLabel>Solución propuesta</SectionLabel>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          Una plataforma digital (web y app) donde negocios puedan
          registrarse y promocionar sus servicios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <SectionLabel>Funciones clave</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>Registro fácil de negocios con perfiles personalizables</li>
            <li>
              Opciones para reseñas y calificaciones de clientes para
              fomentar la confianza
            </li>
            <li>
              Reservas en línea y pagos integrados para una experiencia sin
              fricciones
            </li>
            <li>
              Sistema de recomendaciones personalizadas basado en
              preferencias del usuario
            </li>
            <li>
              Herramientas de análisis para que los negocios comprendan su
              rendimiento
            </li>
          </ul>
        </div>
        <div>
          <SectionLabel>Modelo de negocio</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>
              <span className="font-semibold text-foreground">Freemium.</span>{" "}
              Registro gratuito para negocios pequeños con funciones básicas.
            </li>
            <li>
              <span className="font-semibold text-foreground">
                Suscripción premium.
              </span>{" "}
              Negocios pagan tarifas mensuales/anuales para funciones
              avanzadas.
            </li>
            <li>
              <span className="font-semibold text-foreground">
                Comisiones.
              </span>{" "}
              Ganancia por transacciones realizadas en la plataforma.
            </li>
            <li>
              <span className="font-semibold text-foreground">
                Publicidad.
              </span>{" "}
              Espacios de promoción pagados dentro de la plataforma para
              mayor visibilidad.
            </li>
            <li>
              <span className="font-semibold text-foreground">
                Servicios adicionales.
              </span>{" "}
              Oferta de servicios de fotografía, diseño y marketing digital.
            </li>
          </ul>
        </div>
      </div>

      <div>
        <SectionLabel>Proyecciones financieras</SectionLabel>
        <InfoCard>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill={CHART_COLORS.neutral} />
              <Bar dataKey="gastos" fill={CHART_COLORS.sand} />
              <Bar dataKey="beneficio" fill={CHART_COLORS.volcanic} />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">
            Inversión inicial: $100,000 – $120,000
          </h4>
          <p className="mb-4 text-sm md:text-base text-muted-foreground">
            Incluye desarrollo de la plataforma, infraestructura, marketing
            inicial y operación por 6 meses.
          </p>
          <h4 className="font-semibold mb-2">Retorno de inversión (ROI)</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>
              Primera etapa (1-2 años): recuperación del 70-100% de la
              inversión.
            </li>
            <li>
              Segunda etapa (3 años): margen de ganancia proyectado del
              30-50% anual.
            </li>
          </ul>
        </div>
      </div>

      <div>
        <SectionLabel>Cronograma de ejecución</SectionLabel>
        <InfoCard>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={CHART_COLORS.neutral} />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>
        <div className="mt-6 space-y-2">
          {timelineData.map((item, index) => (
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
          <SectionLabel>Mercado potencial</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>
              Crecimiento sostenido en el turismo local y la digitalización
              de negocios.
            </li>
            <li>
              Público objetivo amplio: turistas nacionales y extranjeros,
              familias, organizadores de eventos.
            </li>
          </ul>
        </div>
        <div>
          <SectionLabel>Escalabilidad</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>Expansión a más países o regiones.</li>
            <li>
              Introducción de nuevas categorías de servicios, como eventos
              corporativos o alquileres especializados.
            </li>
          </ul>
        </div>
        <div>
          <SectionLabel>Ventajas competitivas</SectionLabel>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground marker:text-foreground/50">
            <li>
              Tecnología de punta con IA para recomendaciones personalizadas.
            </li>
            <li>
              Modelo de negocio flexible que se adapta a diferentes tamaños
              de empresas.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
