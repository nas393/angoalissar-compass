import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  LayoutDashboard, TrendingUp, Users, DollarSign, Package,
  Brain, BarChart3, Target, Newspaper, Settings, Download,
  ChevronRight, X, Menu, MapPin, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Minus, Cpu, RefreshCw, Save, Trash2,
  Clock, FileText, CheckSquare, Square, Eye, Activity,
  Zap, Globe, Shield, Star, ChevronDown, ChevronUp, Bell
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  getCurrentPrices, getPriceHistory, getMarketShare,
  getDistributors, getSKUMargins, getDefaultLandedCostScenario,
  calcLandedCost, getForecast, getNewsFeed, getKPISummary,
  PROVINCES, COMMODITIES, type DistributorScorecard,
  type SKUMargin, type LandedCostScenario
} from '../services/mock-data';
import {
  loadSettings, saveSettings, loadBriefings, saveBriefing,
  deleteBriefing, loadProvince, saveProvince, type AppSettings
} from '../lib/storage';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Section =
  | 'overview' | 'commodities' | 'distributors' | 'profitability'
  | 'landed' | 'forecast' | 'copilot' | 'briefings' | 'news' | 'settings';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n: number, dp = 0) => n.toLocaleString('pt-AO', { maximumFractionDigits: dp });
const fmtM = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)} Bi` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} M` : fmt(n);

const SENTIMENT_COLOR = { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' };
const CAT_COLOR = { macro: '#6366f1', commodity: '#f59e0b', competitor: '#ef4444', regulatory: '#22c55e' };

function TrendBadge({ val, suffix = '%' }: { val: number; suffix?: string }) {
  const up = val > 0, zero = val === 0;
  const color = zero ? '#94a3b8' : up ? '#22c55e' : '#ef4444';
  const Icon = zero ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ color, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <Icon size={12} />{Math.abs(val).toFixed(1)}{suffix}
    </span>
  );
}

