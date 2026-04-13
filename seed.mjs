import { initializeApp } from './node_modules/firebase/app/dist/esm/index.esm.js';
import { getFirestore, doc, writeBatch } from './node_modules/firebase/firestore/dist/esm/index.esm.js';

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

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const trades = [
  { nameEn: "Civil / Earthworks", nameZh: "土木/土方工程", standardUnit: "m³", primaryLaborTypes: ["operator", "laborer"], active: true },
  { nameEn: "Excavation", nameZh: "挖掘工程", standardUnit: "m³", primaryLaborTypes: ["excavator-operator", "laborer"], active: true },
  { nameEn: "Rock Breaking / Drilling", nameZh: "碎石/鑽孔工程", standardUnit: "m³", primaryLaborTypes: ["rock-breaking-driller", "laborer"], active: true },
  { nameEn: "Piling (Bored)", nameZh: "鑽孔樁工程", standardUnit: "linear m", primaryLaborTypes: ["piling-operator", "labourer"], active: true },
  { nameEn: "Piling (Driven)", nameZh: "打樁工程", standardUnit: "nos.", primaryLaborTypes: ["piling-operator", "labourer"], active: true },
  { nameEn: "Structural Steel", nameZh: "結構鋼鐵工程", standardUnit: "tonnes", primaryLaborTypes: ["welder", "rigger", "helper"], active: true },
  { nameEn: "Reinforced Concrete", nameZh: "鋼筋混凝土工程", standardUnit: "m³", primaryLaborTypes: ["carpenter", "steel-fixer", "concretor"], active: true },
  { nameEn: "Bar Bending & Fixing", nameZh: "鋼筋紮鐵工程", standardUnit: "tonnes", primaryLaborTypes: ["bar-bender", "steel-fixer"], active: true },
  { nameEn: "Formwork (Timber/Metal)", nameZh: "模板工程", standardUnit: "m²", primaryLaborTypes: ["carpenter-formwork"], active: true },
  { nameEn: "Bricklaying / Blockwork", nameZh: "磚石砌築工程", standardUnit: "m²", primaryLaborTypes: ["bricklayer", "labourer"], active: true },
  { nameEn: "Plastering / Rendering", nameZh: "批盪/抹灰工程", standardUnit: "m²", primaryLaborTypes: ["plasterer"], active: true },
  { nameEn: "Tiling", nameZh: "鋪磚工程", standardUnit: "m²", primaryLaborTypes: ["tiler"], active: true },
  { nameEn: "Marble / Stone", nameZh: "雲石/石材工程", standardUnit: "m²", primaryLaborTypes: ["marble-worker", "mason"], active: true },
  { nameEn: "Painting & Decorating", nameZh: "油漆及裝飾工程", standardUnit: "m²", primaryLaborTypes: ["painter-decorator"], active: true },
  { nameEn: "Plumbing & Drainage", nameZh: "水管及排水工程", standardUnit: "linear m", primaryLaborTypes: ["plumber"], active: true },
  { nameEn: "Electrical Installation", nameZh: "電力安裝工程", standardUnit: "nos. / points", primaryLaborTypes: ["electrician", "electrical-fitter"], active: true },
  { nameEn: "Cable Jointing (Power)", nameZh: "電纜接駁工程", standardUnit: "nos.", primaryLaborTypes: ["cable-jointer"], active: true },
  { nameEn: "Mechanical (HVAC)", nameZh: "機械通風空調工程", standardUnit: "nos. / units", primaryLaborTypes: ["hvac-fitter", "mechanic"], active: true },
  { nameEn: "Fire Services Installation", nameZh: "消防設備安裝工程", standardUnit: "nos. / points", primaryLaborTypes: ["fire-services-fitter"], active: true },
  { nameEn: "Bamboo Scaffolding", nameZh: "搭棚工程(竹)", standardUnit: "m²", primaryLaborTypes: ["bamboo-scaffolder"], active: true },
  { nameEn: "Metal Scaffolding", nameZh: "搭棚工程(金屬)", standardUnit: "m²", primaryLaborTypes: ["metal-scaffolder"], active: true },
  { nameEn: "Diving / Marine", nameZh: "潛水/海事工程", standardUnit: "hrs", primaryLaborTypes: ["diver", "divers-lineman"], active: true },
  { nameEn: "Asphalt / Roadwork", nameZh: "瀝青/道路工程", standardUnit: "m² / tonnes", primaryLaborTypes: ["asphalter", "roller-operator"], active: true },
  { nameEn: "Landscaping", nameZh: "園境工程", standardUnit: "m²", primaryLaborTypes: ["landscaper", "labourer"], active: true },
  { nameEn: "Concreting", nameZh: "混凝土工程", standardUnit: "m³", primaryLaborTypes: ["concretor", "concrete-labourer"], active: true },
  { nameEn: "Curtain Wall / Glazing", nameZh: "幕牆/玻璃工程", standardUnit: "m²", primaryLaborTypes: ["glazer", "metal-worker"], active: true },
  { nameEn: "Waterproofing", nameZh: "防水工程", standardUnit: "m²", primaryLaborTypes: ["waterproofing-specialist"], active: true },
  { nameEn: "Demolition", nameZh: "拆卸工程", standardUnit: "m³ / m²", primaryLaborTypes: ["demolition-worker", "labourer"], active: true },
  { nameEn: "Tunnelling", nameZh: "隧道工程", standardUnit: "linear m", primaryLaborTypes: ["miner", "tunnelling-operative", "shotcreter"], active: true },
  { nameEn: "General Works", nameZh: "雜項工程", standardUnit: "lump sum", primaryLaborTypes: ["general-worker"], active: true },
];

