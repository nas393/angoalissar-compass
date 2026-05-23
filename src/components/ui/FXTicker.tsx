"use client";
import { useEffect, useRef, useState } from "react";
import type { FXRate } from "@/types";
import { C } from "@/lib/constants";

export default function FXTicker({ rates }: { rates: FXRate[] }) {
  const [liveRates, setLiveRates] = useState(rates);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Simulate live FX updates
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveRates(prev => prev.map(r => ({
        ...r,
        rate: parseFloat((r.rate + (Math.random() - .5) * 0.9).toFixed(1)),
        change: parseFloat((r.change + (Math.random() - .5) * .1).toFixed(2)),
      })));
    }, 2600);
    return () => clearInterval(iv);
  }, []);

  // Scroll ticker
  useEffect(() => {
    let raf: number, pos = 0;
    const tick = () => {
      pos -= 0.5;
      const wrap = wrapRef.current;
      if (wrap && pos < -(wrap.scrollWidth / 2)) pos = 0;
      setOffset(pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...liveRates, ...liveRates];

  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`, height:26, display:"flex",
      alignItems:"center", background:"rgba(0,6,16,0.9)" }}>
      <div
        ref={wrapRef}
        style={{ display:"flex", transform:`translateX(${offset}px)`,
          willChange:"transform", whiteSpace:"nowrap" }}
      >
        {items.map((r, i) => (
          <span key={i} style={{ padding:"0 20px", fontSize:10,
            fontFamily:"var(--font-mono)", borderRight:`1px solid ${C.border}`,
            display:"inline-flex", alignItems:"center", gap:7 }}>
            <span style={{ color:C.textDim, fontWeight:700 }}>{r.pair}</span>
            <span style={{ color:C.text, fontWeight:800 }}>{r.rate.toFixed(1)}</span>
            <span style={{ color:r.change >= 0 ? C.neonGreen : C.red, fontSize:9 }}>
              {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change).toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
