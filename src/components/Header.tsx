import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  ShieldCheck, Calendar, Globe, Menu, X, Landmark, 
  Home, Compass, FileText, TrendingUp, MessageSquare, Settings, 
  ChevronLeft, ChevronRight, Shield
} from "lucide-react";
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

  // Lock scroll on body when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileMenuOpen]);

  const logoText = settings?.logoText || (lang === "fa" ? "بازرگانی" : "Eslami");
  const logoSubtext = settings?.logoSubtext || (lang === "fa" ? " اسلامی" : " Trading");
  const brandName = settings?.brandName || (lang === "fa" ? "بازرگانی اسلامی" : "Eslami Global Trading");

  const t = LANGUAGES[lang]?.slogan || LANGUAGES.en.slogan;
  const menuLabels = MENU_DICTIONARY[lang] || MENU_DICTIONARY.en;

  const isHome = currentTab === "home";

  return (
    <header className={`sticky top-0 transition-colors duration-300 backdrop-blur-md ${
      mobileMenuOpen ? "z-[999999]" : "z-40"
    } ${
      isHome 
        ? "bg-[#faf6eb]/90 border-b border-pistachio-light text-organic-bark" 
        : "bg-luxury-dark/95 border-b border-luxury-gold/20 text-white"
    }`}>
      {/* Top Banner Alert Bar */}
      <div className={`transition-all duration-300 text-[10px] sm:text-xs tracking-widest font-mono py-1 select-none shadow-xs font-medium ${
        isHome 
          ? "bg-pistachio text-white" 
          : "bg-luxury-gold text-luxury-dark"
      }`}>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-row justify-center md:justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{brandName.toUpperCase()} PORTAL SECURE // SSL 256-BIT ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-3 h-3 shrink-0" />
              <span>FITI / ISO 3632 COMPILATION STANDARDS ENGAGED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>UTC: {systime.replace("T", " ").substring(0, 19)}</span>
            </div>
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
            className="lg:hidden p-1.5 focus:outline-none cursor-pointer text-inherit"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer (RTL & LTR Offcanvas) */}
      {mobileMenuOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] lg:hidden" id="mobile-offcanvas-menu" dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity duration-350"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar Container */}
          <div 
            className={`fixed top-0 bottom-0 w-[82%] max-w-[340px] h-full shadow-2xl flex flex-col justify-between z-10 overflow-hidden transition-all duration-300 ${
              lang === "fa" || lang === "ar" 
                ? "right-0 border-l animate-slide-in-right" 
                : "left-0 border-r animate-slide-in-left"
            } ${
              isHome 
                ? "bg-[#faf6eb] text-organic-bark border-pistachio-light" 
                : "bg-luxury-dark text-white border-luxury-gold/15"
            }`}
            style={{
              boxShadow: "0 25px 50px -12px rgba(0,0, 0, 0.60)"
            }}
          >
            {/* Drawer Header with Logo & Dual RTL Close Buttons */}
            <div className={`p-5 flex items-center justify-between border-b border-dashed ${
              isHome ? "border-pistachio/20" : "border-luxury-gold/15"
            }`}>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-display font-light uppercase tracking-wider">
                    {logoText}<span className={`${isHome ? 'text-pistachio' : 'text-luxury-gold'} font-normal`}>{logoSubtext}</span>
                  </span>
                  <span className={`text-[8px] font-mono tracking-widest uppercase ${isHome ? 'text-pistachio/70' : 'text-luxury-gold/65'}`}>Global</span>
                </div>
                <span className="text-[7px] font-mono uppercase text-gray-400 font-bold block mt-0.5">Secure Session Desk</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
                  isHome ? 'bg-pistachio-light text-pistachio hover:bg-pistachio/10' : 'bg-neutral-900 text-luxury-gold hover:bg-neutral-800'
                }`}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Document Menu Tree */}
            <div className="flex-grow p-5 space-y-6 overflow-y-auto">
              <div className="space-y-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase block mb-3 font-semibold px-2 ${
                  isHome ? 'text-gray-550' : 'text-gray-400'
                }`}>
                  {lang === "fa" ? "منوی مدیریت و دسترسی سریع" : lang === "ar" ? "قائمة الوصول السريع" : "QUICK ACCESS MENU"}
                </span>

                {[
                  { id: "home", label: menuLabels.overview, icon: Home },
                  { id: "catalog", label: menuLabels.catalog, icon: Compass },
                  { id: "rfq", label: menuLabels.rfq, icon: FileText },
                  { id: "blogs", label: menuLabels.blogs, icon: TrendingUp },
                  { id: "advisor", label: menuLabels.advisor, icon: MessageSquare },
                  { id: "admin", label: menuLabels.admin, icon: Settings },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold scale-100 active:scale-98 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? isHome
                            ? "bg-pistachio text-white shadow-md font-bold"
                            : "bg-luxury-gold text-luxury-dark shadow-md font-bold"
                          : isHome
                            ? "text-organic-bark/85 hover:bg-pistachio-light/70 hover:text-pistachio"
                            : "text-gray-250 hover:bg-neutral-900 hover:text-luxury-gold"
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'opacity-60'}`} />
                      <span className="flex-grow text-start">{item.label}</span>
                      {lang === "fa" || lang === "ar" ? (
                        <ChevronLeft className="w-3.5 h-3.5 opacity-45 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 opacity-45 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Secure Token and Trust Information Area */}
              <div className={`p-4 rounded-2xl space-y-2 border ${
                isHome 
                  ? 'bg-pistachio-light/35 border-pistachio-light text-organic-bark/80' 
                  : 'bg-black/20 border-white/5 text-gray-400'
              }`}>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-[#cca250]">ISO & Audit Verified</span>
                </div>
                <p className="text-[10px] leading-relaxed font-light">
                  {lang === "fa" 
                    ? "سامانه صادراتی لوکس آئورالاکس تحت نظارت مستقیم بهداشتی قرنطینه و استانداردهای پایش کیفی برتر فعالیت می‌نماید."
                    : "International Cargo Operations. Double-certified security keys and cargo purity parameters active."}
                </p>
              </div>
            </div>

            {/* Redesigned Grid Language Selection Deck */}
            <div className={`p-5 border-t ${
              isHome ? "border-pistachio/15 bg-cream/10" : "border-luxury-gold/15 bg-black/10"
            } space-y-3.5`}>
              <div className="flex items-center gap-1.5 px-1">
                <Globe className={`w-3.5 h-3.5 ${isHome ? 'text-pistachio' : 'text-luxury-gold'}`} />
                <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${
                  isHome ? 'text-organic-bark/80' : 'text-gray-300'
                }`}>
                  {lang === "fa" ? "انتخاب زبان پورتال" : lang === "ar" ? "اختر لغة النظام" : "PORTAL LANGUAGE"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2" id="mobile-lang-pills-selector">
                {Object.keys(LANGUAGES).map((lk) => {
                  const isActive = lang === lk;
                  return (
                    <button
                      key={lk}
                      onClick={() => { setLang(lk); setMobileMenuOpen(false); }}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                        isActive
                          ? isHome
                            ? "bg-pistachio text-white font-bold scale-102"
                            : "bg-luxury-gold text-luxury-dark font-bold scale-102 shadow-md"
                          : isHome
                            ? "bg-white border border-gray-200 hover:bg-gray-50 text-organic-bark/80"
                            : "bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-gray-300"
                      }`}
                    >
                      <span className="text-sm shrink-0">{LANGUAGES[lk].flag}</span>
                      <span className="truncate">{LANGUAGES[lk].label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Encryption Certificate signature line */}
              <div className="flex items-center justify-between text-[8px] font-mono text-gray-400 mt-1 px-1 tracking-wider uppercase">
                <span>SSL Secured // AES-256</span>
                <span>v2.8.2</span>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
