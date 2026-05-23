"use client";
import { useState } from "react";
import { X, Presentation, RefreshCw, Star } from "lucide-react";
import { C, GLOW, PANEL } from "@/lib/constants";
import { ProvincePill } from "@/components/ui";

const SLIDES = [
  { title:"Executive Summary",       emoji:"📊", desc:"Revenue, volume, gross margin, DSO KPIs" },
  { title:"Market Prices",           emoji:"💹", desc:"Commodity prices by province and trend" },
  { title:"Distributor Performance", emoji:"👥", desc:"Rankings, scorecards, radar profile" },
  { title:"Profitability Analysis",  emoji:"📈", desc:"Margin by brand, region, channel, SKU" },
  { title:"Risks & Opportunities",   emoji:"⚡", desc:"Market intelligence and competitive analysis" },
  { title:"Action Plan",             emoji:"🎯", desc:"3 priority commercial actions" },
];

interface Props { open: boolean; onClose: () => void; province: string | null; }

export default function PPTXExportModal({ open, onClose, province }: Props) {
  const [state, setState] = useState<"idle"|"exporting"|"done">("idle");

  const doExport = async () => {
    setState("exporting");
    await new Promise(r => setTimeout(r, 1800));
    const lines = [
      "ANGOALISSAR COMPASS — BOARD PRESENTATION",
      `Generated: ${new Date().toLocaleString("en-GB")}`,
      `Scope: ${province || "All Angola"}`,
      "",
      ...SLIDES.flatMap((s, i) => [`SLIDE ${i+1}: ${s.title}`, s.desc, ""]),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type:"text/plain" }));
    a.download = `Angoalissar_Board_${province||"Angola"}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    setState("done");
    setTimeout(() => { setState("idle"); onClose(); }, 1600);
  };

  if (!open) return null;
  const btnColor = state === "done" ? C.neonGreen : C.cyan;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" }}>
      <div style={{ ...PANEL, padding:28, width:"100%", maxWidth:520,
        border:`1px solid ${C.borderHi}`, boxShadow:GLOW(C.cyan,20) }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:C.text, fontFamily:"var(--font-mono)",
              letterSpacing:1, textShadow:GLOW(C.cyan,8) }}>BOARD PRESENTATION</div>
            <div style={{ fontSize:10, color:C.textDim, marginTop:3, fontFamily:"var(--font-mono)" }}>Export to PowerPoint</div>
            <div style={{ marginTop:8 }}><ProvincePill province={province}/></div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.textDim }}><X size={18}/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
              background:`${C.cyan}07`, border:`1px solid ${C.border}`, borderRadius:8 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{s.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:"var(--font-mono)" }}>Slide {i+1}: {s.title}</div>
                <div style={{ fontSize:10, color:C.textDim, fontFamily:"var(--font-mono)" }}>{s.desc}</div>
              </div>
              <div style={{ width:16, height:16, borderRadius:"50%", border:`1.5px solid ${C.cyan}60`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.cyan }}/>
              </div>
            </div>
          ))}
        </div>
        <button onClick={doExport} disabled={state !== "idle"} style={{
          width:"100%", padding:"13px", background:`${btnColor}15`, border:`1px solid ${btnColor}`,
          borderRadius:10, color:btnColor, fontSize:12, fontWeight:800, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          fontFamily:"var(--font-mono)", letterSpacing:1,
          textShadow:GLOW(btnColor), boxShadow:GLOW(btnColor,10),
          opacity: state === "exporting" ? 0.7 : 1,
        }}>
          {state === "done"      && <><Star size={15}/> EXPORTED!</>}
          {state === "exporting" && <><RefreshCw size={15} className="animate-spin"/> GENERATING…</>}
          {state === "idle"      && <><Presentation size={15}/> EXPORT PPTX</>}
        </button>
      </div>
    </div>
  );
}
