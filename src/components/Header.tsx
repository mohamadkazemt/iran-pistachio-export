import { useState, useEffect } from "react";
import { ShieldCheck, Calendar, Globe, Menu, X, Landmark } from "lucide-react";
import { SiteSettings } from "../types.js";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: string;
  setLang: (lang: string) => void;
  settings?: SiteSettings | null;
}

const LANGUAGES: Record<string, { label: string; flag: string; slogan: string }> = {
  en: { label: "English", flag: "🇺🇸", slogan: "Securing Premium Global Commodity Infrastructure" },
  fa: { label: "فارسی", flag: "🇮🇷", slogan: "تأمین مقتدرانه و صادرات محصولات کشاورزی و پسته ممتاز" },
  es: { label: "Español", flag: "🇪🇸", slogan: "Asegurando la Infraestructura de Mercancías Globales Premium" },
  zh: { label: "中文", flag: "🇨🇳", slogan: "保障全球顶奢大宗农产品与主权物流供应链通道" },
  ar: { label: "العربية", flag: "🇸🇦", slogan: "تأمين البنية التحتية الممتازة للسلع العالمية" },
  de: { label: "Deutsch", flag: "🇩🇪", slogan: "Sicherung globaler Luxus-Handelswege" }
};

const MENU_DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    overview: "Overview",
    catalog: "Exquisite Portfolios",
    rfq: "Request Quotation",
    blogs: "Trade Intelligence",
    advisor: "Compliance Desk IQ",
    admin: "Admin Controls"
  },
  fa: {
    overview: "نمای کلی",
    catalog: "سبد محصولات تجاری",
    rfq: "ثبت تقاضا (RFQ)",
    blogs: "نشریات تحلیل بازار",
    advisor: "گفتگوی زنده با مشاور",
    admin: "پنل مدیریت مرجع"
  },
  es: {
    overview: "Resumen",
    catalog: "Portafolios Exquisitos",
    rfq: "Solicitud de Cotización",
    blogs: "Inteligencia Comercial",
    advisor: "Panel de Cumplimiento",
    admin: "Controles de Admin"
  },
  zh: {
    overview: "主页概览",
    catalog: "精选出口名录",
    rfq: "询价采购通道",
    blogs: "全球贸易合规",
    advisor: "合规智能对话",
    admin: "中央管理控制"
  },
  ar: {
    overview: "نظرة عامة",
    catalog: "كتالوج المنتجات الفاخرة",
    rfq: "طلب اقتباس السعر",
    blogs: "أبحاث التجارة العالمية",
    advisor: "مكتب استشارات جمركية",
    admin: "لوحة تحكم المشرف"
  },
  de: {
    overview: "Übersicht",
    catalog: "Portfolios",
    rfq: "Preisanfrage",
    blogs: "Handelsberichte",
    advisor: "Compliance-Desk",
    admin: "Administration"
  }
};

