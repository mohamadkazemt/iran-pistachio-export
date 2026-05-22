import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Globe, Scale, ArrowRight, Landmark, Compass, 
  MapPin, Anchor, Star, Sparkles, Sprout, ShieldAlert, Award, ChevronRight, Play, Eye
} from "lucide-react";
import { SiteSettings, Product } from "../types.js";

interface HomeSectionProps {
  setCurrentTab: (tab: string) => void;
  onPreSelectProduct: (productId: string) => void;
  lang: string;
  settings?: SiteSettings | null;
}

const DEFAULT_STEPS = [
  {
    num: "01",
    phase: "Terroir Selection",
    headline: "High-Altitude Volcanic Slopes",
    details: "Estates selected above 1,200 meters, utilizing clean snowmelt water. Diurnal thermal range improves lipid density inside developing kernels.",
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80"
  },
  {
    num: "02",
    phase: "Hyper-Careful Sorting",
    headline: "Laser & Manual Verification",
    details: "Dual-spectrum sensors examine dimensions, instantly quarantining fraction-split kernels, preserving strictly whole, vibrant green premium crops.",
    image: "https://images.unsplash.com/photo-1517093602195-b40af9688b46?auto=format&fit=crop&w=600&q=80"
  },
  {
    num: "03",
    phase: "Sterile Encapsulation",
    headline: "Pre-Flushed Nitrogen Shielding",
    details: "Sealed inside micro-perforated composite barrier films under nitrogen pressure. Humidity sensors stream telemetry during freight transit.",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80"
  }
];

