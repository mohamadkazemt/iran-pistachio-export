import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Maximize2, Minimize2, Save, FileText, Layout, Eye, 
  HelpCircle, Sparkles, Languages, Check, Globe, Calendar, Clock, RotateCcw, AlertCircle,
  Heading, AlignLeft, AlignCenter, AlignRight, Play, Quote, Table as TableIcon, 
  AlertTriangle, CreditCard, ChevronDown, ChevronUp, Download, Image as ImageIcon, BarChart3,
  Search, Link, Shield, MapPin, Tag, Percent
} from "lucide-react";
import { Product, Blog, MediaItem } from "../types";
import AuraMediaLibrary from "./AuraMediaLibrary";

interface AuraPublishingDeskProps {
  products: Product[];
  blogs: Blog[];
  media: MediaItem[];
  t: (key: string) => string;
  apiCall: (url: string, method?: string, body?: any) => Promise<any>;
  showNotice: (type: "success" | "error", text: string) => void;
  triggerDataLoads: () => void;
  lang?: "fa" | "en" | "es";
}

// Interfaces for visual block editing
interface GBlock {
  id: string;
  type: "heading" | "paragraph" | "quote" | "image" | "video" | "table" | "callout" | "product_showcase" | "chart" | "faq" | "attachment";
  rtl?: boolean;
  align?: "left" | "center" | "right";
  content: string; // Used for text elements or raw content summaries
  data?: any;       // Structured data for complex blocks
}

interface Revision {
  id: string;
  timestamp: string;
  blocks: GBlock[];
  title: string;
}

const DEFAULT_BLOCKS: GBlock[] = [
  {
    id: "b-1",
    type: "heading",
    content: "Global Import Compliance & Scientific Quarantine Guidelines",
    data: { size: "h2", fontWeight: "font-semibold" }
  },
  {
    id: "b-2",
    type: "paragraph",
    rtl: false,
    align: "left",
    content: "AuraLux sets international milestones for agricultural exports, keeping heavy metal residuals and micro-biological contamination indices well beneath stringent EU, GCC, and North American regulatory tolerances. This dossier outlines phytosanitary protocols."
  },
  {
    id: "b-3",
    type: "callout",
    content: "Phytosanitary Certificates of Origin are issued instantly upon customs clearance inside European Port Hubs by accredited inspectors.",
    data: { theme: "emerald", icon: "shield" }
  }
];

