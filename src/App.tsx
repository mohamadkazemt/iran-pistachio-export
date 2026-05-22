import { useState, useEffect } from "react";
import Header from "./components/Header.tsx";
import Catalog from "./components/Catalog.tsx";
import RfqForm from "./components/RfqForm.tsx";
import BlogSection from "./components/BlogSection.tsx";
import InquiryAgent from "./components/InquiryAgent.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import HomeSection from "./components/HomeSection.tsx";
import { SiteSettings } from "./types.js";
import { 
  ShieldCheck, Globe, Scale, Award, ArrowRight, Landmark, Compass, 
  MapPin, HelpCircle, FileText, Anchor, Star, Phone, Mail, MessageSquare
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [lang, setLang] = useState<string>("en");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const fetchSettings = () => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Error loading web portal settings", err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handlePreSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentTab("rfq");
  };

  const brandName = settings?.brandName || (lang === "fa" ? "بازرگانی اسلامی" : "Eslami Global Trading");
  const contactEmail = settings?.email || "procurement@eslami-global.com";
  const contactPhone = settings?.phone || "+98 21 8888 1234";
  const contactAddress = settings?.address || "Floor 14, Royal Trade Tower, Elahiyeh, Tehran, Iran";

  return (
    <div 
      className="min-h-screen flex flex-col justify-between bg-luxury-light text-luxury-dark selection:bg-luxury-gold selection:text-white font-sans" 
      id="applet-viewport"
      dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}
    >
      
      {/* Prime Header Block */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        lang={lang} 
        setLang={setLang} 
        settings={settings}
      />

      {/* Main Content Router */}
      <main className="flex-grow">
        
        {/* TAB 1: Real-time Premium Overview Landing (Home) */}
        {currentTab === "home" && (
          <HomeSection 
            setCurrentTab={setCurrentTab}
            onPreSelectProduct={handlePreSelectProduct}
            lang={lang}
            settings={settings}
          />
        )}

        {/* TAB 2: Dynamic Catalogs */}
        {currentTab === "catalog" && (
          <Catalog 
            onPreSelectProduct={handlePreSelectProduct} 
            lang={lang} 
          />
        )}

        {/* TAB 3: Rfq Lead intake */}
        {currentTab === "rfq" && (
          <RfqForm 
            preSelectedProductId={selectedProductId} 
            lang={lang} 
          />
        )}

        {/* TAB 4: Trade analysis briefs */}
        {currentTab === "blogs" && (
          <BlogSection 
            lang={lang} 
          />
        )}

        {/* TAB 5: Interactive Advising AI agent */}
        {currentTab === "advisor" && (
          <InquiryAgent 
            lang={lang} 
          />
        )}

        {/* TAB 6: Administrative Operations Dashboard */}
        {currentTab === "admin" && (
          <AdminPanel 
            lang={lang} 
            settings={settings}
            onSettingsUpdated={fetchSettings}
          />
        )}

      </main>

      {/* Corporate Luxury Footer */}
      <footer className="bg-luxury-dark text-white pt-16 pb-12 border-t border-luxury-gold/20 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-800 pb-12 mb-8">
          
          <div className="space-y-4 md:col-span-2">
            <span className="text-lg font-display uppercase tracking-widest text-white">
              {brandName.toUpperCase()}
            </span>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              We secure premium global pipelines of agricultural high-end delicacies and advanced logistics matrices. Certified under strict ISO guidelines, organic quality controls, and protected origins.
            </p>
            <div className="flex gap-4 text-[10px] font-mono text-luxury-gold font-medium">
              <span>EST_2012</span>
              <span>•</span>
              <span>ISO 9001 / 22000 AUDITED</span>
            </div>
            {/* Social icons if present */}
            <div className="flex gap-3 pt-2 text-xs text-gray-400">
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold uppercase tracking-wider font-mono text-[9px]">Instagram</a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold uppercase tracking-wider font-mono text-[9px]">LinkedIn</a>
              )}
              {settings?.telegram && (
                <a href={`https://t.me/${settings.telegram}`} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold uppercase tracking-wider font-mono text-[9px]">Telegram</a>
              )}
              {settings?.whatsApp && (
                <a href={`https://wa.me/${settings.whatsApp.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-gold uppercase tracking-wider font-mono text-[9px]">WhatsApp</a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#a4865e] font-bold">Physical Location</h4>
            <ul className="space-y-2 text-xs text-gray-400 font-light">
              <li className="flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-luxury-gold shrink-0 mt-0.5" /> 
                <span>{contactAddress}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#a4865e] font-bold">Priority Sourcing</h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Consignment queue schedules are processed on our Request Quotation portal. Operator inquiries trigger priority responses.
            </p>
            <div className="space-y-1 bg-black/25 p-3.5 border border-luxury-gold/10 rounded-xs">
              <span className="block text-[8px] font-mono text-[#a4865e] uppercase tracking-wider">Direct Mail Sourcing</span>
              <span className="block text-xs font-mono text-luxury-gold select-all break-all">{contactEmail}</span>
              <span className="block text-[9px] font-mono text-gray-400 pt-1.5">{contactPhone}</span>
            </div>
          </div>

        </div>

        {/* Lower legal copyright bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-500 uppercase">
          <span>© {new Date().getFullYear()} {brandName.toUpperCase()} EXPORT CORPORATION. ALL SOVEREIGN RIGHTS SECURED.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer select-none">TERMS OF CARGO SHIPPING</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer select-none">PHYTO COMPLIANCE TERMS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
