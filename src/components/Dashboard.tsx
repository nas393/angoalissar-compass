"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { MapPin, ChevronDown, ChevronUp, Download, Menu, Presentation } from "lucide-react";
import dynamic from "next/dynamic";

import type {
  Section, CommodityPrice, PriceHistoryPoint, ForecastPoint,
  Distributor, SKUMargin, NewsItem, KPISummary, FXRate, ProvinceHeat,
} from "@/types";
import {
  fetchPrices, fetchPriceHistory, fetchForecast, fetchKPI,
  fetchDistributors, fetchSKUMargins, fetchNews, fetchFXRates, fetchProvinceHeat,
} from "@/services/api";
import { loadSettings, loadBriefings, loadProvince, saveProvince } from "@/lib/storage";
import { PROVINCES, C, GLOW } from "@/lib/constants";
import { ProvincePill } from "@/components/ui";

import Sidebar      from "@/components/ui/Sidebar";
import FXTicker     from "@/components/ui/FXTicker";
import OverviewSection      from "@/components/sections/Overview";
import CommoditiesSection   from "@/components/sections/Commodities";
import DistributorsSection  from "@/components/sections/Distributors";
import ProfitabilitySection from "@/components/sections/Profitability";
import LandedCostSection    from "@/components/sections/LandedCost";
import CopilotSection       from "@/components/sections/Copilot";
import BriefingsSection     from "@/components/sections/Briefings";
import NewsSection          from "@/components/sections/News";
import SettingsSection      from "@/components/sections/Settings";
import PPTXExportModal      from "@/components/sections/PPTXExport";
import CSVExportModal       from "@/components/sections/CSVExport";

// Bloomberg BG — client-only canvas
const BloombergBG = dynamic(() => import("@/components/ui/BloombergBG"), { ssr:false });

const SECTION_LABEL: Record<Section, string> = {
  overview:"Overview", commodities:"Commodities", distributors:"Distributors",
  profitability:"Profitability", landed:"Landed Cost", copilot:"Copilot AI",
  briefings:"Briefings", news:"News", settings:"Settings",
};