export default function AuraPublishingDesk({
  products = [],
  blogs = [],
  media = [],
  t: parentT,
  apiCall,
  showNotice,
  triggerDataLoads,
  lang: parentLang = "en"
}: AuraPublishingDeskProps) {
  // Navigation tabs
  const [activeWorkspace, setActiveWorkspace] = useState<"catalog" | "intelligence" | "research" | "news">("catalog");
  const [lang, setLang] = useState<"fa" | "en" | "es">("en");

  // Sync lang
  useEffect(() => {
    if (parentLang) {
      setLang(parentLang);
    }
  }, [parentLang]);

  const isFa = lang === "fa";

  // Dedicated Persian dictionary for news visual publishing / block editors
  const editorTranslations: Record<string, string> = {
    "Aura WordPress Visual Studio": "استودیو بصری وردپرس آئورا",
    "Workspace": "فضای کاری",
    "Export Product SKU": "کاتالوگ کالاهای صادراتی",
    "Market Intelligence": "گزارش بازار و هوش تجاری",
    "Scientific Research": "پژوهش علمی و قرنطینه دفتری",
    "International News": "اخبار تجارت بین‌المللی",
    "Revisions History": "سوابق ویرایش و بازیابی",
    "Revisions": "نقاط بازنشانی نسخه",
    "Exit Fullscreen": "خروج از تمام‌صفحه",
    "Fullscreen Writing": "نگارش تمام‌صفحه",
    
    // Core details
    "Document Entry Desk": "میز تحریریه و نگارش اسناد رسمی آئورا",
    "Primary Heading Descriptor": "شاخص عنوان اصلی و پیش‌نمایش در نتایج جستجو",
    "Synopsis Abstract highlight": "چکیده مطالب و پانویس ترغیب‌کننده سند",
    "A technical, brief, elegant summary outlining key contents to stimulate downloads...": "یک خلاصه تخصصی، کوتاه و شکیل جهت ترغیب خریداران و مراجع علمی به دانلود سند...",
    "SEO URL Permalink Slug": "پیوند یکتای سئو (SEO Slug URL)",
    "Author / Lead Auditor Signee": "نویسنده / ممیز و حسابرس مسئول آزمایشگاهی کالا",
    "Metadata Classification Tags": "کلمات کلیدی و متادیتا (تگ صادراتی)",
    "Quarantine Report Template type": "قالب و استانداردهای بهداشتی قرنطینه کالا",
    
    // Core drop downs & report types
    "Scientific Quarantine Report": "گزارش علمی بهداشت و قرنطینه کالا",
    "Agricultural Quality Audit": "ممیزی بهداشتی و کیفی کشاورزی",
    "Export Regulation Updates": "بروزرسانی قوانین و مقررات صادرات دفتری",
    "Trade Analytics": "تحلیل آماری صنعت صادرات",
    "Industry Forecasts": "پیش‌بینی‌های کلان اقتصادی و ترافیک صنعت",
    "Laboratory Reports": "نتایج گواهی‌های مستند آزمایشگاهی",
    
    // Specifications
    "Vetted specifications profiles specs": "مشخصات بازرگانی، استانداردهای آزمایشگاهی و عیار کالا",
    "Export Price range (Unit)": "محدوده تجمعی قیمت صادراتی (بازه مرجع)",
    "Commercial selling unit": "واحد سنجش و مبادله تجاری محصول",
    "HS Tariff Code": "کد تعرفه نظام هماهنگ گمرکی (HS Code)",
    "Minimum bulk MOQ": "حداقل سفارش مبادلاتی (MOQ)",
    "Delivery Lead time": "زمان تقریبی و برنامه حمل دریایی",
    "Protected source origin": "منطقه جغرافیایی و خاستگاه تحت حفاظت بارگیری",
    "Accredited purity grade": "درجه عیار خلوص آزمایشگاهی",
    "Advanced heavy transport packaging specs": "مشخصات کیفی بسته‌بندی ضد رطوبت محموله سنگین",
    
    // WordPress canvas
    "WordPress Content Canvas Block Editor": "محیط بصری نگارش و طراحی محتوای پورتال آئورا",
    "Interactive Blocks": "بخش تعاملی فعال",
    "Canvas is entirely static. Select elements below to construct premium layouts.": "محیط تحریریه سند خالی است. از دکمه‌های زیر جهت ساختاربندی شکیل کاتالوگ و گزارش بهره بگیرید.",
    "Interactive Heading Block": "تیتر شکیل جدید",
    "Delete block": "حذف کامل این بخش",
    "Select / Upload WebP": "انتخاب/آپلود WebP از گالری",
    "Add Visual Row": "➕ افزودن ردیف اطلاعاتی",
    "Pull Row": "➖ حذف ردیف آخر",
    "Catalog Target product Showcase": "برجسته کردن معرفی یکی از کالاهای کاتالوگ",
    "Showcase Link Status": "وضعیت پیوند معرفی",
    "Live Site Anchor": "لینک فعال در سایت اصلی",
    "Analytical Interactive Chart metrics builder": "نمودارساز آماری پویا کالا",
    "Faqs Accoridons Question entries": "آکاردئون پرسش و پاسخ‌های متداول بازرگانی (FAQ)",
    "PDF DOCUMENT": "سند رسمی ضمیمه PDF",
    
    // Block Library Presets
    "Gutenberg Block library presets": "المان‌های تخصصی نگارش پورتال وردپرس (تحریریه گوتنبرگ)",
    "Heading": "تیتر اصلی (Heading)",
    "Paragraph": "پاراگراف متن (Paragraph)",
    "Quote Book": "نقل قول طلایی (Quote)",
    "Image Block": "تصویر بهینه (Image)",
    "Video Embed": "فیلم راهنما (Video)",
    "Visual Table": "جدول مشخصات کالا (Table)",
    "Callout Box": "کادر پیام هشدار (Callout)",
    "FAQ Accordion": "سوالات متداول (FAQ)",
    "Interactive Chart": "نمودار آماری (Chart)",
    "Product Card": "معرفی کالا دپو (Product)",
    "Download PDF": "لینک دانلود PDF سند",
    
    // SEO
    "Live Search Engine SEO Previewer": "پیش‌نمایش ارگانیک موتورهای جستجوی گوگل (SEO)",
    "Simulating active organic search views for this item": "بدین صورت صفحه جدید با استانداردهای گوگل رندر و نمایان می‌گردد",
    "AuraLux Luxury Exporter": "هلدینگ تجاری بازرگانی آئورالاکس (صادرات لوکس)",
    "No abstract summary specified yet. Complete the synopsis in document form to build standard SEO indexing.": "متن چکیده مطالب خالی است. نگارش چکیده برای فعال شدن موتور سئو گوگل الزامی می‌باشد.",
    "Rating": "امتیاز خریداران ملل",
    "Origin": "مبدا بارگیری محموله",
    
    // Publishing sidebar
    "Status & Publishing": "پیکربندی وضعیت و طرح انتشار سند",
    "Saved status": "وضعیت ذخیره‌سازی",
    "Content language": "زبان نگاری سند",
    "Compiled blocks": "المان‌های فعال",
    "Release Scheme": "طرح بازنشر و انتشار",
    "Draft": "پیش‌نویس",
    "Scheduled": "زمان‌بندی شده",
    "Publish": "انتشار آنی",
    "Scheduled Publish Calendar": "زمان دقیق انتشار خودکار",
    "Will go live automatically on selected time.": "این سند در موعد از پیش تعیین شده بدون نیاز به تایید مجدد فوراً فعال می‌شود.",
    "Attach Quarantine PDF Document": "پیوست گزارش بهداشتی و قرنطینه کالا (PDF)",
    "Links a download PDF button inside publication layouts viewer.": "با بارگذاری، دکمه شکیل پیوست سند در بخش نهایی مراجعین نمایش داده خواهد شد.",
    "Schedule Release": "تنظیم زمان‌بندی",
    "Save Draft": "ذخیره پیش‌نویس موقت",
    "Publish Document": "تأیید نهایی و انتشار سند",
    "Document Version history": "نقاط ذخیره سازی قبلی پورتال",
    "No local revisions stored yet. Revisions are created as you edit contents.": "هیچ ذخیره خودکاری انجام نشده است؛ سیستم به صورت دوره‌ای بک‌آپ‌گیری می‌کند.",
    "Restore": "بازنشانی این نسخه",
    "Gutenberg Built-in Assets Desk": "گالری تخصصی رسانه‌ متصل آئورا",
    "Select or upload file payload to embed visually in frame": "تصویر با پسوند بهینه‌شده به انضمام فایل PDF دلخواه را علامت‌گذاری یا بارگذاری کنید",
    "Auto Save Status": "ذخیره‌سازی هوشمند زنده",
    "Synching updates...": "درحال همگام‌سازی و اعمال تحریریه...",
    "Draft auto-saved 2s ago": "ذخیره ابری با موفقیت انجام شد (۲ ثانیه پیش)",
  };

  const t = (key: string, fallback = "") => {
    if (isFa) {
      if (editorTranslations[key]) return editorTranslations[key];
    }
    if (parentT) {
      const parentRes = parentT(key);
      if (parentRes !== key) return parentRes;
    }
    return fallback || key;
  };

  // Visual features
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Draft Saved");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [previewMode, setPreviewMode] = useState<"editor" | "live_desktop" | "seo_sim">("editor");
  const [seoPreviewDevice, setSeoPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Publishing & scheduling state
  const [publishStatus, setPublishStatus] = useState<"draft" | "scheduled" | "published">("published");
  const [scheduledDate, setScheduledDate] = useState<string>("2026-06-15");
  const [scheduledTime, setScheduledTime] = useState<string>("12:00");

  // Unified publishing states (Notion-style document)
  const [title, setTitle] = useState("Royal Akbari Extra-Jumbo Organic Export Edition");
  const [slug, setSlug] = useState("royal-akbari-pistachio-luxury-pack");
  const [author, setAuthor] = useState("Elena Rostova, Senior Phytosanitary Auditor");
  const [tagsInput, setTagsInput] = useState("Compliance, Agricultural Audit, Trade Analytics");
  const [excerpt, setExcerpt] = useState("Comprehensive technical specification mapping soil moisture analysis profiles, packing parameters, and EU certificate credentials.");
  
  // Catalog Product specific extra properties
  const [priceRange, setPriceRange] = useState("$9,500 - $11,800");
  const [unit, setUnit] = useState("Metric Ton");
  const [hsCode, setHsCode] = useState("0802.51.00");
  const [minOrder, setMinOrder] = useState("1 Bulk Metric Ton");
  const [leadTime, setLeadTime] = useState("12 - 17 Days Sea Route");
  const [origin, setOrigin] = useState("Rafsanjan High Plateaus (Protected Origin)");
  const [purityGrade, setPurityGrade] = useState("AAA Double-Peeled (99.85% Pure)");
  const [packagingDetails, setPackagingDetails] = useState("Hermetically double sealed polymer bags pre-flushed with premium nitrogen gas.");
  
  // Dedicated Whitepaper/Reports specific extra properties
  const [reportType, setReportType] = useState<string>("Scientific Quarantine Report");
  const [attachedPdfUrl, setAttachedPdfUrl] = useState<string>("https://ais-dev-bca34bugtnd5zc5wbzc7kl-58319881119.us-east1.run.app/quarantine_certificates_Aura_AAA.pdf");
  
  // Visual blocks structure state
  const [blocks, setBlocks] = useState<GBlock[]>(DEFAULT_BLOCKS);

  // Auto slug generation based on Title
  useEffect(() => {
    if (title && activeWorkspace === "catalog") {
      const formattedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(formattedSlug);
    }
  }, [title]);

  // Simulated Auto-Saving ticker with random increments to show real-time synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSaveStatus("Synching updates...");
      setTimeout(() => {
        setAutoSaveStatus("Draft auto-saved 2s ago");
      }, 700);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Capture metadata details & store them as standard visual block presets when requested
  const handleAddNewBlock = (type: GBlock["type"]) => {
    const newId = "b-" + Date.now() + Math.random().toString(36).substring(2, 5);
    let initialBlock: GBlock = { id: newId, type, content: "" };

    switch (type) {
      case "heading":
        initialBlock.content = "New Interactive Heading Block";
        initialBlock.data = { size: "h3", fontWeight: "font-semibold" };
        break;
      case "paragraph":
        initialBlock.content = "Start typing premium, multilingual content here...";
        initialBlock.rtl = lang === "fa";
        initialBlock.align = lang === "fa" ? "right" : "left";
        break;
      case "quote":
        initialBlock.content = "In matters of agricultural distribution, certified verification beats cheap promises without end.";
        initialBlock.data = { author: "Chief Inspector Vance" };
        break;
      case "image":
        initialBlock.content = "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80";
        initialBlock.data = { alt: "Extra long Akbari pistachios display", caption: "Premium grade A sorting" };
        break;
      case "video":
        initialBlock.content = "https://www.youtube.com/embed/dQw4w9WgXcQ";
        break;
      case "table":
        initialBlock.content = "Specs Metric Grid";
        // 3x3 initial cells
        initialBlock.data = {
          headers: ["Biological Spec Parameter", "Tolerance Target Limit", "Real-Time Verified Score"],
          rows: [
            ["Aflatoxin Quotient B1", "< 2.0 ppb threshold", "ND (Non-Detectable) ✓"],
            ["Residual Pesticides", "0.00% Organic", "Passed (USDA Zero Limits)"],
            ["Average Seed Sizing", "18/20 jumbo caliber", "19.2 mm Premium Size"]
          ]
        };
        break;
      case "callout":
        initialBlock.content = "Ensure quarantine documentation matches custom border clearance records exactly to completely minimize delays.";
        initialBlock.data = { theme: "blue", icon: "info" };
        break;
      case "faq":
        initialBlock.content = "FAQ Accordions Set";
        initialBlock.data = {
          faqs: [
            { question: "Are your pesticide testing records accessible for individual inspection lots?", answer: "Yes, every container is analyzed by gas chromatography, and full certified reports are downloadable on our site." },
            { question: "How long can nitrogen-sealed packages protect whole kernels freshness?", answer: "Our composite aluminum bags preserve delicate biological lipids for up to 24 consecutive months under climate-controlled holds." }
          ]
        };
        break;
      case "product_showcase":
        initialBlock.content = products[0]?.id || "prod-raw-pistachio";
        initialBlock.data = { showPrice: true, showSpecs: true };
        break;
      case "chart":
        initialBlock.content = "Export Trends Q1-Q4";
        initialBlock.data = {
          chartType: "bar",
          datapoints: [
            { label: "Q1 Winter", value: 340 },
            { label: "Q2 Spring", value: 480 },
            { label: "Q3 Summer", value: 720 },
            { label: "Q4 Autumn", value: 910 }
          ]
        };
        break;
      case "attachment":
        initialBlock.content = "quarantine_verification_cert.pdf";
        initialBlock.data = {
          url: "https://ais-dev-bca34bugtnd5zc5wbzc7kl-58319881119.us-east1.run.app/export_catalog_auralux.pdf",
          fileSize: "4.8 MB",
          fileType: "PDF Document"
        };
        break;
    }

    setBlocks(prev => [...prev, initialBlock]);
    showNotice("success", t(`Added dynamic "${type}" block.`));
  };

  const handleBlockChange = (id: string, updatedField: Partial<GBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updatedField } : b));
  };

  const handleBlockDataChange = (id: string, updatedDataKey: string, newValue: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? {
      ...b,
      data: {
        ...b.data,
        [updatedDataKey]: newValue
      }
    } : b));
  };

  // Reordering blocks manually
  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;
    
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const arrayCopy = [...blocks];
    const temp = arrayCopy[index];
    arrayCopy[index] = arrayCopy[targetIndex];
    arrayCopy[targetIndex] = temp;
    setBlocks(arrayCopy);
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Draft Revision History snapshots creator
  const createRevisionSnapshot = (act: string) => {
    const revision: Revision = {
      id: "rev-" + Date.now(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      blocks: JSON.parse(JSON.stringify(blocks)),
      title: `${act} - ${blocks.length} blocks`
    };
    setRevisions(prev => [revision, ...prev].slice(0, 5)); // Keep last 5 revisions
  };

  const restoreRevision = (rev: Revision) => {
    setBlocks(rev.blocks);
    showNotice("success", t(`Restored to revision: ${rev.timestamp}`));
    setShowRevisions(false);
  };

  // Compile visual blocks into standard Markdown for database representation
  const compileBlocksToMarkdown = (): string => {
    let md = "";
    blocks.forEach(b => {
      switch (b.type) {
        case "heading":
          const prefix = b.data?.size === "h1" ? "#" : b.data?.size === "h3" ? "###" : "##";
          md += `${prefix} ${b.content}\n\n`;
          break;
        case "paragraph":
          md += `${b.content}\n\n`;
          break;
        case "quote":
          md += `> ${b.content}\n> — ${b.data?.author || "Reporter"}\n\n`;
          break;
        case "image":
          md += `![${b.data?.alt || "Image"}](${b.content})\n*${b.data?.caption || ''}*\n\n`;
          break;
        case "video":
          md += `[Embedded Video: ${b.content}]\n\n`;
          break;
        case "table":
          md += `| ${b.data?.headers?.join(" | ")} |\n`;
          md += `| ${b.data?.headers?.map(() => "---").join(" | ")} |\n`;
          b.data?.rows?.forEach((row: string[]) => {
            md += `| ${row.join(" | ")} |\n`;
          });
          md += "\n";
          break;
        case "callout":
          md += `::: ${b.data?.theme || "info"}\n${b.content}\n:::\n\n`;
          break;
        case "faq":
          md += `### Frequently Asked Questions\n`;
          b.data?.faqs?.forEach((faq: any) => {
            md += `* **Q: ${faq.question}**\n  A: ${faq.answer}\n`;
          });
          md += "\n";
          break;
        case "product_showcase":
          const prod = products.find(p => p.id === b.content);
          md += `[Product Showcase: ${prod?.name || b.content}]\n\n`;
          break;
        case "chart":
          md += `[Statistical Chart: ${b.content}]\n\n`;
          break;
        case "attachment":
          md += `[Download Resource Attached: ${b.content}](${b.data?.url})\n\n`;
          break;
      }
    });
    return md;
  };

  // Main Submit handler (supports Products, Whitepapers, Research Reports, News)
  const handlePublishDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    createRevisionSnapshot("Pre-Publish Save");

    const compiledContent = compileBlocksToMarkdown();
    const tagsArray = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    try {
      if (activeWorkspace === "catalog") {
        // Build product specifications key-value map from our visual tables blocks if possible
        const specificationsMap: Record<string, string> = {
          "Origin Geographic": origin,
          "Harmonized HS Code": hsCode,
          "Lead Delivery Time": leadTime,
          "Purity Valuation": purityGrade
        };

        const tableBlock = blocks.find(b => b.type === "table");
        if (tableBlock && tableBlock.data?.rows) {
          tableBlock.data.rows.forEach((r: string[]) => {
            if (r[0] && r[1]) specificationsMap[r[0]] = r[1];
          });
        }

        const productPayload = {
          name: title,
          description: excerpt + " " + compiledContent.substring(0, 200) + "...",
          categories: ["Strategic Crop", "Agricultural Luxury"],
          priceRange,
          unit,
          imageUrl: blocks.find(b => b.type === "image")?.content || "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format",
          origin,
          hsCode,
          minOrder,
          leadTime,
          purityGrade,
          packaging: packagingDetails,
          specifications: specificationsMap
        };

        await apiCall("/api/products/add", "POST", productPayload);
        showNotice("success", t(`Product SKU "${title}" catalog profile generated and deployed.`));
      } else {
        // Publish Academic/Scientific/Intelligence report, News or General Article
        const categoryMeta = activeWorkspace === "intelligence" ? "Market Intelligence" : activeWorkspace === "research" ? "Scientific & Agricultural Research" : "International News";

        const blogPayload = {
          title,
          excerpt,
          content: compiledContent,
          author,
          tags: [categoryMeta, ...tagsArray],
          imageUrl: blocks.find(b => b.type === "image")?.content || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format",
          publicationDate: publishStatus === "scheduled" ? `${scheduledDate} (${scheduledTime})` : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          readTime: `${Math.max(2, Math.round(compiledContent.split(" ").length / 200))} Min`,
          // Embed visual report configurations to save in db
          contentType: reportType,
          attachments: [attachedPdfUrl],
          isScheduled: publishStatus === "scheduled",
          scheduledDate: publishStatus === "scheduled" ? `${scheduledDate}T${scheduledTime}:00` : undefined,
          status: publishStatus,
          blocks: blocks // Store raw JSON blocks for perfect revisions
        };

        await apiCall("/api/blogs/add", "POST", blogPayload);
        showNotice("success", t(`"${reportType}" entry posted in active circulation.`));
      }

      triggerDataLoads();
    } catch (err) {
      showNotice("error", t("Failed to register document updates inside system database."));
    }
  };

  // Media trigger link for visual block insertions
  const openBlockMediaLibrary = (blockId: string) => {
    setMediaTargetBlockId(blockId);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelectedForBlock = (url: string) => {
    if (mediaTargetBlockId) {
      handleBlockChange(mediaTargetBlockId, { content: url });
      showNotice("success", t("Image embedded successfully in active block editor!"));
    }
    setIsMediaPickerOpen(false);
    setMediaTargetBlockId(null);
  };

  return (
    <div className={`space-y-6 text-luxury-dark transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 overflow-y-auto p-6 lg:p-12' : ''}`} id="gutenberg-publishing-desk">
      
      {/* Visual Editor workspace bar controller */}
      <div className="bg-white border rounded-3xl p-4.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-luxury-gold/10 text-luxury-gold shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-luxury-dark uppercase flex items-center gap-2">
              <span>{t("Aura WordPress Visual Studio")}</span>
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">PRO</span>
            </h2>
            <div className="flex items-center gap-2 text-[8.5px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">
              <span>{t("Workspace")}: {activeWorkspace.toUpperCase()}</span>
              <span>•</span>
              <span className="text-gray-500 font-semibold">{autoSaveStatus}</span>
            </div>
          </div>
        </div>

        {/* Workspace selector tabs switches */}
        <div className="flex items-center gap-1.5 bg-gray-50 border p-1 rounded-2xl overflow-x-auto">
          {[
            { id: "catalog", label: t("Export Product SKU"), color: "text-emerald-700 bg-emerald-50" },
            { id: "intelligence", label: t("Market Intelligence"), color: "text-blue-700 bg-blue-50" },
            { id: "research", label: t("Scientific Research"), color: "text-amber-700 bg-amber-50" },
            { id: "news", label: t("International News"), color: "text-indigo-700 bg-indigo-50" }
          ].map(tab => {
            const isCurrent = activeWorkspace === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  createRevisionSnapshot(`Switched workspace`);
                  setActiveWorkspace(tab.id as any);
                  if (tab.id === "catalog") {
                    setTitle("Royal Fandoghi Dry-Roasted Premium Grade");
                    setExcerpt("Hand-picked organic Fandoghi pistachios dry-roasted with micro-sea salts.");
                  } else if (tab.id === "research") {
                    setTitle("Mycotoxins Elimination through Cryo-Sorting: An Academic Sourcing Report");
                    setExcerpt("A comprehensive physical chromatography audit surveying laser optical rejection systems for safe exports.");
                    setReportType("Scientific Quarantine Report");
                  } else {
                    setTitle("Macroeconomic Forecasts of Global Tree Nuts Trade Volumes 2026-2027");
                    setExcerpt("Assessing global freight canal hold delays, container shipping price indices, and currency hedges. ");
                    setReportType("Market Intelligence");
                  }
                }}
                className={`px-3.5 py-2 text-[10px] font-bold uppercase rounded-xl transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02] ${
                  isCurrent 
                    ? `bg-luxury-dark text-white font-bold shadow-xs` 
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Layout action view options */}
        <div className="flex items-center gap-2">
          {/* Revisions history triggers */}
          <button
            onClick={() => setShowRevisions(!showRevisions)}
            className="border px-3.5 py-2.5 rounded-xl text-xs hover:bg-gray-50 flex items-center gap-1.5 font-semibold text-gray-600 transition-all cursor-pointer relative"
            title={t("Revisions History")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("Revisions")}</span>
            {revisions.length > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-white font-mono text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {revisions.length}
              </span>
            )}
          </button>

          {/* Fullscreen writing trigger */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border p-2.5 rounded-xl text-gray-500 hover:text-luxury-dark hover:bg-gray-100 transition-all cursor-pointer"
            title={isFullscreen ? t("Exit Fullscreen") : t("Fullscreen Writing")}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <form onSubmit={handlePublishDocument} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="gutenberg-master-form">
        
        {/* Left Side (3 columns): Gutenberg dynamic formatting visual canvas */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Main Title, Slug, Metadata Block Card (Notion Layout) */}
          <div className="bg-white border rounded-3xl p-6 lg:p-8 space-y-6 shadow-xs relative overflow-hidden">
            {/* Ambient water stamp line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-luxury-gold to-blue-500"></div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-widest">
              <span>{t("Document Entry Desk")}</span>
              <div className="flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-luxury-gold" />
                <button type="button" onClick={() => setLang("en")} className={`hover:underline cursor-pointer ${lang === 'en' ? 'text-luxury-gold font-bold' : ''}`}>EN</button>
                <span>/</span>
                <button type="button" onClick={() => setLang("fa")} className={`hover:underline cursor-pointer ${lang === 'fa' ? 'text-luxury-gold font-bold' : ''}`}>FA (RTL)</button>
              </div>
            </div>

            {/* Document Title input */}
            <div className="space-y-1">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === "fa" ? "عنوان محصول یا گزارش پژوهشی..." : "Title name of export commodity / report..."}
                dir={lang === "fa" ? "rtl" : "ltr"}
                className={`w-full bg-transparent border-b border-dashed border-gray-100 hover:border-gray-300 focus:border-pistachio text-xl sm:text-2xl font-bold text-luxury-dark py-1 outline-none font-sans transition-all`}
              />
              <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider block">{t("Primary Heading Descriptor")}</span>
            </div>

            {/* Document Secondary excerpt / synopsis */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider block font-bold">{t("Synopsis Abstract highlight")}</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                dir={lang === "fa" ? "rtl" : "ltr"}
                placeholder={t("A technical, brief, elegant summary outlining key contents to stimulate downloads...")}
                className="w-full border border-gray-100 px-4 py-2.5 text-xs rounded-xl outline-none focus:border-pistachio text-gray-500 leading-relaxed font-sans"
              />
            </div>

            {/* URL details slug modifier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("SEO URL Permalink Slug")}</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl">
                  <span className="text-[10px] font-mono text-gray-400 truncate select-none">auralux.com/catalogs/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                    className="flex-1 bg-transparent border-none text-[10px] outline-none text-luxury-gold font-mono font-bold ml-1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Author / Lead Auditor Signee")}</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border px-3.5 py-1.5 text-xs rounded-xl outline-none focus:border-pistachio text-luxury-dark"
                />
              </div>
            </div>

            {/* Tags separator split list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Metadata Classification Tags")}</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Certifications, Logistics, Saffron"
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 outline-none rounded-xl focus:border-pistachio text-luxury-dark font-mono text-[10.5px]"
                  />
                </div>
              </div>

              {/* Reports subcategory type selector */}
              {activeWorkspace !== "catalog" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Quarantine Report Template type")}</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="border bg-white px-3 py-2 text-xs rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Scientific Quarantine Report">{t("Scientific Quarantine Report")}</option>
                    <option value="Agricultural Quality Audit">{t("Agricultural Quality Audit")}</option>
                    <option value="Export Regulation updates">{t("Export Regulation Updates")}</option>
                    <option value="Market Logistics Intelligence">{t("Market Intelligence")}</option>
                    <option value="Trade Volume Analytics">{t("Trade Analytics")}</option>
                    <option value="Sector Industry Forecast">{t("Industry Forecasts")}</option>
                    <option value="Accredited Lab Report">{t("Laboratory Reports")}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Catalog SKU Spec Configs Card */}
          {activeWorkspace === "catalog" && (
            <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-xs" id="catalog-specs-shuttle">
              <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold pb-2 border-b">{t("Vetted specifications profiles specs")}</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Export Price range (Unit)")}</label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. $9,200 - $11,500"
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none font-mono text-[11px] text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Commercial selling unit")}</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Metric Ton"
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("HS Tariff Code")}</label>
                  <input
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none font-mono font-bold text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Minimum bulk MOQ")}</label>
                  <input
                    type="text"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Delivery Lead time")}</label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Protected source origin")}</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-mono text-gray-400">{t("Accredited purity grade")}</label>
                  <input
                    type="text"
                    value={purityGrade}
                    onChange={(e) => setPurityGrade(e.target.value)}
                    className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <label className="text-[9px] uppercase font-mono text-gray-400">{t("Advanced heavy transport packaging specs")}</label>
                <textarea
                  rows={2}
                  value={packagingDetails}
                  onChange={(e) => setPackagingDetails(e.target.value)}
                  className="border px-3.5 py-2 text-xs rounded-xl outline-none text-zinc-600 font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Gutenberg Visual Blocks Layout Flow Frame */}
          <div className="bg-white border rounded-3xl p-6 lg:p-8 space-y-6 shadow-xs relative" id="gutenberg-blocks-flow">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">{t("WordPress Content Canvas Block Editor")}</span>
              <span className="text-[8.5px] font-mono text-gray-400 block">{blocks.length} {t("Interactive Blocks")}</span>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center p-12 text-xs text-gray-400 border border-dashed rounded-2xl bg-cream/5">
                {t("Canvas is entirely static. Select elements below to construct premium layouts.")}
              </div>
            ) : (
              <div className="space-y-4" id="gutenberg-blocks-grid">
                {blocks.map((block, index) => {
                  const isRTL = block.rtl;
                  return (
                    <div 
                      key={block.id} 
                      className="border border-gray-100 bg-slate-50/50 hover:bg-white rounded-2xl p-4 transition-all duration-300 relative group flex gap-3.5 items-start shadow-xs hover:shadow-xs hover:border-pistachio-light"
                    >
                      {/* Left Block Controls (manual reordering list) */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1 border-r border-gray-100 pr-2 pb-1.5">
                        <button 
                          type="button" 
                          onClick={() => moveBlock(index, "up")}
                          disabled={index === 0} 
                          className="text-gray-400 p-0.5 hover:text-luxury-dark disabled:opacity-25 disabled:hover:text-gray-400 cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-[9px] font-mono text-gray-400 font-bold select-none">{index + 1}</span>
                        <button 
                          type="button" 
                          onClick={() => moveBlock(index, "down")}
                          disabled={index === blocks.length - 1} 
                          className="text-gray-400 p-0.5 hover:text-luxury-dark disabled:opacity-25 disabled:hover:text-gray-400 cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Main block customizer body */}
                      <div className="flex-1 space-y-3 min-w-0" dir={isRTL ? "rtl" : "ltr"}>
                        {/* Header metadata label row */}
                        <div className="flex items-center justify-between !dir-ltr pb-1 border-b border-dashed border-gray-100/60">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono font-bold uppercase text-luxury-gold px-2 py-0.5 rounded-full bg-luxury-gold/10">
                              {block.type.replace("_", " ")}
                            </span>
                            
                            {/* RTL/LTR triggers for text block elements */}
                            {(block.type === "paragraph" || block.type === "heading") && (
                              <button
                                type="button"
                                onClick={() => handleBlockChange(block.id, { rtl: !block.rtl })}
                                className="text-[8.5px] font-mono text-gray-400 hover:text-luxury-gold cursor-pointer uppercase font-bold"
                              >
                                {isRTL ? "RTL (فارسی) ✓" : "LTR (EN)"}
                              </button>
                            )}

                            {/* Headline Sizing pickers */}
                            {block.type === "heading" && (
                              <div className="flex gap-1.5 text-[8.5px] font-mono text-gray-400 uppercase">
                                <button type="button" onClick={() => handleBlockDataChange(block.id, "size", "h1")} className={block.data?.size === "h1" ? "text-luxury-dark font-bold underline" : ""}>H1</button>
                                <button type="button" onClick={() => handleBlockDataChange(block.id, "size", "h2")} className={block.data?.size === "h2" ? "text-luxury-dark font-bold underline" : ""}>H2</button>
                                <button type="button" onClick={() => handleBlockDataChange(block.id, "size", "h3")} className={block.data?.size === "h3" ? "text-luxury-dark font-bold underline" : ""}>H3</button>
                              </div>
                            )}

                            {/* Callout Theme pickers */}
                            {block.type === "callout" && (
                              <div className="flex gap-1.5 text-[8px] font-mono text-gray-400 uppercase">
                                {["emerald", "blue", "amber", "rose"].map(thm => (
                                  <button 
                                    key={thm} 
                                    type="button" 
                                    onClick={() => handleBlockDataChange(block.id, "theme", thm)} 
                                    className={`px-1.5 border rounded-full uppercase ${block.data?.theme === thm ? 'bg-luxury-dark text-white font-bold' : ''}`}
                                  >
                                    {thm[0]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            type="button" 
                            onClick={() => {
                              createRevisionSnapshot(`Deleted block #${index+1}`);
                              deleteBlock(block.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-1 rounded transition-opacity cursor-pointer duration-300"
                            title={t("Delete block")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Rendering core visual editors based on block type */}
                        {block.type === "heading" && (
                          <input 
                            type="text"
                            value={block.content}
                            onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                            className={`w-full bg-transparent border-none outline-none text-luxury-dark font-sans tracking-wide ${
                              block.data?.size === "h1" ? "text-lg font-bold" : block.data?.size === "h3" ? "text-sm font-medium" : "text-base font-semibold"
                            }`}
                          />
                        )}

                        {block.type === "paragraph" && (
                          <textarea 
                            rows={2}
                            value={block.content}
                            onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                            className="w-full bg-transparent border-none outline-none text-xs text-gray-500 font-light leading-relaxed font-sans resize-none"
                          />
                        )}

                        {block.type === "quote" && (
                          <div className="border-s-4 border-luxury-gold ps-3.5 space-y-1.5 py-1">
                            <textarea 
                              rows={1}
                              value={block.content}
                              onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-xs italic text-gray-600 font-serif"
                            />
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                              <span>—</span>
                              <input 
                                type="text"
                                value={block.data?.author || ""}
                                onChange={(e) => handleBlockDataChange(block.id, "author", e.target.value)}
                                className="bg-transparent border-none outline-none font-sans max-w-xs focus:text-luxury-dark"
                                placeholder="Citation citation credit..."
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="space-y-2">
                            <div className="h-40 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center border group/img">
                              <img src={block.content} alt="Media preview" className="w-full h-full object-cover" />
                              
                              {/* Overlay change layout trigger */}
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => openBlockMediaLibrary(block.id)}
                                  className="bg-white/95 text-luxury-dark text-[10px] tracking-widest font-bold uppercase px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-pistachio" />
                                  <span>{t("Select / Upload WebP")}</span>
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text"
                                placeholder="Image Alt Tag (highly critical for SEO compliance)..."
                                value={block.data?.alt || ""}
                                onChange={(e) => handleBlockDataChange(block.id, "alt", e.target.value)}
                                className="border px-3 py-1 text-[10px] rounded-lg outline-none"
                              />
                              <input 
                                type="text"
                                placeholder="Photo caption citation visible on site..."
                                value={block.data?.caption || ""}
                                onChange={(e) => handleBlockDataChange(block.id, "caption", e.target.value)}
                                className="border px-3 py-1 text-[10px] rounded-lg outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "video" && (
                          <div className="space-y-2">
                            <div className="bg-luxury-dark rounded-xl p-4 flex items-center justify-between text-white border border-white/5 font-mono text-[10px]">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-rose-500 animate-pulse" />
                                <span>Embedded Video Embed: {block.content}</span>
                              </div>
                              <span className="text-gray-500">MOCKUP CUSTOM PLAYER ✓</span>
                            </div>
                            <input 
                              type="text"
                              value={block.content}
                              onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                              placeholder="YouTube embed URL (e.g. key token reference)..."
                              className="w-full border px-3 py-1.5 text-xs rounded-xl font-mono text-zinc-500"
                            />
                          </div>
                        )}

                        {block.type === "callout" && (
                          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                            block.data?.theme === 'emerald' ? 'bg-[#f4faf2] border-emerald-100 text-emerald-900' :
                            block.data?.theme === 'rose' ? 'bg-[#fff5f5] border-rose-100 text-rose-900' :
                            block.data?.theme === 'amber' ? 'bg-[#fffbeb] border-amber-100 text-amber-900' :
                            'bg-[#f0f9ff] border-blue-100 text-blue-900'
                          }`}>
                            <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${
                              block.data?.theme === 'emerald' ? 'text-emerald-600' :
                              block.data?.theme === 'rose' ? 'text-rose-600' :
                              block.data?.theme === 'amber' ? 'text-amber-600' :
                              'text-blue-600'
                            }`} />
                            <textarea
                              rows={2}
                              value={block.content}
                              onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-xs leading-relaxed font-sans font-light resize-none"
                            />
                          </div>
                        )}

                        {block.type === "table" && (
                          <div className="space-y-3">
                            <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white">
                              <table className="w-full text-xs font-sans">
                                <thead>
                                  <tr className="bg-gray-50 text-luxury-dark border-b">
                                    {block.data?.headers?.map((hdr: string, hIdx: number) => (
                                      <th key={hIdx} className="p-3 text-start font-semibold">
                                        <input 
                                          type="text" 
                                          value={hdr} 
                                          onChange={(e) => {
                                            const copyHdrs = [...block.data.headers];
                                            copyHdrs[hIdx] = e.target.value;
                                            handleBlockDataChange(block.id, "headers", copyHdrs);
                                          }}
                                          className="bg-transparent border-none outline-none font-bold text-luxury-dark focus:bg-gray-100 h-full w-full"
                                        />
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.data?.rows?.map((row: string[], rIdx: number) => (
                                    <tr key={rIdx} className="border-b last:border-none">
                                      {row.map((cell: string, cIdx: number) => (
                                        <td key={cIdx} className="p-2.5">
                                          <input 
                                            type="text" 
                                            value={cell} 
                                            onChange={(e) => {
                                              const copyRows = [...block.data.rows];
                                              copyRows[rIdx][cIdx] = e.target.value;
                                              handleBlockDataChange(block.id, "rows", copyRows);
                                            }}
                                            className="bg-transparent border-none outline-none text-zinc-600 w-full focus:bg-gray-50 py-0.5 px-1 rounded"
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const headersCount = block.data.headers.length;
                                  const newRow = Array(headersCount).fill("New Parameter");
                                  handleBlockDataChange(block.id, "rows", [...block.data.rows, newRow]);
                                }}
                                className="border px-3.5 py-1.5 rounded-xl text-[10px] hover:bg-gray-100 transition-all font-semibold font-mono uppercase cursor-pointer text-gray-400"
                              >
                                + Add Visual Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (block.data.rows.length > 1) {
                                    handleBlockDataChange(block.id, "rows", block.data.rows.slice(0, -1));
                                  }
                                }}
                                className="border border-rose-100 text-rose-600 px-3.5 py-1.5 rounded-xl text-[10px] hover:bg-rose-50 transition-all font-semibold font-mono uppercase cursor-pointer"
                              >
                                - Pull Row
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === "product_showcase" && (
                          <div className="bg-[#fcfdfa] border border-[#f0f5eb] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-xl bg-pistachio-light/10 flex items-center justify-center shrink-0">
                                <CreditCard className="w-6 h-6 text-pistachio animate-bounce" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-luxury-dark">{t("Catalog Target product Showcase")}</h4>
                                <select
                                  value={block.content}
                                  onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                                  className="border bg-white text-[11.5px] px-2.5 py-1.5 rounded-xl outline-none cursor-pointer mt-1"
                                >
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.hsCode})</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <div className="text-right">
                                <span className="text-[9px] uppercase tracking-wide text-gray-400 block">{t("Showcase Link Status")}</span>
                                <span className="text-emerald-600 font-bold">✓ {t("Live Site Anchor")}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "chart" && (
                          <div className="space-y-4">
                            <span className="block text-[8.5px] uppercase font-bold tracking-widest text-[#a1a59c] font-mono">{t("Analytical Interactive Chart metrics builder")}</span>
                            
                            {/* Live bar heights visual chart */}
                            <div className="bg-white border rounded-xl p-4.5 flex items-end justify-between h-32 gap-3 pb-2.5 shadow-inner">
                              {block.data?.datapoints?.map((dp: any, dpIdx: number) => {
                                const maxVal = Math.max(...block.data.datapoints.map((d: any) => d.value)) || 1000;
                                const heightPercent = Math.min(100, Math.round((dp.value / maxVal) * 100));
                                return (
                                  <div key={dpIdx} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group">
                                    <div className="text-[9.5px] font-bold font-mono text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {dp.value}
                                    </div>
                                    <div 
                                      className="w-full bg-gradient-to-t from-pistachio to-[#98cc76] rounded-t-md cursor-pointer transition-all duration-500 hover:brightness-105"
                                      style={{ height: `${heightPercent}%` }}
                                      title={`${dp.label}: ${dp.value}`}
                                    ></div>
                                    <span className="text-[8.5px] font-mono text-gray-400 font-bold truncate max-w-full block">
                                      {dp.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Data points inputs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {block.data?.datapoints?.map((dp: any, dpIdx: number) => (
                                <div key={dpIdx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[10px] space-y-1.5">
                                  <input 
                                    type="text" 
                                    value={dp.label}
                                    onChange={(e) => {
                                      const copyPts = [...block.data.datapoints];
                                      copyPts[dpIdx].label = e.target.value;
                                      handleBlockDataChange(block.id, "datapoints", copyPts);
                                    }}
                                    className="w-full bg-transparent border-b font-semibold border-gray-200 outline-none text-luxury-dark"
                                  />
                                  <input 
                                    type="number" 
                                    value={dp.value}
                                    onChange={(e) => {
                                      const copyPts = [...block.data.datapoints];
                                      copyPts[dpIdx].value = parseInt(e.target.value) || 0;
                                      handleBlockDataChange(block.id, "datapoints", copyPts);
                                    }}
                                    className="w-full bg-transparent outline-none font-mono text-emerald-600 font-bold"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === "faq" && (
                          <div className="space-y-4">
                            <span className="block text-[8.5px] uppercase font-bold text-[#b1b5ad] font-mono tracking-widest">{t("Faqs Accoridons Question entries")}</span>
                            {block.data?.faqs?.map((faq: any, fIdx: number) => (
                              <div key={fIdx} className="bg-white border rounded-xl p-3 space-y-2">
                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] font-mono font-bold text-amber-500">Q{fIdx+1}:</span>
                                  <input 
                                    type="text" 
                                    value={faq.question}
                                    onChange={(e) => {
                                      const copyFaqs = [...block.data.faqs];
                                      copyFaqs[fIdx].question = e.target.value;
                                      handleBlockDataChange(block.id, "faqs", copyFaqs);
                                    }}
                                    className="w-full bg-transparent text-xs border-none font-bold text-luxury-dark focus:bg-gray-50 outline-none py-0.5 rounded"
                                    placeholder="Type question here..."
                                  />
                                </div>
                                <div className="flex gap-2 items-start pt-1.5 border-t border-dashed">
                                  <span className="text-[10.5px] font-mono font-bold text-emerald-600">A:</span>
                                  <textarea 
                                    rows={2}
                                    value={faq.answer}
                                    onChange={(e) => {
                                      const copyFaqs = [...block.data.faqs];
                                      copyFaqs[fIdx].answer = e.target.value;
                                      handleBlockDataChange(block.id, "faqs", copyFaqs);
                                    }}
                                    className="w-full bg-transparent text-xs text-gray-500 font-light leading-relaxed focus:bg-gray-50 outline-none py-0.5 rounded resize-none"
                                    placeholder="Type answer details here..."
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === "attachment" && (
                          <div className="bg-[#fffcf6] border border-amber-100 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                                <Download className="w-5 h-5 animate-pulse" />
                              </div>
                              <div className="min-w-0">
                                <input
                                  type="text"
                                  value={block.content}
                                  onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                                  className="bg-transparent border-none font-bold text-xs text-luxury-dark outline-none focus:bg-white p-0.5 rounded w-full"
                                  placeholder="quarantine_certificates.pdf"
                                />
                                <span className="block text-[9px] font-mono text-gray-400 mt-1 uppercase tracking-wide">
                                  {block.data?.fileType || "PDF DOCUMENT"} • {block.data?.fileSize || "1.2 MB"}
                                </span>
                              </div>
                            </div>
                            
                            <input 
                              type="text"
                              value={block.data?.url || ""}
                              onChange={(e) => handleBlockDataChange(block.id, "url", e.target.value)}
                              placeholder="Direct download secure attachment file URL..."
                              className="border px-3.5 py-1.5 text-[10.5px] font-mono text-gray-500 rounded-xl mt-1 w-full sm:max-w-xs focus:bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* In-place Block Addition preset panel (WordPress block inserter) */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <span className="block text-[8.5px] font-mono text-gray-400 uppercase tracking-widest font-bold pb-2">{t("Gutenberg Block library presets")}</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { type: "heading", label: t("Heading"), icon: Heading },
                  { type: "paragraph", label: t("Paragraph"), icon: AlignLeft },
                  { type: "quote", label: t("Quote Book"), icon: Quote },
                  { type: "image", label: t("Image Block"), icon: ImageIcon },
                  { type: "video", label: t("Video Embed"), icon: Play },
                  { type: "table", label: t("Visual Table"), icon: TableIcon },
                  { type: "callout", label: t("Callout Box"), icon: AlertCircle },
                  { type: "faq", label: t("FAQ Accordion"), icon: HelpCircle },
                  { type: "chart", label: t("Interactive Chart"), icon: BarChart3 },
                  { type: "product_showcase", label: t("Product Card"), icon: CreditCard },
                  { type: "attachment", label: t("Download PDF"), icon: Download }
                ].map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => handleAddNewBlock(preset.type as any)}
                      className="bg-white hover:bg-pistachio text-gray-600 hover:text-white border px-3 py-2.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span className="text-[9.5px] leading-none">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time simulated Google Search result preview (SEO Preview Panel) */}
          <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-xs" id="seo-previewer-grid-card">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest">{t("Live Search Engine SEO Previewer")}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">{t("Simulating active organic search views for this item")}</span>
              </div>
              
              <div className="flex gap-2">
                {["desktop", "mobile"].map(dev => (
                  <button
                    key={dev}
                    type="button"
                    onClick={() => setSeoPreviewDevice(dev as any)}
                    className={`px-3 py-1 text-[9.5px] uppercase font-bold font-mono rounded-lg transition-all ${
                      seoPreviewDevice === dev ? 'bg-luxury-dark text-white' : 'border hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Google SERP entry */}
            <div className="font-sans text-xs flex justify-center py-4 bg-gray-50 rounded-2xl border border-dashed">
              <div className={`p-5 bg-white border rounded-xl shadow-xs ${seoPreviewDevice === 'mobile' ? 'max-w-[360px]' : 'w-full max-w-xl'}`}>
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1">
                  <span className="text-zinc-700">https://auralux.com</span>
                  <span>›</span>
                  <span className="text-zinc-500 font-mono truncate">{slug}</span>
                </div>
                
                {/* Hyperlink */}
                <h3 className="text-[#1a0dab] hover:underline text-base font-medium font-sans cursor-pointer leading-tight font-sans mb-1 select-none">
                  {title} | {t("AuraLux Luxury Exporter")}
                </h3>
                
                {/* Meta Description preview */}
                <p className="text-zinc-600 text-[12px] leading-relaxed font-sans">
                  <span className="text-emerald-800 font-mono font-bold text-[10.5px] bg-emerald-50 px-1 rounded mr-1">WebP ✓</span>
                  {excerpt || t("No abstract summary specified yet. Complete the synopsis in document form to build standard SEO indexing.")}
                </p>
                
                {/* Visual spec rating badge for products */}
                {activeWorkspace === "catalog" && (
                  <div className="flex items-center gap-2 text-[10.5px] font-sans text-zinc-400 mt-2 pt-2 border-t border-dashed">
                    <span>{t("Rating")}: 5.0 ★ •</span>
                    <span>MOQ: {minOrder} •</span>
                    <span className="text-zinc-500 font-semibold">{t("Origin")}: {origin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Info settings: publish triggers, Revision sidebar history, catalog attachment references */}
        <div className="space-y-5 lg:col-span-1">
          {/* Action publishing buttons widget */}
          <div className="bg-white border rounded-3xl p-5 space-y-5 shadow-xs">
            <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold pb-2 border-b">{t("Status & Publishing")}</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>{t("Saved status")}:</span>
                <span className="font-bold text-luxury-dark uppercase">{publishStatus}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>{t("Content language")}:</span>
                <span className="font-bold text-luxury-dark uppercase font-mono">{lang}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>{t("Compiled blocks")}:</span>
                <span className="font-bold text-emerald-600 font-mono">{blocks.length}</span>
              </div>
            </div>

            {/* Save status options selectors */}
            <div className="space-y-2">
              <label className="text-[9.5px] uppercase font-mono text-gray-400 block font-bold">{t("Release Scheme")}</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: "draft", label: t("Draft") },
                  { id: "scheduled", label: t("Scheduled") },
                  { id: "published", label: t("Publish") }
                ].map(sch => (
                  <button
                    key={sch.id}
                    type="button"
                    onClick={() => {
                      createRevisionSnapshot(`Set status to ${sch.id}`);
                      setPublishStatus(sch.id as any);
                    }}
                    className={`px-1 py-1 px-1 py-2 text-[9px] uppercase font-bold font-mono rounded-lg cursor-pointer ${
                      publishStatus === sch.id ? 'bg-luxury-dark text-white' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {sch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduled Time picker widget */}
            {publishStatus === "scheduled" && (
              <div className="p-3.5 bg-[#fffdf6] border border-amber-100 rounded-2xl space-y-2.5">
                <div className="flex gap-1.5 items-center text-amber-800 text-[10.5px] font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{t("Scheduled Publish Calendar")}</span>
                </div>
                
                <div className="flex gap-1">
                  <input 
                    type="date" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="border border-amber-200/50 text-[10px] font-mono bg-white px-2 py-1.5 rounded-lg outline-none w-full"
                  />
                  <input 
                    type="time" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border border-amber-200/50 text-[10px] font-mono bg-white px-2 py-1.5 rounded-lg outline-none max-w-24"
                  />
                </div>
                <span className="text-[8px] font-mono text-amber-600 tracking-wide block uppercase leading-tight">{t("Will go live automatically on selected time.")}</span>
              </div>
            )}

            {/* PDF attachment secure citation field for whitepapers */}
            {activeWorkspace !== "catalog" && (
              <div className="space-y-2 pt-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold block">{t("Attach Quarantine PDF Document")}</label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={attachedPdfUrl}
                    onChange={(e) => setAttachedPdfUrl(e.target.value)}
                    placeholder="https://AuraPdfLinkSource..."
                    className="w-full pl-8 pr-3 py-2 text-[10px] font-mono border border-gray-200 outline-none rounded-xl"
                  />
                </div>
                <span className="text-[8.5px] text-gray-400 block leading-tight">{t("Links a download PDF button inside publication layouts viewer.")}</span>
              </div>
            )}

            {/* Big Active publish Submission trigger */}
            <button
              type="submit"
              className="w-full bg-pistachio hover:bg-pistachio-light text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-[1.01] transition-all cursor-pointer transform"
            >
              {publishStatus === 'scheduled' ? t("Schedule Release") : publishStatus === 'draft' ? t("Save Draft") : t("Publish Document")}
            </button>
          </div>

          {/* Revisions history sidepanel drawer */}
          {showRevisions && (
            <div className="bg-white border rounded-3xl p-5 space-y-4 shadow-xs" id="revisions-drawer-card">
              <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold pb-2 border-b">{t("Document Version history")}</span>
              
              {revisions.length === 0 ? (
                <div className="text-center p-4 text-[10.5px] text-gray-400 font-sans leading-relaxed">
                  {t("No local revisions stored yet. Revisions are created as you edit contents.")}
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="p-3 bg-red-50/10 border border-red-50 hover:bg-cream/20 text-xs rounded-xl flex items-center justify-between text-[11px] gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold block text-luxury-dark truncate">{rev.title}</span>
                        <span className="text-[8px] font-mono text-gray-400 block mt-0.5">{rev.timestamp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => restoreRevision(rev)}
                        className="text-[9px] font-mono font-bold uppercase text-emerald-600 hover:underline shrink-0 cursor-pointer"
                      >
                        {t("Restore")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Embedded dialog Media picker modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-55 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-slate-50 rounded-3xl overflow-hidden h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5.5 bg-luxury-dark text-white flex justify-between items-center pr-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest">{t("Gutenberg Built-in Assets Desk")}</h3>
                <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider">{t("Select or upload file payload to embed visually in frame")}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-white hover:text-luxury-gold text-2xl font-bold font-mono cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <AuraMediaLibrary 
                media={media}
                t={t}
                apiCall={apiCall}
                showNotice={showNotice}
                triggerDataLoads={triggerDataLoads}
                onSelect={handleMediaSelectedForBlock}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
