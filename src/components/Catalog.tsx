import { useState, useEffect } from "react";
import { Product } from "../types.js";
import { Sparkles, MapPin, Scale, Package, Shield, ArrowRight, X, Layers, Landmark } from "lucide-react";

interface CatalogProps {
  onPreSelectProduct: (productId: string) => void;
  lang: string;
}

const DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    title: "EXQUISITE CORPORATE CATALOG",
    subtitle: "Vetted international standard commodities backed by rigorous purity tests, custom physical packaging, and seamless customs facilitation.",
    all: "ALL PORTFOLIOS",
    origin: "Origin",
    hs: "HS Classification",
    minOrder: "Minimum Cargo",
    lead: "Lead Time",
    purity: "Certifications",
    request: "Initiate Priority RFQ Procedure",
    specs: "Technical Audit Specifications",
    pkging: "Physical Export Packaging Logistics"
  },
  es: {
    title: "CATÁLOGO CORPORATIVO EXQUISITO",
    subtitle: "Productos de estándar internacional garantizados por rigurosas pruebas de pureza, embalaje físico personalizado y aduanas perfectas.",
    all: "TODOS LOS PORTFOLIOS",
    origin: "Origen",
    hs: "Clasificación HS",
    minOrder: "Carga Mínima",
    lead: "Plazo de Entrega",
    purity: "Certificaciones",
    request: "Iniciar Procedimiento RFQ Prioritario",
    specs: "Especificaciones Técnicas de Auditoría",
    pkging: "Logística y Embalaje Físico de Exportación"
  },
  zh: {
    title: "高奢全球出口名录",
    subtitle: "符合严格纯度测试、定制物理包装和无缝全球通关的国际标准优质大宗商品。",
    all: "全部资产组合",
    origin: "产地",
    hs: "协调制度(HS)编码",
    minOrder: "最低承运量",
    lead: "交付交付期",
    purity: "产品纯度认证",
    request: "启动优先询价(RFQ)程序",
    specs: "技术参数审计指标",
    pkging: "出口实物物理包装物流"
  },
  ar: {
    title: "كتالوج السلع الفاخرة المعتمدة",
    subtitle: "منتجات معتمدة بموجب فحوصات مخبرية صارمة لضمان النقاء، معبأة بمواصفات قياسية وتسهيلات جمركية متكاملة.",
    all: "جميع المنتجات",
    origin: "المنشأ الأصلي",
    hs: "تصنيف المنسق (HS)",
    minOrder: "الحد الأدنى للطلب",
    lead: "فترة الشحن والجاهزية",
    purity: "شهادات جودة النقاء",
    request: "بدء إجراءات طلب التسعير الفوري",
    specs: "المواصفات والضوابط الفنية المعتمدة",
    pkging: "لوجستيات التعبئة والتغليف المادي للتصدير"
  },
  de: {
    title: "EXQUISITER HANDELSKATALOG",
    subtitle: "Zertifizierte Rohstoffe nach internationalem Standard, gestützt auf strenge Reinheitstests, maßgeschneiderte Verpackung und reibungslose Zollabwicklung.",
    all: "ALLE PORTFOLIOS",
    origin: "Herkunft",
    hs: "Zoll-HS-Code",
    minOrder: "Mindestmenge",
    lead: "Transportdauer",
    purity: "Qualitätszertifikate",
    request: "Prioritäres RFQ-Verfahren einleiten",
    specs: "Technische Audit-Spezifikationen",
    pkging: "Physische Exportverpackung und Logistik"
  },
  fa: {
    title: "کاتالوگ جامع محصولات لوکس صادراتی",
    subtitle: "فرآورده‌های کشاورزی مطابق با استانداردهای سخت‌گیرانه بین‌المللی شامل پسته، زعفران، بادام و میوه‌های خشک ممتاز همگام با آزمون‌های دقیق خلوص.",
    all: "همه محصولات",
    origin: "خاستگاه محصول",
    hs: "کد بین‌المللی تعرفه گمرکی (HS Classification)",
    minOrder: "حداقل تناژ سفارش صادراتی",
    lead: "مدت زمان آماده‌سازی محموله",
    purity: "گواهی‌نامه‌ها و تاییدیه خلوص",
    request: "آغاز فرآیند استعلام قیمت اولویت‌دار",
    specs: "برگه ارزیابی فنی و ممیزی محصول",
    pkging: "سیستم حفاظتی و لجستیک بسته‌بندی صادراتی"
  }
};

