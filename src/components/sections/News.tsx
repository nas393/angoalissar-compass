"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import type { NewsItem } from "@/types";
import { SectionHeader, NeonBadge } from "@/components/ui";
import { C, SENT_COLOR, CAT_COLOR } from "@/lib/constants";

const CATS = [
  { key:null,           label:"All" },
  { key:"macro",        label:"Macro" },
  { key:"commodity",    label:"Commodity" },
  { key:"competitor",   label:"Competitors" },
  { key:"regulatory",   label:"Regulatory" },
];

export default function NewsSection({ province, news }: {
  province: string | null;
  news: NewsItem[];
}) {
  const [cat, setCat] = useState<string|null>(null);
  const filtered = news.filter(n =>
    (!province || !n.province || n.province === province) &&
    (!cat || n.category === cat)
  );

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Market Intelligence" sub="Real-time news and competitive signals" province={province}/>
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {CATS.map(c => {
          const active = cat === c.key;
          const color = c.key ? CAT_COLOR[c.key] : C.cyan;
          return (
            <button key={String(c.key)} onClick={() => setCat(c.key)} style={{
              padding:"5px 14px", borderRadius:20, fontSize:10, fontWeight:700,
              background: active ? `${color}18` : "rgba(0,180,220,0.04)",
              border:`1px solid ${active ? color : C.border}`,
              color: active ? color : C.textDim, fontFamily:"var(--font-mono)", letterSpacing:.5,
              boxShadow: active ? `0 0 10px ${color}30` : "none",
            }}>{c.label.toUpperCase()}</button>
          );
        })}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map(n => (
          <div key={n.id} className="animate-fade-in" style={{
            background:"rgba(0,14,28,0.82)", backdropFilter:"blur(14px)",
            border:`1px solid ${C.border}`,
            borderLeft:`3px solid ${SENT_COLOR[n.sentiment]}`,
            borderRadius:10, padding:"12px 16px",
            boxShadow:`inset 0 0 20px ${SENT_COLOR[n.sentiment]}08`,
            transition:"border-color .15s",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.55, marginBottom:5,
                  fontFamily:"var(--font-mono)" }}>{n.headline}</div>
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:9, color:C.textDim, fontFamily:"var(--font-mono)" }}>{n.source}</span>
                  <span style={{ color:C.textDim, fontSize:9 }}>·</span>
                  <span style={{ fontSize:9, color:C.textDim, fontFamily:"var(--font-mono)" }}>{n.date}</span>
                  {n.province && (
                    <>
                      <span style={{ color:C.textDim, fontSize:9 }}>·</span>
                      <span style={{ fontSize:9, color:C.amber, display:"flex", alignItems:"center",
                        gap:3, fontFamily:"var(--font-mono)" }}>
                        <MapPin size={8}/>{n.province}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                <NeonBadge label={n.category} color={CAT_COLOR[n.category]}/>
                <NeonBadge label={n.sentiment} color={SENT_COLOR[n.sentiment]}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
