// Seed script for SiteFlow reference data
// Run: node scripts/seed-reference-data.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiOXnYupQ_oVAMJ95KEpfECW5l-m8Gb20",
  authDomain: "site-daily-app.firebaseapp.com",
  projectId: "site-daily-app",
  storageBucket: "site-daily-app.firebasestorage.app",
  messagingSenderId: "254198216229",
  appId: "1:254198216229:web:9b4406a033a5a33f2771cc",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── TRADES ───
const trades = [
  { id: "civil-earthworks", nameEn: "Civil / Earthworks", nameZh: "土木/土方工程", standardUnit: "m³", primaryLaborTypes: ["operator", "laborer"], active: true },
  { id: "excavation", nameEn: "Excavation", nameZh: "挖掘工程", standardUnit: "m³", primaryLaborTypes: ["excavator-operator", "laborer"], active: true },
  { id: "rock-breaking", nameEn: "Rock Breaking / Drilling", nameZh: "碎石/鑽孔工程", standardUnit: "m³", primaryLaborTypes: ["rock-breaking-driller", "laborer"], active: true },
  { id: "piling-bored", nameEn: "Piling (Bored)", nameZh: "鑽孔樁工程", standardUnit: "linear m", primaryLaborTypes: ["piling-operator", "labourer"], active: true },
  { id: "piling-driven", nameEn: "Piling (Driven)", nameZh: "打樁工程", standardUnit: "nos.", primaryLaborTypes: ["piling-operator", "labourer"], active: true },
  { id: "structural-steel", nameEn: "Structural Steel", nameZh: "結構鋼鐵工程", standardUnit: "tonnes", primaryLaborTypes: ["welder", "rigger", "helper"], active: true },
  { id: "reinforced-concrete", nameEn: "Reinforced Concrete", nameZh: "鋼筋混凝土工程", standardUnit: "m³", primaryLaborTypes: ["carpenter", "steel-fixer", "concretor"], active: true },
  { id: "bar-bending", nameEn: "Bar Bending & Fixing", nameZh: "鋼筋紮鐵工程", standardUnit: "tonnes", primaryLaborTypes: ["bar-bender", "steel-fixer"], active: true },
  { id: "formwork", nameEn: "Formwork (Timber/Metal)", nameZh: "模板工程", standardUnit: "m²", primaryLaborTypes: ["carpenter-formwork"], active: true },
  { id: "bricklaying", nameEn: "Bricklaying / Blockwork", nameZh: "磚石砌築工程", standardUnit: "m²", primaryLaborTypes: ["bricklayer", "labourer"], active: true },
  { id: "plastering", nameEn: "Plastering / Rendering", nameZh: "批盪/抹灰工程", standardUnit: "m²", primaryLaborTypes: ["plasterer"], active: true },
  { id: "tiling", nameEn: "Tiling", nameZh: "鋪磚工程", standardUnit: "m²", primaryLaborTypes: ["tiler"], active: true },
  { id: "marble-stone", nameEn: "Marble / Stone", nameZh: "雲石/石材工程", standardUnit: "m²", primaryLaborTypes: ["marble-worker", "mason"], active: true },
  { id: "painting", nameEn: "Painting & Decorating", nameZh: "油漆及裝飾工程", standardUnit: "m²", primaryLaborTypes: ["painter-decorator"], active: true },
  { id: "plumbing-drainage", nameEn: "Plumbing & Drainage", nameZh: "水管及排水工程", standardUnit: "linear m", primaryLaborTypes: ["plumber"], active: true },
  { id: "electrical", nameEn: "Electrical Installation", nameZh: "電力安裝工程", standardUnit: "nos. / points", primaryLaborTypes: ["electrician", "electrical-fitter"], active: true },
  { id: "cable-jointing", nameEn: "Cable Jointing (Power)", nameZh: "電纜接駁工程", standardUnit: "nos.", primaryLaborTypes: ["cable-jointer"], active: true },
  { id: "hvac", nameEn: "Mechanical (HVAC)", nameZh: "機械通風空調工程", standardUnit: "nos. / units", primaryLaborTypes: ["hvac-fitter", "mechanic"], active: true },
  { id: "fire-services", nameEn: "Fire Services Installation", nameZh: "消防設備安裝工程", standardUnit: "nos. / points", primaryLaborTypes: ["fire-services-fitter"], active: true },
  { id: "bamboo-scaffolding", nameEn: "Bamboo Scaffolding", nameZh: "搭棚工程(竹)", standardUnit: "m²", primaryLaborTypes: ["bamboo-scaffolder"], active: true },
  { id: "metal-scaffolding", nameEn: "Metal Scaffolding", nameZh: "搭棚工程(金屬)", standardUnit: "m²", primaryLaborTypes: ["metal-scaffolder"], active: true },
  { id: "diving-marine", nameEn: "Diving / Marine", nameZh: "潛水/海事工程", standardUnit: "hrs", primaryLaborTypes: ["diver", "divers-lineman"], active: true },
  { id: "asphalt-roadwork", nameEn: "Asphalt / Roadwork", nameZh: "瀝青/道路工程", standardUnit: "m² / tonnes", primaryLaborTypes: ["asphalter", "roller-operator"], active: true },
  { id: "landscaping", nameEn: "Landscaping", nameZh: "園境工程", standardUnit: "m²", primaryLaborTypes: ["landscaper", "labourer"], active: true },
  { id: "concreting", nameEn: "Concreting", nameZh: "混凝土工程", standardUnit: "m³", primaryLaborTypes: ["concretor", "concrete-labourer"], active: true },
  { id: "curtain-wall", nameEn: "Curtain Wall / Glazing", nameZh: "幕牆/玻璃工程", standardUnit: "m²", primaryLaborTypes: ["glazer", "metal-worker"], active: true },
  { id: "waterproofing", nameEn: "Waterproofing", nameZh: "防水工程", standardUnit: "m²", primaryLaborTypes: ["waterproofing-specialist"], active: true },
  { id: "demolition", nameEn: "Demolition", nameZh: "拆卸工程", standardUnit: "m³ / m²", primaryLaborTypes: ["demolition-worker", "labourer"], active: true },
  { id: "tunnelling", nameEn: "Tunnelling", nameZh: "隧道工程", standardUnit: "linear m", primaryLaborTypes: ["miner", "tunnelling-operative", "shotcreter"], active: true },
  { id: "general-works", nameEn: "General Works", nameZh: "雜項工程", standardUnit: "lump sum", primaryLaborTypes: ["general-worker"], active: true },
];