const laborRoles = [
  { nameEn: "Foreman", nameZh: "管工", category: "supervision", active: true },
  { nameEn: "Skilled Worker", nameZh: "熟練工人", category: "skilled", active: true },
  { nameEn: "Semi-Skilled Worker", nameZh: "半熟練工人", category: "semi-skilled", active: true },
  { nameEn: "General Worker", nameZh: "普通工人", category: "general", active: true },
  { nameEn: "Operator", nameZh: "操作員", category: "skilled", active: true },
];

const constraints = [
  { category: "environmental", categoryZh: "環境", nameEn: "Low Headroom", nameZh: "低淨空", active: true },
  { category: "environmental", categoryZh: "環境", nameEn: "Confined Space", nameZh: "密閉空間", active: true },
  { category: "environmental", categoryZh: "環境", nameEn: "Extreme Weather", nameZh: "惡劣天氣", active: true },
  { category: "environmental", categoryZh: "環境", nameEn: "High Temperature", nameZh: "高溫", active: true },
  { category: "environmental", categoryZh: "環境", nameEn: "Heavy Rain / Typhoon", nameZh: "暴雨/颱風", active: true },
  { category: "logistical", categoryZh: "物流", nameEn: "Material Delay", nameZh: "物料延誤", active: true },
  { category: "logistical", categoryZh: "物流", nameEn: "Site Access Issues", nameZh: "地盤出入口問題", active: true },
  { category: "logistical", categoryZh: "物流", nameEn: "Tower Crane Downtime", nameZh: "塔吊停機", active: true },
  { category: "logistical", categoryZh: "物流", nameEn: "Congestion / Overcrowding", nameZh: "擠迫", active: true },
  { category: "technical", categoryZh: "技術", nameEn: "RFI Pending", nameZh: "待批核工程查詢", active: true },
  { category: "technical", categoryZh: "技術", nameEn: "Design Conflict", nameZh: "設計衝突", active: true },
  { category: "technical", categoryZh: "技術", nameEn: "Permit Issue", nameZh: "許可證問題", active: true },
  { category: "technical", categoryZh: "技術", nameEn: "Drawing Revision", nameZh: "圖則修訂", active: true },
  { category: "resource", categoryZh: "資源", nameEn: "Labour Shortage", nameZh: "人手不足", active: true },
  { category: "resource", categoryZh: "資源", nameEn: "Plant Breakdown", nameZh: "機械故障", active: true },
  { category: "resource", categoryZh: "資源", nameEn: "Material Shortage", nameZh: "物料短缺", active: true },
];