export default function Header({ currentTab, setCurrentTab, lang, setLang, settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systime, setSystime] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const logoText = settings?.logoText || "Aura";
  const logoSubtext = settings?.logoSubtext || "Lux";
  const brandName = settings?.brandName || "AuraLux Global";

  const t = LANGUAGES[lang]?.slogan || LANGUAGES.en.slogan;
  const menuLabels = MENU_DICTIONARY[lang] || MENU_DICTIONARY.en;

  const isHome = currentTab === "home";

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
      isHome 
        ? "bg-[#faf6eb]/90 border-b border-pistachio-light text-organic-bark" 
        : "bg-luxury-dark/95 border-b border-luxury-gold/20 text-white"
    }`}>
      {/* Top Banner Alert Bar */}
      <div className={`transition-all duration-300 text-[10px] sm:text-xs tracking-widest font-mono py-1 px-4 flex flex-wrap justify-between items-center select-none shadow-xs font-medium ${
        isHome 
          ? "bg-pistachio text-white" 
          : "bg-luxury-gold text-luxury-dark"
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{brandName.toUpperCase()} PORTAL SECURE // SSL 256-BIT ENCRYPTED</span>
        </div>
        <div className="flex items-center gap-4 hidden md:flex">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-3 h-3" />
            <span>FITI / ISO 3632 COMPILATION STANDARDS ENGAGED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>UTC: {systime.replace("T", " ").substring(0, 19)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Brand Identity Branding */}
          <div 
            className="flex flex-col cursor-pointer select-none group"
            onClick={() => setCurrentTab("home")}
          >
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-display font-light uppercase tracking-[0.25em] ${isHome ? 'text-organic-bark' : 'text-white'}`}>
                {logoText}<span className={`${isHome ? 'text-pistachio' : 'text-luxury-gold'} font-normal`}>{logoSubtext}</span>
              </span>
              <span className={`text-[9px] font-mono tracking-widest uppercase ${isHome ? 'text-pistachio/70' : 'text-luxury-gold/60'}`}>Global</span>
            </div>
            <span className={`text-[9px] font-sans font-medium tracking-[0.14em] uppercase mt-0.5 transition-colors block max-w-xs truncate hidden sm:block ${
              isHome ? 'text-gray-500 group-hover:text-pistachio' : 'text-gray-400 group-hover:text-luxury-gold'
            }`}>
              {t}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-sans font-medium text-xs uppercase tracking-[0.18em]">
            <button 
              onClick={() => setCurrentTab("home")}
              className={`pb-1 border-b transition-all duration-300 cursor-pointer ${
                currentTab === "home"
                  ? isHome 
                    ? "text-pistachio border-pistachio font-boldScale" 
                    : "text-luxury-gold border-luxury-gold font-boldScale"
                  : isHome 
                    ? "text-gray-650 hover:text-pistachio border-transparent" 
                    : "text-gray-300 hover:text-luxury-gold border-transparent"
              }`}
            >
              {menuLabels.overview}
            </button>
            <button 
              onClick={() => setCurrentTab("catalog")}
              className={`pb-1 border-b transition-all duration-300 cursor-pointer ${
                currentTab === "catalog"
                  ? isHome 
                    ? "text-pistachio border-pistachio font-boldScale" 
                    : "text-luxury-gold border-luxury-gold font-boldScale"
                  : isHome 
                    ? "text-gray-650 hover:text-pistachio border-transparent" 
                    : "text-gray-300 hover:text-luxury-gold border-transparent"
              }`}
            >
              {menuLabels.catalog}
            </button>
            <button 
              onClick={() => setCurrentTab("rfq")}
              className={`pb-1 border-b transition-all duration-300 cursor-pointer ${
                currentTab === "rfq"
                  ? isHome 
                    ? "text-pistachio border-pistachio font-boldScale" 
                    : "text-luxury-gold border-luxury-gold font-boldScale"
                  : isHome 
                    ? "text-gray-650 hover:text-pistachio border-transparent" 
                    : "text-gray-300 hover:text-luxury-gold border-transparent"
              }`}
            >
              {menuLabels.rfq}
            </button>
            <button 
              onClick={() => setCurrentTab("blogs")}
              className={`pb-1 border-b transition-all duration-300 cursor-pointer ${
                currentTab === "blogs"
                  ? isHome 
                    ? "text-pistachio border-pistachio font-boldScale" 
                    : "text-luxury-gold border-luxury-gold font-boldScale"
                  : isHome 
                    ? "text-gray-650 hover:text-pistachio border-transparent" 
                    : "text-gray-300 hover:text-luxury-gold border-transparent"
              }`}
            >
              {menuLabels.blogs}
            </button>
            <button 
              onClick={() => setCurrentTab("advisor")}
              className={`pb-1 border-b transition-all duration-300 cursor-pointer ${
                currentTab === "advisor"
                  ? isHome 
                    ? "text-pistachio border-pistachio font-boldScale" 
                    : "text-luxury-gold border-luxury-gold font-boldScale"
                  : isHome 
                    ? "text-gray-650 hover:text-pistachio border-transparent" 
                    : "text-gray-300 hover:text-luxury-gold border-transparent"
              }`}
            >
              {menuLabels.advisor}
            </button>
            <button 
              onClick={() => setCurrentTab("admin")}
              className={`px-3.5 py-2 border rounded-xs text-[10px] tracking-widest transition-all duration-300 cursor-pointer font-bold ${
                currentTab === "admin"
                  ? isHome 
                    ? "bg-pistachio text-white border-pistachio shadow-xs" 
                    : "bg-luxury-gold text-luxury-dark border-luxury-gold"
                  : isHome 
                    ? "text-pistachio border-pistachio/50 hover:bg-pistachio hover:text-white bg-transparent" 
                    : "text-luxury-gold border-luxury-gold/50 bg-transparent hover:bg-luxury-gold hover:text-luxury-dark"
              }`}
            >
              {menuLabels.admin}
            </button>
          </nav>

          {/* Right Sourcing & Language Controls Deck */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Inline Flags selectors */}
            <div className="flex bg-neutral-100/10 p-1 border border-neutral-300/10 backdrop-blur-sm gap-0.5" id="lang-inline-selector">
              {Object.keys(LANGUAGES).map((lk) => (
                <button
                  key={lk}
                  onClick={() => setLang(lk)}
                  className={`p-1 px-1.5 text-sm transition-transform cursor-pointer hover:scale-115 shrink-0 ${
                    lang === lk 
                      ? "grayscale-0 border-b-2 border-luxury-gold filter brightness-110" 
                      : "grayscale-50 brightness-75 hover:grayscale-0 hover:brightness-100"
                  }`}
                  title={LANGUAGES[lk].label}
                >
                  {LANGUAGES[lk].flag}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile hamburger toggler */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-1.5 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden px-4 pt-2 pb-6 flex flex-col gap-4 font-sans font-medium text-xs uppercase tracking-wider ${
          isHome ? "bg-[#faf6eb] text-organic-bark border-t border-pistachio-light" : "bg-luxury-dark text-white border-t border-luxury-gold/10"
        }`}>
          <button 
            onClick={() => { setCurrentTab("home"); setMobileMenuOpen(false); }}
            className={`text-left py-2 border-b transition-colors ${
              currentTab === "home"
                ? isHome 
                  ? "border-pistachio-light text-pistachio font-bold" 
                  : "border-luxury-gold/10 text-luxury-gold font-bold"
                : isHome
                  ? "border-pistachio-light text-gray-650 hover:text-pistachio"
                  : "border-luxury-gold/10 text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.overview}
          </button>
          <button 
            onClick={() => { setCurrentTab("catalog"); setMobileMenuOpen(false); }}
            className={`text-left py-2 border-b transition-colors ${
              currentTab === "catalog"
                ? isHome 
                  ? "border-pistachio-light text-pistachio font-bold" 
                  : "border-luxury-gold/10 text-luxury-gold font-bold"
                : isHome
                  ? "border-pistachio-light text-gray-650 hover:text-pistachio"
                  : "border-luxury-gold/10 text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.catalog}
          </button>
          <button 
            onClick={() => { setCurrentTab("rfq"); setMobileMenuOpen(false); }}
            className={`text-left py-2 border-b transition-colors ${
              currentTab === "rfq"
                ? isHome 
                  ? "border-pistachio-light text-pistachio font-bold" 
                  : "border-luxury-gold/10 text-luxury-gold font-bold"
                : isHome
                  ? "border-pistachio-light text-gray-650 hover:text-pistachio"
                  : "border-luxury-gold/10 text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.rfq}
          </button>
          <button 
            onClick={() => { setCurrentTab("blogs"); setMobileMenuOpen(false); }}
            className={`text-left py-2 border-b transition-colors ${
              currentTab === "blogs"
                ? isHome 
                  ? "border-pistachio-light text-pistachio font-bold" 
                  : "border-luxury-gold/10 text-luxury-gold font-bold"
                : isHome
                  ? "border-pistachio-light text-gray-650 hover:text-pistachio"
                  : "border-luxury-gold/10 text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.blogs}
          </button>
          <button 
            onClick={() => { setCurrentTab("advisor"); setMobileMenuOpen(false); }}
            className={`text-left py-2 border-b transition-colors ${
              currentTab === "advisor"
                ? isHome 
                  ? "border-pistachio-light text-pistachio font-bold" 
                  : "border-luxury-gold/10 text-luxury-gold font-bold"
                : isHome
                  ? "border-pistachio-light text-gray-650 hover:text-pistachio"
                  : "border-luxury-gold/10 text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.advisor}
          </button>
          <button 
            onClick={() => { setCurrentTab("admin"); setMobileMenuOpen(false); }}
            className={`text-left py-2 transition-colors ${
              currentTab === "admin"
                ? isHome 
                  ? "text-pistachio font-bold" 
                  : "text-luxury-gold font-bold"
                : isHome
                  ? "text-gray-650 hover:text-pistachio"
                  : "text-gray-300 hover:text-luxury-gold"
            }`}
          >
            {menuLabels.admin}
          </button>

          {/* Inline Flags selectors for Mobile */}
          <div className="flex bg-neutral-100/5 p-1 pb-1 pr-1 pl-1 gap-1 border border-neutral-300/10 justify-start w-fit">
            {Object.keys(LANGUAGES).map((lk) => (
              <button
                key={lk}
                onClick={() => { setLang(lk); setMobileMenuOpen(false); }}
                className="p-1 px-2 hover:scale-105"
              >
                {LANGUAGES[lk].flag}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