export default function HomeSection({ setCurrentTab, onPreSelectProduct, lang, settings }: HomeSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<"certificates" | "gallery" | "videos">("certificates");
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (active) setLiveProducts(data.slice(0, 4));
      })
      .catch(err => console.error("Error loaded homepage products", err));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up auto-advancing background slider
  const slidersList = settings?.sliders || [];
  useEffect(() => {
    if (slidersList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIdx(prev => (prev + 1) % slidersList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slidersList]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const textDict = settings?.homepageTexts?.[lang] || settings?.homepageTexts?.["en"];

  // Fallback defaults
  const heroTag = textDict?.heroTag || "Intelligent Sovereign Exquisite Sourcing";
  const heroTitle1 = textDict?.heroTitle1 || "Pristine Purity,";
  const heroTitle2 = textDict?.heroTitle2 || "Sovereign Logistics";
  const heroDesc = textDict?.heroDesc || "AuraLux facilities orchestrate an elite organic pipeline of premium Persian raw pistachios, exclusive tree nuts, and delicate dried fruit reserves.";
  const ctaCatalog = textDict?.ctaCatalog || "Explore Royal Reserves";
  const ctaAdvisor = textDict?.ctaAdvisor || "Aura Intelligence Desk";
  
  const stat1Label = textDict?.stat1Label || "Tested Purity Standard";
  const stat1Value = textDict?.stat1Value || "99.8% Passed";
  const stat2Label = textDict?.stat2Label || "Safe Freight Cargoes";
  const stat2Value = textDict?.stat2Value || "Nitrogen Shielded";
  const stat3Label = textDict?.stat3Label || "Sovereign Logistics Lines";
  const stat3Value = textDict?.stat3Value || "EXW / FOB / CIF";
  const stat4Label = textDict?.stat4Label || "Compliance Assurance";
  const stat4Value = textDict?.stat4Value || "Zero Aflatoxin";

  const pillarTitle = textDict?.pillarTitle || "Organically Crafted, Universally Authenticated";
  const pillarSubtitle = textDict?.pillarSubtitle || "Our high-end agricultural offerings are harvested selectively, packaged under inert nitrogen filters, and transported cleanly.";
  const pillar1Title = textDict?.pillar1Title || "Artisanal Pistachio Estates";
  const pillar1Desc = textDict?.pillar1Desc || "Our high-yield pistachio trees thrive in dry volcanic terrains, producing deep green kernel grades that exceed prime export and regulatory benchmarks.";
  const pillar2Title = textDict?.pillar2Title || "Premium Nitrogen Storage";
  const pillar2Desc = textDict?.pillar2Desc || "Processed inside sterile, vacuum-sealed cargo packages, pre-flushed with food-grade nitrogen to lock in rich, biological enzymes and prevent oxidation.";
  const pillar3Title = textDict?.pillar3Title || "ISO Validation System";
  const pillar3Desc = textDict?.pillar3Desc || "Comprehensive chromatography evaluation scans every container batch, establishing strict aflatoxin-free certification and phytosanitary clearance.";

  const journeyTitle = textDict?.journeyTitle || "The Sourcing Odyssey";
  const journeySubtitle = textDict?.journeySubtitle || "Witness the exquisite progression of the earth's premium organic treasures from volcanic mountains to international sea terminals.";
  const readMore = textDict?.readMore || "View Export Specifications";

  const backgroundZoom = 1 + scrollY * 0.0003;
  const overlayOpacityByScroll = Math.min(0.85, 0.45 + scrollY * 0.001);
  const textParallax = scrollY * 0.35;
  const elementFloatingMultiplier = scrollY * 0.15;

  const currentHeroImage = slidersList[activeSlideIdx]?.imageUrl || "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="bg-[#fcfdfa] text-organic-bark selection:bg-pistachio selection:text-white" id="landing-home-scroller">
      
      {/* 1. CINEMATIC SCROLL-REACTIVE ULTRA-PREMIUM HERO */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-pistachio-light"
        id="luxury-interactive-hero"
      >
        {/* Parallax Zoom Background Image */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${currentHeroImage}')`,
            transform: `scale(${backgroundZoom}) translateY(${scrollY * 0.08}px)`
          }}
        />

        {/* Dynamic Light Overlay shifting by scrolling */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{ 
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(241,248,238,0.15) 0%, rgba(44,66,27,${overlayOpacityByScroll}) 80%)`
          }}
        />

        {/* Floating Pistachio Leaf 1 (Interactive Parallax element) */}
        <motion.div 
          className="absolute top-[18%] left-[8%] w-12 h-12 md:w-16 md:h-16 pointer-events-none filter blur-[0.5px] opacity-80"
          style={{ y: -elementFloatingMultiplier * 1.5, rotate: scrollY * 0.08 }}
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-linear-to-br from-pistachio/30 to-pistachio-dark/40 rounded-full border border-pistachio/50 flex items-center justify-center text-white backdrop-blur-xs">
            <Sprout className="w-5 h-5 text-pistachio" />
          </div>
        </motion.div>

        {/* Floating Star Leaf 2 (Interactive Parallax element) */}
        <motion.div 
          className="absolute bottom-[24%] right-[10%] w-16 h-16 md:w-20 md:h-20 pointer-events-none filter blur-[1px] opacity-75"
          style={{ y: -elementFloatingMultiplier * 0.9, rotate: -scrollY * 0.05 }}
          animate={{ y: [0, 15, 0], rotate: [0, -7, 7, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-linear-to-tr from-cream/40 to-pistachio/50 rounded-2xl border border-cream/60 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-[#dcae51]" />
          </div>
        </motion.div>

        {/* Floating Bio Spark 3 */}
        <motion.div 
          className="absolute top-[50%] right-[18%] w-8 h-8 pointer-events-none hidden lg:block"
          style={{ y: -elementFloatingMultiplier * 2.2 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-4 h-4 bg-[#dcae51] rounded-full shadow-lg shadow-[#dcae51]/50" />
        </motion.div>

        {/* Main Hero Container */}
        <div className="max-w-7xl mx-auto relative z-10 text-center" style={{ transform: `translateY(${textParallax * 0.2}px)` }}>
          
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-cream/90 backdrop-blur-md border border-pistachio/40 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-mono font-semibold uppercase tracking-widest text-[#5c4a3c] mb-6 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-pistachio" />
            <span>{heroTag}</span>
          </motion.div>

          {/* Title Header: Splendid Pistachio styling */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display uppercase tracking-[0.06em] leading-[1.05] text-white mb-6">
            <motion.span 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="block font-light text-cream text-shadow-md"
            >
              {heroTitle1}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="block font-medium text-linear-to-r from-pistachio-light via-cream to-[#dcae51] tracking-widest text-shadow-lg"
            >
              {heroTitle2}
            </motion.span>
          </h1>

          {/* Luxury Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xs sm:text-sm md:text-base text-cream/90 font-light leading-relaxed max-w-2xl mx-auto mb-10 tracking-wide font-sans px-4 text-shadow-sm"
          >
            {heroDesc}
          </motion.p>

          {/* CTA Action Deck */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <button
              onClick={() => setCurrentTab("catalog")}
              className="w-full sm:w-auto bg-linear-to-r from-pistachio to-[#8dbd6c] hover:from-white hover:to-white text-white hover:text-pistachio border-2 border-transparent hover:border-pistachio transition-all duration-300 px-8 py-4 px-8 rounded-xs text-xs font-semibold uppercase tracking-widest font-sans flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              id="pistachio-cta-catalog"
            >
              <span>{ctaCatalog}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab("advisor")}
              className="w-full sm:w-auto bg-cream/90 backdrop-blur-md hover:bg-pistachio text-organic-bark hover:text-white border-2 border-[#dcae51]/50 hover:border-pistachio transition-all duration-300 px-8 py-4 rounded-xs text-xs font-semibold uppercase tracking-widest font-sans flex items-center justify-center gap-2 cursor-pointer shadow-inner"
              id="pistachio-cta-advisor"
            >
              <span>{ctaAdvisor}</span>
              <Globe className="w-4 h-4 text-[#dcae51]" />
            </button>
          </motion.div>
        </div>

        {/* Stat overlay, now light-themed glassmorphic and elegant */}
        <div className="absolute bottom-0 inset-x-0 bg-white/75 backdrop-blur-lg border-t border-pistachio-light py-5 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x divide-pistachio-light text-xs font-sans">
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{stat1Label}</span>
              <span className="font-semibold text-pistachio-dark font-mono text-sm leading-6 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#dcae51] shrink-0" />
                {stat1Value}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{stat2Label}</span>
              <span className="font-semibold text-pistachio-dark text-sm leading-6">{stat2Value}</span>
            </div>
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{stat3Label}</span>
              <span className="font-semibold text-pistachio-dark text-sm leading-6">{stat3Value}</span>
            </div>
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{stat4Label}</span>
              <span className="font-semibold text-pistachio flex items-center gap-1 text-sm leading-6 uppercase text-[11px] font-mono tracking-wider font-bold">
                <ShieldCheck className="w-4 h-4 text-pistachio" />
                {stat4Value}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC BRAND STORYTELLING WITH BEN-TO PILLARS */}
      <section className="py-24 bg-cream/35 relative overflow-hidden text-organic-bark" id="pistachio-story-guide">
        {/* Subtle background abstract gradient circles to enrich design layout */}
        <div className="absolute top-1/4 right-[-10%] w-[35rem] h-[35rem] rounded-full bg-linear-to-br from-pistachio-light/30 to-cream/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-[-10%] w-[30rem] h-[30rem] rounded-full bg-linear-to-tr from-cream/20 to-pistachio-light/45 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-pistachio-light/80 border border-pistachio/30 rounded-full text-[9px] font-mono tracking-widest uppercase text-pistachio"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Sovereignty Over Terroir</span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-[#5c4a3c] mt-4 mb-3">
              {pillarTitle}
            </h2>
            <div className="w-16 h-1 bg-[#dcae51] mx-auto mb-5 rounded-full" />
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-xl mx-auto font-sans">
              {pillarSubtitle}
            </p>
          </div>

          {/* Interactive Bento Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar Item 1 */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white/90 backdrop-blur-md border border-pistachio-light/60 p-8 hover:border-pistachio/40 rounded-3xl transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 block relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-radial-gradient(circle at 100% 100%, rgba(141,189,108,0.1), transparent) transition-opacity duration-300 ${hoveredCard === 1 ? "opacity-100" : "opacity-0"}`} />
              <div className="w-12 h-12 bg-pistachio-light rounded-2xl border border-pistachio/30 flex items-center justify-center text-pistachio mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider mb-3 text-pistachio-dark">
                {pillar1Title}
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-4 font-sans">
                {pillar1Desc}
              </p>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#dcae51] flex items-center gap-1 cursor-pointer">
                <span>0.8% Moisture Ceiling</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            {/* Pillar Item 2 */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white/90 backdrop-blur-md border border-pistachio-light/60 p-8 hover:border-pistachio/40 rounded-3xl transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 block relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-radial-gradient(circle at 100% 100%, rgba(141,189,108,0.1), transparent) transition-opacity duration-300 ${hoveredCard === 2 ? "opacity-100" : "opacity-0"}`} />
              <div className="w-12 h-12 bg-pistachio-light rounded-2xl border border-pistachio/30 flex items-center justify-center text-pistachio mb-6">
                <Anchor className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider mb-3 text-pistachio-dark">
                {pillar2Title}
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-4 font-sans">
                {pillar2Desc}
              </p>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#dcae51] flex items-center gap-1 cursor-pointer">
                <span>Nitrogen Barrier Cap</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            {/* Pillar Item 3 */}
            <motion.div 
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white/90 backdrop-blur-md border border-pistachio-light/60 p-8 hover:border-pistachio/40 rounded-3xl transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 block relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`absolute inset-0 bg-radial-gradient(circle at 100% 100%, rgba(141,189,108,0.1), transparent) transition-opacity duration-300 ${hoveredCard === 3 ? "opacity-100" : "opacity-0"}`} />
              <div className="w-12 h-12 bg-pistachio-light rounded-2xl border border-pistachio/30 flex items-center justify-center text-pistachio mb-6">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider mb-3 text-pistachio-dark">
                {pillar3Title}
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-4 font-sans">
                {pillar3Desc}
              </p>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#dcae51] flex items-center gap-1 cursor-pointer">
                <span>100% Phyto Compliant</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE CHRONICLE STORY & ROADMAP */}
      <section className="py-24 bg-white border-b border-pistachio-light" id="pistachio-interactive-chronicle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Dynamic visuals changing as step active */}
            <div className="space-y-6 relative">
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-widest block">Operational Excellence Sequence</span>
              <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-[#5c4a3c] mb-6">
                {journeyTitle}
              </h3>

              {/* Step indicator pills */}
              <div className="flex gap-2.5 mb-8">
                {DEFAULT_STEPS.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`px-4.5 py-2.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      activeStep === idx 
                        ? "bg-pistachio text-white shadow-md shadow-pistachio/30" 
                        : "bg-pistachio-light/65 text-pistachio-dark hover:bg-pistachio-light"
                    }`}
                  >
                    Step {step.num}
                  </button>
                ))}
              </div>

              {/* Framer Motion animate container for visuals */}
              <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-xl border border-pistachio-light/60 bg-[#faf6eb]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeStep}
                    src={DEFAULT_STEPS[activeStep].image}
                    alt={DEFAULT_STEPS[activeStep].headline}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover filter brightness-95"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-linear-to-t from-pistachio-dark/80 via-transparent to-transparent" />
                
                {/* Embedded step overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="font-mono text-xs text-[#dcae51] tracking-widest uppercase block mb-1">
                    {DEFAULT_STEPS[activeStep].phase}
                  </span>
                  <h4 className="text-base sm:text-lg font-display uppercase tracking-wider font-semibold">
                    {DEFAULT_STEPS[activeStep].headline}
                  </h4>
                </div>
              </div>
            </div>

            {/* Right: Rich storytelling cards */}
            <div className="space-y-6 lg:pl-8">
              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed font-sans">
                {journeySubtitle}
              </p>

              <div className="space-y-6">
                {DEFAULT_STEPS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      activeStep === idx 
                        ? "bg-pistachio-light/40 border-pistachio/40 shadow-xs" 
                        : "bg-transparent border-transparent hover:bg-cream/20"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`font-mono text-base font-bold ${activeStep === idx ? 'text-pistachio' : 'text-gray-300'}`}>
                        {item.num}
                      </span>
                      <h4 className="text-sm font-display font-bold uppercase tracking-wide text-pistachio-dark">
                        {item.phase}
                      </h4>
                    </div>
                    
                    <p className={`text-xs font-light font-sans leading-relaxed ${activeStep === idx ? 'text-gray-700' : 'text-gray-400'}`}>
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setCurrentTab("catalog")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pistachio hover:text-pistachio-dark font-sans transition-colors cursor-pointer"
                >
                  <span>{readMore}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHERRY-PICKED LUXURY DELICACIES (PISTACHIO SPECIALS & MORE) */}
      <section className="py-24 bg-[#fafbf8]" id="pistachio-delicacy-showcase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8dbd6c]" id="signature-reserves-badge">Royal Reserves Showcase</span>
              <h2 className="text-3xl font-display uppercase tracking-widest text-[#5c4a3c]" id="signature-reserves-title">Selected Exquisite Products</h2>
            </div>
            
            <button
              onClick={() => setCurrentTab("catalog")}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5c4a3c] hover:text-[#8dbd6c] font-sans transition-all cursor-pointer bg-cream/50 px-4 py-2 border border-pistachio-light rounded-xs"
              id="goto-full-catalog-btn"
            >
              <span>View Sovereign Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {liveProducts.length > 0 ? (
              liveProducts.map(p => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -6 }}
                  className="bg-white border border-pistachio-light rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  id={`home-product-card-${p.id}`}
                >
                  <div className="relative h-52 bg-cream overflow-hidden">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-4 left-4 bg-pistachio-dark/95 text-white font-mono text-[8px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {p.categories[0]}
                    </span>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-[#dcae51] uppercase tracking-wider block mb-1">SKU: {p.id.toUpperCase()}</span>
                      <h4 className="text-xs font-display font-semibold uppercase text-pistachio-dark tracking-wide mb-1 leading-relaxed line-clamp-1">{p.name}</h4>
                      <p className="text-[11px] text-gray-500 font-light font-sans line-clamp-2 leading-relaxed mb-4">{p.description}</p>
                    </div>
                    <button 
                      onClick={() => onPreSelectProduct(p.id)} 
                      className="text-[10px] font-mono text-pistachio hover:text-pistachio-dark hover:underline font-bold uppercase block transition-colors mt-2 text-left"
                    >
                      Verify Quotation Terms →
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center text-xs text-gray-400 py-6">
                Directing database products ledger...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BRANDED MEDIA TAB-DECK (CERTIFICATES, ORCHARDS GALLERY, VIDEOS) */}
      <section className="py-24 bg-white border-b border-pistachio-light" id="cms-brand-media-deck">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-widest block">Sovereign Validation Resources</span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-[#5c4a3c] mt-2 mb-3">
              Corporate Records & Gallery
            </h2>
            <div className="w-12 h-1 bg-pistachio mx-auto text-center" />
          </div>

          {/* Media Interactive Selection Tabs */}
          <div className="flex justify-center border-b border-pistachio-light pb-0.5 mb-12 gap-2 sm:gap-6">
            <button
              onClick={() => setActiveMediaTab("certificates")}
              className={`px-5 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                activeMediaTab === "certificates"
                  ? "text-pistachio border-pistachio font-boldScale"
                  : "text-gray-400 border-transparent hover:text-pistachio"
              }`}
            >
              Audited Certificates ({settings?.certificates?.length || 3})
            </button>
            <button
              onClick={() => setActiveMediaTab("gallery")}
              className={`px-5 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                activeMediaTab === "gallery"
                  ? "text-pistachio border-pistachio font-boldScale"
                  : "text-gray-400 border-transparent hover:text-pistachio"
              }`}
            >
              Physical Galleries ({settings?.gallery?.length || 3})
            </button>
            <button
              onClick={() => setActiveMediaTab("videos")}
              className={`px-5 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                activeMediaTab === "videos"
                  ? "text-pistachio border-pistachio font-boldScale"
                  : "text-gray-400 border-transparent hover:text-pistachio"
              }`}
            >
              Sourcing Documentaries ({settings?.videos?.length || 1})
            </button>
          </div>

          <div className="mt-8 animate-fadeIn">
            {/* Sub-Tab 1: Audited Certificates */}
            {activeMediaTab === "certificates" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(settings?.certificates || []).map((cert, index) => (
                  <motion.div
                    key={cert.id || index}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 bg-[#fafbf8] border border-pistachio-light rounded-3xl flex items-start gap-4"
                  >
                    <div className="p-3 bg-linear-to-br from-pistachio-light to-cream rounded-2xl text-pistachio shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-display font-bold uppercase tracking-wide text-pistachio-dark mb-1 leading-relaxed">
                        {cert.name}
                      </h4>
                      <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                        Issued: {cert.issuedBy}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Sub-Tab 2: Orchards Gallery */}
            {activeMediaTab === "gallery" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {(settings?.gallery || []).map((photo, idx) => (
                  <div key={photo.id || idx} className="group relative rounded-3xl overflow-hidden h-64 shadow-xs border border-pistachio-light/60 bg-cream">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div className="text-white">
                        <span className="text-[8px] font-mono text-[#dcae51] tracking-widest uppercase block mb-1">Physical Orchard Record</span>
                        <h4 className="text-xs font-display uppercase tracking-wider">{photo.title}</h4>
                      </div>
                    </div>
                    {/* Hover indicator icon */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs shadow-xs text-pistachio p-2.5 rounded-full opacity-90 block">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Tab 3: Documentaries */}
            {activeMediaTab === "videos" && (
              <div className="max-w-3xl mx-auto">
                {(settings?.videos || []).map((vid, idx) => (
                  <div key={vid.id || idx} className="group relative rounded-3xl overflow-hidden shadow-2xl border border-pistachio-light/70 aspect-video bg-luxury-dark/90 flex items-center justify-center">
                    <img
                      src={vid.videoUrl}
                      alt={vid.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-xs group-hover:scale-102 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 text-center px-4">
                      {/* Interactive play button simulation */}
                      <button className="w-16 h-16 bg-[#dcae51] text-white rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white hover:text-pistachio transition-colors shadow-lg shadow-[#dcae51]/20">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                      <span className="text-[10px] font-mono uppercase text-gray-300 tracking-[0.2em] block mb-1">Corporate Presentation video</span>
                      <h4 className="text-sm sm:text-base font-display uppercase text-white tracking-widest max-w-md mx-auto">{vid.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. LANDING VERIFIED STATISTICS & TESTIMONIAL GLASS BOX */}
      <section className="py-24 bg-linear-to-b from-[#faf6eb] to-[#f4f7f2] relative" id="pistachio-client-endorsements">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6">
              <div className="flex gap-1 text-[#dcae51]">
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              
              <blockquote className="text-xl sm:text-2xl font-display font-light uppercase tracking-wide leading-relaxed text-[#5c4a3c] italic" id="testimonial-quote">
                "AuraLux has established our custom pistachio raw sorting pipelines with absolute fidelity. The freshness parameters are unparalleled."
              </blockquote>
              
              <div className="w-12 h-0.5 bg-pistachio" />
              
              <div>
                <span className="block font-mono text-[10px] text-gray-400 uppercase tracking-widest">H. S. Van Der Berg</span>
                <span className="block text-xs font-light text-gray-500 font-sans mt-0.5">Procurement Director, Rotterdam Dielectrics Group</span>
              </div>
            </div>

            {/* Glassmorphic detailed statistics panel */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-pistachio-light shadow-xl" id="testimonial-stats-box">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#5c4a3c] mb-6 pb-2 border-b border-pistachio-light flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-pistachio" />
                Verified Importer Performance Audit
              </h4>
              
              <ul className="space-y-4 text-xs font-sans text-gray-500">
                <li className="flex justify-between items-center py-2 border-b border-pistachio-light/40 last:border-0">
                  <span className="text-gray-400">Pistachio Kernel Purity Ratio</span>
                  <strong className="font-mono text-pistachio-dark text-sm">99.8% Certified Passed</strong>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-pistachio-light/40 last:border-0">
                  <span className="text-gray-400">Total Air/Marine Shipments facilitated</span>
                  <strong className="font-mono text-pistachio-dark text-sm">1,240,000 Kilograms</strong>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-pistachio-light/40 last:border-0">
                  <span className="text-gray-400">Aflatoxin Limit Grade ISO 3632</span>
                  <strong className="font-mono text-pistachio text-sm">ZERO POSITIVE DETECTED</strong>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-pistachio-light/40 last:border-0">
                  <span className="text-gray-400">Quarantine Holding delays</span>
                  <strong className="font-mono text-pistachio-dark text-sm">0 Days Recorded (2025)</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
