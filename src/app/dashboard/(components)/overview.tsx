"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Ene",
    total: 0,
  },
  {
    name: "Feb",
    total: 1,
  },
  {
    name: "Mar",
    total: 0,
  },
  {
    name: "Abr",
    total: 2,
  },
  {
    name: "May",
    total: 0,
  },
  {
    name: "Jun",
    total: 1,
  },
  {
    name: "Jul",
    total: 3,
  },
  {
    name: "Ago",
    total: 2,
  },
  {
    name: "Sep",
    total: 1,
  },
  {
    name: "Oct",
    total: 0,
  },
  {
    name: "Nov",
    total: 1,
  },
  {
    name: "Dic",
    total: 2,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
