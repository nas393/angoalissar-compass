"use client";
import { useState } from "react";
import { Brain, Bell, Save } from "lucide-react";
import type { AppSettings } from "@/types";
import { saveSettings } from "@/lib/storage";
import { SectionHeader, Panel } from "@/components/ui";
import { C, GLOW } from "@/lib/constants";

export default function SettingsSection({ settings, onUpdate }: {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
}) {
  const [s, setS] = useState(settings);
  const changed = JSON.stringify(s) !== JSON.stringify(settings);

  const save = () => { saveSettings(s); onUpdate(s); };
  const upd = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setS(prev => ({ ...prev, [k]: v }));

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Settings" sub="Configure Copilot, briefing schedule and preferences" province={null}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Copilot AI */}
        <Panel style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <Brain size={16} color={C.cyan} style={{ filter:`drop-shadow(0 0 5px ${C.cyan})` }}/>
            <span style={{ fontSize:12, fontWeight:800, color:C.text, fontFamily:"var(--font-mono)", letterSpacing:1 }}>
              COPILOT AI
            </span>
          </div>
          {/* Memory slider */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:7, fontFamily:"var(--font-mono)" }}>MEMORY LENGTH (TURNS)</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input type="range" min={5} max={30} step={5} value={s.copilotMemory}
                onChange={e => upd("copilotMemory", Number(e.target.value))}
                style={{ flex:1, accentColor:C.cyan }}/>
              <span style={{ color:C.text, fontWeight:800, fontFamily:"var(--font-mono)", minWidth:24 }}>
                {s.copilotMemory}
              </span>
            </div>
          </div>
          {/* Devil tone */}
          <div>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:7, fontFamily:"var(--font-mono)" }}>DEVIL'S ADVOCATE INTENSITY</div>
            <select value={s.devilTone} onChange={e => upd("devilTone", e.target.value as any)}
              style={{ background:`${C.cyan}08`, border:`1px solid ${C.border}`, borderRadius:8,
                padding:"8px 10px", color:C.text, fontSize:12, width:"100%", fontFamily:"var(--font-mono)" }}>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="brutal">Brutal</option>
            </select>
          </div>
        </Panel>

        {/* Briefing schedule */}
        <Panel style={{ padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <Bell size={16} color={C.neonGreen} style={{ filter:`drop-shadow(0 0 5px ${C.neonGreen})` }}/>
            <span style={{ fontSize:12, fontWeight:800, color:C.text, fontFamily:"var(--font-mono)", letterSpacing:1 }}>
              DAILY BRIEFING
            </span>
          </div>
          {/* Toggle */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:7, fontFamily:"var(--font-mono)" }}>ENABLE DAILY BRIEFING</div>
            <div onClick={() => upd("briefingEnabled", !s.briefingEnabled)} style={{
              width:44, height:24, borderRadius:12, cursor:"pointer",
              background: s.briefingEnabled ? C.cyan : `${C.cyan}15`,
              border:`1px solid ${s.briefingEnabled ? C.cyan : C.border}`,
              position:"relative", transition:"all .2s",
              boxShadow: s.briefingEnabled ? GLOW(C.cyan,8) : "none",
            }}>
              <div style={{
                position:"absolute", top:3, width:16, height:16, borderRadius:"50%",
                left: s.briefingEnabled ? 22 : 3,
                background: s.briefingEnabled ? "#001820" : "rgba(0,180,220,0.3)",
                transition:"left .2s", border:`1px solid ${C.cyan}50`,
              }}/>
            </div>
          </div>
          {/* Time picker */}
          <div>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:7, fontFamily:"var(--font-mono)" }}>BRIEFING TIME</div>
            <input type="time" value={s.briefingTime}
              onChange={e => upd("briefingTime", e.target.value)}
              disabled={!s.briefingEnabled}
              style={{ background:`${C.cyan}06`, border:`1px solid ${C.border}`,
                borderRadius:8, padding:"8px 10px", color:s.briefingEnabled?C.text:C.textDim,
                fontSize:12, width:"100%", fontFamily:"var(--font-mono)",
                opacity:s.briefingEnabled?1:0.4 }}/>
          </div>
          {s.briefingEnabled && (
            <div style={{ marginTop:12, padding:"8px 12px", background:`${C.amber}10`,
              border:`1px solid ${C.amber}30`, borderRadius:8,
              fontSize:10, color:C.amber, fontFamily:"var(--font-mono)", lineHeight:1.5 }}>
              ⏰ Daily briefing active at {s.briefingTime}. Copy output to WhatsApp or email.
            </div>
          )}
        </Panel>
      </div>

      {changed && (
        <div style={{ marginTop:14, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={save} style={{
            padding:"10px 24px", background:`${C.neonGreen}15`,
            border:`1px solid ${C.neonGreen}`, borderRadius:8, color:C.neonGreen,
            fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-mono)",
            letterSpacing:1, boxShadow:GLOW(C.neonGreen,8),
            display:"flex", alignItems:"center", gap:8,
          }}>
            <Save size={14}/> SAVE SETTINGS
          </button>
        </div>
      )}
    </div>
  );
}
