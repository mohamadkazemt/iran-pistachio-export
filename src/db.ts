import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Product, Blog, RFQ, SystemLog, BackupInfo, SiteSettings, HomepageTexts, AdminUser, VisitorAnalytics, MediaItem, SEOSettings } from "./types.js";

const DB_PATH = path.join(process.cwd(), "src", "db.json");
const BACKUPS_DIR = path.join(process.cwd(), "src", "backups");

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-raw-pistachio",
    name: "Royal Akbari Raw Pistachios",
    description: "The crown jewel of Persian agricultural luxury. Hand-picked, super-long Akbari raw pistachios from ancient mineral plains, boasting natural cream-colored shells with whole green-and-purple kernels.",
    categories: ["Raw Pistachio", "Agricultural Luxury"],
    priceRange: "$9,200 - $11,500",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80",
    origin: "Rafsanjan Plains (Protected Designation of Origin)",
    hsCode: "0802.51.00",
    minOrder: "1 Metric Ton",
    leadTime: "10 - 14 Days Air / Sea Freight",
    purityGrade: "Premium Quality (Moisture <6.0%, Splitting >98%)",
    packaging: "Hermetically sealed multi-layer polymer bags inside reinforced standard export wooden pallets.",
    specifications: {
      "Pesticide Test": "ND (Not Detected - 100% Organic certified)",
      "Foreign Matter": "< 0.15%",
      "In-shell Yield": "Min 52%",
      "Aflatoxin B1": "ND (Below limits of EU compliance)",
      "Certifications": "Phytosanitary Certificate, ISO 22000, Halal"
    }
  },
  {
    id: "prod-roasted-pistachio",
    name: "Fandoghi Roasted & Jumbo Pistachios",
    description: "Premium round-bodied Fandoghi grade harvested at peak ripeness, gently dry roasted inside high-efficiency airflow rotators to perfection without disrupting kernel structures.",
    categories: ["Roasted Pistachio", "Premium Foodstuffs"],
    priceRange: "$8,800 - $10,400",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    origin: "Kerman Plateau",
    hsCode: "0802.52.00",
    minOrder: "2 Metric Tons",
    leadTime: "12 - 18 Days Sea Freight",
    purityGrade: "Grade-A Roasted (Moisture <2.5%)",
    packaging: "Food-grade nitrogen-flushed poly bags enclosed inside double-wall heavy cartons.",
    specifications: {
      "Roasting Temp": "125°C - 130°C",
      "Style": "In-shell Natural Open",
      "Defect Count": "< 1.2% max limit",
      "Additive Content": "Zero artificial colorings or flavorings",
      "Certifications": "SGS Quality Cleared, HACCP"
    }
  },
  {
    id: "prod-salted-pistachio",
    name: "Kallehghouchi Salted Persian Jumbo Pistachios",
    description: "Legendary Ram-Head Jumbo (Kallehghouchi) pistachios, roasted and salted lightly with micro-refined sea salts to accentuate culinary depth and deliver standard export flavor richness.",
    categories: ["Salted Pistachio", "Gourmet Foodstuffs"],
    priceRange: "$9,500 - $11,800",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80",
    origin: "Yazd Arid Belts",
    hsCode: "0802.52.10",
    minOrder: "1 Metric Ton",
    leadTime: "10 - 15 Days Freight Line",
    purityGrade: "Jumbo Grade 20/22 (Moisture <3.0%)",
    packaging: "Vacuum insulated plastic packs with built-in desiccant cores to eliminate ambient humidity.",
    specifications: {
      "Sea Salt Quotient": "1.5% - 2.0% micro-salted",
      "Splitting Ratio": "98.5% open-mouth",
      "Aflatoxin Screen": "Negative (Tested per consignment lot)",
      "Admixture Limit": "< 0.1%",
      "Certifications": "ISO 9001:2015, Phyto Certificate"
    }
  },
  {
    id: "prod-pistachio-kernel",
    name: "Ahmad Aghaei Royal Pistachio Kernels",
    description: "Whole, machine-shelled Ahmad Aghaei pistachio kernels, displaying gorgeous purple-red skins enclosing vibrant green heart matrices. Ideal for luxury nut manufacturers.",
    categories: ["Pistachio Kernel", "Premium Foodstuffs"],
    priceRange: "$16,500 - $18,900",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=600&q=80",
    origin: "Rafsanjan Orchards",
    hsCode: "0802.52.20",
    minOrder: "500 Kilograms",
    leadTime: "7 - 12 days Air Freight",
    purityGrade: "Whole Medium Kernels (99.5% clean)",
    packaging: "Double-layered nitrogen-purged hermetic cartons to preserve delicate seeds lipids.",
    specifications: {
      "Purity ratio": "99.85% pure kernels",
      "Moisture Content": "< 5.5%",
      "Damaged Seeds": "< 0.5%",
      "Heavy Metals Test": "Passed (Well beneath standard EU regulatory tolerances)",
      "Certifications": "ISO 22000, BRC Global Standards"
    }
  },
  {
    id: "prod-green-kernel",
    name: "Double Green Peeled Pistachio Kernels (AAA Grade)",
    description: "The absolute pinnacle of confectionery luxury. Exceptionally green, raw kernels, completely peeled of outward reddish skins to display intense natural coloration.",
    categories: ["Green Pistachio Kernel", "Agricultural Luxury"],
    priceRange: "$24,500 - $28,900",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
    origin: "Ancient Khorasan Valleys",
    hsCode: "0802.52.30",
    minOrder: "200 Kilograms",
    leadTime: "5 - 9 Days Expedited Air Cargo",
    purityGrade: "Grade AAA Extra-Green",
    packaging: "Sealed aluminum foil bags flushed with high-grade gaseous nitrogen, housed inside protective cases.",
    specifications: {
      "Peeled Ratio": "> 99.2%",
      "Color Classification": "Double Premium Green (Rank I)",
      "Moisture Rate": "< 5.0% max limit",
      "ND Additives": "Yes (Negative additive verification)",
      "Certifications": "Organic USDA, Eurofins Lab Audited"
    }
  },
  {
    id: "prod-pistachio-powder",
    name: "Ultra-Fine Green Pistachio Powder",
    description: "Pure green peeled kernels ground inside cryo-cooled milling chambers into fine-grain powder. Perfectly preserves vibrant natural emerald colors and seed oils without heating.",
    categories: ["Pistachio Powder"],
    priceRange: "$18,500 - $21,000",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
    origin: "AuraLux Industrial Milling Center",
    hsCode: "1106.30.90",
    minOrder: "500 Kilograms",
    leadTime: "8 - 14 Days Air Cargo",
    purityGrade: "Grade-I Cryo-Ground Fine Powder",
    packaging: "Thick food-grade foil barrier sacks with integrated oxygen absorbers.",
    specifications: {
      "Mesh Size Value": "95% passing 80 mesh lines",
      "Oil Content Preservation": "46% - 50% healthy seed lipids",
      "Water Activity Rate": "< 0.40 aw",
      "Coliform Screen": "ND (Absolute sterile control)",
      "Certifications": "FSSC 22000, Kosher Certificate"
    }
  },
  {
    id: "prod-pistachio-slices",
    name: "Luxury Slivered Pistachio Slices",
    description: "Drawn from first-grade green kernels, slivered into delicate, uniform, paper-thin slices. Ideal for premier pâtisseries, gourmet chocolates, and luxury dining garnishes.",
    categories: ["Pistachio Slices", "Gourmet Foodstuffs"],
    priceRange: "$19,000 - $22,500",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80",
    origin: "Tehran Logistics Park",
    hsCode: "2008.19.10",
    minOrder: "300 Kilograms",
    leadTime: "7 - 12 days Freight Express",
    purityGrade: "Uniform Slivered Grade S",
    packaging: "Rigid plastic airtight containers, shock-absorbing foam pads, double outer cartons.",
    specifications: {
      "Slice Thickness Accuracy": "0.6mm - 0.8mm (micro-cut)",
      "Whole Slices ratio": "> 94.5%",
      "Residual Shell": "0.00% (triple electronic inspection)",
      "Sensory Profile": "Mild, nutty, sweet aroma",
      "Certifications": "Phytosanitary Clearance, FDA Registered"
    }
  },
  {
    id: "prod-pistachio-butter",
    name: "Organic Velvet Pistachio Butter Reserve",
    description: "100% pure organic pistachio kernels, slowly stone-milled into a silky-smooth, velvet butter. Zero hydrogenated oils, palm fats, sugar, or preservatives are added.",
    categories: ["Pistachio Butter", "Agricultural Luxury"],
    priceRange: "$14 - $22",
    unit: "Glass Jar (500g)",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    origin: "AuraLux Cold-Press Laboratory",
    hsCode: "2008.19.20",
    minOrder: "1,000 Jars",
    leadTime: "10 - 15 Days Temperature-Controlled Cargo",
    purityGrade: "Organic Cold-Pressed Reserve",
    packaging: "Lead-free glass jars inside partitioned thick cardboard security boxes.",
    specifications: {
      "Kernel Percentage": "100.0% pure pistachios",
      "Oil Separation": "Slight natural separation (indicates no emulsifiers)",
      "Grinding Smoothness": "< 15 microns precision",
      "Aflatoxin B1 Level": "Zero detected",
      "Certifications": "USDA Organic, Ecocert, Vegan"
    }
  },
  {
    id: "prod-mixed-nuts",
    name: "Royal Imperial Mixed Nuts Medley",
    description: "A meticulously balanced gourmet medley of raw and lightly dry-roasted nuts: supreme almonds, Persian walnuts, giant hazelnuts, and premium sea-salted cashews.",
    categories: ["Mixed Nuts", "Gourmet Foodstuffs"],
    priceRange: "$11,200 - $13,400",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=600&q=80",
    origin: "Multi-designated global estates",
    hsCode: "2008.19.90",
    minOrder: "1 Metric Ton",
    leadTime: "12 - 16 Days Bulk Freight",
    purityGrade: "Standard Premium Medley",
    packaging: "Sealed moisture-resistant nitrogen bags, protected inside heavy transit crates.",
    specifications: {
      "Medley breakdown": "30% Almond, 30% Walnut, 20% Hazelnut, 20% Cashew",
      "Preservation Style": "Nitrogen blanket shield",
      "Total Moisture Ratio": "< 4.5% overall",
      "GMO Verification": "Non-GMO Verified",
      "Certifications": "GFSI Global Food Standard"
    }
  },
  {
    id: "prod-almond",
    name: "Vetted Mamra Supreme Export Almonds",
    description: "The legendary Mamra almond, esteemed worldwide for its high nutritional oil density, crisp bite, and signature single-kernel long curvature.",
    categories: ["Almond", "Agricultural Luxury"],
    priceRange: "$18,500 - $22,800",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
    origin: "Zayandehrud Highlands",
    hsCode: "0802.11.00",
    minOrder: "1 Metric Ton",
    leadTime: "10 - 14 Days Air/Sea transport",
    purityGrade: "Mamra Grade Single-Select (Shelled)",
    packaging: "Dual-wall vacuum sealed thick sacs inside maritime-proof freight panels.",
    specifications: {
      "Oil Concentration": "52% - 55% healthy fats",
      "Bitter Core Ratio": "0% (strict automated chromatography)",
      "Shell debris": "Zero registered",
      "Size metric range": "Long Mamra AA index",
      "Certifications": "SGS Quality Assurance, ISO 22000"
    }
  },
  {
    id: "prod-walnut",
    name: "High-Altitude Persian Halves Walnuts",
    description: "Extra-light, premium dry-shelled walnut halves harvested from organic groves. Meticulously hand-sorted to maintain gorgeous butterfly-half structures intact.",
    categories: ["Walnut", "Premium Foodstuffs"],
    priceRange: "$7,500 - $9,400",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
    origin: "Tuyserkan High Highlands (1,900m)",
    hsCode: "0802.32.00",
    minOrder: "1 Metric Ton",
    leadTime: "14 - 20 Days Sea Cargo",
    purityGrade: "Extra Light Quarter/Halved Kernels",
    packaging: "Corrugated cardboard crates containing inner nitrogen environment barriers.",
    specifications: {
      "Skins Color grade": "Extra Light (USDA scale index)",
      "Moisture rating": "< 4.8% dry core",
      "Halves Proportion": "> 88.5% whole butterfly seeds",
      "Rancidity Test Index": "PV <1.5 meq/kg",
      "Certifications": "Eurofins Lab Vetted, Phyto Certificate"
    }
  },
  {
    id: "prod-hazelnut",
    name: "Tehran Highlands Jumbo Hazelnuts",
    description: "Premium, large-sized whole hazelnuts with smooth, rich shells and rich ivory kernels. Dry-roasted or raw configuration available for commercial procurement.",
    categories: ["Hazelnut", "Premium Foodstuffs"],
    priceRange: "$6,200 - $7,800",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    origin: "Ramsar Organic Highlands",
    hsCode: "0802.22.00",
    minOrder: "2 Metric Tons",
    leadTime: "15 - 22 Days Sea Freight",
    purityGrade: "Shelled Jumbo Grade (13mm - 15mm)",
    packaging: "Doublewoven polypropylene bulk bags with poly inner barriers.",
    specifications: {
      "Size Range Specification": "13mm - 15mm round calibration",
      "Water ratio limits": "< 5.2% max moisture",
      "Damaged/Shrunk kernels": "< 1.5%",
      "Organic purity score": "100% natural, chemical pesticide free",
      "Certifications": "HACCP, ISO 9001, Halal"
    }
  },
  {
    id: "prod-cashew",
    name: "King Size W180 Roasted Cashews",
    description: "The absolute largest cashew size available globally. Roasted at precise temperatures and lightly finished to preserve standard creamy kernels texturing.",
    categories: ["Cashew", "Gourmet Foodstuffs"],
    priceRange: "$10,500 - $12,600",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=600&q=80",
    origin: "Vetted Coastal Estates",
    hsCode: "0801.32.00",
    minOrder: "1 Metric Ton",
    leadTime: "12 - 18 days Sea Freight",
    purityGrade: "King Size W180 Grade-A",
    packaging: "Hermetic tins flushed with carbon dioxide and nitrogen mixture.",
    specifications: {
      "Cashew seed count": "120 - 140 kernels per pound",
      "Total broken ratio": "< 3.0% max pieces",
      "Color uniformity index": "Uniform white/pale ivory",
      "Insect damage count": "0.00%",
      "Certifications": "SGS quality clearance, FDA certified"
    }
  },
  {
    id: "prod-raisins",
    name: "Golden Seedless Persian Raisins",
    description: "Naturally sun-dried golden raisins treated with sulfur dioxide to lock in unique golden-amber colors. Soft, succulent, and exceptionally sweet.",
    categories: ["Raisins", "Dried Fruits"],
    priceRange: "$3,800 - $5,200",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80",
    origin: "Malayer Vineyards",
    hsCode: "0806.20.00",
    minOrder: "5 Metric Tons",
    leadTime: "18 - 25 Days Sea Freight",
    purityGrade: "Premium Golden Grade AAA",
    packaging: "Cardboard boxes of 10kg with inner plastic liner.",
    specifications: {
      "Sugar crystallization": "Zero presence on arrival",
      "Sizing count index": "320 - 360 units per 100g",
      "Total moisture value": "< 16.0% damp maximum",
      "Sulfur Residue Value": "< 1500 ppm",
      "Certifications": "ISO 22000, HACCP, Halal"
    }
  },
  {
    id: "prod-dried-fruits",
    name: "AuraPersica Organic Dried Fruits Medley",
    description: "Premium mixture of highest quality export dried figs, dried apricots, sun-dried peaches, and organic nectarine slices. Succulent, organic, and completely un-sulfated.",
    categories: ["Dried Fruits", "Agricultural Luxury"],
    priceRange: "$6,500 - $8,200",
    unit: "Metric Ton",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80",
    origin: "Shiraz Sun Groves",
    hsCode: "0813.50.00",
    minOrder: "1 Metric Ton",
    leadTime: "12 - 17 Days Sea Freight",
    purityGrade: "Organic Medley Grade A",
    packaging: "Vacuum insulated boxes with nitrogen gas flushing to preserve softness.",
    specifications: {
      "Constituents breakdown": "30% Fig, 30% Apricot, 20% Peach, 20% Nectarine",
      "Water activity quotient": "< 0.62 aw",
      "Added sugars count": "0% (natural fruit glucose only)",
      "Preservation Style": "Cold-storage shipped",
      "Certifications": "HCCP Registered, Organic Certification"
    }
  },
  {
    id: "prod-gift-boxes",
    name: "Royal Emblem Leather-Wrapped Gift Box",
    description: "A luxury corporate gift container. Crafted from premium embossed leather, containing velvet linings, and carrying customized brass logo engravings. Pre-loaded with supreme raw pistachios.",
    categories: ["Luxury Gift Boxes", "Agricultural Luxury"],
    priceRange: "$85 - $150",
    unit: "Luxury Set",
    imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    origin: "AuraLux Crafts Workshop",
    hsCode: "4202.91.00",
    minOrder: "100 Units",
    leadTime: "15 - 25 Days Air cargo",
    purityGrade: "Elite Artisan Handcrafted Style",
    packaging: "Shockproof foam-packed velvet carry pouches inside outer wood transport frames.",
    specifications: {
      "Shell materials": "Embossed full grain hide leather over cedar wood core",
      "Lining material selection": "Anti-static jewelry-grade velvet",
      "Standard Compartments count": "4 modular dividers (pre-weighted partitions)",
      "Weight Capacity limit": "Up to 2.5kg net nut products",
      "Certifications": "Handicrafts Origin Seal"
    }
  },
  {
    id: "prod-export-pkg",
    name: "Hermetic Poly-Liner Commercial Export Packaging",
    description: "Premium bulk shipment freight bags. Configured with a multi-axially oriented nylon barrier laminate and food-grade seal indicators to eliminate container transpiration.",
    categories: ["Premium Export Packaging", "Advanced High-Temp Materials"],
    priceRange: "$2.50 - $4.80",
    unit: "Industrial Bag",
    imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80",
    origin: "AuraLux Technical Fab Center",
    hsCode: "3923.21.00",
    minOrder: "10,000 Units",
    leadTime: "20 - 30 Days Sea Cargo",
    purityGrade: "O2/H2O High Barrier Commercial Laminate",
    packaging: "Un-filled bags stacked on standard euro-pallets under stretch wrap.",
    specifications: {
      "Oxygen Permeability Rate": "< 0.15 cc/m²/day/bar",
      "Water Vapor Transmission": "< 0.08 g/m²/day",
      "Material Structure Layers": "PE/EVOH/NYLON/PE quad-ply extreme tensile strength",
      "Burst Pressure Threshold": "> 180 kPa",
      "Certifications": "FDA Compliance, EU Food-Contact Approval Certificate"
    }
  }
];

