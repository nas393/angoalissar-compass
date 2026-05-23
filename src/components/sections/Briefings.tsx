"use client";
import { useState } from "react";
import { Download, Trash2, CheckSquare, Square, Brain } from "lucide-react";
import type { SavedBriefing } from "@/types";
import { deleteBriefing, saveBriefing } from "@/lib/storage";
import { SectionHeader } from "@/components/ui";
import { C, GLOW } from "@/lib/constants";

export default function BriefingsSection({
  province, briefings, onRefresh,
}: {
  province: string | null;
  briefings: SavedBriefing[];
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState(new Set<string>());

  const filtered = province
    ? briefings.filter(b => !b.province || b.province === province)
    : briefings;

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const doDelete = (id: string) => { deleteBriefing(id); onRefresh(); };

  const exportCSV = () => {
    const toExport = filtered.filter(b => selected.size === 0 || selected.has(b.id));
    const csv = [
      "id,title,type,province,tone,horizon,generatedAt",
      ...toExport.map(b =>
        `"${b.id}","${b.title}","${b.type}","${b.province||""}","${b.tone}","${b.horizon}","${b.generatedAt}"`
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = `briefings_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Saved Briefings" sub="Auditable history of AI analyses with full metadata"
        province={province}
        actions={
          filtered.length > 0 && (
            <button onClick={exportCSV} style={{
              padding:"7px 14px", background:`${C.cyan}12`,
              border:`1px solid ${C.cyan}`, borderRadius:8, color:C.cyan,
              fontSize:10, fontWeight:700, cursor:"pointer",
              fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:6,
              boxShadow:GLOW(C.cyan,6),
            }}>
              <Download size={13}/> EXPORT CSV
            </button>
          )
        }
      />

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.textDim }}>
          <Brain size={40} style={{ opacity:.2, marginBottom:12 }} color={C.cyan}/>
          <div style={{ fontSize:13, fontFamily:"var(--font-mono)" }}>No briefings saved yet.</div>
          <div style={{ fontSize:11, marginTop:4, fontFamily:"var(--font-mono)" }}>
            Generate analyses in the Copilot AI section — they will appear here automatically.
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(b => (
            <div key={b.id} style={{
              background:"rgba(0,14,28,0.82)", backdropFilter:"blur(14px)",
              border:`1px solid ${selected.has(b.id) ? C.cyan : C.border}`,
              borderRadius:12, padding:"14px 16px",
              transition:"border-color .15s",
              boxShadow: selected.has(b.id) ? GLOW(C.cyan,6) : "none",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div onClick={() => toggle(b.id)} style={{ cursor:"pointer", marginTop:2 }}>
                  {selected.has(b.id)
                    ? <CheckSquare size={15} color={C.cyan}/>
                    : <Square size={15} color={C.textDim}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"var(--font-mono)" }}>
                      {b.title}
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                      <span style={{
                        fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:6,
                        background: b.type==="devil" ? `${C.red}18` : `${C.cyan}18`,
                        color: b.type==="devil" ? C.red : C.cyan,
                        border:`1px solid ${b.type==="devil"?C.red:C.cyan}35`,
                        fontFamily:"var(--font-mono)", letterSpacing:1,
                      }}>
                        {b.type==="devil" ? "DEVIL'S ADVOCATE" : "BRIEFING"}
                      </span>
                      <button onClick={() => doDelete(b.id)} style={{
                        background:"none", border:"none", cursor:"pointer",
                        color:C.textDim, padding:2, display:"flex",
                      }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:14, marginTop:6, fontSize:10,
                    color:C.textDim, flexWrap:"wrap", fontFamily:"var(--font-mono)" }}>
                    <span>📍 {b.province || "All Provinces"}</span>
                    <span>🎯 Tone: {b.tone}</span>
                    <span>📅 Horizon: {b.horizon}</span>
                    <span>🕐 {new Date(b.generatedAt).toLocaleString("en-GB")}</span>
                  </div>
                  <div style={{ marginTop:8, fontSize:11, color:C.textMid, lineHeight:1.65,
                    maxHeight:72, overflow:"hidden", fontFamily:"var(--font-mono)",
                    maskImage:"linear-gradient(to bottom, black 50%, transparent)" }}>
                    {b.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