// ─── LABOR ROLES ───
const laborRoles = [
  { id: "foreman", nameEn: "Foreman", nameZh: "管工", category: "supervision", active: true },
  { id: "skilled-worker", nameEn: "Skilled Worker", nameZh: "熟練工人", category: "skilled", active: true },
  { id: "semi-skilled-worker", nameEn: "Semi-Skilled Worker", nameZh: "半熟練工人", category: "semi-skilled", active: true },
  { id: "general-worker", nameEn: "General Worker", nameZh: "普通工人", category: "general", active: true },
  { id: "operator", nameEn: "Operator", nameZh: "操作員", category: "skilled", active: true },
];

// ─── CONSTRAINTS ───
const constraints = [
  { id: "low-headroom", category: "environmental", categoryZh: "環境", nameEn: "Low Headroom", nameZh: "低淨空", active: true },
  { id: "confined-space", category: "environmental", categoryZh: "環境", nameEn: "Confined Space", nameZh: "密閉空間", active: true },
  { id: "extreme-weather", category: "environmental", categoryZh: "環境", nameEn: "Extreme Weather", nameZh: "惡劣天氣", active: true },
  { id: "high-temperature", category: "environmental", categoryZh: "環境", nameEn: "High Temperature", nameZh: "高溫", active: true },
  { id: "heavy-rain-typhoon", category: "environmental", categoryZh: "環境", nameEn: "Heavy Rain / Typhoon", nameZh: "暴雨/颱風", active: true },
  { id: "material-delay", category: "logistical", categoryZh: "物流", nameEn: "Material Delay", nameZh: "物料延誤", active: true },
  { id: "site-access", category: "logistical", categoryZh: "物流", nameEn: "Site Access Issues", nameZh: "地盤出入口問題", active: true },
  { id: "tower-crane-downtime", category: "logistical", categoryZh: "物流", nameEn: "Tower Crane Downtime", nameZh: "塔吊停機", active: true },
  { id: "congestion", category: "logistical", categoryZh: "物流", nameEn: "Congestion / Overcrowding", nameZh: "擠迫", active: true },
  { id: "rfi-pending", category: "technical", categoryZh: "技術", nameEn: "RFI Pending", nameZh: "待批核工程查詢", active: true },
  { id: "design-conflict", category: "technical", categoryZh: "技術", nameEn: "Design Conflict", nameZh: "設計衝突", active: true },
  { id: "permit-issue", category: "technical", categoryZh: "技術", nameEn: "Permit Issue", nameZh: "許可證問題", active: true },
  { id: "drawing-revision", category: "technical", categoryZh: "技術", nameEn: "Drawing Revision", nameZh: "圖則修訂", active: true },
  { id: "labour-shortage", category: "resource", categoryZh: "資源", nameEn: "Labour Shortage", nameZh: "人手不足", active: true },
  { id: "plant-breakdown", category: "resource", categoryZh: "資源", nameEn: "Plant Breakdown", nameZh: "機械故障", active: true },
  { id: "material-shortage", category: "resource", categoryZh: "資源", nameEn: "Material Shortage", nameZh: "物料短缺", active: true },
];

