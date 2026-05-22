import { useState, useEffect } from "react";
import { Blog } from "../types.js";
import { Landmark, Calendar, User, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";

interface BlogSectionProps {
  lang: string;
}

const DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    title: "TRADE INTELLIGENCE PORTAL",
    subtitle: "Strategic logistics insights, regulatory HS updates, and international commodities whitepapers authored by the Eslami senior strategy board.",
    read: "Read Analysis Report",
    back: "Return to briefings indices",
    published: "Executive Briefing",
    time: "Reading duration"
  },
  es: {
    title: "PORTAL DE INTELIGENCIA DE COMERCIO",
    subtitle: "Análisis estratégico de logística, actualizaciones de HS e informes técnicos de commodities internacionales por la junta de estrategia sénior de Eslami.",
    read: "Leer artículo de análisis",
    back: "Volver al catálogo de informes",
    published: "Boletín Ejecutivo",
    time: "Duración de lectura"
  },
  zh: {
    title: "全球贸易合规智库",
    subtitle: "Eslami资深战略委员会撰写的全球供应链地缘政治分析、海关关税编码优化及国际大宗商品技术白皮书。",
    read: "阅读合规与风险报告",
    back: "返回智库报告目录",
    published: "首席决策简报",
    time: "预计阅读用时"
  },
  ar: {
    title: "بوابة دراسات التجارة واللوجستيات",
    subtitle: "مؤشرات لوجستية استراتيجية، تحديثات لوائح الرمز المنسق (HS Code)، وأبحاث السلع الدولية الصادرة عن الهيئة الاستشارية العليا لـ Eslami.",
    read: "قراءة التحليل الاستراتيجي للاستيراد",
    back: "العودة لقائمة الدراسات المنشورة",
    published: "إيجاز تنفيذي",
    time: "مدة القراءة التقريبية"
  },
  de: {
    title: "GLOBAL TRADE INTEL-HUB",
    subtitle: "Strategische Logistikanalysen, Regulierungsupdates zu HS-Codes und Rohstoffberichte, verfasst vom Eslami-Aufsichtsrat.",
    read: "Analysenbericht öffnen",
    back: "Zurück zur Berichtsübersicht",
    published: "Mitteilung des Vorstands",
    time: "Lesezeit"
  },
  fa: {
    title: "پورتال هوشمندی و ممیزی بازرگانی",
    subtitle: "بینش‌های لجستیک استراتژیک، اطلاعات گمرکی و تخصصی کدهای تعرفه (HS)، و برگه‌های سفید تجارت بین‌الملل توسط هیئت مدیره ارشد Eslami.",
    read: "مشاهده گزارش تحلیل و بررسی",
    back: "بازگشت به شاخص ممیزی و نشریات",
    published: "نشریه تخصصی هیئت مدیره",
    time: "مدت زمان لازم برای مطالعه"
  }
};