export default function Catalog({ onPreSelectProduct, lang }: CatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const labels = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed loading catalog", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories: string[] = ["All", ...Array.from(new Set(products.flatMap(p => p.categories))) as string[]];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.categories.includes(selectedCategory));

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans" id="catalog-main-panel">
      
      {/* Exquisite Section Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] tracking-[0.2em] font-mono text-luxury-gold uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premier Exporter Portfolio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-light uppercase tracking-widest text-luxury-dark mb-4">
          {labels.title}
        </h1>
        <div className="w-16 h-[1.5px] bg-luxury-gold mx-auto mb-6"></div>
        <p className="text-sm text-gray-500 font-light leading-relaxed tracking-wide">
          {labels.subtitle}
        </p>
      </div>

      {/* Category Navigation Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xs border text-[11px] font-sans font-medium tracking-widest uppercase transition-all duration-300 ${
              selectedCategory === cat
                ? "bg-luxury-dark text-white border-luxury-dark shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold hover:text-luxury-dark"
            }`}
            id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat === "All" ? labels.all : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
        </div>
      ) : (
        /* Products Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredProducts.map(p => {
            const displayName = p.translations?.[lang]?.name || p.name;
            const displayDesc = p.translations?.[lang]?.description || p.description;
            const displayOrigin = p.translations?.[lang]?.origin || p.origin;
            return (
              <div
                key={p.id}
                onClick={() => setActiveProduct(p)}
                className="bg-white border border-gray-100 rounded-xs overflow-hidden cursor-pointer group hover:border-luxury-gold/40 hover:shadow-2xl hover:shadow-luxury-gold/5 transition-all duration-500 flex flex-col justify-between"
                id={`product-card-${p.id}`}
              >
                <div>
                  {/* Image Showcase Frame */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-luxury-light">
                    <img
                      src={p.imageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Category badging overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      {p.categories.map(cat => (
                        <span key={cat} className="bg-luxury-dark/95 border border-luxury-gold/30 text-[9px] font-mono tracking-widest text-luxury-gold px-2.5 py-1 uppercase">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Title Content */}
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-baseline gap-2 mb-3">
                      <h2 className="text-lg font-display font-medium text-luxury-dark tracking-wide uppercase group-hover:text-luxury-gold transition-colors duration-300">
                        {displayName}
                      </h2>
                      <span className="font-mono text-xs text-luxury-gold font-semibold shrink-0">
                        {p.priceRange} <span className="text-[10px] text-gray-400 font-normal">/ {p.unit}</span>
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 font-light leading-relaxed tracking-wide mb-6 line-clamp-3">
                      {displayDesc}
                    </p>

                    {/* High level specifications showcase */}
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-gray-100 pt-5 text-[11px] font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                        <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider">{labels.origin}:</span>
                        <span className="truncate max-w-[120px]">{displayOrigin.split(" (")[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                        <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider">HS:</span>
                        <span className="font-mono">{p.hsCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                        <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider">MOQ:</span>
                        <span>{p.minOrder}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                        <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider">Lead:</span>
                        <span>{p.leadTime.split(" ")[0]} Days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="border-t border-gray-100 p-6 flex items-center justify-between text-xs font-sans font-semibold tracking-widest uppercase text-luxury-dark group-hover:bg-luxury-light transition-colors">
                  <span>View Pure Tolerances & Logistics</span>
                  <ArrowRight className="w-4 h-4 text-luxury-gold group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Luxury Immersive Product Specifications Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-luxury-dark/90 backdrop-blur-sm flex items-center justify-center p-4" id="specification-modal">
          <div className="bg-white border text-luxury-dark border-luxury-gold/30 rounded-xs max-w-4xl w-full p-6 sm:p-10 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-luxury-dark cursor-pointer transition-colors"
              aria-label="Close details"
              id="spec-modal-close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Heading Elements */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-1/3 h-52 sm:h-64 rounded-xs overflow-hidden bg-luxury-light shrink-0">
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {activeProduct.categories.map(cat => (
                      <span key={cat} className="bg-luxury-gold/10 border border-luxury-gold/30 text-[9px] font-mono tracking-widest text-luxury-gold px-2.5 py-0.5 uppercase">
                        {cat}
                      </span>
                    ))}
                    <span className="bg-luxury-slate/10 text-gray-600 text-[9px] font-mono tracking-widest px-2.5 py-0.5 uppercase flex items-center gap-1">
                      <Landmark className="w-2.5 h-2.5" />
                      SECURE VALUE CHAIN
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-luxury-dark uppercase tracking-wide mb-3">
                    {activeProduct.translations?.[lang]?.name || activeProduct.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-light leading-relaxed tracking-wide mb-4">
                    {activeProduct.translations?.[lang]?.description || activeProduct.description}
                  </p>
                </div>

                {/* Core Commercial Limits Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">{labels.origin}</span>
                    <span className="font-semibold text-luxury-dark">{activeProduct.translations?.[lang]?.origin || activeProduct.origin}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">{labels.hs}</span>
                    <span className="font-mono font-semibold text-luxury-dark">{activeProduct.hsCode}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">{labels.minOrder}</span>
                    <span className="font-semibold text-luxury-dark">{activeProduct.minOrder}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">{labels.lead}</span>
                    <span className="font-semibold text-luxury-dark">{activeProduct.leadTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Audit parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-luxury-light p-6 border border-gray-100 rounded-xs">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-luxury-dark mb-4 pb-2 border-b border-gray-200">
                  <Layers className="w-4 h-4 text-luxury-gold" />
                  <span>{labels.specs}</span>
                </div>
                <table className="w-full text-xs" id="specs-table">
                  <tbody>
                    {activeProduct.purityGrade && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-gray-400 uppercase font-medium tracking-wide">Standard Grade</td>
                        <td className="py-2.5 font-sans font-semibold text-right text-luxury-dark">{activeProduct.purityGrade}</td>
                      </tr>
                    )}
                    {Object.entries(activeProduct.specifications).map(([key, val]) => (
                      <tr key={key} className="border-b border-gray-100 last:border-0" id={`spec-row-${key.toLowerCase().replace(/\s+/g, "-")}`}>
                        <td className="py-2.5 text-gray-400 uppercase font-medium tracking-wide">{key}</td>
                        <td className="py-2.5 font-sans font-semibold text-right text-luxury-dark">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Physical packaging protocols */}
              <div className="bg-luxury-light p-6 border border-gray-100 rounded-xs">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-luxury-dark mb-4 pb-2 border-b border-gray-200">
                  <Package className="w-4 h-4 text-luxury-gold" />
                  <span>{labels.pkging}</span>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed tracking-wide mb-4">
                  Export commodities are packaged under strict humidity-controlled environments utilizing dynamic desiccant layers and vacuum sealed frames to guarantee peak mineral status at physical arrival points.
                </p>
                <div className="border border-luxury-gold/30 bg-white p-4 rounded-xs text-xs">
                  <span className="block text-[10px] font-mono text-luxury-gold uppercase tracking-wider mb-1 font-medium">Standard Packaging Spec</span>
                  <span className="font-sans font-semibold text-luxury-dark leading-relaxed-strict">{activeProduct.packaging}</span>
                </div>
              </div>
            </div>

            {/* Primary RFQ Redirect Action */}
            <button
              onClick={() => {
                onPreSelectProduct(activeProduct.id);
                setActiveProduct(null);
              }}
              className="w-full bg-luxury-dark text-white border border-luxury-dark hover:bg-transparent hover:text-luxury-dark transition-all duration-300 py-4.5 px-6 rounded-xs text-xs font-semibold uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-3.5"
              id="spec-modal-rfq-submit"
            >
              <span>{labels.request}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
