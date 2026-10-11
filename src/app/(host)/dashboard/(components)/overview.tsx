"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { ReservationActivityItem } from "@/types/panel";

interface OverviewProps {
  data?: ReservationActivityItem[];
}

const defaultData: { name: string; total: number }[] = [
  { name: "Ene", total: 0 },
  { name: "Feb", total: 0 },
  { name: "Mar", total: 0 },
  { name: "Abr", total: 0 },
  { name: "May", total: 0 },
  { name: "Jun", total: 0 },
  { name: "Jul", total: 0 },
  { name: "Ago", total: 0 },
  { name: "Sep", total: 0 },
  { name: "Oct", total: 0 },
  { name: "Nov", total: 0 },
  { name: "Dic", total: 0 },
];

function toChartData(items: ReservationActivityItem[]): { name: string; total: number }[] {
  if (!items?.length) return defaultData;
  return items.map((item) => ({ name: item.label, total: item.count }));
}

export function Overview({ data }: OverviewProps) {
  const chartData = data?.length ? toChartData(data) : defaultData;

  return (
    <div className="min-w-[280px] w-full" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "hsl(var(--card-foreground))" }}
          formatter={(value: number) => [value, "total"]}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
