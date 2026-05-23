"use client";
import {
  LayoutDashboard, TrendingUp, Users, BarChart3, Package,
  Brain, FileText, Newspaper, Settings, Menu, Activity
} from "lucide-react";
import type { Section, NewsItem } from "@/types";
import { C, GLOW } from "@/lib/constants";
import { ProvincePill } from "./index";

const NAV: { key: Section; Icon: React.FC<any>; label: string; badge?: string }[] = [
  { key:"overview",      Icon:LayoutDashboard, label:"Overview" },
  { key:"commodities",   Icon:TrendingUp,      label:"Commodities" },
  { key:"distributors",  Icon:Users,           label:"Distributors" },
  { key:"profitability", Icon:BarChart3,        label:"Profitability" },
  { key:"landed",        Icon:Package,          label:"Landed Cost" },
  { key:"copilot",       Icon:Brain,            label:"Copilot AI",    badge:"AI" },
  { key:"briefings",     Icon:FileText,         label:"Briefings" },
  { key:"news",          Icon:Newspaper,        label:"News" },
  { key:"settings",      Icon:Settings,         label:"Settings" },
];

const SENT_COLOR: Record<string,string> = {
  positive:"#00ff88", neutral:"#ffaa00", negative:"#ff3b5c",
};

interface Props {
  active: Section;
  onSelect: (s: Section) => void;
  province: string | null;
  collapsed: boolean;
  onToggle: () => void;
  newsFeed: NewsItem[];
}

export default function Sidebar({ active, onSelect, province, collapsed, onToggle, newsFeed }: Props) {
  return (
    <aside style={{
      width: collapsed ? 58 : 220,
      height:"100vh", position:"sticky", top:0,
      background:"rgba(0,5,14,0.97)",
      borderRight:`1px solid ${C.border}`,
      display:"flex", flexDirection:"column",
      overflowY:"auto", overflowX:"hidden",
      transition:"width .22s ease", flexShrink:0, zIndex:10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "14px 0" : "14px 16px",
        display:"flex", alignItems:"center", gap:10,
        borderBottom:`1px solid ${C.border}`,
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:C.cyan, letterSpacing:3,
              fontFamily:"var(--font-mono)", textShadow:GLOW(C.cyan,14) }}>COMPASS</div>
            <div style={{ fontSize:8, color:C.textDim, fontWeight:700, letterSpacing:2,
              fontFamily:"var(--font-mono)" }}>ANGOALISSAR · v2.0</div>
          </div>
        )}
        <button onClick={onToggle}
          style={{ background:"none", border:"none", cursor:"pointer",
            color:C.textDim, padding:4, display:"flex" }}>
          <Menu size={17} color={C.cyanDim} />
        </button>
      </div>

      {/* Province scope */}
      {!collapsed && (
        <div style={{ padding:"8px 12px", borderBottom:`1px solid ${C.border}` }}>
          <ProvincePill province={province} />
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex:1, paddingTop:6 }}>
        {NAV.map(({ key, Icon, label, badge }) => {
          const isActive = active === key;
          return (
            <button key={key} onClick={() => onSelect(key)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding: collapsed ? "10px 0" : "10px 14px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: isActive ? `${C.cyan}10` : "transparent",
              borderLeft: isActive ? `2px solid ${C.cyan}` : "2px solid transparent",
              border:"none", cursor:"pointer",
              borderTop:"none", borderBottom:"none", borderRight:"none",
              transition:"all .12s", position:"relative",
            }}>
              {isActive && (
                <div style={{ position:"absolute", left:2, top:"18%", bottom:"18%",
                  width:2, background:C.cyan, borderRadius:1,
                  boxShadow:GLOW(C.cyan,8) }}/>
              )}
              <Icon size={16} color={isActive ? C.cyan : C.textDim}
                style={{ filter: isActive ? `drop-shadow(0 0 6px ${C.cyan})` : "none", flexShrink:0 }}/>
              {!collapsed && (
                <span style={{ fontSize:11, fontWeight: isActive ? 700 : 400,
                  color: isActive ? C.cyan : C.textDim,
                  flex:1, textAlign:"left", fontFamily:"var(--font-mono)", letterSpacing:.5 }}>
                  {label}
                </span>
              )}
              {!collapsed && badge && (
                <span style={{ fontSize:8, fontWeight:900, padding:"1px 5px", borderRadius:4,
                  background:`${C.cyan}20`, color:C.cyan, border:`1px solid ${C.cyan}40`,
                  fontFamily:"var(--font-mono)", letterSpacing:1 }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini news feed */}
      {!collapsed && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"10px 12px" }}>
          <div style={{ fontSize:8, color:C.textDim, fontWeight:800, marginBottom:8,
            letterSpacing:2, fontFamily:"var(--font-mono)", display:"flex", alignItems:"center", gap:5 }}>
            <Activity size={9} color={C.cyanDim}/> LIVE · {province?.toUpperCase() || "ALL"}
          </div>
          {newsFeed.slice(0,3).map(n => (
            <div key={n.id} style={{ display:"flex", gap:6, marginBottom:8, alignItems:"flex-start" }}>
              <div style={{ width:4, height:4, borderRadius:"50%",
                background:SENT_COLOR[n.sentiment], marginTop:4, flexShrink:0,
                boxShadow:`0 0 4px ${SENT_COLOR[n.sentiment]}` }}/>
              <div style={{ fontSize:9, color:C.textDim, lineHeight:1.4,
                fontFamily:"var(--font-mono)" }}>
                {n.headline.slice(0,54)}…
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
