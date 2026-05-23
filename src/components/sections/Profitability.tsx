"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { SKUMargin } from "@/types";
import { SectionHeader, Panel, TabBar } from "@/components/ui";
import { C, TOOLTIP_STYLE } from "@/lib/constants";
import { fmtM } from "@/lib/utils";

type GroupKey = "brand" | "region" | "channel" | "salesperson" | "sku";

export default function ProfitabilitySection({ province, margins }: {
  province: string | null;
  margins: SKUMargin[];
}) {
  const [groupBy, setGroupBy] = useState<GroupKey>("brand");

  const grouped = useMemo(() => {
    const map: Record<string, { rev:number; cost:number }> = {};
    margins.forEach(row => {
      const key = (row as any)[groupBy] ?? row.brand;
      if (!map[key]) map[key] = { rev:0, cost:0 };
      map[key].rev  += row.revenueAOA;
      map[key].cost += row.costAOA;
    });
    return Object.entries(map).map(([name,v]) => ({
      name: name.length > 20 ? name.slice(0,18)+"…" : name,
      revenue: v.rev,
      gp: v.rev - v.cost,
      margin: parseFloat(((1 - v.cost/v.rev)*100).toFixed(1)),
    })).sort((a,b) => b.revenue - a.revenue).slice(0,9);
  }, [margins, groupBy]);

  const TABS: { key: GroupKey; label: string }[] = [
    {key:"brand",      label:"Brand"},
    {key:"region",     label:"Region"},
    {key:"channel",    label:"Channel"},
    {key:"salesperson",label:"Salesperson"},
    {key:"sku",        label:"SKU"},
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Profitability Engine" sub="Margin analysis across commercial dimensions" province={province}/>
      <div style={{ marginBottom:14 }}>
        <TabBar tabs={TABS} active={groupBy} onChange={setGroupBy}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Bar chart */}
        <Panel style={{ padding:14 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:10, fontFamily:"var(--font-mono)" }}>REVENUE vs GROSS PROFIT (AOA)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={grouped} layout="vertical" barSize={11}>
              <XAxis type="number" hide/>
              <YAxis type="category" dataKey="name" width={110}
                tick={{ fontSize:9, fill:C.textMid, fontFamily:"var(--font-mono)" }}
                axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [fmtM(v)+" AOA",""]}/>
              <Bar dataKey="revenue" fill={`${C.cyan}20`} radius={[0,4,4,0]}/>
              <Bar dataKey="gp" fill={C.cyan} radius={[0,4,4,0]}
                style={{ filter:`drop-shadow(0 0 3px ${C.cyan})` }}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Detail table */}
        <Panel style={{ overflow:"hidden" }}>
          <div style={{ padding:"9px 14px", borderBottom:`1px solid ${C.border}`,
            fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5, fontFamily:"var(--font-mono)" }}>
            DETAIL · BY {groupBy.toUpperCase()}
          </div>
          <div style={{ maxHeight:270, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:`${C.cyan}06` }}>
                  {["Name","Revenue","GP","Margin"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left",
                      color:C.textDim, fontWeight:700, fontSize:9, letterSpacing:1, fontFamily:"var(--font-mono)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map((r,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}15` }}>
                    <td style={{ padding:"9px 12px", color:C.textMid, fontSize:11, fontFamily:"var(--font-mono)" }}>{r.name}</td>
                    <td style={{ padding:"9px 12px", color:C.text, fontSize:12, fontFamily:"var(--font-mono)" }}>{fmtM(r.revenue)}</td>
                    <td style={{ padding:"9px 12px", color:C.cyan, fontWeight:700, fontSize:12, fontFamily:"var(--font-mono)" }}>{fmtM(r.gp)}</td>
                    <td style={{ padding:"9px 12px" }}>
                      <span style={{ color:r.margin<5?C.red:r.margin<10?C.amber:C.neonGreen,
                        fontWeight:800, fontSize:12, fontFamily:"var(--font-mono)",
                        textShadow:`0 0 6px ${r.margin<5?C.red:r.margin<10?C.amber:C.neonGreen}` }}>
                        {r.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
