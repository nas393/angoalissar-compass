"use client";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { CommodityPrice, PriceHistoryPoint, ForecastPoint } from "@/types";
import { SectionHeader, Panel, TabBar, TrendBadge } from "@/components/ui";
import { C, COMMODITIES, TOOLTIP_STYLE } from "@/lib/constants";
import { fmt } from "@/lib/utils";

interface Props {
  province: string | null;
  prices: CommodityPrice[];
  getHistory: (c: string) => PriceHistoryPoint[];
  getForecast: (c: string) => ForecastPoint[];
}

export default function CommoditiesSection({ province, prices, getHistory, getForecast }: Props) {
  const [sel, setSel] = useState("Rice");

  const history  = useMemo(() => getHistory(sel),  [getHistory, sel]);
  const forecast = useMemo(() => getForecast(sel),  [getForecast, sel]);

  const current = history[history.length-1]?.price ?? 0;
  const chg = history[0]?.price ? ((current - history[0].price) / history[0].price * 100) : 0;

  const tableRows = province
    ? prices.filter(p => p.province === province)
    : prices.filter(p => p.commodity === sel);

  const tabs = COMMODITIES.map(c => ({ key:c, label:c }));

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Commodities" sub="Market prices, history and 12-month forecast" province={province}/>
      <div style={{ marginBottom:14 }}><TabBar tabs={tabs} active={sel} onChange={setSel}/></div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Price chart */}
        <Panel style={{ padding:14 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:4, fontFamily:"var(--font-mono)" }}>{sel.toUpperCase()} · 60 DAYS</div>
          <div style={{ fontSize:26, fontWeight:900, color:C.text, letterSpacing:-1,
            fontFamily:"var(--font-mono)", textShadow:`0 0 12px ${C.cyan}50` }}>
            {fmt(current)}<span style={{ fontSize:12, color:C.textDim, fontWeight:400, marginLeft:4 }}>AOA/kg</span>
          </div>
          <div style={{ marginTop:3, marginBottom:10 }}><TrendBadge val={chg}/></div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan} stopOpacity={.22}/>
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide/>
              <YAxis hide domain={["auto","auto"]}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${fmt(v)} AOA`,""]}/>
              <Area type="monotone" dataKey="price" stroke={C.cyan} fill="url(#gp)"
                strokeWidth={2} dot={false}
                style={{ filter:`drop-shadow(0 0 3px ${C.cyan}80)` }}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Forecast chart */}
        <Panel style={{ padding:14 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:10, fontFamily:"var(--font-mono)" }}>12-MONTH FORECAST</div>
          <ResponsiveContainer width="100%" height={178}>
            <AreaChart data={forecast}>
              <XAxis dataKey="month" tick={{ fontSize:9, fill:C.textDim, fontFamily:"var(--font-mono)" }}
                axisLine={false} tickLine={false}/>
              <YAxis hide domain={["auto","auto"]}/>
              <Tooltip contentStyle={TOOLTIP_STYLE}/>
              <Area type="monotone" dataKey="upper" stroke="none" fill={`${C.neonGreen}10`}/>
              <Area type="monotone" dataKey="lower" stroke="none" fill="#010a16"/>
              <Line type="monotone" dataKey="actual" stroke={C.textMid} strokeWidth={1.5}
                dot={false} strokeDasharray="4 2"/>
              <Line type="monotone" dataKey="forecast" stroke={C.neonGreen} strokeWidth={2}
                dot={false} style={{ filter:`drop-shadow(0 0 4px ${C.neonGreen})` }}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Price table */}
      <Panel style={{ overflow:"hidden" }}>
        <div style={{ padding:"8px 14px", borderBottom:`1px solid ${C.border}`,
          fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5, fontFamily:"var(--font-mono)" }}>
          PRICES BY {province ? "PROVINCE" : "COMMODITY"} · {province || sel.toUpperCase()}
        </div>
        <div style={{ maxHeight:200, overflowY:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${C.cyan}06` }}>
                {["Province","Commodity","Price (AOA)","Unit"].map(h => (
                  <th key={h} style={{ padding:"7px 14px", textAlign:"left",
                    color:C.textDim, fontWeight:700, fontSize:9, letterSpacing:1, fontFamily:"var(--font-mono)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(0,22).map((row,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.border}15` }}>
                  <td style={{ padding:"7px 14px", color:C.textMid, fontSize:12, fontFamily:"var(--font-mono)" }}>{row.province}</td>
                  <td style={{ padding:"7px 14px", color:C.textDim, fontSize:12, fontFamily:"var(--font-mono)" }}>{row.commodity}</td>
                  <td style={{ padding:"7px 14px", color:C.text, fontWeight:800, fontSize:13, fontFamily:"var(--font-mono)",
                    textShadow:`0 0 8px ${C.cyan}40` }}>{fmt(row.price)}</td>
                  <td style={{ padding:"7px 14px", color:C.textDim, fontSize:11, fontFamily:"var(--font-mono)" }}>AOA/kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