const INITIAL_BLOGS: Blog[] = [
  {
    id: "blog-pistachio-strategy-2026",
    title: "Geopolitical and Market Drivers of the 2026 Global Pistachio Wholesale Supply Chain",
    excerpt: "An expert macroeconomic whitepaper assessing climatic oscillations, freight shipping canal backlogs, and import tariff hedging programs.",
    content: "## Executive Summary\nIn Q2 2026, the international pistachio wholesale index registered a significant consolidation due to variable yields in key growing regions, coupled with maritime channel holds in Gibraltar and Singapore. Leading importing houses are turning towards long-term contracts under fixed incoterm pricing models like FOB (Free On Board) and CIF (Cost, Insurance & Freight) with certified suppliers to guard wholesale liquidity.\n\n## 1. Climatic Factors & Yield Indexing\nRafsanjan and Kerman valleys experienced a cold frost during winter, reducing initial long-bodied Akbari yields by 14%. Importers must utilize bulk warehouses pre-flushed with nitrogen gas to store seed crops securely, blocking potential lipid decay before sea freight boarding.\n\n## 2. Navigating Incoterms Rules\nSelecting the right incoterm structure is critical. CIF shifts the responsibility of maritime cargo tracking and premium insurance straight to AuraLux, whereas EXW places customs entry clearance on the importer. AuraLux provides direct customs filing assist lists at EuroPort Terminal Hubs to speed transfers.\n\n## 3. Recommended Actions\nWe advise establishing long-term priority allocation agreements with verified exporters that hold extensive warehouse stock to hedge against anticipated price increases in late Q4 2026.",
    publicationDate: "May 18, 2026",
    readTime: "7 Min",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80",
    author: "Dr. Marcus Vance, Chief Trade Economist",
    tags: ["Trade Intelligence", "Logistics", "Compliance"]
  },
  {
    id: "blog-nut-health-benefits",
    title: "Clinical & Biochemical Valuations of Bioactive Lipids in Premium Tree Nuts",
    excerpt: "Technical audit of the cardiovascular and anti-inflammatory properties of polysaturated fatty acids within green pistachio kernels and mamra almonds.",
    content: "## Introduction\nScientific literature demonstrates that premium grade nuts contain a superior concentration of bioactive lipids. In particular, green pistachio kernels and Long Mamra almonds are highly enriched in oleic acid and omega-nine fatty acids, which actively support healthy blood lipid levels.\n\n## 1. Lipid Stability & Oxidation Mitigation\nTree nuts oils are sensitive to UV exposure and high room temperatures. AuraLux cold-gas milling and nitrogen vacuum packing keeps relative oxidation near zero, ensuring active enzymes stay stable for up to 24 months.\n\n## 2. ISO 3632 & Heavy Metal Controls\nImporters must request full lab reports ensuring heavy metals (like Lead and Cadmium) and mycotoxins are well below FDA and EFSA limits. All AuraLux products are certified organic, showing non-detectable traces across full-grid spectrum tests.",
    publicationDate: "April 02, 2026",
    readTime: "9 Min",
    imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    author: "Elena Rostova, Director of Bio-Agricultural Innovation",
    tags: ["Technical Materials", "Healthy Food", "Standards"]
  },
  {
    id: "blog-export-compliance-2026",
    title: "Navigating Aflatoxin Compliance for Premium Nut Exporters",
    excerpt: "Minimize global shipping delays and customs cargo rejections inside EU ports with proactive food safety certifications.",
    content: "## The Hidden Hazard of Aflatoxins\nAflatoxins represent toxic secondary metabolites produced by Aspergillus fungi. Consignments of nuts arriving at major international hubs are audited rigorously. A single positive test exceeding 2.0 ppb can trigger entire cargo holds, costing upwards of $18,000 in daily container demurrage fees.\n\n## 1. Soil & Thermal Selection Protocols\nAuraLux fields are located in dry, high-altitude highlands (above 1,200m). Winter snowmelt waters keep the soils naturally pure, while low humidity levels reduce fungal growth significantly compared to typical low-lying tropical agricultural zones.\n\n## 2. Advanced Multi-Spectrum Laser Sorter\nEvery batch passes through twin multi-spectrum sorting cameras. Any kernel showing slight shell cracking or internal decay is instantly ejected, maintaining 100% aflatoxin-free certification on export consignments.",
    publicationDate: "March 15, 2026",
    readTime: "6 Min",
    imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80",
    author: "Alistair Thorne, Esq., Global Trade Attorney",
    tags: ["Trade Intelligence", "Compliance", "Finance"]
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  brandName: "AuraLux Global",
  logoText: "Aura",
  logoSubtext: "Lux",
  phone: "+98 21 8888 1234",
  whatsApp: "+971 50 123 4567",
  telegram: "auralux_global",
  email: "procurement@auralux-global.com",
  address: "Floor 14, Royal Trade Tower, Elahiyeh, Tehran, Iran",
  facebook: "https://facebook.com/auralux_global",
  instagram: "https://instagram.com/auralux_global",
  linkedin: "https://linkedin.com/company/auralux_global",
  twitter: "https://twitter.com/auralux_global",
  homepageTexts: {
    en: {
      heroTag: "Intelligent Sovereign Exquisite Sourcing",
      heroTitle1: "Pristine Purity,",
      heroTitle2: "Sovereign Logistics",
      heroDesc: "AuraLux facilities orchestrate an elite organic pipeline of premium Persian raw pistachios, exclusive tree nuts, and delicate dried fruit reserves. Sourced from dry high-altitude volcanic soils, certified under absolute ISO validation systems, and loaded to global freight corridors securely.",
      ctaCatalog: "Explore Royal Reserves",
      ctaAdvisor: "Aura Intelligence Desk",
      stat1Label: "Tested Purity Standard",
      stat1Value: "99.8% Passed",
      stat2Label: "Safe Freight Cargoes",
      stat2Value: "Nitrogen Shielded",
      stat3Label: "Sovereign Logistics Lines",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "Compliance Assurance",
      stat4Value: "Zero Aflatoxin",
      pillarTitle: "Organically Crafted, Universally Authenticated",
      pillarSubtitle: "Our high-end agricultural offerings are harvested selectively at peak maturities, subjected to certified dry packaging regimes, and delivered untainted across international borders.",
      pillar1Title: "Artisanal Pistachio Estates",
      pillar1Desc: "Our high-yield pistachio trees thrive in dry volcanic terrains, producing deep green kernel grades that exceed prime export and regulatory benchmarks.",
      pillar2Title: "Premium Nitrogen Storage",
      pillar2Desc: "Processed inside sterile, vacuum-sealed cargo packages, pre-flushed with food-grade nitrogen to lock in rich, biological enzymes and prevent oxidation.",
      pillar3Title: "ISO Validation System",
      pillar3Desc: "Comprehensive chromatography evaluation scans every container batch, establishing strict aflatoxin-free certification and phytosanitary clearance.",
      journeyTitle: "The Sourcing Odyssey",
      journeySubtitle: "Witness the exquisite progression of the earth's premium organic treasures from volcanic mountains to international sea terminals.",
      readMore: "View Export Specifications"
    },
    es: {
      heroTag: "Abastecimiento Inteligente y Soberano de Alta Gama",
      heroTitle1: "Pureza Prístina,",
      heroTitle2: "Logística Soberana",
      heroDesc: "AuraLux organiza una cadena de suministro orgánica de élite para pistachos persas de primera calidad y delicias botánicas exclusivas. Cultivados en campos ancestrales y auditados bajo normas de certificación ISO.",
      ctaCatalog: "Explorar Reservas Reales",
      ctaAdvisor: "Mesa de Inteligencia Aura",
      stat1Label: "Estándar de Pureza Probada",
      stat1Value: "99.8% Aprobado",
      stat2Label: "Cargas de Carga Seguras",
      stat2Value: "Con Nitrógeno",
      stat3Label: "Líneas Logísticas Soberanas",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "Aseguramiento de Cumplimiento",
      stat4Value: "Cero Aflatoxinas",
      pillarTitle: "Elaborado Orgánicamente, Autenticado Universalmente",
      pillarSubtitle: "Nuestras ofertas agrícolas de alta gama se cosechan selectivamente, se someten a regímenes de envasado seco certificado y se entregan intactas.",
      pillar1Title: "Fincas de Pistachos Artesanales",
      pillar1Desc: "Nuestros árboles crecen en terrenos volcánicos secos, produciendo granos de color verde intenso que superan los estándares de exportación premium.",
      pillar2Title: "Empaque de Nitrógeno Premium",
      pillar2Desc: "Procesado en empaques al vacío estériles, prelavados con nitrógeno para sellar enzimas frescas y evitar el deterioro por transporte prolongado.",
      pillar3Title: "Validación ISO",
      pillar3Desc: "Los análisis cromatográficos garantizan la pureza y demuestran la ausencia total de aflatoxinas con el despacho aduanero certificado.",
      journeyTitle: "La Odisea del Origen",
      journeySubtitle: "Siga la extraordinaria ruta de las joyas agrícolas desde los huertos antiguos hasta los puertos de destino global.",
      readMore: "Ver Ficha de Exportación"
    },
    zh: {
      heroTag: "智慧、主权与极奢大宗物料供应",
      heroTitle1: "原生卓越纯度,",
      heroTitle2: "主权安全物流",
      heroDesc: "AuraLux 致力于构建全球顶奢有机开心果、精品坚果及精品干果类天然农产品的全球出口通道。来自富含矿物质高海拔古老产区，历经严苛的 ISO 权威质检与无缝全球干线货运衔接。",
      ctaCatalog: "查看皇家专属储备",
      ctaAdvisor: "阿乌拉智慧合规台",
      stat1Label: "实测科学纯度标准",
      stat1Value: "99.8% 合格率",
      stat2Label: "货柜全程安全跟踪",
      stat2Value: "惰性气体填充保护",
      stat3Label: "全球主权干线保障",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "中转进口合规放行",
      stat4Value: "零黄曲霉素",
      pillarTitle: "天然有机培育，全球合规审计",
      pillarSubtitle: "我们所有的高端出口作物均在成熟巅峰期手工采摘，充氮隔氧气密封装箱，绝对封存锁鲜，避免化学氧化变质。",
      pillar1Title: "顶级稀贵开心果庄园",
      pillar1Desc: "选自最适宜生长的大陆性火山灰沙土带，果仁通体青翠红衣丰满，油脂醇厚，完美超越全球最高规格标准。",
      pillar2Title: "惰性密封保鲜存储",
      pillar2Desc: "真空保鲜舱级无菌流水线，充氮隔氧气密封装箱，绝对封存锁鲜，抑制任何可能发生的化学氧化变质。",
      pillar3Title: "ISO 标准溯源",
      pillar3Desc: "批批质检并经过最严格的高压液相色谱扫描，一键下载中英文植物检疫证书与无公害原产地电子报告。",
      journeyTitle: "匠心纯粹之履",
      journeySubtitle: "探寻大自然最负盛名的绿色有机珍宝，如何从巍峨远山运抵国际一流枢纽港港口。",
      readMore: "查看皇家出口标准规范"
    },
    ar: {
      heroTag: "أرقى قنوات الاستيراد والتوزيع السيادي والذكي",
      heroTitle1: "نقاء أصيل،",
      heroTitle2: "ولوستجيات سيادية",
      heroDesc: "تنسق AuraLux سلسلة إمداد عضوية نخبوية للفستق الفارسي الفاخر والمكسرات الحصرية والفاكهة المجففة الفاخرة. يتم حصادها من حقول قديمة وتوثيقها بموجب أنظمة شهادات ISO الحازمة للمنافذ الدولية.",
      ctaCatalog: "استكشف الاحتياطي الملكي",
      ctaAdvisor: "مكتب استشارات أورا",
      stat1Label: "معيار النقاء المضمون",
      stat1Value: "99.8% نسبة النجاح",
      stat2Label: "شحنات جمركية مؤمنة",
      stat2Value: "مغلف بالنيتروجين",
      stat3Label: "خطوط شحن مباشرة",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "تأمين الامتثال والصحة",
      stat4Value: "خالٍ من الأفلاتوكسين",
      pillarTitle: "إنتاج عضوي طبيعي، معتمد بضوابط عالمية",
      pillarSubtitle: "حصاد السلع الزراعية الراقية في فترة الخصوبة الكاملة، وتعبئتها ضمن بيئات محكمة خالية من الرطوبة لشحنها وتصديرها دولياً.",
      pillar1Title: "مزارع الفستق الطينية العريقة",
      pillar1Desc: "تزدهر أشجارنا في بيئات نادرة مما ينتج حبوب فستق خضراء داكنة تتخطى المعايير القياسية للتجارة.",
      pillar2Title: "حفظ الشحن بالنيتروجين",
      pillar2Desc: "يعبأ المنتج في كابسولات مفرغة مغسولة بغاز النيتروجين لحمايته من نسب الرطوبة الشديدة والحفاظ على الطعم الرائع.",
      pillar3Title: "شهادة ISO الدقيقة",
      pillar3Desc: "يخضع كل لوط لرقابة شديدة للتأكد من خلوه تماماً من السموم الفطرية وإصدار تصاريح الحجر الزراعي الفورية.",
      journeyTitle: "ملحمة الإنتاج والتصدير",
      journeySubtitle: "تابع الرحلة الفخمة التي تسلكها أغلى ثمار الأرض من قلب الجبال إلى أرصفة الشحن الدولية.",
      readMore: "مشاهدة مواصفات تصدير الشحنة"
    },
    de: {
      heroTag: "Intelligente, Souveräne & Exquisite Rohstoffbeschaffung",
      heroTitle1: "Absolute Reinheit,",
      heroTitle2: "Souveräne Logistik",
      heroDesc: "AuraLux koordiniert eine Premium-Bio-Pipeline für erlesene iranische Pistazienkerne, exklusive Baumnüsse und getrocknete Früchte. Direkt bezogen von jahrhundertealten Plantagen und zertifiziert nach ISO-Standards.",
      ctaCatalog: "Königliche Reserven ansehen",
      ctaAdvisor: "Aura Zoll-Informationsdesk",
      stat1Label: "Laborgeprüfter Reinheitsgrad",
      stat1Value: "99.8% Bestanden",
      stat2Label: "Sichere Containertransporte",
      stat2Value: "Stickstoffgeschützt",
      stat3Label: "Souveräne Transportkorridore",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "Konformität & Einfuhrfreigabe",
      stat4Value: "Aflatoxinfrei",
      pillarTitle: "Biologischer Anbau, Weltweit Zertifiziert",
      pillarSubtitle: "Unsere landwirtschaftlichen Spitzenprodukte werden bei voller Reife sorgfältig geerntet, nach strengen Frischenormen versiegelt und exportiert.",
      pillar1Title: "Kultivierte Pistazienhaine",
      pillar1Desc: "Unsere Bäume gedeihen auf nährstoffreichen Vulkanböden und produzieren tiefgrüne Premium-Kerne der Spitzenklasse.",
      pillar2Title: "Stickstoffisierte Frischeversiegelung",
      pillar2Desc: "In absolut keimfreien Vakuumverpackungen abgefüllt und mit Stickstoff begast, um natürliche Antioxidantien zu schützen.",
      pillar3Title: "Zelluläre ISO-Prüfung",
      pillar3Desc: "Chromatographische Endkontrollen zertifizieren absolute Aflatoxinfreiheit für eine reibungslose Zollabwicklung an EU-Ports.",
      journeyTitle: "Vom Feld in den Welthandel",
      journeySubtitle: "Verfolgen Sie den außergewöhnlichen Weg erstklassiger Bio-Erzeugnisse von antiken Hochflächen bis zu den Handelshäfen.",
      readMore: "Exportdatenblatt öffnen"
    },
    fa: {
      heroTag: "تامین هوشمند، مقتدرانه و نفیس فرآورده‌های ممتاز کشاورزی",
      heroTitle1: "خلوص بی‌نظیر،",
      heroTitle2: "لجستیک مقتدرانه",
      heroDesc: "تجهیزات مدرن و شبکه تأمین AuraLux زنجیره‌ای مقتدر از صادرات پسته ممتاز اکبری، بادام، گردو و میوه‌های خشک دست‌چین را سازماندهی می‌کند. این سبد نفیس حاصل خاک‌های حاصلخیز مرتفع اراضی آتشفشانی، با گواهی‌نامه‌های معتبر ISO و بسته‌بندی‌های خلأ پیشرفته است.",
      ctaCatalog: "کشف ذخایر سلطنتی",
      ctaAdvisor: "میز اطلاعات و هوش تجاری",
      stat1Label: "استاندارد خلوص آزمایشگاهی",
      stat1Value: "۹۹.۸٪ تایید شده",
      stat2Label: "محموله‌های حفاظتی اتمسفر غنی شده",
      stat2Value: "تزریق نیتروژن",
      stat3Label: "مسیرهای توزیع و ترانزیت مستقیم",
      stat3Value: "EXW / FOB / CIF",
      stat4Label: "تضمین انطباق و سلامت",
      stat4Value: "بدون آفلاتوکسین",
      pillarTitle: "فرآوری کاملا ارگانیک، تایید با استانداردهای جهانی",
      pillarSubtitle: "محصولات کشاورزی کشاورزی صادراتی ما در اوج بلوغ چیده شده، تحت اتمسفر گاز نیتروژن مهر و موم شده و با پایش رطوبت مداوم توزیع می‌گردند.",
      pillar1Title: "مزارع سنتی و پایدار پسته",
      pillar1Desc: "درختان پسته در خاک‌های شنی مرتفع آتشفشانی تغذیه می‌شوند که مغز سبز زمردینی باکیفیت و درصد چربی عالی پدید می‌آورند.",
      pillar2Title: "سیستم نگهداری و بسته‌بندی خلأ",
      pillar2Desc: "استفاده از گازهای خنثی و بسته‌بندی‌های ترکیبی ضداکسیداسیون که طراوت و آنزیم‌های زنده مغزها را در ترانزیت‌های طولانی حفظ می‌کند.",
      pillar3Title: "پروتکل انطباق و سلامت ISO",
      pillar3Desc: "پایش دقیق کروماتوگرافی به منظور صدور گواهی عدم آفلاتوکسین و مدارک استاندارد بهداشتی جهت ترخیص یکجا در بنادر بین‌المللی.",
      journeyTitle: "حماسه مبدا تا مقصد",
      journeySubtitle: "مسیر باشکوه جواهرات سبز کشاورزی از باغ‌های کهن کوهستانی تا پیشرفته‌ترین بنادر دریایی جهان.",
      readMore: "مشاهده برگ مشخصات صادراتی"
    }
  },
  sliders: [
    {
      id: "slide-1",
      title: "Royal Pistachio Orchards",
      subtitle: "Nurtured on ancient volcanic mountain snowmelt under intense solar exposure, producing unparalleled green emerald cores.",
      imageUrl: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "slide-2",
      title: "Precision Sorter Laboratories",
      subtitle: "Every shipment lot is analyzed with optical laser-spectrometers, ensuring absolute aflatoxin exclusion and physical uniform sizing.",
      imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "slide-3",
      title: "Global Maritime Logistics Corridors",
      subtitle: "Securing priority trade supply lines with temperature-regulated nitrogen containers and real-time transit status streams.",
      imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  certificates: [
    {
      id: "cert-phyto",
      name: "International Phytosanitary Export Certificate",
      issuedBy: "Ministry of Agriculture and Food Administration",
      imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "cert-iso22000",
      name: "ISO 22000:2018 Food Safety Management Validation",
      issuedBy: "Global Trust Auditor S.A.",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "cert-halal",
      name: "Consolidated Halal Food Export Compliance",
      issuedBy: "Central Al-Kowsar Halal Auditing Council",
      imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=400&q=80"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Hand-Picking the Akbari Crop",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "gal-2",
      title: "Nitrogen Bulk Sealing Station",
      imageUrl: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "gal-3",
      title: "Emerald Slices Confectionery Grade",
      imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80"
    }
  ],
  videos: [
    {
      id: "vid-1",
      title: "AuraLux Corporate Sourcing Documentary",
      videoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80"
    }
  ]
};

interface DatabaseData {
  products: Product[];
  blogs: Blog[];
  rfqs: RFQ[];
  logs: SystemLog[];
  settings: SiteSettings;
  admins: AdminUser[];
  analytics: VisitorAnalytics[];
  media: MediaItem[];
}

class PremiumDatabase {
  private data: DatabaseData = {
    products: INITIAL_PRODUCTS,
    blogs: INITIAL_BLOGS,
    rfqs: [],
    logs: [],
    settings: INITIAL_SETTINGS,
    admins: [],
    analytics: [],
    media: []
  };

  constructor() {
    this.ensureDirs();
    this.load();
  }

  private ensureDirs() {
    const parentDir = path.dirname(DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(fileContent);
        this.data = {
          products: parsed.products || INITIAL_PRODUCTS,
          blogs: parsed.blogs || INITIAL_BLOGS,
          rfqs: parsed.rfqs || [],
          logs: parsed.logs || [],
          settings: parsed.settings || INITIAL_SETTINGS,
          admins: parsed.admins || [],
          analytics: parsed.analytics || [],
          media: parsed.media || []
        };
      } else {
        this.save();
        this.logSystemEvent("DATABASE_INITIALIZED", "INFO", "localhost", "System DB initialized with seed settings, products and trade whitepapers.");
      }
      
      // Auto seed missing datasets
      this.seedDefaultAdmin();
      this.seedDemoData();
    } catch (err) {
      console.error("Failed to load local DB, fallback to memory", err);
    }
  }

  private seedDefaultAdmin() {
    if (!this.data.admins || this.data.admins.length === 0) {
      const salt = "auralux_secure_salt_78fafae8bc90";
      const hash = crypto.pbkdf2Sync("Admin123456!", salt, 1000, 64, "sha512").toString("hex");
      this.data.admins = [
        {
          id: "admin-default",
          username: "admin",
          email: "admin@nazari-pistachio.com",
          passwordHash: hash,
          salt: salt,
          role: "superadmin",
          createdAt: new Date().toISOString()
        }
      ];
      this.save();
    }
  }

  private seedDemoData() {
    // Seed RFQs (enquiries) if empty
    if (!this.data.rfqs || this.data.rfqs.length === 0) {
      this.data.rfqs = [
        {
          id: "rfq-demo-1",
          clientName: "Jean-Pierre Laurent",
          email: "jp.laurent@gourmet-europe.fr",
          company: "Laurent Confectionery Ltd",
          country: "France",
          productInterestId: "prod-green-kernel",
          quantityNeeded: "5 Metric Tons",
          preferredIncoterm: "CIF",
          comment: "Procuring premium double-green kernels for our winter collection. Requires zero-aflatoxin phytosanitary paperwork.",
          spamScore: 0,
          status: "Pending",
          submissionTime: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: "rfq-demo-2",
          clientName: "Hiroshi Tanaka",
          email: "tanaka@sushinut-tokyo.co.jp",
          company: "Tokyo Sourcing Group",
          country: "Japan",
          productInterestId: "prod-raw-pistachio",
          quantityNeeded: "12 Metric Tons",
          preferredIncoterm: "FOB",
          comment: "We are establishing regular import tunnels. Do you support nitrogen-charged preservation bags to withstand humidity?",
          spamScore: 0,
          status: "Reviewed",
          submissionTime: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: "rfq-demo-3",
          clientName: "Fatima Al-Sudairy",
          email: "f.sudairy@alkharj-foods.sa",
          company: "Al-Kharj Food Products",
          country: "Saudi Arabia",
          productInterestId: "prod-gift-boxes",
          quantityNeeded: "800 Sets",
          preferredIncoterm: "DDP",
          comment: "Custom brass engraving with our corporate stamp 'Al-Kharj' expected. Send logistics specifications and mock image.",
          spamScore: 1,
          status: "Contacted",
          submissionTime: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
          id: "rfq-demo-4",
          clientName: "Spambot Jenkins",
          email: "earn-btc-fast-99@spambox.rocks",
          company: "Get Wealthy Today Inc",
          country: "United States",
          productInterestId: "prod-cashew",
          quantityNeeded: "1000 Metric Tons",
          preferredIncoterm: "EXW",
          comment: "Check out http://grow-rich-casino.com/earn-crypto-free for free bitcoin jackpot tokens!!! Instant payout!!! Fully secure!!!",
          spamScore: 5, // High spam bot signature!
          status: "Pending",
          submissionTime: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
    }

    // Seed Visitor Analytics if empty
    if (!this.data.analytics || this.data.analytics.length === 0) {
      const dates = Array.from({ length: 10 }).map((_, i) => {
        const d = new Date(Date.now() - (9 - i) * 24 * 3600 * 1000);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });

      this.data.analytics = [
        { id: "an-1", date: dates[0], visitors: 420, pageViews: 1250, inquiries: 3, byCountry: [{ label: "Germany", count: 120 }, { label: "China", count: 95 }, { label: "Japan", count: 70 }, { label: "Other", count: 135 }], byDevice: { desktop: 280, mobile: 110, tablet: 30 } },
        { id: "an-2", date: dates[1], visitors: 450, pageViews: 1380, inquiries: 2, byCountry: [{ label: "Germany", count: 130 }, { label: "China", count: 105 }, { label: "Japan", count: 80 }, { label: "Other", count: 135 }], byDevice: { desktop: 300, mobile: 120, tablet: 30 } },
        { id: "an-3", date: dates[2], visitors: 490, pageViews: 1620, inquiries: 4, byCountry: [{ label: "Germany", count: 150 }, { label: "China", count: 125 }, { label: "Spain", count: 85 }, { label: "Other", count: 130 }], byDevice: { desktop: 310, mobile: 140, tablet: 40 } },
        { id: "an-4", date: dates[3], visitors: 580, pageViews: 1980, inquiries: 6, byCountry: [{ label: "China", count: 180 }, { label: "Germany", count: 140 }, { label: "Saudi Arabia", count: 90 }, { label: "Other", count: 170 }], byDevice: { desktop: 380, mobile: 160, tablet: 40 } },
        { id: "an-5", date: dates[4], visitors: 510, pageViews: 1540, inquiries: 3, byCountry: [{ label: "China", count: 160 }, { label: "Germany", count: 120 }, { label: "Japan", count: 85 }, { label: "Other", count: 145 }], byDevice: { desktop: 340, mobile: 140, tablet: 30 } },
        { id: "an-6", date: dates[5], visitors: 480, pageViews: 1420, inquiries: 2, byCountry: [{ label: "Germany", count: 140 }, { label: "China", count: 110 }, { label: "Spain", count: 75 }, { label: "Other", count: 155 }], byDevice: { desktop: 320, mobile: 130, tablet: 30 } },
        { id: "an-7", date: dates[6], visitors: 540, pageViews: 1850, inquiries: 5, byCountry: [{ label: "Germany", count: 160 }, { label: "China", count: 130 }, { label: "Saudi Arabia", count: 80 }, { label: "Other", count: 170 }], byDevice: { desktop: 360, mobile: 140, tablet: 40 } },
        { id: "an-8", date: dates[7], visitors: 620, pageViews: 2150, inquiries: 8, byCountry: [{ label: "China", count: 210 }, { label: "Germany", count: 150 }, { label: "Japan", count: 95 }, { label: "Other", count: 165 }], byDevice: { desktop: 410, mobile: 170, tablet: 40 } },
        { id: "an-9", date: dates[8], visitors: 690, pageViews: 2480, inquiries: 9, byCountry: [{ label: "China", count: 240 }, { label: "Germany", count: 160 }, { label: "France", count: 110 }, { label: "Other", count: 180 }], byDevice: { desktop: 450, mobile: 200, tablet: 40 } },
        { id: "an-10", date: dates[9], visitors: 730, pageViews: 2650, inquiries: 11, byCountry: [{ label: "China", count: 250 }, { label: "Germany", count: 170 }, { label: "Japan", count: 120 }, { label: "Other", count: 190 }], byDevice: { desktop: 480, mobile: 210, tablet: 40 } }
      ];
    }

    // Seed Media Files if empty
    if (!this.data.media || this.data.media.length === 0) {
      this.data.media = [
        { id: "med-1", fileName: "phytosanitary_certificate_template.pdf", mimeType: "application/pdf", size: "1.2 MB", url: "#pdf-view", uploadedAt: new Date(Date.now() - 3600000 * 120).toISOString() },
        { id: "med-2", fileName: "cargo_loading_nitrogen_flush.jpg", mimeType: "image/jpeg", size: "450 KB", url: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80", uploadedAt: new Date(Date.now() - 3600000 * 96).toISOString() },
        { id: "med-3", fileName: "royal_akbari_pistachio_packout.jpg", mimeType: "image/jpeg", size: "520 KB", url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80", uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString() },
        { id: "med-4", fileName: "standard_operating_procedures.pdf", mimeType: "application/pdf", size: "2.1 MB", url: "#pdf-view", uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString() }
      ];
    }

    // Ensure SEO block exists on settings
    if (!this.data.settings.seo) {
      this.data.settings.seo = {
        metaTitle: "AuraLux Global | Premium Persian Organic Pistachios & Sourcing Solutions",
        metaDescription: "AuraLux facilities orchestrate an elite organic pipeline of premium Persian raw pistachios, exclusive tree nuts, and delicate dried fruit reserves. Sourced from dry volcanic soils, certified under absolute ISO validation systems.",
        keywords: "pistachios, wholesales, agricultural exporters, Persian pistachios, Mamra almonds, food logistics, organic nuts",
        ogImage: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=80",
        sitemapLastUpdated: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      };
    }

    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database file", err);
    }
  }

  // --- Settings (CMS) ---
  public getSettings(): SiteSettings {
    const current = this.data.settings || INITIAL_SETTINGS;
    current.homepageTexts = { ...INITIAL_SETTINGS.homepageTexts, ...current.homepageTexts };
    return current;
  }

  public updateSettings(newSettings: SiteSettings, ip: string): SiteSettings {
    this.data.settings = { ...INITIAL_SETTINGS, ...newSettings };
    this.save();
    this.logSystemEvent("SETTINGS_UPDATED", "INFO", ip, "Global CMS settings updated via dynamic Admin Panel controls");
    return this.data.settings;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public addProduct(p: Omit<Product, "id">, ip: string): Product {
    const newProduct: Product = {
      ...p,
      id: "prod-" + Date.now()
    };
    this.data.products.unshift(newProduct);
    this.save();
    this.logSystemEvent("PRODUCT_ADDED", "INFO", ip, `Admin added premium product: ${newProduct.name}`);
    return newProduct;
  }

  public deleteProduct(id: string, ip: string): boolean {
    const originalLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length < originalLen) {
      this.save();
      this.logSystemEvent("PRODUCT_DELETED", "WARNING", ip, `Admin removed product: ${id}`);
      return true;
    }
    return false;
  }

  // --- Blogs ---
  public getBlogs(): Blog[] {
    return this.data.blogs;
  }

  public addBlog(b: Omit<Blog, "id">, ip: string): Blog {
    const newBlog: Blog = {
      ...b,
      id: "blog-" + Date.now()
    };
    this.data.blogs.unshift(newBlog);
    this.save();
    this.logSystemEvent("BLOG_POST_PUBLISHED", "INFO", ip, `Admin published article: ${newBlog.title}`);
    return newBlog;
  }

  public deleteBlog(id: string, ip: string): boolean {
    const originalLen = this.data.blogs.length;
    this.data.blogs = this.data.blogs.filter(b => b.id !== id);
    if (this.data.blogs.length < originalLen) {
      this.save();
      this.logSystemEvent("BLOG_DELETED", "WARNING", ip, `Admin removed blog article: ${id}`);
      return true;
    }
    return false;
  }

  // --- RFQs (Lead Intake) ---
  public getRFQs(): RFQ[] {
    return this.data.rfqs;
  }

  public addRFQ(r: Omit<RFQ, "id" | "status" | "submissionTime">, ip: string): RFQ {
    const newRfq: RFQ = {
      ...r,
      id: "rfq-" + Date.now(),
      status: "Pending",
      submissionTime: new Date().toISOString()
    };
    this.data.rfqs.unshift(newRfq);
    this.save();
    this.logSystemEvent("LEAD_INTAKE_SUCCESS", "INFO", ip, `New RFQ inquiry matching ${r.productInterestId} by ${r.clientName} (${r.company}) under incoterm ${r.preferredIncoterm}`);
    return newRfq;
  }

  public updateRFQStatus(id: string, status: RFQ["status"], ip: string): boolean {
    const rfq = this.data.rfqs.find(r => r.id === id);
    if (rfq) {
      rfq.status = status;
      this.save();
      this.logSystemEvent("LEAD_STATUS_UPDATE", "INFO", ip, `RFQ ${id} status altered to: ${status}`);
      return true;
    }
    return false;
  }

  // --- Logging & Security Audit ---
  public getLogs(): SystemLog[] {
    return this.data.logs;
  }

  public logSystemEvent(event: string, level: SystemLog["level"], ip: string, details: string) {
    const logEntry: SystemLog = {
      id: "log-" + Math.random().toString(36).substring(4, 11) + Date.now(),
      event,
      level,
      ip,
      timestamp: new Date().toISOString(),
      details
    };
    this.data.logs.unshift(logEntry);
    if (this.data.logs.length > 120) {
      this.data.logs.pop();
    }
    this.save();
  }

  // --- Secure Backups API ---
  public getBackupsList(): BackupInfo[] {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) return [];
      const files = fs.readdirSync(BACKUPS_DIR);
      return files
        .filter(f => f.startsWith("db_backup_") && f.endsWith(".json"))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f));
          return {
            fileName: f,
            size: (stats.size / 1024).toFixed(2) + " KB",
            timestamp: new Date(stats.mtime).toISOString()
          };
        })
        .sort((a, b) => b.fileName.localeCompare(a.fileName));
    } catch {
      return [];
    }
  }

  public createBackup(ip: string): string {
    const timestamp = Date.now();
    const fileName = `db_backup_${timestamp}.json`;
    const targetFile = path.join(BACKUPS_DIR, fileName);
    try {
      fs.writeFileSync(targetFile, JSON.stringify(this.data, null, 2), "utf-8");
      this.logSystemEvent("DATABASE_BACKUP_CREATED", "INFO", ip, `Backup generated: ${fileName}`);
      return fileName;
    } catch (err: any) {
      this.logSystemEvent("DATABASE_BACKUP_FAIL", "ALERT", ip, `Failed backup attempt: ${err.message}`);
      throw err;
    }
  }

  public restoreBackup(fileName: string, ip: string): boolean {
    const sourceFile = path.join(BACKUPS_DIR, fileName);
    try {
      if (fs.existsSync(sourceFile)) {
        const fileContent = fs.readFileSync(sourceFile, "utf-8");
        const parsed = JSON.parse(fileContent);
        this.data = {
          products: parsed.products || INITIAL_PRODUCTS,
          blogs: parsed.blogs || INITIAL_BLOGS,
          rfqs: parsed.rfqs || [],
          logs: parsed.logs || [],
          settings: parsed.settings || INITIAL_SETTINGS,
          admins: parsed.admins || [],
          analytics: parsed.analytics || [],
          media: parsed.media || []
        };
        this.save();
        this.seedDefaultAdmin(); // Safely guarantee admins exist even after restore
        this.logSystemEvent("DATABASE_RESTORE_SUCCESS", "SECURITY", ip, `Restored DB state to archive: ${fileName}`);
        return true;
      }
      return false;
    } catch (err: any) {
      this.logSystemEvent("DATABASE_RESTORE_FAILED", "ALERT", ip, `Fail DB recovery from ${fileName}: ${err.message}`);
      return false;
    }
  }

  // --- Administrators authentication & management ---
  public getAdmins(): AdminUser[] {
    return this.data.admins || [];
  }

  public verifyAdminCredentials(username: string, password_attempt: string): AdminUser | null {
    const admin = this.data.admins?.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!admin) return null;
    const computedHash = crypto.pbkdf2Sync(password_attempt, admin.salt, 1000, 64, "sha512").toString("hex");
    if (computedHash === admin.passwordHash) {
      admin.lastLogin = new Date().toISOString();
      this.save();
      return admin;
    }
    return null;
  }

  public changeAdminPassword(username: string, new_pass: string, ip: string): boolean {
    const admin = this.data.admins?.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!admin) return false;
    const new_salt = crypto.randomBytes(16).toString("hex");
    const new_hash = crypto.pbkdf2Sync(new_pass, new_salt, 1000, 64, "sha512").toString("hex");
    admin.salt = new_salt;
    admin.passwordHash = new_hash;
    this.save();
    this.logSystemEvent("ADMIN_PASSWORD_CHANGED", "SECURITY", ip, `Operator ${username} successfully updated their password variables.`);
    return true;
  }

  // --- Visitor website analytics getters & setters ---
  public getVisitorAnalytics(): VisitorAnalytics[] {
    return this.data.analytics || [];
  }

  // --- Media managers ---
  public getMediaItems(): MediaItem[] {
    return this.data.media || [];
  }

  public addMediaItem(item: Omit<MediaItem, "id" | "uploadedAt">, ip: string): MediaItem {
    const newMedia: MediaItem = {
      ...item,
      id: "med-" + Date.now(),
      uploadedAt: new Date().toISOString()
    };
    if (!this.data.media) this.data.media = [];
    this.data.media.unshift(newMedia);
    this.save();
    this.logSystemEvent("MEDIA_FILE_UPLOADED", "INFO", ip, `Stored file inside compliance gallery: ${item.fileName} (${item.mimeType})`);
    return newMedia;
  }

  public deleteMediaItem(id: string, ip: string): boolean {
    if (!this.data.media) return false;
    const startCount = this.data.media.length;
    this.data.media = this.data.media.filter(m => m.id !== id);
    if (this.data.media.length < startCount) {
      this.save();
      this.logSystemEvent("MEDIA_FILE_DELETED", "WARNING", ip, `Deleted file ID: ${id} from repository assets`);
      return true;
    }
    return false;
  }

  // --- SEO parameters and translations updates ---
  public updateSEO(seoData: SEOSettings, ip: string): SEOSettings {
    this.data.settings.seo = seoData;
    this.save();
    this.logSystemEvent("SEO_METADATA_UPDATED", "INFO", ip, "Global export SEO and description keywords configured");
    return seoData;
  }
}

export const dbInstance = new PremiumDatabase();
