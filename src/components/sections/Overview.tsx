"use client";
import { useMemo } from "react";
import { DollarSign, Package, TrendingUp, Users, Clock, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { CommodityPrice, KPISummary, NewsItem, ProvinceHeat } from "@/types";
import { KPICard, SectionHeader, Panel } from "@/components/ui";
import AngolaMap from "@/components/ui/AngolaMap";
import { C, COMMODITIES, SENT_COLOR, TOOLTIP_STYLE } from "@/lib/constants";
import { fmt, fmtM } from "@/lib/utils";

interface Props {
  province: string | null;
  onProvinceChange: (p: string | null) => void;
  prices: CommodityPrice[];
  kpi: KPISummary;
  news: NewsItem[];
  heatData: ProvinceHeat[];
}

export default function OverviewSection({ province, onProvinceChange, prices, kpi, news, heatData }: Props) {
  const avgByComm = useMemo(() => {
    const filtered = province ? prices.filter(p => p.province === province) : prices;
    return COMMODITIES.map(c => {
      const pts = filtered.filter(p => p.commodity === c);
      return { commodity:c, avg: pts.length ? Math.round(pts.reduce((a,b) => a+b.price,0)/pts.length) : 0 };
    });
  }, [prices, province]);

  const topNews = useMemo(() =>
    (province ? news.filter(n => !n.province || n.province === province) : news).slice(0,4),
    [news, province]
  );

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Overview" sub="Executive performance summary" province={province}/>
      
      {/* KPI Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:10, marginBottom:20 }}>
        <KPICard label="Total Revenue" value={fmtM(kpi.totalRevenue)} sub="AOA"
          trend={kpi.revenueGrowthPct} accent={C.cyan} icon={DollarSign}/>
        <KPICard label="Total Volume" value={fmt(kpi.totalVolumeMT)} sub="MT"
          accent={C.neonGreen} icon={Package}/>
        <KPICard label="Gross Margin" value={`${kpi.grossMarginPct}%`}
          trend={kpi.marginVsTargetPct} accent={C.amber} icon={TrendingUp}/>
        <KPICard label="Active Customers" value={fmt(kpi.activeCustomers)}
          accent={C.purple} icon={Users}/>
        <KPICard label="DSO" value={`${kpi.collectionDays}d`} sub="Collection Days"
          accent={kpi.collectionDays > 45 ? C.red : C.neonGreen} icon={Clock}/>
        <KPICard label="Top Region" value={kpi.topRegion}
          accent={C.cyan} icon={Star}/>
      </div>

      {/* Three-column grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        {/* Avg prices bar chart */}
        <Panel style={{ padding:14 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:10, fontFamily:"var(--font-mono)" }}>AVG PRICES BY COMMODITY (AOA/kg)</div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={avgByComm} barSize={26}>
              <XAxis dataKey="commodity" tick={{ fontSize:9, fill:C.textDim, fontFamily:"var(--font-mono)" }}
                axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${fmt(v)} AOA`,""]}/>
              <Bar dataKey="avg" radius={[4,4,0,0]} fill={C.cyan}
                style={{ filter:`drop-shadow(0 0 3px ${C.cyan}60)` }}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Angola heat map */}
        <Panel style={{ padding:14 }}>
          <AngolaMap data={heatData} selectedProvince={province} onSelect={onProvinceChange}/>
        </Panel>

        {/* News feed */}
        <Panel style={{ padding:14 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:10, fontFamily:"var(--font-mono)" }}>LATEST INTELLIGENCE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {topNews.map(n => (
              <div key={n.id} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", marginTop:4, flexShrink:0,
                  background:SENT_COLOR[n.sentiment], boxShadow:`0 0 6px ${SENT_COLOR[n.sentiment]}` }}/>
                <div>
                  <div style={{ fontSize:11, color:C.textMid, lineHeight:1.4,
                    fontFamily:"var(--font-mono)" }}>{n.headline}</div>
                  <div style={{ fontSize:9, color:C.textDim, marginTop:1,
                    fontFamily:"var(--font-mono)" }}>{n.source} · {n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
