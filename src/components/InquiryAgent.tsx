import { useState, useRef, useEffect } from "react";
import { AdviserMessage } from "../types.js";
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle, HelpCircle, FileText, Globe } from "lucide-react";

interface InquiryAgentProps {
  lang: string;
}

const CONVERSATION_SUGGESTIONS: Record<string, string[]> = {
  en: [
    "Explain Incoterm CIF vs FOB liability transfers.",
    "Detail SGS inspection and phytosanitary certificate filings.",
    "What is the export lead time for AuraPersica Saffron?",
    "HS code classifications and import tariffs for blue halite crystals."
  ],
  es: [
    "Diferencia entre Incoterms CIF y FOB.",
    "Cuéntame de los certificados fitosanitarios para el azafrán.",
    "¿Cuál es el tiempo de transporte marítimo para mica sheets?",
    "Códigos arancelarios HS para cristales de sal azul."
  ],
  zh: [
    "解释在离岸价(FOB)和到岸价(CIF)下风险划分的区别。",
    "如何办理藏红花进口植物检疫证书 and SGS检测报告？",
    "合成云母板的太空及高电压Dielectric测试数值如何？",
    "查询藍色岩鹽晶體的協調制度编码与通关指引。"
  ],
  ar: [
    "ما هو الفرق المعتمد في انتقال الالتزامات بين CIF و FOB بموجب Incoterms؟",
    "اشرح متطلبات الفحص والشهادات الصحية النباتية لتصدير الزعفران.",
    "كم تبلغ الفترة الزمنية لشحن أوراق الميكا الاصطناعية بحرياً؟",
    "تفاصيل تصنيف الرمز المنسق (HS) والتعرفة الجمركية لكريستالات الملح الأزرق."
  ],
  de: [
    "Was ist der Unterschied bei Risikoübergang zwischen CIF und FOB?",
    "Benötigen wir ein Pflanzengesundheitszeugnis für den Safran-Import?",
    "Wie hoch sind die dielektrischen Festigkeiten der TheraMica-Platten?",
    "Zollklassifizierung und HS-Codes für blaue Halit-Kristalle."
  ],
  fa: [
    "تفاوت انتقال مسئولیت و ریسک بین اینکوترمز CIF و FOB چیست؟",
    "بررسی الزامات بازرسی SGS و صدور گواهی‌های بهداشت گیاهی صادرات پسته.",
    "زمان تفصیلی ترانزیت و ترخیص محصولات کشاورزی Eslami چقدر است؟",
    "کد تعرفه HS و حقوق گمرکی واردات مغز پسته سبز مینیاتوری."
  ]
};

const CHAT_INTRO: Record<string, { welcome: string; advice: string }> = {
  en: {
    welcome: "Eslami Global Trade IQ Desk",
    advice: "Inquire below about custom specifications compliance registers, shipping routes scheduling, certificate regulations, and immediate import tariffs."
  },
  es: {
    welcome: "Mesa de Inteligencia Comercial Eslami",
    advice: "Consulte sobre especificaciones técnicas, regulaciones de aduanas, rutas de transporte y aranceles de importación."
  },
  zh: {
    welcome: "Eslami 国际贸易合规智能服务台",
    advice: "在此查询产品纯度规范、海关进出口关税、植物检疫证书要求以及国际物流航线排程。"
  },
  ar: {
    welcome: "مكتب استشارات التجارة الدولية Eslami",
    advice: "استفسر عن اللوائح الجمركية، جداول الشحن واللوجستيات، الفحوصات الفنية لشهادات المنشأ والمعاملات التجارية الدولية."
  },
  de: {
    welcome: "Eslami Handels- und Zoll-Intelligence-Desk",
    advice: "Fragen Sie nach technischen Spezifikationen, Zollbestimmungen, phytosanitären Zeugnissen oder Incoterms."
  },
  fa: {
    welcome: "میز تجارت و مشاور هوش بازرگانی Eslami",
    advice: "در بخش زیر برای بررسی سازگاری قوانین مشخصات، زمان‌بندی مسیرهای حمل، مقررات سرتیفیکیت‌ها و تعرفه واردات استعلام نمایید."
  }
};

