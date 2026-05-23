"use client";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import type { Distributor } from "@/types";
import { SectionHeader, Panel, ScoreBar } from "@/components/ui";
import { C, GLOW } from "@/lib/constants";

export default function DistributorsSection({ province, distributors }: {
  province: string | null;
  distributors: Distributor[];
}) {
  const top = distributors[0];
  const radarData = top ? [
    {s:"Sales",    v:top.salesAchievement},
    {s:"Margin",   v:top.profitability*5},
    {s:"Collection",v:top.collectionEfficiency},
    {s:"Coverage", v:top.coverage},
    {s:"Growth",   v:Math.max(top.growth*3+30,0)},
  ] : [];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Distributor Scorecards" sub="Automated performance rankings" province={province}/>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
        {/* Rankings table */}
        <Panel style={{ overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`,
            fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5, fontFamily:"var(--font-mono)" }}>
            RANKINGS · PERFORMANCE
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${C.cyan}06` }}>
                {["#","Distributor","Region","Sales%","Margin%","Collection%","Score"].map(h => (
                  <th key={h} style={{ padding:"9px 12px", textAlign:"left",
                    color:C.textDim, fontWeight:700, fontSize:9, letterSpacing:1, fontFamily:"var(--font-mono)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributors.map(d => (
                <tr key={d.id} style={{ borderBottom:`1px solid ${C.border}15` }}>
                  <td style={{ padding:"10px 12px", fontFamily:"var(--font-mono)",
                    color:d.rank<=3?C.amber:C.textDim, fontWeight:900, fontSize:13,
                    textShadow:d.rank<=3?GLOW(C.amber,6):"none" }}>
                    {d.rank<=3?"★":""}{d.rank}
                  </td>
                  <td style={{ padding:"10px 12px", color:C.text, fontWeight:600, fontSize:12, fontFamily:"var(--font-mono)" }}>{d.name}</td>
                  <td style={{ padding:"10px 12px", color:C.textMid, fontSize:11, fontFamily:"var(--font-mono)" }}>{d.region}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span style={{ color:d.salesAchievement>=100?C.neonGreen:d.salesAchievement>=80?C.amber:C.red,
                      fontWeight:800, fontSize:12, fontFamily:"var(--font-mono)",
                      textShadow:`0 0 6px ${d.salesAchievement>=100?C.neonGreen:d.salesAchievement>=80?C.amber:C.red}` }}>
                      {d.salesAchievement}%
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", color:C.textMid, fontSize:12, fontFamily:"var(--font-mono)" }}>{d.profitability}%</td>
                  <td style={{ padding:"10px 12px", color:d.collectionEfficiency>=90?C.neonGreen:C.amber,
                    fontSize:12, fontWeight:700, fontFamily:"var(--font-mono)" }}>{d.collectionEfficiency}%</td>
                  <td style={{ padding:"10px 12px" }}><ScoreBar score={d.score}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Radar card */}
        <Panel style={{ padding:16 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:2, fontFamily:"var(--font-mono)" }}>RADAR · TOP DISTRIBUTOR</div>
          <div style={{ fontSize:11, color:C.textMid, marginBottom:10, fontFamily:"var(--font-mono)" }}>{top?.name}</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%">
              <PolarGrid stroke={`${C.cyan}20`}/>
              <PolarAngleAxis dataKey="s" tick={{ fontSize:9, fill:C.textDim, fontFamily:"var(--font-mono)" }}/>
              <PolarRadiusAxis domain={[0,100]} hide/>
              <Radar dataKey="v" stroke={C.cyan} fill={C.cyan} fillOpacity={.18}
                strokeWidth={1.5} style={{ filter:`drop-shadow(0 0 4px ${C.cyan})` }}/>
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