export default function BlogSection({ lang }: BlogSectionProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const labels = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/blogs")
      .then(res => res.json())
      .then(data => {
        if (active) {
          setBlogs(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed loading blogs", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (activeBlog) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-sans animate-fadeIn" id="blog-reader-panel">
        
        {/* Back navigation */}
        <button
          onClick={() => setActiveBlog(null)}
          className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-[#a4865e] hover:text-luxury-dark transition-colors mb-10 cursor-pointer"
          id="blog-back-button"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>{labels.back}</span>
        </button>

        {/* Featured Card image */}
        <div className="w-full h-80 sm:h-[420px] rounded-xs overflow-hidden bg-luxury-light border border-gray-100 mb-10">
          <img
            src={activeBlog.imageUrl}
            alt={activeBlog.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Article header metadata info bar */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase text-gray-400 tracking-wider mb-5">
          <div className="flex items-center gap-1 bg-luxury-gold/10 text-luxury-gold px-2.5 py-1 font-semibold rounded-full">
            <Landmark className="w-3.5 h-3.5" />
            <span>{labels.published}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{activeBlog.publicationDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{labels.time}: {activeBlog.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>By {activeBlog.author}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-luxury-dark uppercase tracking-wide leading-tight mb-8">
          {activeBlog.translations?.[lang]?.title || activeBlog.title}
        </h1>

        <div className="w-24 h-[1px] bg-luxury-gold mb-10"></div>

        {/* Main Content Render */}
        <article className="prose prose-md prose-slate max-w-none text-xs text-gray-700 leading-relaxed font-light tracking-wide space-y-6" id="blog-rich-content">
          {(activeBlog.translations?.[lang]?.content || activeBlog.content).split("\n\n").map((para, pIdx) => {
            if (para.startsWith("## ") || para.startsWith("### ")) {
              return (
                <h2 key={pIdx} className="text-sm font-semibold uppercase text-luxury-dark tracking-widest mb-4 mt-8">
                  {para.replace(/###?\s+/, "")}
                </h2>
              );
            }
            if (para.startsWith("- ") || para.startsWith("* ")) {
              return (
                <ul key={pIdx} className="list-disc pl-6 space-y-2.5 my-4">
                  {para.split("\n").map((li, lIdx) => (
                    <li key={lIdx} className="text-gray-600 font-light text-xs">{li.replace(/^[\s-*]+\s*/, "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={pIdx} className="leading-relaxed-strict tracking-wide text-xs text-gray-500">
                {para}
              </p>
            );
          })}
        </article>

        {/* Article keywords */}
        <div className="flex flex-wrap gap-2 pt-10 border-t border-gray-100 mt-12">
          {activeBlog.tags.map(tag => (
            <span key={tag} className="bg-luxury-light text-gray-500 border border-gray-200 text-[9px] font-mono tracking-widest uppercase px-3.5 py-1 rounded-full">
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans" id="blog-briefs-panel">
      
      {/* Geopolitical Whitepapers Title Heading */}
      <div className="text-center max-w-2xl mx-auto mb-16 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] tracking-[0.2em] font-mono text-luxury-gold uppercase mb-4">
          <Landmark className="w-3.5 h-3.5" />
          <span>Strategic Exporter Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display uppercase tracking-widest text-luxury-dark mb-4">
          {labels.title}
        </h1>
        <div className="w-16 h-[1.5px] bg-luxury-gold mx-auto mb-6"></div>
        <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xl mx-auto">
          {labels.subtitle}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
        </div>
      ) : (
        /* Blog whitepapers grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(b => {
            const displayName = b.translations?.[lang]?.title || b.title;
            const displayExcerpt = b.translations?.[lang]?.excerpt || b.excerpt;
            return (
              <div
                key={b.id}
                onClick={() => setActiveBlog(b)}
                className="bg-white border border-gray-100 rounded-none overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-luxury-gold/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                id={`blog-card-${b.id}`}
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-luxury-light">
                    <img
                      src={b.imageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-luxury-dark/95 border border-luxury-gold/30 text-[9px] font-mono text-luxury-gold tracking-widest uppercase px-3 py-1">
                      {labels.published}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Metadata bar */}
                    <div className="flex items-center gap-3.5 text-[9px] font-mono uppercase text-gray-400 tracking-wider mb-3">
                      <span className="shrink-0">{b.publicationDate}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shrink-0"></span>
                      <span className="truncate">{b.readTime} reading</span>
                    </div>

                    <h3 className="text-sm font-display font-medium text-luxury-dark tracking-wide uppercase line-clamp-2 hover:text-[#a4865e] transition-colors mb-3">
                      {displayName}
                    </h3>
                    
                    <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed-strict tracking-wide mb-4">
                      {displayExcerpt}
                    </p>
                  </div>
                </div>

                {/* Action Button trigger read */}
                <div className="border-t border-gray-100 p-6 flex items-center justify-between text-[10px] font-sans font-semibold tracking-widest uppercase text-luxury-dark">
                  <span>{labels.read}</span>
                  <ChevronRight className="w-4.5 h-4.5 text-luxury-gold" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
