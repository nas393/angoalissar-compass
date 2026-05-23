"use client";
import { useState } from "react";
import { calcLandedCost, defaultLandedCostParams } from "@/services/api";
import { SectionHeader, Panel } from "@/components/ui";
import { C, GLOW } from "@/lib/constants";
import { fmt } from "@/lib/utils";

const FIELDS: { label: string; key: string; step: number; unit: string }[] = [
  { label:"Base Cost",       key:"baseCostUSD",    step:0.1,  unit:"USD" },
  { label:"Freight",         key:"freightUSD",     step:0.1,  unit:"USD" },
  { label:"Customs Duty",    key:"customsDuty",    step:0.5,  unit:"%" },
  { label:"FX Rate",         key:"fxRate",         step:1,    unit:"USD/AOA" },
  { label:"Other Costs",     key:"otherCostsAOA",  step:100,  unit:"AOA" },
  { label:"Selling Price",   key:"sellingPriceAOA",step:100,  unit:"AOA" },
];

export default function LandedCostSection({ province }: { province: string | null }) {
  const [params, setParams] = useState(defaultLandedCostParams());
  const result = calcLandedCost(params);

  const marginColor = result.marginPct < 0 ? C.red : result.marginPct < 5 ? C.amber : C.neonGreen;
  const marginMsg   = result.marginPct < 0 ? "⚠ LOSS — RENEGOTIATE" : result.marginPct < 5 ? "⚡ COMPRESSED MARGIN" : "✓ HEALTHY MARGIN";

  const update = (key: string, val: number) =>
    setParams(prev => ({ ...prev, [key]: val }));

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Landed Cost Simulator"
        sub="Model the impact of freight, FX, customs and costs on SKU margins" province={province}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Inputs */}
        <Panel style={{ padding:20 }}>
          <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
            marginBottom:16, fontFamily:"var(--font-mono)" }}>SCENARIO PARAMETERS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {FIELDS.map(f => (
              <div key={f.key}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:9, color:C.textDim, fontWeight:700,
                    letterSpacing:1, fontFamily:"var(--font-mono)" }}>{f.label.toUpperCase()}</span>
                  <span style={{ fontSize:9, color:C.cyan, fontFamily:"var(--font-mono)" }}>{f.unit}</span>
                </div>
                <input
                  type="number" step={f.step}
                  value={(params as any)[f.key]}
                  onChange={e => update(f.key, parseFloat(e.target.value) || 0)}
                  style={{ width:"100%", background:`${C.cyan}08`,
                    border:`1px solid ${C.border}`, borderRadius:8,
                    padding:"9px 12px", color:C.text, fontSize:14, fontWeight:800,
                    fontFamily:"var(--font-mono)", boxSizing:"border-box" }}
                />
              </div>
            ))}
          </div>
        </Panel>

        {/* Results */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Panel style={{ padding:18, border:`1px solid ${C.cyan}30` }}>
            <div style={{ fontSize:9, color:C.cyan, fontWeight:700, letterSpacing:1.5,
              marginBottom:14, fontFamily:"var(--font-mono)" }}>CALCULATION RESULT</div>
            {[
              ["CIF Cost (AOA)",      fmt(result.cifAOA)],
              ["Customs Duty (AOA)",  fmt(result.dutyAOA)],
              ["Other Costs (AOA)",   fmt(result.otherCostsAOA)],
              ["LANDED COST (AOA)",   fmt(result.landedCostAOA), true],
              ["Selling Price (AOA)", fmt(result.sellingPriceAOA)],
            ].map(([label,val,bold]) => (
              <div key={label as string} style={{ display:"flex", justifyContent:"space-between",
                paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${C.border}20` }}>
                <span style={{ fontSize:11, color:bold?C.text:C.textDim,
                  fontWeight:bold?700:400, fontFamily:"var(--font-mono)" }}>{label}</span>
                <span style={{ fontSize:13, color:bold?C.cyan:C.text,
                  fontWeight:800, fontFamily:"var(--font-mono)",
                  textShadow:bold?GLOW(C.cyan,6):"none" }}>{val}</span>
              </div>
            ))}
          </Panel>

          <Panel style={{ padding:20, textAlign:"center",
            border:`1px solid ${marginColor}40`, background:`${marginColor}08` }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:6, fontFamily:"var(--font-mono)" }}>ESTIMATED GROSS MARGIN</div>
            <div style={{ fontSize:58, fontWeight:900, color:marginColor, letterSpacing:-3,
              fontFamily:"var(--font-mono)", textShadow:GLOW(marginColor,22) }}>
              {result.marginPct}%
            </div>
            <div style={{ fontSize:10, color:C.textDim, marginTop:4, fontFamily:"var(--font-mono)" }}>
              {marginMsg}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
