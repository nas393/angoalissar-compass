"use client";
import { useState, useRef } from "react";
import { RefreshCw, Zap, Shield, Send } from "lucide-react";
import type { KPISummary, AppSettings, SavedBriefing } from "@/types";
import { SectionHeader, Panel, TabBar } from "@/components/ui";
import { saveBriefing } from "@/lib/storage";
import { C, GLOW } from "@/lib/constants";
import { fmtM, fmt } from "@/lib/utils";

interface Message { role: "user" | "assistant"; content: string; }

interface Props {
  province: string | null;
  kpi: KPISummary;
  settings: AppSettings;
}

const QUICK_QUESTIONS = [
  "What is the current state of flour margins?",
  "Key risks this week?",
  "Compare Luanda vs Benguela performance",
  "Top 3 priority actions for Q2",
];

export default function CopilotSection({ province, kpi, settings }: Props) {
  const [tab, setTab] = useState<"chat"|"briefing"|"devil">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState(settings.devilTone);
  const [horizon, setHorizon] = useState("30 days");
  const endRef = useRef<HTMLDivElement>(null);

  const systemPrompt = `You are the Commercial Copilot for Angoalissar Lda (Webcor Group), an FMCG importer and distributor in Angola.
Active provinces: Luanda, Benguela, Lobito, Lubango, Huambo, Cabinda, Namibe, Uíge and more.
Brands: Madrugada, Águia, Stallion (wheat flour), Patriota, Uncle Sam.
Current KPIs: Revenue ${fmtM(kpi.totalRevenue)} AOA, Volume ${fmt(kpi.totalVolumeMT)} MT, Gross Margin ${kpi.grossMarginPct}%.
Province scope: ${province || "All Angola"}.
Key competitors: Noble Group, Sodosa, Alimenta Angola, Kero, Candando.
Always respond in English. Be direct, analytical and action-oriented. Use data when available.
Memory: last ${settings.copilotMemory} turns.`;

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role:"user", content:userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: systemPrompt,
          messages: newMessages.slice(-settings.copilotMemory*2).map(m => ({
            role: m.role, content: m.content,
          })),
        }),
      });
      const data = await resp.json();
      const reply = data.content?.find((c:any) => c.type==="text")?.text ?? "No response.";
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role:"assistant",
        content:"⚠ API connection error. The Copilot responds when the Anthropic API key is configured in the backend.",
      }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
  };

  const generateBriefing = async (type: "briefing"|"devil") => {
    setLoading(true);
    setTab("chat");
    const toneMap = { mild:"gentle and constructive", moderate:"direct and critical", brutal:"brutally honest, no filters" };
    const prompt = type === "briefing"
      ? `Generate a daily executive briefing for Angoalissar management. Scope: ${province || "All Angola"}. Horizon: ${horizon}. Include: key KPIs, top risks, opportunities, and 3 priority actions. Concise format for board meeting.`
      : `Act as Devil's Advocate (${toneMap[tone]}). Challenge Angoalissar's current commercial performance. Scope: ${province || "All Angola"}. Identify blind spots, questionable decisions, and risks the team may be ignoring. Be ${tone}.`;

    const newMessages: Message[] = [...messages, { role:"user", content:prompt }];
    setMessages(newMessages);

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: systemPrompt,
          messages: [{ role:"user", content:prompt }],
        }),
      });
      const data = await resp.json();
      const content = data.content?.find((c:any) => c.type==="text")?.text ?? "No response.";
      const briefing: SavedBriefing = {
        id: Date.now().toString(),
        title: type === "briefing"
          ? `Executive Briefing — ${new Date().toLocaleDateString("en-GB")}`
          : `Devil's Advocate — ${new Date().toLocaleDateString("en-GB")}`,
        content, type, province, tone, horizon,
        generatedAt: new Date().toISOString(),
      };
      saveBriefing(briefing);
      setMessages(prev => [...prev, {
        role:"assistant",
        content:`**${briefing.title}**\n\n${content}\n\n*Saved automatically to Briefings.*`,
      }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"⚠ Error generating briefing." }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
  };

  const TABS = [
    { key:"chat" as const, label:"💬 Copilot" },
    { key:"briefing" as const, label:"📋 Briefing" },
    { key:"devil" as const, label:"😈 Devil's Advocate" },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="AI Commercial Copilot"
        sub="Conversational AI powered by your company data" province={province}/>
      <div style={{ marginBottom:14 }}>
        <TabBar tabs={TABS} active={tab} onChange={setTab} accent={tab==="devil"?C.red:C.cyan}/>
      </div>

      {tab === "chat" && (
        <Panel>
          <div style={{ height:360, overflowY:"auto", padding:"14px 16px",
            display:"flex", flexDirection:"column", gap:10 }}>
            {messages.length === 0 && (
              <div>
                <div style={{ textAlign:"center", padding:"20px 0 16px",
                  color:C.textDim, fontSize:11, fontFamily:"var(--font-mono)" }}>
                  COMMERCIAL COPILOT · ONLINE — Ask anything about your business
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {QUICK_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      padding:"10px 12px", background:`${C.cyan}08`,
                      border:`1px solid ${C.cyan}25`, borderRadius:8,
                      color:C.cyanDim, fontSize:10, textAlign:"left",
                      fontFamily:"var(--font-mono)", lineHeight:1.5,
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{
                  maxWidth:"82%", padding:"10px 14px", borderRadius:12, fontSize:12,
                  lineHeight:1.65, fontFamily:"var(--font-mono)", whiteSpace:"pre-wrap",
                  background: m.role==="user" ? `${C.cyan}22` : `${C.blue}18`,
                  color:C.text,
                  border:`1px solid ${m.role==="user"?C.cyan:C.blue}30`,
                  boxShadow:GLOW(m.role==="user"?C.cyan:C.blue, 6),
                  borderBottomRightRadius: m.role==="user" ? 4 : 12,
                  borderBottomLeftRadius:  m.role==="assistant" ? 4 : 12,
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:5, padding:"10px 14px",
                background:`${C.cyan}08`, borderRadius:12, width:"fit-content",
                border:`1px solid ${C.cyan}20` }}>
                {[0,1,2].map(i => (
                  <div key={i} className="animate-pulse-dot" style={{
                    width:6, height:6, borderRadius:"50%", background:C.cyan,
                    animationDelay:`${i*0.2}s`, boxShadow:GLOW(C.cyan),
                  }}/>
                ))}
              </div>
            )}
            <div ref={endRef}/>
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, padding:10, display:"flex", gap:8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about sales, margins, risks, opportunities…"
              disabled={loading}
              style={{ flex:1, background:`${C.cyan}06`, border:`1px solid ${C.border}`,
                borderRadius:8, padding:"9px 12px", color:C.text, fontSize:12,
                fontFamily:"var(--font-mono)" }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
              padding:"9px 20px", background:`${C.cyan}18`, border:`1px solid ${C.cyan}`,
              borderRadius:8, color:C.cyan, fontSize:11, fontWeight:800,
              fontFamily:"var(--font-mono)", letterSpacing:1, opacity:loading?0.5:1,
              boxShadow:GLOW(C.cyan,8), display:"flex", alignItems:"center", gap:6,
            }}>
              <Send size={13}/> SEND
            </button>
          </div>
        </Panel>
      )}

      {tab === "briefing" && (
        <Panel style={{ padding:22 }}>
          <p style={{ fontSize:12, color:C.textMid, marginBottom:18, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>
            Generates a daily executive summary with KPIs, risks, opportunities and priority actions.
            Saved automatically to Briefings with full audit metadata.
          </p>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:8, fontFamily:"var(--font-mono)" }}>HORIZON</div>
            <div style={{ display:"flex", gap:8 }}>
              {["7 days","30 days","Quarter","Annual"].map(h => (
                <button key={h} onClick={() => setHorizon(h)} style={{
                  padding:"6px 14px", borderRadius:8, fontSize:10, fontWeight:700,
                  background: horizon===h ? `${C.cyan}18` : "rgba(0,180,220,0.04)",
                  border:`1px solid ${horizon===h ? C.cyan : C.border}`,
                  color: horizon===h ? C.cyan : C.textDim, fontFamily:"var(--font-mono)",
                  boxShadow: horizon===h ? GLOW(C.cyan,6) : "none",
                }}>{h}</button>
              ))}
            </div>
          </div>
          <button onClick={() => generateBriefing("briefing")} disabled={loading} style={{
            padding:"12px 28px", background:`${C.cyan}15`, border:`1px solid ${C.cyan}`,
            borderRadius:10, color:C.cyan, fontSize:12, fontWeight:800, opacity:loading?0.5:1,
            fontFamily:"var(--font-mono)", letterSpacing:1, boxShadow:GLOW(C.cyan,10),
            display:"flex", alignItems:"center", gap:10,
          }}>
            {loading ? <><RefreshCw size={15} className="animate-spin"/> GENERATING…</> : <><Zap size={15}/> GENERATE EXECUTIVE BRIEFING</>}
          </button>
        </Panel>
      )}

      {tab === "devil" && (
        <Panel style={{ padding:22, border:`1px solid ${C.red}25` }}>
          <p style={{ fontSize:12, color:C.textMid, marginBottom:18, fontFamily:"var(--font-mono)", lineHeight:1.6 }}>
            Independent critical perspective — challenges decisions, identifies blind spots
            and risks the team may be ignoring.
          </p>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:9, color:C.textDim, fontWeight:700, letterSpacing:1.5,
              marginBottom:8, fontFamily:"var(--font-mono)" }}>INTENSITY</div>
            <div style={{ display:"flex", gap:8 }}>
              {([["mild","Mild"],["moderate","Moderate"],["brutal","☠ Brutal"]] as const).map(([v,l]) => (
                <button key={v} onClick={() => setTone(v)} style={{
                  padding:"6px 14px", borderRadius:8, fontSize:10, fontWeight:700,
                  background: tone===v ? `${C.red}18` : "rgba(220,0,60,0.04)",
                  border:`1px solid ${tone===v ? C.red : C.border}`,
                  color: tone===v ? C.red : C.textDim, fontFamily:"var(--font-mono)",
                  boxShadow: tone===v ? GLOW(C.red,6) : "none",
                }}>{l}</button>
              ))}
            </div>
          </div>
          <button onClick={() => generateBriefing("devil")} disabled={loading} style={{
            padding:"12px 28px", background:`${C.red}15`, border:`1px solid ${C.red}`,
            borderRadius:10, color:C.red, fontSize:12, fontWeight:800, opacity:loading?0.5:1,
            fontFamily:"var(--font-mono)", letterSpacing:1, boxShadow:GLOW(C.red,10),
            display:"flex", alignItems:"center", gap:10,
          }}>
            {loading ? <><RefreshCw size={15} className="animate-spin"/> GENERATING…</> : <><Shield size={15}/> ACTIVATE DEVIL'S ADVOCATE</>}
          </button>
        </Panel>
      )}
    </div>
  );
}
