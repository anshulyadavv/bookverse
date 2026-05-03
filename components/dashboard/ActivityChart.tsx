"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; mins: number }[];
}

export function ActivityChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip 
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)" }}
            itemStyle={{ color: "#1D1D1F", fontWeight: "bold" }}
            labelStyle={{ color: "#9ca3af", fontSize: "12px", marginBottom: "4px" }}
          />
          <Area type="monotone" dataKey="mins" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorMins)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