export default function Dashboard() {
  // ── Navigation & UI state ──────────────────────────────────────────────────
  const [section,      setSection]      = useState<Section>("overview");
  const [province,     setProvince]     = useState<string|null>(null);
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [provOpen,     setProvOpen]     = useState(false);
  const [csvOpen,      setCsvOpen]      = useState(false);
  const [pptxOpen,     setPptxOpen]     = useState(false);
  const [settings,     setSettings]     = useState(loadSettings);
  const [briefings,    setBriefings]    = useState(loadBriefings);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [prices,       setPrices]       = useState<CommodityPrice[]>([]);
  const [kpi,          setKpi]          = useState<KPISummary | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [margins,      setMargins]      = useState<SKUMargin[]>([]);
  const [news,         setNews]         = useState<NewsItem[]>([]);
  const [fxRates,      setFxRates]      = useState<FXRate[]>([]);
  const [heatData,     setHeatData]     = useState<ProvinceHeat[]>([]);
  const [historyCache, setHistoryCache] = useState<Record<string, PriceHistoryPoint[]>>({});
  const [forecastCache,setForecastCache]= useState<Record<string, ForecastPoint[]>>({});

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = loadProvince();
    if (saved) setProvince(saved);

    Promise.all([
      fetchPrices(), fetchKPI(), fetchDistributors(),
      fetchSKUMargins(), fetchNews(), fetchFXRates(), fetchProvinceHeat(),
    ]).then(([p,k,d,m,n,fx,heat]) => {
      setPrices(p); setKpi(k); setDistributors(d);
      setMargins(m); setNews(n); setFxRates(fx); setHeatData(heat);
    });
  }, []);

  // ── Province change ────────────────────────────────────────────────────────
  const handleProvinceChange = useCallback((p: string | null) => {
    setProvince(p);
    saveProvince(p);
    setProvOpen(false);
    // Re-fetch province-specific data
    if (p) {
      fetchDistributors(p).then(setDistributors);
      fetchSKUMargins(p).then(setMargins);
    } else {
      fetchDistributors().then(setDistributors);
      fetchSKUMargins().then(setMargins);
    }
  }, []);

  // ── History/forecast helpers (cached) ──────────────────────────────────────
  const getHistory = useCallback((commodity: string): PriceHistoryPoint[] => {
    if (!historyCache[commodity]) {
      fetchPriceHistory(commodity).then(h =>
        setHistoryCache(prev => ({ ...prev, [commodity]: h }))
      );
      return [];
    }
    return historyCache[commodity];
  }, [historyCache]);

  const getForecast = useCallback((commodity: string): ForecastPoint[] => {
    if (!forecastCache[commodity]) {
      fetchForecast(commodity).then(f =>
        setForecastCache(prev => ({ ...prev, [commodity]: f }))
      );
      return [];
    }
    return forecastCache[commodity];
  }, [forecastCache]);

  // Pre-warm cache for visible commodity
  useEffect(() => {
    ["Rice","Maize","Beans","Oil","Sugar","Flour"].forEach(c => {
      fetchPriceHistory(c).then(h => setHistoryCache(prev => ({ ...prev, [c]: h })));
      fetchForecast(c).then(f => setForecastCache(prev => ({ ...prev, [c]: f })));
    });
  }, []);

  // ── Section nav ────────────────────────────────────────────────────────────
  const handleSelect = useCallback((s: Section) => {
    setSection(s);
    setMobileOpen(false);
    window.scrollTo({ top:0 });
  }, []);

  // ── News for sidebar ───────────────────────────────────────────────────────
  const sidebarNews = useMemo(() =>
    province ? news.filter(n => !n.province || n.province === province) : news,
    [news, province]
  );

  // ── Section renderer ───────────────────────────────────────────────────────
  const renderSection = () => {
    if (!kpi) return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        height:300, color:C.textDim, fontFamily:"var(--font-mono)", fontSize:12,
        flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", gap:5 }}>
          {[0,1,2].map(i => (
            <div key={i} className="animate-pulse-dot" style={{ width:8, height:8,
              borderRadius:"50%", background:C.cyan, animationDelay:`${i*0.2}s` }}/>
          ))}
        </div>
        LOADING DATA…
      </div>
    );
    switch (section) {
      case "overview":
        return <OverviewSection province={province} onProvinceChange={handleProvinceChange}
          prices={prices} kpi={kpi} news={news} heatData={heatData}/>;
      case "commodities":
        return <CommoditiesSection province={province} prices={prices}
          getHistory={getHistory} getForecast={getForecast}/>;
      case "distributors":
        return <DistributorsSection province={province} distributors={distributors}/>;
      case "profitability":
        return <ProfitabilitySection province={province} margins={margins}/>;
      case "landed":
        return <LandedCostSection province={province}/>;
      case "copilot":
        return <CopilotSection province={province} kpi={kpi} settings={settings}/>;
      case "briefings":
        return <BriefingsSection province={province} briefings={briefings}
          onRefresh={() => setBriefings(loadBriefings())}/>;
      case "news":
        return <NewsSection province={province} news={news}/>;
      case "settings":
        return <SettingsSection settings={settings} onUpdate={s => { setSettings(s); }}/>;
    }
  };

  const sidebarProps = {
    active: section, onSelect: handleSelect,
    province, collapsed, onToggle: () => setCollapsed(c => !c),
    newsFeed: sidebarNews,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, color:C.text, position:"relative" }}>
      {/* Animated background */}
      <BloombergBG/>

      {/* Desktop sidebar */}
      <div style={{ position:"relative", zIndex:10, display:"none" }} className="sidebar-desktop">
        <Sidebar {...sidebarProps}/>
      </div>
      <style>{`
        @media(min-width:769px){ .sidebar-desktop{ display:block !important; } }
        @media(max-width:768px){ .mob-menu-btn{ display:flex !important; } .kpi-grid{ grid-template-columns: repeat(2,1fr) !important; } .two-col{ grid-template-columns: 1fr !important; } }
        .mob-menu-btn{ display:none; }
      `}</style>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          <div onClick={() => setMobileOpen(false)}
            style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)" }}/>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, zIndex:201 }}>
            <Sidebar {...sidebarProps} collapsed={false} onToggle={() => setMobileOpen(false)}/>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex:1, minHeight:"100vh", overflowX:"hidden", position:"relative", zIndex:1 }}>

        {/* ── Topbar ── */}
        <header style={{
          position:"sticky", top:0, zIndex:50,
          background:"rgba(1,8,20,0.92)", backdropFilter:"blur(16px)",
          borderBottom:`1px solid ${C.border}`,
          padding:"10px 22px", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:10, flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Mobile menu */}
            <button className="mob-menu-btn" onClick={() => setMobileOpen(true)} style={{
              background:"none", border:"none", cursor:"pointer", color:C.cyanDim, padding:4 }}>
              <Menu size={20}/>
            </button>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text, letterSpacing:1,
                fontFamily:"var(--font-mono)", textShadow:GLOW(C.cyan,6) }}>
                {SECTION_LABEL[section]}
              </div>
              <div style={{ fontSize:9, color:C.textDim, fontFamily:"var(--font-mono)", letterSpacing:1 }}>
                {new Date().toLocaleDateString("en-GB",{ weekday:"short",day:"numeric",month:"short",year:"numeric" })}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {/* Province selector */}
            <div style={{ position:"relative" }}>
              <button onClick={() => setProvOpen(o => !o)} style={{
                display:"flex", alignItems:"center", gap:6, padding:"6px 12px",
                background:`${C.cyan}08`, border:`1px solid ${C.border}`,
                borderRadius:8, color:C.textMid, fontSize:10, cursor:"pointer",
                fontFamily:"var(--font-mono)" }}>
                <MapPin size={12} color={C.cyan} style={{ filter:`drop-shadow(0 0 4px ${C.cyan})` }}/>
                <span style={{ color:C.text, fontWeight:700 }}>{province || "ALL PROVINCES"}</span>
                {provOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              </button>
              {provOpen && (
                <div style={{
                  position:"absolute", top:"110%", right:0, width:210,
                  background:"rgba(0,10,22,0.98)", border:`1px solid ${C.borderHi}`,
                  borderRadius:10, zIndex:100, padding:6,
                  boxShadow:`0 8px 32px rgba(0,0,0,.75),${GLOW(C.cyan,18)}`,
                  maxHeight:290, overflowY:"auto",
                }}>
                  <button onClick={() => handleProvinceChange(null)} style={{
                    width:"100%", padding:"7px 10px", borderRadius:6,
                    background: !province ? `${C.cyan}15` : "transparent",
                    border:"none", color: !province ? C.cyan : C.textDim,
                    textAlign:"left", cursor:"pointer", fontSize:11,
                    fontWeight: !province ? 700 : 400, fontFamily:"var(--font-mono)",
                  }}>All Provinces</button>
                  {PROVINCES.map(p => (
                    <button key={p} onClick={() => handleProvinceChange(p)} style={{
                      width:"100%", padding:"6px 10px", borderRadius:6,
                      background: province === p ? `${C.cyan}12` : "transparent",
                      border:"none", color: province === p ? C.cyan : C.textDim,
                      textAlign:"left", cursor:"pointer", fontSize:10,
                      fontWeight: province === p ? 700 : 400, fontFamily:"var(--font-mono)",
                    }}>{p}</button>
                  ))}
                </div>
              )}
            </div>

            {/* PPTX button */}
            <button onClick={() => setPptxOpen(true)} style={{
              padding:"6px 12px", background:"rgba(0,102,255,0.12)",
              border:"1px solid rgba(0,102,255,0.5)", borderRadius:8,
              color:"#6699ff", fontSize:10, fontWeight:700,
              fontFamily:"var(--font-mono)", letterSpacing:.5,
              display:"flex", alignItems:"center", gap:5,
            }}>
              <Presentation size={13}/> PPTX
            </button>

            {/* CSV button */}
            <button onClick={() => setCsvOpen(true)} style={{
              padding:"6px 12px", background:`${C.cyan}08`,
              border:`1px solid ${C.border}`, borderRadius:8,
              color:C.cyanDim, fontSize:10, fontWeight:700,
              fontFamily:"var(--font-mono)", letterSpacing:.5,
              display:"flex", alignItems:"center", gap:5,
            }}>
              <Download size={13}/> CSV
            </button>
          </div>
        </header>

        {/* ── FX Ticker ── */}
        {fxRates.length > 0 && <FXTicker rates={fxRates}/>}

        {/* ── Province scope pill ── */}
        <div style={{ padding:"10px 22px 0", display:"flex", alignItems:"center", gap:8 }}>
          <ProvincePill province={province}/>
          {province && (
            <button onClick={() => handleProvinceChange(null)} style={{
              fontSize:9, color:C.textDim, background:"none", border:"none",
              cursor:"pointer", fontFamily:"var(--font-mono)", letterSpacing:.5,
            }}>✕ CLEAR</button>
          )}
        </div>

        {/* ── Section content ── */}
        <div style={{ padding:"18px 22px 56px" }}>
          {renderSection()}
        </div>
      </main>

      {/* ── Modals ── */}
      <CSVExportModal  open={csvOpen}  onClose={() => setCsvOpen(false)}  prices={prices} province={province}/>
      <PPTXExportModal open={pptxOpen} onClose={() => setPptxOpen(false)} province={province}/>
    </div>
  );
}