// ─── PROVINCE SCOPE PILL ─────────────────────────────────────────────────────
function ProvinceScopePill({ province }: { province: string | null }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: province ? 'rgba(234,179,8,0.15)' : 'rgba(99,102,241,0.15)',
      border: `1px solid ${province ? '#eab308' : '#6366f1'}40`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      color: province ? '#eab308' : '#818cf8'
    }}>
      <MapPin size={10} />
      {province ? province.toUpperCase() : 'TODAS AS PROVÍNCIAS'}
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string; value: string; sub?: string;
  trend?: number; icon: React.FC<any>; accent: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 12, right: 12, width: 36, height: 36,
        background: accent + '20', borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={16} color={accent} />
      </div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.5 }}>{value}</div>
      {(sub || trend !== undefined) && (
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          {sub && <span style={{ color: '#64748b' }}>{sub}</span>}
          {trend !== undefined && <TrendBadge val={trend} />}
        </div>
      )}
    </div>
  );
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function SectionWrap({ title, sub, province, children, actions }: {
  title: string; sub?: string; province: string | null;
  children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{title}</h2>
          {sub && <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{sub}</p>}
          <div style={{ marginTop: 6 }}><ProvinceScopePill province={province} /></div>
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── OVERVIEW SECTION ────────────────────────────────────────────────────────
function OverviewSection({ province }: { province: string | null }) {
  const kpi = useMemo(() => getKPISummary(), []);
  const prices = useMemo(() => getCurrentPrices(), []);
  const news = useMemo(() => getNewsFeed(province).slice(0, 4), [province]);
  const filtered = province ? prices.filter(p => p.province === province) : prices;
  const avgByComm = COMMODITIES.map(c => {
    const pts = filtered.filter(p => p.commodity === c);
    const avg = pts.length ? Math.round(pts.reduce((a, b) => a + b.price, 0) / pts.length) : 0;
    return { commodity: c, avg };
  });

  return (
    <SectionWrap title="Visão Geral" sub="Resumo executivo de desempenho e mercado" province={province}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KPICard label="Receita Total" value={fmtM(kpi.totalRevenue)} sub="AOA" trend={kpi.revenueGrowthPct} icon={DollarSign} accent="#6366f1" />
        <KPICard label="Volume Total" value={fmt(kpi.totalVolumeMT)} sub="MT" icon={Package} accent="#22c55e" />
        <KPICard label="Margem Bruta" value={`${kpi.grossMarginPct}%`} trend={kpi.marginVsTargetPct} icon={TrendingUp} accent={kpi.grossMarginPct < 5 ? '#ef4444' : '#f59e0b'} />
        <KPICard label="Clientes Activos" value={fmt(kpi.activeCustomers)} icon={Users} accent="#06b6d4" />
        <KPICard label="Dias de Cobrança" value={`${kpi.collectionDays}d`} sub="DSO" icon={Clock} accent={kpi.collectionDays > 45 ? '#ef4444' : '#22c55e'} />
        <KPICard label="Região Líder" value={kpi.topRegion} icon={MapPin} accent="#a78bfa" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>PREÇOS MÉDIOS POR COMMODITY (AOA/kg)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={avgByComm} barSize={28}>
              <XAxis dataKey="commodity" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${fmt(v)} AOA`, 'Médio']} />
              <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>ÚLTIMAS NOTÍCIAS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {news.map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: SENTIMENT_COLOR[n.sentiment], marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{n.headline}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{n.source} · {n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── COMMODITIES SECTION ─────────────────────────────────────────────────────
function CommoditiesSection({ province }: { province: string | null }) {
  const [selected, setSelected] = useState('Arroz');
  const history = useMemo(() => getPriceHistory(selected, 60), [selected]);
  const prices = useMemo(() => getCurrentPrices(), []);
  const forecast = useMemo(() => getForecast(selected), [selected]);
  const current = history[history.length - 1]?.price || 0;
  const prev = history[0]?.price || 1;
  const chg = ((current - prev) / prev) * 100;

  const tableData = province
    ? prices.filter(p => p.province === province)
    : PROVINCES.map(prov => {
        const p = prices.find(x => x.province === prov && x.commodity === selected);
        return p || { province: prov, commodity: selected, price: 0, currency: 'AOA', unit: 'kg', lastUpdated: '' };
      });

  return (
    <SectionWrap title="Preços & Commodities" sub="Preços de mercado, histórico e projeções" province={province}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {COMMODITIES.map(c => (
          <button key={c} onClick={() => setSelected(c)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: selected === c ? '#6366f1' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${selected === c ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
            color: selected === c ? '#fff' : '#94a3b8', transition: 'all 0.15s'
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{selected.toUpperCase()} · 60 DIAS</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{fmt(current)} AOA/kg</div>
              <TrendBadge val={chg} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`${fmt(v)} AOA`, '']} />
              <Area type="monotone" dataKey="price" stroke="#6366f1" fill="url(#gradPrice)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>PREVISÃO 12 MESES</div>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="gradFcast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="upperBound" stroke="none" fill="rgba(34,197,94,0.1)" />
              <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#1e293b" />
              <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="forecast" stroke="#22c55e" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          PREÇOS POR PROVÍNCIA · {province ? province.toUpperCase() : 'TODAS'}
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Província', 'Produto', 'Preço (AOA)', 'Unidade'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 20).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                  <td style={{ padding: '8px 16px', color: '#cbd5e1' }}>{row.province}</td>
                  <td style={{ padding: '8px 16px', color: '#94a3b8' }}>{row.commodity}</td>
                  <td style={{ padding: '8px 16px', color: '#f1f5f9', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(row.price)}</td>
                  <td style={{ padding: '8px 16px', color: '#64748b' }}>{row.unit}/kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── DISTRIBUTORS SECTION ────────────────────────────────────────────────────
function DistributorsSection({ province }: { province: string | null }) {
  const data = useMemo(() => getDistributors(), []);
  const filtered = province ? data.filter(d => d.region === province) : data;

  const radarData = filtered.slice(0, 1).map(d => ([
    { subject: 'Vendas', value: d.salesAchievement },
    { subject: 'Margem', value: d.profitability * 5 },
    { subject: 'Cobrança', value: d.collectionEfficiency },
    { subject: 'Cobertura', value: d.coverage },
    { subject: 'Crescimento', value: Math.max(d.growth * 3 + 30, 0) },
  ]));

  return (
    <SectionWrap title="Scorecard de Distribuidores" sub="Rankings automáticos por performance" province={province}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                {['#', 'Distribuidor', 'Região', 'Vendas%', 'Margem%', 'Cobrança%', 'Score'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filtered.length ? filtered : data).map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', color: d.rank <= 3 ? '#f59e0b' : '#64748b', fontWeight: 700 }}>
                    {d.rank <= 3 ? '★' : ''} {d.rank}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#f1f5f9', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{d.region}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: d.salesAchievement >= 100 ? '#22c55e' : d.salesAchievement >= 80 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                      {d.salesAchievement}%
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#f1f5f9' }}>{d.profitability}%</td>
                  <td style={{ padding: '10px 14px', color: d.collectionEfficiency >= 90 ? '#22c55e' : '#f59e0b' }}>{d.collectionEfficiency}%</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                        <div style={{ width: `${d.score}%`, height: '100%', background: d.score >= 70 ? '#22c55e' : d.score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 12, minWidth: 28 }}>{d.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>PERFIL TOP DISTRIBUIDOR</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{filtered[0]?.name || data[0]?.name}</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData[0] || []}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis domain={[0, 100]} hide />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── PROFITABILITY ENGINE ─────────────────────────────────────────────────────
function ProfitabilitySection({ province }: { province: string | null }) {
  const [groupBy, setGroupBy] = useState<'sku' | 'brand' | 'region' | 'channel' | 'salesperson'>('brand');
  const rawData = useMemo(() => getSKUMargins(), []);
  const data = province ? rawData.filter(d => d.region === province) : rawData;

  const grouped = useMemo(() => {
    const map: Record<string, { revenue: number; cost: number; units: number }> = {};
    data.forEach(row => {
      const key = row[groupBy];
      if (!map[key]) map[key] = { revenue: 0, cost: 0, units: 0 };
      map[key].revenue += row.revenueAOA;
      map[key].cost += row.costAOA;
      map[key].units += row.units;
    });
    return Object.entries(map).map(([name, v]) => ({
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      revenue: v.revenue,
      gp: v.revenue - v.cost,
      margin: parseFloat(((1 - v.cost / v.revenue) * 100).toFixed(1)),
      units: v.units
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [data, groupBy]);

  const VIEWS: { key: typeof groupBy; label: string }[] = [
    { key: 'brand', label: 'Marca' }, { key: 'region', label: 'Região' },
    { key: 'channel', label: 'Canal' }, { key: 'salesperson', label: 'Vendedor' },
    { key: 'sku', label: 'SKU' }
  ];

  return (
    <SectionWrap title="Motor de Rentabilidade" sub="Análise de margem por dimensão comercial" province={province}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {VIEWS.map(v => (
          <button key={v.key} onClick={() => setGroupBy(v.key)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: groupBy === v.key ? '#6366f1' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${groupBy === v.key ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
            color: groupBy === v.key ? '#fff' : '#94a3b8'
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>RECEITA vs MARGEM BRUTA (AOA)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={grouped} layout="vertical" barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [fmtM(v) + ' AOA', '']} />
              <Bar dataKey="revenue" fill="#334155" radius={[0, 4, 4, 0]} />
              <Bar dataKey="gp" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#64748b', fontWeight: 600 }}>
            TABELA DETALHADA · AGRUPAR POR {groupBy.toUpperCase()}
          </div>
          <div style={{ maxHeight: 230, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Nome', 'Receita', 'GP', 'Margem%'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{r.name}</td>
                    <td style={{ padding: '8px 12px', color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.revenue)}</td>
                    <td style={{ padding: '8px 12px', color: '#6366f1', fontVariantNumeric: 'tabular-nums' }}>{fmtM(r.gp)}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: r.margin < 5 ? '#ef4444' : r.margin < 10 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{r.margin}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── LANDED COST SIMULATOR ───────────────────────────────────────────────────
function LandedCostSection({ province }: { province: string | null }) {
  const [s, setS] = useState(() => calcLandedCost(getDefaultLandedCostScenario()));
  const result = useMemo(() => calcLandedCost(s), [s]);

  const update = (key: keyof LandedCostScenario, val: number | string) =>
    setS(prev => ({ ...prev, [key]: val }));

  const FIELDS: { key: keyof LandedCostScenario; label: string; step: number; prefix?: string }[] = [
    { key: 'baseCostUSD', label: 'Custo Base (USD)', step: 0.1, prefix: '$' },
    { key: 'freightUSD', label: 'Frete (USD)', step: 0.1, prefix: '$' },
    { key: 'customsDuty', label: 'Direitos Aduaneiros (%)', step: 0.5 },
    { key: 'fxRate', label: 'Taxa de Câmbio (USD→AOA)', step: 1 },
    { key: 'otherCosts', label: 'Outros Custos (AOA)', step: 100 },
    { key: 'sellingPriceAOA', label: 'Preço de Venda (AOA)', step: 100 },
  ];

  return (
    <SectionWrap title="Simulador de Custo Landed" sub="Impacto de frete, câmbio e alfândega na margem" province={province}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 16 }}>PARÂMETROS DO CENÁRIO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FIELDS.map(f => (
              <div key={f.key as string}>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
                  {f.prefix && <span style={{ padding: '0 10px', color: '#64748b', fontSize: 13 }}>{f.prefix}</span>}
                  <input
                    type="number" step={f.step}
                    value={s[f.key] as number}
                    onChange={e => update(f.key, parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 12px', color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>RESULTADO DO CENÁRIO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Custo CIF (AOA)', value: fmt(Math.round((s.baseCostUSD + s.freightUSD) * s.fxRate)) },
                { label: 'Direitos Aduaneiros (AOA)', value: fmt(Math.round((s.baseCostUSD + s.freightUSD) * s.fxRate * s.customsDuty / 100)) },
                { label: 'Outros Custos (AOA)', value: fmt(s.otherCosts) },
                { label: 'CUSTO LANDED (AOA)', value: fmt(result.landedCostAOA), highlight: true },
                { label: 'Preço de Venda (AOA)', value: fmt(result.sellingPriceAOA) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: row.highlight ? '#f1f5f9' : '#94a3b8', fontWeight: row.highlight ? 700 : 400 }}>{row.label}</span>
                  <span style={{ fontSize: 14, color: row.highlight ? '#6366f1' : '#f1f5f9', fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: result.marginPct < 0 ? 'rgba(239,68,68,0.1)' : result.marginPct < 5 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${result.marginPct < 0 ? 'rgba(239,68,68,0.4)' : result.marginPct < 5 ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}`,
            borderRadius: 12, padding: 20, textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>MARGEM BRUTA ESTIMADA</div>
            <div style={{
              fontSize: 48, fontWeight: 800, letterSpacing: -2,
              color: result.marginPct < 0 ? '#ef4444' : result.marginPct < 5 ? '#f59e0b' : '#22c55e'
            }}>
              {result.marginPct}%
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {result.marginPct < 0 ? '⚠ Prejuízo — renegociar preço ou custo' :
               result.marginPct < 5 ? '⚡ Margem comprimida — monitorar' :
               '✓ Margem saudável'}
            </div>
          </div>
        </div>
      </div>
    </SectionWrap>
  );
}

// ─── NEWS SECTION ────────────────────────────────────────────────────────────
function NewsSection({ province }: { province: string | null }) {
  const news = useMemo(() => getNewsFeed(province), [province]);
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? news.filter(n => n.category === filter) : news;

  const CATS = [
    { key: 'macro', label: 'Macro' }, { key: 'commodity', label: 'Commodity' },
    { key: 'competitor', label: 'Concorrentes' }, { key: 'regulatory', label: 'Regulatório' }
  ];

  return (
    <SectionWrap title="Feed de Notícias" sub="Inteligência de mercado em tempo real" province={province}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFilter(null)} style={{
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          background: !filter ? '#6366f1' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${!filter ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
          color: !filter ? '#fff' : '#94a3b8'
        }}>Todos</button>
        {CATS.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key === filter ? null : c.key)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filter === c.key ? (CAT_COLOR as any)[c.key] + '33' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${filter === c.key ? (CAT_COLOR as any)[c.key] : 'rgba(255,255,255,0.1)'}`,
            color: filter === c.key ? (CAT_COLOR as any)[c.key] : '#94a3b8'
          }}>{c.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(n => (
          <div key={n.id} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: `3px solid ${SENTIMENT_COLOR[n.sentiment]}`,
            borderRadius: 10, padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500, lineHeight: 1.4, marginBottom: 6 }}>{n.headline}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{n.source}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>·</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{n.date}</span>
                  {n.province && (
                    <>
                      <span style={{ fontSize: 11, color: '#475569' }}>·</span>
                      <span style={{ fontSize: 11, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={9} />{n.province}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <span style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: (CAT_COLOR as any)[n.category] + '20',
                  color: (CAT_COLOR as any)[n.category]
                }}>{n.category}</span>
                <span style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: SENTIMENT_COLOR[n.sentiment] + '20',
                  color: SENTIMENT_COLOR[n.sentiment]
                }}>{n.sentiment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

// ─── CSV EXPORT MODAL ────────────────────────────────────────────────────────
function CsvExportModal({ open, onClose, province }: { open: boolean; onClose: () => void; province: string | null }) {
  const ALL_DATA = useMemo(() => getCurrentPrices(), []);
  const data = province ? ALL_DATA.filter(p => p.province === province) : ALL_DATA;
  const cols = Object.keys(data[0] || {});
  const [selected, setSelected] = useState(new Set(cols));
  const preview = data.slice(0, 5).map(row => Object.fromEntries(Array.from(selected).map(c => [c, (row as any)[c]])));
  const sizeKB = ((JSON.stringify(preview).length / 1024)).toFixed(1);

  const toggle = (c: string) => setSelected(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const doExport = () => {
    const colArr = Array.from(selected);
    const csv = [colArr.join(','), ...data.map(row => colArr.map(c => (row as any)[c] ?? '').join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `compass_export_${province || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    onClose();
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Exportar CSV</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Pré-visualização em tempo real</div>
            <div style={{ marginTop: 6 }}><ProvinceScopePill province={province} /></div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 160 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>COLUNAS</div>
            {cols.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                <div onClick={() => toggle(c)} style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected.has(c) ? '#6366f1' : '#334155'}`, background: selected.has(c) ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected.has(c) && <div style={{ width: 8, height: 8, background: '#fff', borderRadius: 1 }} />}
                </div>
                <span style={{ fontSize: 12, color: selected.has(c) ? '#f1f5f9' : '#64748b' }}>{c}</span>
              </label>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>PRÉ-VISUALIZAÇÃO (5 linhas)</div>
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10 }}>
              <table style={{ fontSize: 11, borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>{Array.from(selected).map(c => <th key={c} style={{ padding: '4px 10px', color: '#64748b', fontWeight: 600 }}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => <tr key={i}>{Array.from(selected).map(c => <td key={c} style={{ padding: '4px 10px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.04)' }}>{String(row[c] || '')}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
              {data.length} linhas · {selected.size} colunas · ~{sizeKB} KB (pré-visualização)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={doExport} style={{
            padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}><Download size={15} /> Baixar CSV</button>
        </div>
      </div>
    </div>
  );
}

// ─── SAVED BRIEFINGS SECTION ─────────────────────────────────────────────────
function SavedBriefingsSection({ province }: { province: string | null }) {
  const [briefings, setBriefings] = useState(() => loadBriefings());
  const [csvOpen, setCsvOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const filtered = province ? briefings.filter(b => !b.province || b.province === province) : briefings;

  const toggle = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const del = (id: string) => { deleteBriefing(id); setBriefings(loadBriefings()); };

  const exportSelected = () => {
    const toExport = filtered.filter(b => selectedIds.size === 0 || selectedIds.has(b.id));
    const csv = ['id,title,type,province,tone,horizon,generatedAt',
      ...toExport.map(b => `"${b.id}","${b.title}","${b.type}","${b.province || ''}","${b.tone}","${b.horizon}","${b.generatedAt}"`)
    ].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `briefings_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <SectionWrap title="Briefings Guardados" sub="Histórico auditável de análises AI" province={province}
      actions={
        <>
          {filtered.length > 0 && <button onClick={exportSelected} style={{ padding: '6px 14px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={13} /> Exportar CSV</button>}
        </>
      }>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <Brain size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Nenhum briefing guardado ainda.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Use o Copilot AI ou o Briefing Executivo para gerar análises.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => (
            <div key={b.id} style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${selectedIds.has(b.id) ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12, padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div onClick={() => toggle(b.id)} style={{ cursor: 'pointer', marginTop: 2 }}>
                  {selectedIds.has(b.id) ? <CheckSquare size={16} color="#6366f1" /> : <Square size={16} color="#475569" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{b.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: b.type === 'devil' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', color: b.type === 'devil' ? '#ef4444' : '#818cf8' }}>
                        {b.type === 'devil' ? 'Devil\'s Advocate' : 'Briefing'}
                      </span>
                      <button onClick={() => del(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 2 }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
                    <span>📍 {b.province || 'Todas'}</span>
                    <span>🎯 Tom: {b.tone}</span>
                    <span>📅 Horizonte: {b.horizon}</span>
                    <span>🕐 {new Date(b.generatedAt).toLocaleString('pt-AO')}</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.6, maxHeight: 80, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
                    {b.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionWrap>
  );
}

// ─── AI COPILOT SECTION ───────────────────────────────────────────────────────
function CopilotSection({ province, settings }: { province: string | null; settings: AppSettings }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'briefing' | 'devil'>('chat');
  const [tone, setTone] = useState(settings.devilTone);
  const [horizon, setHorizon] = useState('30 dias');
  const endRef = useRef<HTMLDivElement>(null);

  const kpi = useMemo(() => getKPISummary(), []);
  const prices = useMemo(() => getCurrentPrices().slice(0, 10), []);
  const news = useMemo(() => getNewsFeed(province).slice(0, 4), [province]);

  const systemContext = `Você é o Copilot Comercial da Angoalissar Lda (grupo Webcor), empresa de importação e distribuição FMCG em Angola.
Províncias activas: Luanda, Benguela, Lobito, Lubango, Huambo, Cabinda, Namibe, Uíge, entre outras.
Marcas: Madrugada, Águia, Stallion (farinha de trigo), Patriota, Uncle Sam.
Contexto actual: Receita ${fmtM(kpi.totalRevenue)} AOA, volume ${fmt(kpi.totalVolumeMT)} MT, margem bruta ${kpi.grossMarginPct}%.
Foco de scope: ${province || 'Angola toda'}
Concorrentes chave: Noble Group, Sodosa, Alimenta Angola, Kero, Candando.
Responda sempre em português de Angola. Seja directo, analítico e orientado para acção.
Memória activa: últimos ${settings.copilotMemory} turnos.`;

  const buildHistory = () => messages.slice(-settings.copilotMemory * 2).map(m => ({ role: m.role, content: m.content }));

  const sendMessage = async (userMsg: string, isSystem = false) => {
    if (!userMsg.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemContext,
          messages: [...buildHistory().slice(0, -1), { role: 'user', content: userMsg }]
        })
      });
      const data = await resp.json();
      const reply = data.content?.find((c: any) => c.type === 'text')?.text || 'Sem resposta.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Erro de conexão com o modelo AI. Verifique a ligação.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const generateBriefing = async (type: 'briefing' | 'devil') => {
    setLoading(true);
    const toneMap = { mild: 'gentil e construtivo', moderate: 'directo e crítico', brutal: 'brutal e sem filtros' };
    const prompt = type === 'briefing'
      ? `Gera um briefing executivo diário para a gestão da Angoalissar. Âmbito: ${province || 'Angola toda'}. Horizonte: ${horizon}. Inclui: KPIs chave, riscos, oportunidades e 3 acções prioritárias. Formato conciso para apresentação em reunião.`
      : `Actua como um Devil's Advocate ${toneMap[tone]}. Questiona o desempenho comercial actual da Angoalissar. Âmbito: ${province || 'Angola toda'}. Identifica pontos cegos, decisões questionáveis, e riscos que a equipa está a ignorar. Tom: ${tone}.`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: systemContext,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await resp.json();
      const content = data.content?.find((c: any) => c.type === 'text')?.text || 'Sem resposta.';
      const briefing = {
        id: Date.now().toString(), title: type === 'briefing' ? `Briefing Executivo – ${new Date().toLocaleDateString('pt-AO')}` : `Devil's Advocate – ${new Date().toLocaleDateString('pt-AO')}`,
        content, type, province, tone, horizon, generatedAt: new Date().toISOString(), exportable: true
      };
      saveBriefing(briefing);
      setMessages(prev => [...prev, { role: 'assistant', content: `**${briefing.title}**\n\n${content}\n\n*Guardado automaticamente em Briefings Guardados.*` }]);
      setTab('chat');
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Erro ao gerar briefing.' }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = ['Qual é o estado das margens de farinha?', 'Que riscos vejo esta semana?', 'Comparar Luanda vs Benguela', 'Acções prioritárias para Q2'];

  return (
    <SectionWrap title="Copilot Comercial AI" sub="Assistente conversacional com dados da empresa" province={province}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ key: 'chat', label: '💬 Copilot' }, { key: 'briefing', label: '📋 Briefing Executivo' }, { key: 'devil', label: '😈 Devil\'s Advocate' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: tab === t.key ? '#6366f1' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${tab === t.key ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
            color: tab === t.key ? '#fff' : '#94a3b8'
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'chat' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 360, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div>
                <div style={{ textAlign: 'center', padding: '20px 0 16px', color: '#475569', fontSize: 13 }}>
                  Olá! Sou o seu Copilot Comercial. Faça-me qualquer pergunta sobre o negócio.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {QUICK.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      padding: '10px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 8, color: '#818cf8', fontSize: 12, textAlign: 'left', cursor: 'pointer', lineHeight: 1.4
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  color: m.role === 'user' ? '#fff' : '#f1f5f9',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
                  whiteSpace: 'pre-wrap'
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 12, display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 12, display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Pergunte sobre vendas, margens, riscos…"
              disabled={loading}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
              padding: '10px 18px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1
            }}>Enviar</button>
          </div>
        </div>
      )}

      {tab === 'briefing' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
            Gera automaticamente um resumo executivo diário com KPIs, riscos, oportunidades e acções prioritárias.
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>HORIZONTE</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['7 dias', '30 dias', 'Trimestre', 'Anual'].map(h => (
                <button key={h} onClick={() => setHorizon(h)} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: horizon === h ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${horizon === h ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                  color: horizon === h ? '#fff' : '#94a3b8'
                }}>{h}</button>
              ))}
            </div>
          </div>
          <button onClick={() => generateBriefing('briefing')} disabled={loading} style={{
            padding: '12px 28px', background: '#6366f1', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.5 : 1
          }}>
            {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> A gerar…</> : <><Zap size={16} /> Gerar Briefing Executivo</>}
          </button>
        </div>
      )}

      {tab === 'devil' && (
        <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
            Perspectiva crítica independente — questiona decisões, identifica pontos cegos e riscos ignorados.
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>INTENSIDADE</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'mild', l: 'Suave' }, { v: 'moderate', l: 'Moderado' }, { v: 'brutal', l: '☠ Brutal' }].map(t => (
                <button key={t.v} onClick={() => setTone(t.v as any)} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: tone === t.v ? '#ef4444' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${tone === t.v ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  color: tone === t.v ? '#fff' : '#94a3b8'
                }}>{t.l}</button>
              ))}
            </div>
          </div>
          <button onClick={() => generateBriefing('devil')} disabled={loading} style={{
            padding: '12px 28px', background: '#ef4444', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.5 : 1
          }}>
            {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> A gerar…</> : <><Shield size={16} /> Activar Devil's Advocate</>}
          </button>
        </div>
      )}
    </SectionWrap>
  );
}

// ─── SETTINGS SECTION ────────────────────────────────────────────────────────
function SettingsSection({ settings, onUpdate }: { settings: AppSettings; onUpdate: (s: AppSettings) => void }) {
  const [s, setS] = useState(settings);
  const changed = JSON.stringify(s) !== JSON.stringify(settings);

  const update = (key: keyof AppSettings, val: any) => setS(prev => ({ ...prev, [key]: val }));
  const save = () => { saveSettings(s); onUpdate(s); };

  return (
    <SectionWrap title="Configurações" sub="Personalizar Copilot, alertas e exportações" province={null}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            title: 'Copilot AI', icon: Brain, items: [
              { label: 'Memória do Copilot (turnos)', key: 'copilotMemory' as const, type: 'range', min: 5, max: 30, step: 5 },
              { label: 'Intensidade Devil\'s Advocate', key: 'devilTone' as const, type: 'select', options: [{ v: 'mild', l: 'Suave' }, { v: 'moderate', l: 'Moderado' }, { v: 'brutal', l: 'Brutal' }] }
            ]
          },
          {
            title: 'Briefing Automático', icon: Bell, items: [
              { label: 'Activar Briefing Diário', key: 'briefingEnabled' as const, type: 'toggle' },
              { label: 'Hora do Briefing', key: 'briefingTime' as const, type: 'time' }
            ]
          }
        ].map(block => (
          <div key={block.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <block.icon size={16} color="#6366f1" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{block.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {block.items.map(item => (
                <div key={item.key}>
                  <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>{item.label.toUpperCase()}</label>
                  {item.type === 'range' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="range" min={(item as any).min} max={(item as any).max} step={(item as any).step}
                        value={s[item.key] as number} onChange={e => update(item.key, Number(e.target.value))}
                        style={{ flex: 1, accentColor: '#6366f1' }} />
                      <span style={{ color: '#f1f5f9', fontWeight: 700, minWidth: 30 }}>{s[item.key]}</span>
                    </div>
                  )}
                  {item.type === 'select' && (
                    <select value={s[item.key] as string} onChange={e => update(item.key, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, width: '100%' }}>
                      {(item as any).options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  )}
                  {item.type === 'toggle' && (
                    <div onClick={() => update(item.key, !(s[item.key] as boolean))} style={{
                      width: 44, height: 24, borderRadius: 12, background: s[item.key] ? '#6366f1' : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                    }}>
                      <div style={{ position: 'absolute', top: 3, left: s[item.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </div>
                  )}
                  {item.type === 'time' && (
                    <input type="time" value={s[item.key] as string} onChange={e => update(item.key, e.target.value)}
                      disabled={!s.briefingEnabled}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: s.briefingEnabled ? '#f1f5f9' : '#475569', fontSize: 13, width: '100%', opacity: s.briefingEnabled ? 1 : 0.5 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: 13, color: '#f59e0b', lineHeight: 1.5 }}>
        <strong>⏰ Briefing WhatsApp/Email:</strong> O briefing automático gera um resumo formatado que pode copiar para WhatsApp ou email.
        {s.briefingEnabled && <span> Activo às <strong>{s.briefingTime}</strong>.</span>}
        {!s.briefingEnabled && <span> Desactivado — active acima para configurar.</span>}
      </div>

      {changed && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={save} style={{ padding: '10px 24px', background: '#22c55e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={15} /> Guardar Configurações
          </button>
        </div>
      )}
    </SectionWrap>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV_ITEMS: { key: Section; icon: React.FC<any>; label: string; badge?: string }[] = [
  { key: 'overview',      icon: LayoutDashboard, label: 'Visão Geral' },
  { key: 'commodities',   icon: TrendingUp,      label: 'Commodities' },
  { key: 'distributors',  icon: Users,           label: 'Distribuidores' },
  { key: 'profitability', icon: BarChart3,        label: 'Rentabilidade' },
  { key: 'landed',        icon: Package,         label: 'Custo Landed' },
  { key: 'copilot',       icon: Brain,           label: 'Copilot AI',    badge: 'AI' },
  { key: 'briefings',     icon: FileText,        label: 'Briefings' },
  { key: 'news',          icon: Newspaper,       label: 'Notícias' },
  { key: 'settings',      icon: Settings,        label: 'Configurações' },
];

function Sidebar({ active, onSelect, province, collapsed, onToggle }: {
  active: Section; onSelect: (s: Section) => void; province: string | null;
  collapsed: boolean; onToggle: () => void;
}) {
  return (
    <aside style={{
      width: collapsed ? 64 : 220, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflowY: 'auto', overflowX: 'hidden', zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.3 }}>COMPASS</div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>ANGOALISSAR</div>
          </div>
        )}
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, display: 'flex' }}>
          <Menu size={18} />
        </button>
      </div>

      {/* Province scope */}
      {!collapsed && (
        <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <ProvinceScopePill province={province} />
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => onSelect(item.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 16px', justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderRight: 'none',
              borderTop: 'none', borderBottom: 'none'
            }}>
              <item.icon size={17} color={isActive ? '#818cf8' : '#475569'} />
              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#c7d2fe' : '#64748b', flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 8, background: '#6366f1', color: '#fff' }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini news feed */}
      {!collapsed && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px' }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={10} /> FEED · <ProvinceScopePill province={province} />
          </div>
          {getNewsFeed(province).slice(0, 3).map(n => (
            <div key={n.id} style={{ display: 'flex', gap: 6, marginBottom: 7, alignItems: 'flex-start' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: SENTIMENT_COLOR[n.sentiment], marginTop: 4, flexShrink: 0 }} />
              <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{n.headline.slice(0, 55)}…</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

// ─── PROVINCE SELECTOR ───────────────────────────────────────────────────────
function ProvinceBar({ province, onChange }: { province: string | null; onChange: (p: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, color: '#94a3b8', fontSize: 13, cursor: 'pointer'
      }}>
        <MapPin size={14} color="#818cf8" />
        <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{province || 'Todas as Províncias'}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, width: 220, background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: 6
        }}>
          <button onClick={() => { onChange(null); setOpen(false); }} style={{
            width: '100%', padding: '8px 12px', background: !province ? 'rgba(99,102,241,0.15)' : 'transparent',
            border: 'none', borderRadius: 6, color: !province ? '#818cf8' : '#64748b', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: !province ? 600 : 400
          }}>Todas as Províncias</button>
          {PROVINCES.map(p => (
            <button key={p} onClick={() => { onChange(p); setOpen(false); }} style={{
              width: '100%', padding: '7px 12px', background: province === p ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: 'none', borderRadius: 6, color: province === p ? '#818cf8' : '#64748b', textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: province === p ? 600 : 400
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [section, setSection] = useState<Section>('overview');
  const [province, setProvince] = useState<string | null>(() => loadProvince());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { saveProvince(province); }, [province]);

  const handleSelect = useCallback((s: Section) => {
    setSection(s);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'DM Mono', 'IBM Plex Mono', monospace" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media(max-width:768px){
          .sidebar-desktop{display:none!important}
          .main-content{margin-left:0!important;max-width:100vw!important}
          .two-col{grid-template-columns:1fr!important}
          .kpi-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar active={section} onSelect={handleSelect} province={province} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 240, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <Sidebar active={section} onSelect={handleSelect} province={province} collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="main-content" style={{ flex: 1, minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,23,42,0.9)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'none', padding: 4
            }} className="mobile-menu-btn">
              <Menu size={20} />
            </button>
            <style>{`.mobile-menu-btn{display:flex!important} @media(min-width:769px){.mobile-menu-btn{display:none!important}}`}</style>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{NAV_ITEMS.find(n => n.key === section)?.label}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>ANGOALISSAR COMPASS · {new Date().toLocaleDateString('pt-AO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <ProvinceBar province={province} onChange={setProvince} />
            <button onClick={() => setCsvOpen(true)} style={{
              padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 28px', maxWidth: 1200 }}>
          {section === 'overview'      && <OverviewSection province={province} />}
          {section === 'commodities'   && <CommoditiesSection province={province} />}
          {section === 'distributors'  && <DistributorsSection province={province} />}
          {section === 'profitability' && <ProfitabilitySection province={province} />}
          {section === 'landed'        && <LandedCostSection province={province} />}
          {section === 'copilot'       && <CopilotSection province={province} settings={settings} />}
          {section === 'briefings'     && <SavedBriefingsSection province={province} />}
          {section === 'news'          && <NewsSection province={province} />}
          {section === 'settings'      && <SettingsSection settings={settings} onUpdate={setSettings} />}
        </div>
      </main>

      <CsvExportModal open={csvOpen} onClose={() => setCsvOpen(false)} province={province} />
    </div>
  );
}
