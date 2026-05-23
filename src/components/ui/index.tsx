"use client";
import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, MapPin } from "lucide-react";
import { C, GLOW, PANEL, TOOLTIP_STYLE } from "@/lib/constants";

// ── TrendBadge ────────────────────────────────────────────────────────────────
export function TrendBadge({ val, suffix = "%" }: { val: number; suffix?: string }) {
  const color = val === 0 ? C.textDim : val > 0 ? C.neonGreen : C.red;
  const Icon  = val === 0 ? Minus : val > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ color, fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:2, fontFamily:"var(--font-mono)" }}>
      <Icon size={11} />{Math.abs(val).toFixed(1)}{suffix}
    </span>
  );
}

// ── NeonBadge ─────────────────────────────────────────────────────────────────
export function NeonBadge({ label, color = C.cyan }: { label: string; color?: string }) {
  return (
    <span style={{ padding:"2px 8px", borderRadius:6, fontSize:9, fontWeight:800, letterSpacing:1,
      background:`${color}15`, color, border:`1px solid ${color}35`, textTransform:"uppercase",
      fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

// ── ProvincePill ──────────────────────────────────────────────────────────────
export function ProvincePill({ province }: { province: string | null }) {
  const color = province ? C.amber : C.cyanDim;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 11px",
      background:`${color}12`, border:`1px solid ${color}30`, borderRadius:20,
      fontSize:10, fontWeight:700, color, letterSpacing:.5, fontFamily:"var(--font-mono)" }}>
      <MapPin size={9} />{province ? province.toUpperCase() : "ALL PROVINCES"}
    </span>
  );
}

// ── KPICard ───────────────────────────────────────────────────────────────────
export function KPICard({
  label, value, sub, trend, accent = C.cyan, icon: Icon,
}: {
  label: string; value: string; sub?: string; trend?: number;
  accent?: string; icon: React.FC<{ size?: number; color?: string }>;
}) {
  return (
    <div style={{ ...PANEL, padding:"16px 18px", position:"relative", overflow:"hidden",
      transition:"border-color .2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHi)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg,transparent,${accent},transparent)`, opacity:.6 }}/>
      <div style={{ position:"absolute", top:10, right:12, opacity:.15 }}>
        <Icon size={28} color={accent} />
      </div>
      <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
        textTransform:"uppercase", marginBottom:6, fontFamily:"var(--font-mono)" }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:-0.5,
        fontFamily:"var(--font-mono)", textShadow:GLOW(accent,6) }}>{value}</div>
      <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:8, fontSize:11 }}>
        {sub && <span style={{ color:C.textDim, fontFamily:"var(--font-mono)" }}>{sub}</span>}
        {trend !== undefined && <TrendBadge val={trend} />}
      </div>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({
  title, sub, province, actions,
}: {
  title: string; sub?: string; province: string | null; actions?: React.ReactNode;
}) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
      marginBottom:20, flexWrap:"wrap", gap:8 }}>
      <div>
        <h2 style={{ fontSize:18, fontWeight:900, color:C.text, margin:0, letterSpacing:1,
          fontFamily:"var(--font-mono)", textShadow:GLOW(C.cyan,8) }}>{title}</h2>
        {sub && <p style={{ fontSize:11, color:C.textDim, marginTop:3, fontFamily:"var(--font-mono)" }}>{sub}</p>}
        <div style={{ marginTop:8 }}><ProvincePill province={province} /></div>
      </div>
      {actions && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{actions}</div>}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function Panel({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  return (
    <div style={{ ...PANEL, ...style }} className={className}>
      {children}
    </div>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────────
export function TabBar<T extends string>({
  tabs, active, onChange, accent = C.cyan,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (k: T) => void;
  accent?: string;
}) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding:"5px 16px", borderRadius:20, fontSize:10, fontWeight:700,
          background: active === t.key ? `${accent}18` : "rgba(0,180,220,0.04)",
          border:`1px solid ${active === t.key ? accent : C.border}`,
          color: active === t.key ? accent : C.textDim,
          fontFamily:"var(--font-mono)", letterSpacing:.5,
          boxShadow: active === t.key ? GLOW(accent,6) : "none",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ── NeonTable ─────────────────────────────────────────────────────────────────
export function NeonTable({ headers, rows }: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:`${C.cyan}06` }}>
            {headers.map(h => (
              <th key={h} style={{ padding:"9px 12px", textAlign:"left", color:C.textDim,
                fontWeight:700, fontSize:9, letterSpacing:1, fontFamily:"var(--font-mono)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom:`1px solid ${C.border}15` }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding:"9px 12px", fontSize:12, fontFamily:"var(--font-mono)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── ScoreBar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? C.neonGreen : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ width:56, height:4, background:"rgba(0,180,220,0.1)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${score}%`, height:"100%", borderRadius:2,
          background:`linear-gradient(90deg,${color},${score>=70?C.cyan:C.amber})`,
          boxShadow:`0 0 6px ${color}` }}/>
      </div>
      <span style={{ color:C.text, fontWeight:800, fontSize:11, fontFamily:"var(--font-mono)" }}>{score}</span>
    </div>
  );
}

export { TOOLTIP_STYLE };
