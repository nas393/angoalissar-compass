export const PROVINCES = [
  "Luanda","Benguela","Huíla","Cabinda","Cuanza Norte","Cuanza Sul",
  "Malanje","Lunda Norte","Namibe","Uíge","Huambo","Bié","Cunene",
  "Moxico","Zaire","Bengo","Lunda Sul","Cuando Cubango"
];

export const COMMODITIES = ["Rice","Maize","Beans","Oil","Sugar","Flour"];

export const BRANDS = ["Madrugada","Águia","Stallion","Patriota","Uncle Sam"];

export const REGIONS = ["Luanda","Benguela","Huambo","Lobito","Lubango","Cabinda","Namibe","Uíge"];

export const CHANNELS = ["Wholesale","Retail","HoReCa","Modern Trade"];

export const SALESPERSONS = ["António","Maria","Carlos","Fernanda","João","Beatriz"];

export const PROVINCE_MAP_COORDS = [
  {id:"Luanda",    cx:95,  cy:165, r:16},
  {id:"Benguela",  cx:75,  cy:210, r:14},
  {id:"Huíla",     cx:110, cy:265, r:13},
  {id:"Cabinda",   cx:80,  cy:100, r:11},
  {id:"Huambo",    cx:135, cy:235, r:13},
  {id:"Namibe",    cx:68,  cy:290, r:11},
  {id:"Uíge",      cx:120, cy:120, r:11},
  {id:"Malanje",   cx:170, cy:165, r:11},
  {id:"Bié",       cx:165, cy:225, r:12},
  {id:"Lunda Norte",cx:245,cy:130, r:11},
  {id:"Lunda Sul", cx:235, cy:185, r:11},
  {id:"Moxico",    cx:235, cy:245, r:12},
  {id:"Cuanza Norte",cx:125,cy:145,r:10},
  {id:"Cuanza Sul",cx:110, cy:195, r:11},
  {id:"Cuando Cubango",cx:205,cy:295,r:12},
  {id:"Cunene",    cx:135, cy:310, r:11},
  {id:"Zaire",     cx:95,  cy:108, r:10},
  {id:"Bengo",     cx:100, cy:148, r:10},
];

export const C = {
  cyan:     "#00e5ff",
  cyanDim:  "#00b8cc",
  blue:     "#0066ff",
  neonGreen:"#00ff88",
  amber:    "#ffaa00",
  red:      "#ff3b5c",
  purple:   "#a855f7",
  bg:       "#010810",
  panel:    "rgba(0,18,35,0.75)",
  border:   "rgba(0,220,255,0.12)",
  borderHi: "rgba(0,220,255,0.45)",
  text:     "#e0f7ff",
  textDim:  "#3a6070",
  textMid:  "#7aacbc",
} as const;

export const GLOW = (color: string, size = 12) =>
  `0 0 ${size}px ${color}40, 0 0 ${size * 2}px ${color}18`;

export const PANEL = {
  background: "rgba(0,14,28,0.82)",
  border: "1px solid rgba(0,220,255,0.12)",
  borderRadius: 12,
  backdropFilter: "blur(14px)",
};

export const TOOLTIP_STYLE = {
  background: "rgba(0,10,22,0.97)",
  border: "1px solid rgba(0,220,255,0.2)",
  borderRadius: 8,
  fontSize: 11,
  color: "#e0f7ff",
  fontFamily: "var(--font-mono)",
};

export const SENT_COLOR: Record<string,string> = {
  positive: "#00ff88",
  neutral:  "#ffaa00",
  negative: "#ff3b5c",
};

export const CAT_COLOR: Record<string,string> = {
  macro:      "#00e5ff",
  commodity:  "#ffaa00",
  competitor: "#ff3b5c",
  regulatory: "#00ff88",
};
