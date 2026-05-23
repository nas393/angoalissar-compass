"use client";
import { useState } from "react";
import type { ProvinceHeat } from "@/types";
import { C, GLOW } from "@/lib/constants";

export default function AngolaMap({
  data, selectedProvince, onSelect,
}: {
  data: ProvinceHeat[];
  selectedProvince: string | null;
  onSelect: (p: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxVal = Math.max(...data.map(p => p.value), 1);

  return (
    <div style={{ position:"relative" }}>
      <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
        marginBottom:8, fontFamily:"var(--font-mono)" }}>ANGOLA · MARKET COVERAGE</div>
      <svg viewBox="30 80 250 265" style={{ width:"100%", height:220, display:"block" }}>
        <defs>
          {data.map(p => (
            <radialGradient key={p.id} id={`pg_${p.id.replace(/[\s]/g,"_")}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={C.cyan}
                stopOpacity={0.2 + (p.value/maxVal)*0.55}/>
              <stop offset="100%" stopColor={C.cyan} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* Angola boundary */}
        <path d="M82,100 L95,92 L120,90 L155,88 L200,92 L230,108 L255,125 L268,150 L265,180 L258,210 L250,240 L238,265 L215,280 L195,295 L170,305 L145,308 L120,300 L100,288 L78,270 L65,248 L58,220 L55,195 L60,170 L68,148 L78,125 Z"
          fill="rgba(0,40,70,0.35)" stroke={`${C.cyan}22`} strokeWidth="1.2"/>

        {/* Grid */}
        {[120,150,180,210,240].map(y =>
          <line key={`hy${y}`} x1="55" y1={y} x2="270" y2={y} stroke={`${C.cyan}07`} strokeWidth=".4"/>
        )}
        {[80,120,160,200,240].map(x =>
          <line key={`vx${x}`} x1={x} y1="88" x2={x} y2="310" stroke={`${C.cyan}07`} strokeWidth=".4"/>
        )}

        {data.map(p => {
          const isSelected = selectedProvince === p.id;
          const isHov = hovered === p.id;
          const r = p.r * (isSelected || isHov ? 1.6 : 1);
          const color = isSelected ? C.amber : C.cyan;
          return (
            <g key={p.id} style={{ cursor:"pointer" }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(selectedProvince === p.id ? null : p.id)}>
              <circle cx={p.cx} cy={p.cy} r={r*2.6}
                fill={`url(#pg_${p.id.replace(/[\s]/g,"_")})`}/>
              <circle cx={p.cx} cy={p.cy} r={r}
                fill={`${color}${Math.round((p.value/maxVal*60+35)).toString(16).padStart(2,"0")}`}
                stroke={color} strokeWidth={isSelected||isHov ? 1.6 : .7} opacity={.9}
                style={{ filter:`drop-shadow(0 0 ${r}px ${color}90)` }}/>
              {(isHov || isSelected || p.id === "Luanda") && (
                <text x={p.cx + p.r + 3} y={p.cy + 4}
                  fill={isSelected ? C.amber : C.cyanDim}
                  fontSize="7" fontFamily="var(--font-mono)" fontWeight="700">
                  {p.id.length > 9 ? p.id.slice(0,8) : p.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
        <div style={{ flex:1, height:2,
          background:`linear-gradient(90deg,${C.cyan}20,${C.cyan})`,
          borderRadius:1 }}/>
        <span style={{ fontSize:9, color:C.textDim, fontFamily:"var(--font-mono)" }}>COVERAGE</span>
      </div>
      {selectedProvince && (
        <button onClick={() => onSelect(null)}
          style={{ marginTop:6, fontSize:9, color:C.amber, background:"none",
            border:"none", cursor:"pointer", fontFamily:"var(--font-mono)",
            letterSpacing:.5 }}>
          ✕ CLEAR SELECTION
        </button>
      )}
    </div>
  );
}