export default function InquiryAgent({ lang }: InquiryAgentProps) {
  const [messages, setMessages] = useState<AdviserMessage[]>([
    {
      role: "model",
      content: "Welcome, Trade Director. I am your specialized Eslami Global Trading Exporter Trade Consultant. I hold complete compliance catalogs regarding our premium saffron, bio-nectars, Muscovite insulation, and indigo halites. How may I facilitate your global container supply pipeline today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const intro = CHAT_INTRO[lang] || CHAT_INTRO.en;
  const suggestions = CONVERSATION_SUGGESTIONS[lang] || CONVERSATION_SUGGESTIONS.en;

  useEffect(() => {
    fetch("/api/csrf")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(err => console.error("CSRF token fetch error on chatbot", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: AdviserMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.slice(-8) // Send a short recent context loop
        })
      });

      const data = await response.json();
      const responseMsg: AdviserMessage = {
        role: "model",
        content: data.answer || "Trade database offline. Please retry your inquiry.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, responseMsg]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "### System Connection Brief\nOur intelligent trade advisory systems are currently processing customs schedules offline.\n\n*Developer Checkpoint:* Verify that you have configured your valid `GEMINI_API_KEY` inside the AI Studio Secrets panel and restarted the application context.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (sug: string) => {
    handleSendMessage(sug);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-sans" id="trade-desk-panel">
      
      {/* Immersive Advisory Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] tracking-[0.2em] font-mono text-luxury-gold uppercase mb-4">
          <Bot className="w-3.5 h-3.5" />
          <span>Multilingual Trade Advisor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-luxury-dark mb-3">
          {intro.welcome}
        </h1>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          {intro.advice}
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-100 rounded-xs shadow-xl min-h-[500px] flex flex-col justify-between overflow-hidden">
        
        {/* Connection Secured Stat Bar */}
        <div className="bg-luxury-dark text-gray-400 text-[10px] font-mono py-2.5 px-6 flex items-center justify-between border-b border-luxury-gold/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-white uppercase tracking-wider">Auralux-Advisor-v3.5 Active</span>
          </div>
          <div className="flex items-center gap-3 hidden sm:flex">
            <span className="text-luxury-gold">AGENT_ID: TX_CO_2026_ESTATE</span>
            <span>SECURE PROXY INTEGRITY</span>
          </div>
        </div>

        {/* Conversation Message Scroller */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[480px] bg-luxury-light/40" id="chat-messages-container">
          {messages.map((m, index) => (
            <div 
              key={index} 
              className={`flex gap-4 max-w-3xl ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              id={`chat-bubble-${m.role}-${index}`}
            >
              {/* Profile Icon Ring */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border uppercase text-[10px] font-mono font-bold ${
                m.role === "user" 
                  ? "bg-luxury-gold text-luxury-dark border-luxury-gold/60" 
                  : "bg-luxury-dark text-luxury-gold border-luxury-gold/40"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-luxury-gold" />}
              </div>

              {/* Message Bubble box */}
              <div className={`p-4 rounded-xs text-xs leading-relaxed-strict shadow-sm border ${
                m.role === "user"
                  ? "bg-luxury-dark text-white border-luxury-dark"
                  : "bg-white text-gray-700 border-gray-100"
              }`}>
                <div className="prose prose-sm prose-slate max-w-none text-xs">
                  {/* Simplistic markdown translation layout format rendering */}
                  {m.content.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("## ") || para.startsWith("### ")) {
                      return (
                        <h4 key={pIdx} className="text-xs font-semibold uppercase text-luxury-gold tracking-wider mb-2 mt-4 first:mt-0">
                          {para.replace(/###?\s+/, "")}
                        </h4>
                      );
                    }
                    if (para.startsWith("- ") || para.startsWith("* ")) {
                      return (
                        <ul key={pIdx} className="list-disc pl-4 space-y-1 my-2">
                          {para.split("\n").map((li, lIdx) => (
                            <li key={lIdx}>{li.replace(/^[\s-*]+\s*/, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Extracting lines loaded with strong bold tags
                    const formatted = para.split("\n").map((line, lIdx) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <strong key={lIdx} className="block text-luxury-gold uppercase tracking-wider text-[10px] mt-2 mb-1">{line.replace(/\*\*/g, "")}</strong>;
                      }
                      return <span key={lIdx} className="block mb-1 last:mb-0">{line}</span>;
                    });
                    return <p key={pIdx} className="mb-3 last:mb-0 text-xs font-light tracking-wide">{formatted}</p>;
                  })}
                </div>
                
                {/* Time Indicator */}
                <div className="text-[9px] font-mono text-gray-400 mt-2 text-right">
                  {m.timestamp.substring(11, 16)} UTC
                </div>
              </div>
            </div>
          ))}

          {loading && (
            /* Custom luxury themed Typing Indicator */
            <div className="flex gap-4 mr-auto max-w-md animate-pulse">
              <div className="w-8 h-8 rounded-full bg-luxury-dark flex items-center justify-center shrink-0 border border-luxury-gold/40">
                <Sparkles className="w-4 h-4 text-luxury-gold" />
              </div>
              <div className="p-4 rounded-xs bg-white text-xs border border-gray-100 italic font-mono text-gray-400">
                <span>Analyzing compliance schedules and HS parameters...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Quick Actions Toolbar */}
        <div className="p-4 bg-luxury-light/60 border-t border-gray-100">
          <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Quick Advisory Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSuggestClick(sug)}
                disabled={loading}
                className="bg-white border border-gray-200 text-gray-500 hover:border-luxury-gold hover:text-luxury-dark text-[10px] font-medium px-3.5 py-2.5 rounded-xs transition-colors cursor-pointer text-left truncate max-w-full font-sans uppercase tracking-wider"
                id={`chat-suggest-${sIdx}`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-4"
            id="chat-input-form"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire on HS regulations, container packing lists, phytosanitary requirements..."
              disabled={loading}
              className="flex-1 border border-gray-200 bg-luxury-light/30 focus:bg-white focus:ring-1 focus:ring-luxury-gold px-4 py-3.5 rounded-xs text-xs focus:outline-none tracking-wide text-luxury-dark"
              id="chat-text-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-luxury-dark text-white hover:bg-luxury-gold hover:text-luxury-dark border border-luxury-dark hover:border-luxury-gold transition-colors block px-5.5 py-3.5 rounded-xs cursor-pointer focus:outline-none"
              id="chat-submit-btn"
              aria-label="Send message to advisor"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