const weatherOptions = [
  { nameEn: "Sunny", nameZh: "晴天", icon: "☀️", active: true },
  { nameEn: "Cloudy", nameZh: "多雲", icon: "⛅", active: true },
  { nameEn: "Overcast", nameZh: "陰天", icon: "☁️", active: true },
  { nameEn: "Light Rain", nameZh: "小雨", icon: "🌧️", active: true },
  { nameEn: "Heavy Rain", nameZh: "大雨", icon: "🌧️⛈️", active: true },
  { nameEn: "Amber Rainstorm Signal", nameZh: "黃色暴雨警告", icon: "🟡🌧️", active: true },
  { nameEn: "Red Rainstorm Signal", nameZh: "紅色暴雨警告", icon: "🔴🌧️", active: true },
  { nameEn: "Black Rainstorm Signal", nameZh: "黑色暴雨警告", icon: "⚫🌧️", active: true },
  { nameEn: "Thunderstorm", nameZh: "雷暴", icon: "⛈️", active: true },
  { nameEn: "Typhoon Signal No.1", nameZh: "颱風一號信號", icon: "🌀", active: true },
  { nameEn: "Typhoon Signal No.3", nameZh: "颱風三號信號", icon: "🌀", active: true },
  { nameEn: "Typhoon Signal No.8+", nameZh: "颱風八號或以上信號", icon: "🌀🔴", active: true },
  { nameEn: "Hot Weather Warning", nameZh: "炎熱天氣警告", icon: "🌡️", active: true },
  { nameEn: "Cold Weather Warning", nameZh: "寒冷天氣警告", icon: "❄️", active: true },
  { nameEn: "Foggy / Low Visibility", nameZh: "有霧/能見度低", icon: "🌫️", active: true },
  { nameEn: "Windy", nameZh: "大風", icon: "💨", active: true },
];

const plantCatalog = [
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 320", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 330", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Caterpillar", model: "CAT 336", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC200", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Komatsu", model: "PC300", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Hitachi", model: "ZX200", active: true },
  { category: "excavator", categoryEn: "Excavators", categoryZh: "挖掘機", brand: "Volvo", model: "EC210", active: true },
  { category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Tadano", model: "GR-250N", active: true },
  { category: "mobile-crane", categoryEn: "Mobile Cranes", categoryZh: "流動式起重機", brand: "Liebherr", model: "LTM 1030", active: true },
  { category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Liebherr", model: "63 HC", active: true },
  { category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Potain", model: "MCT 205", active: true },
  { category: "tower-crane", categoryEn: "Tower Cranes", categoryZh: "塔式起重機", brand: "Zoomlion", model: "TC5610", active: true },
  { category: "roller", categoryEn: "Rollers", categoryZh: "壓路機", brand: "BOMAG", model: "BW 120", active: true },
  { category: "breaker", categoryEn: "Concrete Breaker", categoryZh: "挖掘機配碎石器", brand: "Atlas Copco", model: "HB 3100", active: true },
  { category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 28", active: true },
  { category: "bored-pile", categoryEn: "Bored Pile Machines", categoryZh: "鑽孔樁機", brand: "Bauer", model: "BG 36", active: true },
  { category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Caterpillar", model: "DE110", active: true },
  { category: "generator", categoryEn: "Generators", categoryZh: "發電機", brand: "Cummins", model: "500 kVA", active: true },
  { category: "pump", categoryEn: "Pumps", categoryZh: "抽水機", brand: "Honda", model: "WB20", active: true },
  { category: "concrete-pump", categoryEn: "Concrete Pumps", categoryZh: "混凝土泵", brand: "Putzmeister", model: "BSF 36Z", active: true },
  { category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D6", active: true },
  { category: "bulldozer", categoryEn: "Bulldozers", categoryZh: "推土機", brand: "Caterpillar", model: "D8", active: true },
];

console.log('Seeding reference data...\n');

const allCollections = { trades, laborRoles, constraints, weatherOptions, plantCatalog };

for (const [collName, data] of Object.entries(allCollections)) {
  console.log(collName + ': ' + data.length + ' entries');
  for (let i = 0; i < data.length; i += 20) {
    const chunk = data.slice(i, i + 20);
    const b = writeBatch(db);
    for (const item of chunk) {
      const id = item.brand ? slugify(item.category + '-' + item.brand + '-' + item.model) : slugify(item.nameEn);
      b.set(doc(db, collName, id), item);
    }
    await b.commit();
  }
  console.log('  Done');
}

const total = Object.values(allCollections).reduce((s, a) => s + a.length, 0);
console.log('\nSeed complete! Total: ' + total + ' records');