// ─── WEATHER OPTIONS ───
const weatherOptions = [
  { id: "sunny", nameEn: "Sunny", nameZh: "晴天", icon: "☀️", active: true },
  { id: "cloudy", nameEn: "Cloudy", nameZh: "多雲", icon: "⛅", active: true },
  { id: "overcast", nameEn: "Overcast", nameZh: "陰天", icon: "☁️", active: true },
  { id: "light-rain", nameEn: "Light Rain", nameZh: "小雨", icon: "🌧️", active: true },
  { id: "heavy-rain", nameEn: "Heavy Rain", nameZh: "大雨", icon: "🌧️⛈️", active: true },
  { id: "amber-rainstorm", nameEn: "Amber Rainstorm Signal", nameZh: "黃色暴雨警告", icon: "🟡🌧️", active: true },
  { id: "red-rainstorm", nameEn: "Red Rainstorm Signal", nameZh: "紅色暴雨警告", icon: "🔴🌧️", active: true },
  { id: "black-rainstorm", nameEn: "Black Rainstorm Signal", nameZh: "黑色暴雨警告", icon: "⚫🌧️", active: true },
  { id: "thunderstorm", nameEn: "Thunderstorm", nameZh: "雷暴", icon: "⛈️", active: true },
  { id: "typhoon-1", nameEn: "Typhoon Signal No.1", nameZh: "颱風一號信號", icon: "🌀", active: true },
  { id: "typhoon-3", nameEn: "Typhoon Signal No.3", nameZh: "颱風三號信號", icon: "🌀", active: true },
  { id: "typhoon-8", nameEn: "Typhoon Signal No.8+", nameZh: "颱風八號或以上信號", icon: "🌀🔴", active: true },
  { id: "hot-weather", nameEn: "Hot Weather Warning", nameZh: "炎熱天氣警告", icon: "🌡️", active: true },
  { id: "cold-weather", nameEn: "Cold Weather Warning", nameZh: "寒冷天氣警告", icon: "❄️", active: true },
  { id: "foggy", nameEn: "Foggy / Low Visibility", nameZh: "有霧/能見度低", icon: "🌫️", active: true },
  { id: "windy", nameEn: "Windy", nameZh: "大風", icon: "💨", active: true },
];

