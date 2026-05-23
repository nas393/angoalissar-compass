"use client";
import { useState } from "react";
import { X, Download } from "lucide-react";
import type { CommodityPrice } from "@/types";
import { C, GLOW } from "@/lib/constants";
import { ProvincePill } from "@/components/ui";
import { PANEL } from "@/lib/constants";

const ALL_COLS: (keyof CommodityPrice)[] = ["province","commodity","price","currency","unit","lastUpdated"];

interface Props { open: boolean; onClose: () => void; prices: CommodityPrice[]; province: string | null; }

export default function CSVExportModal({ open, onClose, prices, province }: Props) {
  const [cols, setCols] = useState(new Set<keyof CommodityPrice>(ALL_COLS));

  const data = province ? prices.filter(p => p.province === province) : prices;
  const selectedCols = ALL_COLS.filter(c => cols.has(c));
  const preview = data.slice(0, 5);
  const estimatedKB = ((selectedCols.length * data.length * 12) / 1024).toFixed(1);

  const toggle = (col: keyof CommodityPrice) => setCols(prev => {
    const n = new Set(prev);
    n.has(col) ? n.delete(col) : n.add(col);
    return n;
  });

  const doExport = () => {
    const csv = [
      selectedCols.join(","),
      ...data.map(row => selectedCols.map(c => String(row[c] ?? "")).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `compass_prices_${province || "all"}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(5px)" }}>
      <div style={{ ...PANEL, padding:26, width:"100%", maxWidth:640, maxHeight:"84vh",
        overflowY:"auto", border:`1px solid ${C.borderHi}` }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:C.text, fontFamily:"var(--font-mono)",
              letterSpacing:1, textShadow:GLOW(C.cyan,8) }}>EXPORT CSV</div>
            <div style={{ fontSize:10, color:C.textDim, marginTop:3, fontFamily:"var(--font-mono)" }}>
              Live preview — toggle columns before download
            </div>
            <div style={{ marginTop:7 }}><ProvincePill province={province}/></div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none",
            cursor:"pointer", color:C.textDim }}><X size={18}/></button>
        </div>

        <div style={{ display:"flex", gap:16 }}>
          {/* Column selector */}
          <div style={{ width:160, flexShrink:0 }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:8, fontFamily:"var(--font-mono)" }}>COLUMNS</div>
            {ALL_COLS.map(col => (
              <label key={col} onClick={() => toggle(col)} style={{ display:"flex", alignItems:"center",
                gap:8, cursor:"pointer", padding:"5px 0" }}>
                <div style={{ width:14, height:14, borderRadius:4, flexShrink:0,
                  border:`1.5px solid ${cols.has(col) ? C.cyan : C.textDim}`,
                  background: cols.has(col) ? C.cyan : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s", boxShadow: cols.has(col) ? GLOW(C.cyan,6) : "none" }}>
                  {cols.has(col) && <div style={{ width:6, height:6, background:"#010810", borderRadius:1 }}/>}
                </div>
                <span style={{ fontSize:11, color:cols.has(col)?C.text:C.textDim,
                  fontFamily:"var(--font-mono)" }}>{col}</span>
              </label>
            ))}
          </div>

          {/* Preview */}
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:8, fontFamily:"var(--font-mono)" }}>PREVIEW (5 ROWS)</div>
            <div style={{ overflowX:"auto", background:`${C.cyan}05`, borderRadius:8,
              padding:10, border:`1px solid ${C.border}` }}>
              <table style={{ fontSize:10, borderCollapse:"collapse", whiteSpace:"nowrap" }}>
                <thead>
                  <tr>{selectedCols.map(c => (
                    <th key={c} style={{ padding:"4px 10px", color:C.cyan, fontWeight:700,
                      textAlign:"left", fontFamily:"var(--font-mono)" }}>{c}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>{selectedCols.map(c => (
                      <td key={c} style={{ padding:"4px 10px", color:C.textMid,
                        borderTop:`1px solid ${C.border}20`, fontFamily:"var(--font-mono)" }}>
                        {String(row[c] ?? "")}
                      </td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:8, fontSize:10, color:C.textDim, fontFamily:"var(--font-mono)" }}>
              {data.length.toLocaleString()} rows · {selectedCols.length} columns · ~{estimatedKB} KB
            </div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
          <button onClick={doExport} disabled={selectedCols.length === 0} style={{
            padding:"10px 22px", background:`${C.cyan}15`, border:`1px solid ${C.cyan}`,
            borderRadius:8, color:C.cyan, fontSize:11, fontWeight:800, cursor:"pointer",
            fontFamily:"var(--font-mono)", letterSpacing:1, boxShadow:GLOW(C.cyan,8),
            display:"flex", alignItems:"center", gap:8,
            opacity: selectedCols.length === 0 ? 0.4 : 1,
          }}>
            <Download size={14}/> DOWNLOAD CSV
          </button>
        </div>
      </div>
    </div>
  );
}