// ─── PLANT CATALOG (key entries) ───
const plantCatalog = [
  // Excavators
  { id: "cat-320", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 320", active: true },
  { id: "cat-330", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 330", active: true },
  { id: "cat-336", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 336", active: true },
  { id: "cat-340", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 340", active: true },
  { id: "cat-349", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 349", active: true },
  { id: "kom-pc200", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC200", active: true },
  { id: "kom-pc210", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC210", active: true },
  { id: "kom-pc220", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC220", active: true },
  { id: "kom-pc300", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC300", active: true },
  { id: "kom-pc360", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC360", active: true },
  { id: "kom-pc490", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC490", active: true },
  { id: "hit-zx200", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Hitachi", model: "ZX200", active: true },
  { id: "hit-zx210", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Hitachi", model: "ZX210", active: true },
  { id: "hit-zx270", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Hitachi", model: "ZX270", active: true },
  { id: "hit-zx350", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Hitachi", model: "ZX350", active: true },
  { id: "vol-ec210", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC210", active: true },
  { id: "vol-ec220", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC220", active: true },
  { id: "vol-ec290", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC290", active: true },
  { id: "vol-ec350", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC350", active: true },
  { id: "vol-ec380", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC380", active: true },
  { id: "kob-sk200", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Kobelco", model: "SK200", active: true },
  { id: "kob-sk210", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Kobelco", model: "SK210", active: true },
  { id: "kob-sk260", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Kobelco", model: "SK260", active: true },
  { id: "kob-sk350", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Kobelco", model: "SK350", active: true },
  { id: "doo-dx210", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Doosan", model: "DX210", active: true },
  { id: "doo-dx225", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Doosan", model: "DX225", active: true },
  { id: "doo-dx300", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Doosan", model: "DX300", active: true },
  { id: "doo-dx380", category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Doosan", model: "DX380", active: true },
  // Mini Excavators
  { id: "kom-pc55", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Komatsu", model: "PC55", active: true },
  { id: "kom-pc78", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Komatsu", model: "PC78", active: true },
  { id: "kom-pc88", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Komatsu", model: "PC88", active: true },
  { id: "cat-3018", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Caterpillar", model: "301.8", active: true },
  { id: "cat-3055", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Caterpillar", model: "305.5", active: true },
  { id: "cat-308", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Caterpillar", model: "308", active: true },
  { id: "kub-kx040", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "KX040", active: true },
  { id: "kub-kx057", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "KX057", active: true },
  { id: "kub-kx080", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "KX080", active: true },
  { id: "kub-u17", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "U17", active: true },
  { id: "kub-u27", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "U27", active: true },
  { id: "kub-u35", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Kubota", model: "U35", active: true },
  { id: "yan-vio25", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Yanmar", model: "ViO25", active: true },
  { id: "yan-vio35", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Yanmar", model: "ViO35", active: true },
  { id: "yan-vio50", category: "mini-excavator", categoryEn: "Mini Excavators", categoryZh: "迷你挖掘機", brand: "Yanmar", model: "ViO50", active: true },
  // Mobile Cranes
  { id: "tad-gr250n", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Tadano", model: "GR-250N", active: true },
  { id: "tad-gr500ex", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Tadano", model: "GR-500EX", active: true },
  { id: "tad-gr600ex", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Tadano", model: "GR-600EX", active: true },
  { id: "tad-atf220g5", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Tadano", model: "ATF 220G-5", active: true },
  { id: "lie-ltm1030", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Liebherr", model: "LTM 1030", active: true },
  { id: "lie-ltm1100", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Liebherr", model: "LTM 1100", active: true },
  { id: "lie-ltm1300", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Liebherr", model: "LTM 1300", active: true },
  { id: "kat-nk250", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Kato", model: "NK-250", active: true },
  { id: "kat-nk350", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Kato", model: "NK-350", active: true },
  { id: "kat-nk500", category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Kato", model: "NK-500", active: true },
  // Tower Cranes
  { id: "lie-63hc", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Liebherr", model: "63 HC", active: true },
  { id: "lie-132ec", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Liebherr", model: "132 EC-H", active: true },
  { id: "lie-280ec", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Liebherr", model: "280 EC-H", active: true },
  { id: "lie-550ec", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Liebherr", model: "550 EC-H", active: true },
  { id: "pot-mct205", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Potain", model: "MCT 205", active: true },
  { id: "pot-mdt259", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Potain", model: "MDT 259", active: true },
  { id: "pot-mdt389", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Potain", model: "MDT 389", active: true },
  { id: "zoom-tc5610", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Zoomlion", model: "TC5610", active: true },
  { id: "zoom-tc6015", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Zoomlion", model: "TC6015", active: true },
  { id: "zoom-tc7035", category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Zoomlion", model: "TC7035", active: true },
  // Lorry Cranes
  { id: "tad-tr250m", category: "lorry-crane", categoryEn: "Lorry Cranes", categoryZh: "貨車吊機", brand: "Tadano", model: "TR-250M", active: true },
  { id: "tad-tr500ex", category: "lorry-crane", categoryEn: "Lorry Cranes", categoryZh: "貨車吊機", brand: "Tadano", model: "TR-500EX", active: true },
  { id: "fur-unic376", category: "lorry-crane", categoryEn: "Lorry Cranes", categoryZh: "貨車吊機", brand: "Furukawa", model: "UNIC-376", active: true },
  { id: "fur-ur643", category: "lorry-crane", categoryEn: "Lorry Cranes", categoryZh: "貨車吊機", brand: "Furukawa", model: "UR-643", active: true },
  // Rollers
  { id: "bom-bw120", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "BOMAG", model: "BW 120", active: true },
  { id: "bom-bw138", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "BOMAG", model: "BW 138", active: true },
  { id: "bom-bw177", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "BOMAG", model: "BW 177", active: true },
  { id: "bom-bw213", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "BOMAG", model: "BW 213", active: true },
  { id: "ham-hd120", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "Hamm", model: "HD+ 120", active: true },
  { id: "ham-hd140", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "Hamm", model: "HD+ 140", active: true },
  { id: "ham-h20i", category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "Hamm", model: "H 20i", active: true },
  // Concrete Breakers
  { id: "atc-hb3100", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Atlas Copco", model: "HB 3100", active: true },
  { id: "atc-hb4200", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Atlas Copco", model: "HB 4200", active: true },
  { id: "atc-hb5200", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Atlas Copco", model: "HB 5200", active: true },
  { id: "ind-hp3500", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Indeco", model: "HP 3500", active: true },
  { id: "ind-hp5000", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Indeco", model: "HP 5000", active: true },
  { id: "ind-hp7000", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Indeco", model: "HP 7000", active: true },
  { id: "npk-h20x", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "NPK", model: "H-20X", active: true },
  { id: "npk-h30x", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "NPK", model: "H-30X", active: true },
  { id: "npk-h40x", category: "breaker", categoryEn: "Excavator + Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "NPK", model: "H-40X", active: true },
  // Bored Pile Machines
  { id: "bau-bg28", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 28", active: true },
  { id: "bau-bg36", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 36", active: true },
  { id: "bau-bg46", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 46", active: true },
  { id: "bau-bg72", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 72", active: true },
  { id: "lie-lrb255", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Liebherr", model: "LRB 255", active: true },
  { id: "lie-lrb355", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Liebherr", model: "LRB 355", active: true },
  { id: "lie-lrb455", category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Liebherr", model: "LRB 455", active: true },
  // Generators
  { id: "cat-de110", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Caterpillar", model: "DE110", active: true },
  { id: "cat-de175", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Caterpillar", model: "DE175", active: true },
  { id: "cat-de275", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Caterpillar", model: "DE275", active: true },
  { id: "cat-de400", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Caterpillar", model: "DE400", active: true },
  { id: "cum-100kva", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Cummins", model: "100 kVA", active: true },
  { id: "cum-200kva", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Cummins", model: "200 kVA", active: true },
  { id: "cum-500kva", category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Cummins", model: "500 kVA", active: true },
  // Pumps
  { id: "hon-wb20", category: "pump", categoryEn: "Pumps", categoryZh: "抽水機", brand: "Honda", model: "WB20", active: true },
  { id: "hon-wb30", category: "pump", categoryEn: "Pumps", categoryZh: "抽水機", brand: "Honda", model: "WB30", active: true },
  { id: "tsu-ktz35", category: "pump", categoryEn: "Pumps", categoryZh: "抽水機", brand: "Tsurumi", model: "KTZ35", active: true },
  { id: "tsu-ktz55", category: "pump", categoryEn: "Pumps", categoryZh: "抽水機", brand: "Tsurumi", model: "KTZ55", active: true },
  // Concrete Pumps
  { id: "put-bsf36z", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Putzmeister", model: "BSF 36Z", active: true },
  { id: "put-bsf42z", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Putzmeister", model: "BSF 42Z", active: true },
  { id: "put-bsf58z", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Putzmeister", model: "BSF 58Z", active: true },
  { id: "sch-s36sx", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Schwing", model: "S 36 SX", active: true },
  { id: "sch-s39sx", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Schwing", model: "S 39 SX", active: true },
  { id: "sch-s58sx", category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Schwing", model: "S 58 SX", active: true },
  // Bulldozers
  { id: "cat-d5", category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D5", active: true },
  { id: "cat-d6", category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D6", active: true },
  { id: "cat-d8", category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D8", active: true },
  { id: "cat-d10", category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D10", active: true },
];

async function seed() {
  console.log('🌱 Seeding reference data...\n');

  // Seed in batches to avoid Firestore limits
  const batchSize = 20;

  for (const [collName, data] of [
    ['trades', trades],
    ['laborRoles', laborRoles],
    ['constraints', constraints],
    ['weatherOptions', weatherOptions],
    ['plantCatalog', plantCatalog],
  ]) {
    console.log(`📦 ${collName}: ${data.length} entries`);
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const writeBatch_ = writeBatch(db);
      for (const item of batch) {
        writeBatch_.set(doc(db, collName, item.id), item);
      }
      await writeBatch_.commit();
    }
    console.log(`  ✅ Done`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`  Trades: ${trades.length}`);
  console.log(`  Labor Roles: ${laborRoles.length}`);
  console.log(`  Constraints: ${constraints.length}`);
  console.log(`  Weather Options: ${weatherOptions.length}`);
  console.log(`  Plant Catalog: ${plantCatalog.length}`);
  console.log(`  Total: ${trades.length + laborRoles.length + constraints.length + weatherOptions.length + plantCatalog.length} records`);

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
