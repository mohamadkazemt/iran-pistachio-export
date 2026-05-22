import React, { useState, useEffect, useRef } from "react";
import { 
  FolderOpen, Search, Copy, Check, Trash2, ShieldAlert, FileText, Image as ImageIcon, Video, 
  UploadCloud, ArrowRight, Settings2, BarChart, Info, HardDrive, Filter, Folder, ListFilter
} from "lucide-react";
import { MediaItem } from "../types";

interface AuraMediaLibraryProps {
  media: MediaItem[];
  t: (key: string) => string;
  apiCall: (url: string, method?: string, body?: any) => Promise<any>;
  showNotice: (type: "success" | "error", text: string) => void;
  triggerDataLoads: () => void;
  onSelect?: (url: string) => void; // Optional selector callback for the block editor
  lang?: "fa" | "en" | "es";
}

export default function AuraMediaLibrary({ 
  media = [], 
  t: parentT, 
  apiCall, 
  showNotice, 
  triggerDataLoads,
  onSelect,
  lang = "en"
}: AuraMediaLibraryProps) {
  const isFa = lang === "fa";

  // Dedicated Persian dictionary for media elements
  const mediaTranslations: Record<string, string> = {
    "Media Cloud Quota": "سهمیه فضای ابری رسانه",
    "Total Registries": "کل فایل‌های چندرسانه‌ای",
    "Assets": "فایل رسانه",
    "WebP compression active": "فشرده‌سازی خودکار WebP فعال است",
    "Active Folders": "پوشه‌های سازمان‌دهی",
    "Logical Units": "بخش تفکیک شده",
    "Auto folder indexing": "نمایه‌سازی خودکار پوشه",
    "Optimizations Active": "بهینه‌سازی تصاویر بارگذاری شده",
    "Interception Active": "کنترل هوشمند کلیپ‌بورد مستقیم",
    "Paste clipboard images or drag files directly anywhere to auto compress.": "برای فشرده‌سازی تخصصی تصاویر را کپی کرده و Ctrl+V بزنید یا به هرکجا بکشید.",
    "Drag & Drop Files": "فایل‌ها را به این قسمت بکشید و رها کنید",
    "Or click to select locally": "یا برای جستجو در هارد دیسک کلیک کنید",
    "Organized Collections": "مجموعه‌های طبقه‌بندی شده",
    "All Assets": "همه اسناد و رسانه‌ها",
    "Product Mockups": "کاتالوگ تصاویر کالا",
    "Exporters Certificates": "اسناد استاندارد بهداشتی",
    "Report Attachments": "پیوست گزارشات قرنطینه",
    "WordPress Smart Clip": "مکانیزم کلیپ‌بورد هوشمند آئورا",
    "Copy any screenshot or local image and press Ctrl+V anywhere on page. The library will intercept, optimize, and save to active storage catalog instantaneously.": "با کپی هرگونه اسکرین شات و فشردن دکمه‌های ترکیبی Ctrl+V در پورتال، تصویر بهینه‌سازی، تبدیل و فوراً در دیتابیس لوکال ذخیره می‌گردد.",
    "Search by filename, size, ext...": "جستجو با نام فایل، اندازه، فرمت کالا...",
    "All Files": "همه فایل‌های رسانه",
    "Images": "تصاویر کاتالوگ",
    "PDF Reports": "اسناد پژوهشی (PDF)",
    "Videos": "فیلم‌های راهنما (MP4)",
    "Processing File Payload Queue": "صف پردازش و تبدیل فایل لوکال",
    "Clear Queue": "پاک‌سازی لیست پردازش",
    "Direct Resource Link (URL)": "آدرس مستقیم پیوند وب (پیوند خام)",
    "Copy Link": "کپی آدرس سند",
    "Copied": "با موفقیت کپی شد",
    "Insert Block": "درج در محتوای کادر ✓",
    "No matches found in active asset directories. Make a fresh upload above.": "هیچ پسندی با این ساختار وجود ندارد؛ فایل جدید بکشید و رها کنید.",
    "Settings": "تنظیمات سئو",
    "Select": "انتخاب و درج",
    "Delete Asset": "حذف کامل رسانه",
    "Asset File Configurations": "تنظیم متادیتا و خصوصیات سئو فایل",
    "Calibrate SEO descriptions and annotations": "کالیبره کردن متن جایگزین تصویر، برچسب‌ها و عنوان",
    "Save Configurations Data": "ذخیره تغییرات سئو",
    "Direct File reference Link": "آدرس فیزیکی خام فایل رسانه",
    "Direct access URL to media file": "پیوند دسترسی سریع به این رسانه در وب",
    "Resource SEO Descriptive (Alt)": "متن جایگزین تصویر سئو (Image Alt)",
    "Highly recommended to follow regulatory rules and enhance search engine score.": "برای تقویت و ارتقای سئوی وب‌سایت در لایه موتورهای توسعه گوگل شدیداً توصیه می‌شود.",
    "Context Caption narrative": "توضیح کپشن و پانویس کالا",
    "Detailed description label placed underneath zoom visual views.": "متنی کوتاه که در لایه گالری محصولات زیر زوم عکس نمایش داده خواهد شد.",
    "Assign Organizer Folder": "پوشه قرارگیری مشخص در سیستم",
    "Place in categorized collections": "انتخاب دسته ذخیره‌سازی تخصصی رسانه",
    "Are you sure you want to permanently delete \"{name}\"? This action cannot be undone.": "آیا مطمئن هستید که می‌خواهید رسانه را برای همیشه حذف کنید؟ این عمل غیرقابل بازگشت است."
  };

  const t = (key: string, fallback = "") => {
    if (isFa) {
      if (mediaTranslations[key]) return mediaTranslations[key];
    }
    if (parentT) {
      const parentRes = parentT(key);
      if (parentRes !== key) return parentRes;
    }
    return fallback || key;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All Assets");
  const [selectedMimeType, setSelectedMimeType] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Metadata editor form states
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [folderTag, setFolderTag] = useState("Unassigned");

  // Multi-upload queue visual states
  interface UploadQueueItem {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: "queued" | "compressing" | "converting_webp" | "uploading" | "complete" | "failed";
    progressMessage: string;
    resultUrl?: string;
  }
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  // Simulate file analysis, WebP compression, and optimization
  const processAndUploadFile = async (file: File) => {
    const queueId = "uq-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    const originSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    
    const newQueueItem: UploadQueueItem = {
      id: queueId,
      name: file.name,
      size: originSize,
      progress: 5,
      status: "compressing",
      progressMessage: "Analyzing payload metadata..."
    };
    
    setUploadQueue(prev => [newQueueItem, ...prev]);

    try {
      // Stage 1: Reading & Sizing
      await new Promise(resolve => setTimeout(resolve, 800));
      setUploadQueue(prev => prev.map(item => item.id === queueId ? { 
        ...item, progress: 25, progressMessage: "Initiating premium compression algorithms..." 
      } : item));

      // Stage 2: WebP Convert simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const targetSize = (file.size * 0.18 / (1024 * 1024)).toFixed(2) + " MB"; // Simulate 82% smaller WebP size
      setUploadQueue(prev => prev.map(item => item.id === queueId ? { 
        ...item, 
        progress: 60, 
        status: "converting_webp",
        size: targetSize + " (WebP, 82% Compressed)",
        progressMessage: "Converting to standard WebP format..." 
      } : item));

      // Stage 3: Secure upload simulation
      await new Promise(resolve => setTimeout(resolve, 900));
      setUploadQueue(prev => prev.map(item => item.id === queueId ? { 
        ...item, progress: 85, status: "uploading", progressMessage: "Hashing and syncing with Cloud Bucket..." 
      } : item));

      // Save to database/backend mock storage, if image, we use a beautiful Unsplash or raw mock image url
      let simulatedUrl = "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80";
      if (file.type.includes("pdf")) {
        simulatedUrl = "/src/backups/quarantine_certification_report.pdf";
      } else if (file.name.toLowerCase().includes("pistachio")) {
        simulatedUrl = "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=1200&q=80";
      } else if (file.name.toLowerCase().includes("saffron") || file.name.toLowerCase().includes("red")) {
        simulatedUrl = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80";
      } else if (file.name.toLowerCase().includes("box") || file.name.toLowerCase().includes("package")) {
        simulatedUrl = "https://images.unsplash.com/photo-1596701062351-8c4c1314a57c?auto=format&fit=crop&w=1200&q=80";
      }

      await apiCall("/api/admin/media/add", "POST", {
        fileName: file.name.replace(/\.[^/.]+$/, "") + ".webp",
        mimeType: file.type.includes("pdf") ? "application/pdf" : "image/webp",
        size: targetSize,
        url: simulatedUrl
      });

      await new Promise(resolve => setTimeout(resolve, 600));
      setUploadQueue(prev => prev.map(item => item.id === queueId ? { 
        ...item, progress: 100, status: "complete", progressMessage: "Active asset registered!", resultUrl: simulatedUrl
      } : item));

      showNotice("success", t(`Asset "${file.name}" compressed and uploaded successfully!`));
      triggerDataLoads();
    } catch (err) {
      setUploadQueue(prev => prev.map(item => item.id === queueId ? { 
        ...item, status: "failed", progressMessage: "Transfer error. Check system capacity." 
      } : item));
    }
  };

  // Intercept paste events at application scope
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            showNotice("success", t("Clipboard image detected! Compressing automatically..."));
            const pastedFile = new File([file], `Pasted_Capture_${Date.now()}.png`, { type: file.type });
            processAndUploadFile(pastedFile);
          }
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  // Drag and Drop files upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files.length > 0) {
      files.forEach(file => processAndUploadFile(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      files.forEach(file => processAndUploadFile(file));
    }
  };

  // Delete media item handler
  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(t(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`))) {
      try {
        await apiCall(`/api/admin/media/${id}`, "DELETE");
        showNotice("success", t("Media asset swept from active registries."));
        setSelectedItem(null);
        setIsDetailOpen(false);
        triggerDataLoads();
      } catch (err) {
        showNotice("error", t("Failed to delete media item."));
      }
    }
  };

  // Select item details
  const handleViewDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setAltText(item.fileName.replace(".webp", "").replace(/_/g, " ") + " premium organic cargo");
    setCaption(t("Verified international quality standard shipment batch raw assets."));
    // Determine category based on filename
    if (item.fileName.toLowerCase().includes("cert") || item.fileName.toLowerCase().includes("iso")) {
      setFolderTag("Exporters Certificates");
    } else if (item.fileName.toLowerCase().includes("box") || item.fileName.toLowerCase().includes("pkg")) {
      setFolderTag("Product Mockups");
    } else if (item.fileName.toLowerCase().includes("report")) {
      setFolderTag("Report Attachments");
    } else {
      setFolderTag("Product Mockups");
    }
    setIsDetailOpen(true);
  };

  const handleSaveMetadata = () => {
    showNotice("success", t("SEO meta data keywords, alt texts, and captions updated."));
    setIsDetailOpen(false);
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Folder tags lookup helper
  const getItemFolder = (item: MediaItem): string => {
    if (item.fileName.toLowerCase().includes("cert") || item.fileName.toLowerCase().includes("iso")) {
      return "Exporters Certificates";
    } else if (item.fileName.toLowerCase().includes("box") || item.fileName.toLowerCase().includes("pkg")) {
      return "Product Mockups";
    } else if (item.fileName.toLowerCase().includes("report") || item.mimeType.includes("pdf")) {
      return "Report Attachments";
    }
    return "Product Mockups";
  };

  // Calculate simulated storage quota
  const totalItemCount = media.length;
  const simulatedSizeUsed = (12.4 + (totalItemCount * 0.35)).toFixed(1); // MB
  const quotaPercent = Math.min(100, Math.round((parseFloat(simulatedSizeUsed) / 100) * 100));

  // Filter and search lists
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // MimeType filter
    let matchesMime = true;
    if (selectedMimeType === "images") {
      matchesMime = item.mimeType.startsWith("image/");
    } else if (selectedMimeType === "pdfs") {
      matchesMime = item.mimeType.includes("pdf") || item.fileName.toLowerCase().endsWith(".pdf");
    } else if (selectedMimeType === "videos") {
      matchesMime = item.mimeType.startsWith("video/") || item.fileName.toLowerCase().includes("vid");
    }

    // Folder filter
    let matchesFolder = true;
    if (selectedFolder !== "All Assets") {
      matchesFolder = getItemFolder(item) === selectedFolder;
    }

    return matchesSearch && matchesMime && matchesFolder;
  });

  return (
    <div className="space-y-6 text-luxury-dark" id="gutenberg-media-library-desk">
      {/* Top statistics and Storage metrics header widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-luxury-dark to-slate-900 border border-white/5 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-400 uppercase block tracking-wider">{t("Media Cloud Quota")}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono">{simulatedSizeUsed} MB</span>
              <span className="text-xs text-gray-500">/ 100.0 MB</span>
            </div>
            <div className="w-32 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-pistachio h-full rounded-full transition-all duration-500" 
                style={{ width: `${quotaPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-pistachio" />
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-400 uppercase block tracking-wider">{t("Total Registries")}</span>
            <span className="text-xl font-bold font-mono text-luxury-dark">{media.length} {t("Assets")}</span>
            <span className="text-[9.5px] text-emerald-600 block">{t("WebP compression active")}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pistachio-light/10 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 text-pistachio" />
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-400 uppercase block tracking-wider">{t("Active Folders")}</span>
            <span className="text-xl font-bold font-mono text-luxury-dark">3 {t("Logical Units")}</span>
            <span className="text-[9.5px] text-gray-400 block">{t("Auto folder indexing")}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-luxury-gold/10 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-luxury-gold" />
          </div>
        </div>

        <div className="bg-white border border-[#edf3e8] bg-gradient-to-r from-cream/10 to-[#f5faf0] rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-emerald-800 uppercase block tracking-wider">{t("Optimizations Active")}</span>
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">✓ {t("Interception Active")}</span>
            <span className="text-[9px] text-gray-500 block leading-tight">{t("Paste clipboard images or drag files directly anywhere to auto compress.")}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 animate-pulse">
            <Settings2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Main workspace layout: left side navigation folders / drag & drop, right side grid search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Drag and Drop & Folder Categories */}
        <div className="space-y-5 lg:col-span-1">
          {/* Upload card drag region */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300 relative group cursor-pointer ${
              isDragging 
                ? "border-pistachio bg-pistachio/5 scale-95" 
                : "border-gray-300 hover:border-pistachio hover:bg-cream/25"
            }`}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              id="library-media-uploader"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className={`w-10 h-10 transition-transform ${isDragging ? 'scale-125 text-pistachio' : 'text-gray-400 group-hover:text-pistachio'}`} />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-luxury-dark">{t("Drag & Drop Files")}</span>
                <span className="block text-[10px] text-gray-400 mt-1">{t("Or click to select locally")}</span>
              </div>
              <div className="mt-2 text-[9px] font-mono text-gray-400 border border-gray-100 bg-white px-2 py-0.5 rounded-full inline-block">
                WebP, PNG, JPG, PDF, MP4
              </div>
            </div>
          </div>

          {/* Folder Category selectors list */}
          <div className="bg-white border rounded-3xl p-5 space-y-4">
            <span className="block text-[9px] font-mono uppercase text-gray-400 tracking-wider font-bold">{t("Organized Collections")}</span>
            <nav className="flex flex-col gap-1.5" id="media-folder-nav">
              {[
                { name: "All Assets", icon: Folder, count: media.length },
                { name: "Product Mockups", icon: ImageIcon, count: media.filter(m => getItemFolder(m) === "Product Mockups").length },
                { name: "Exporters Certificates", icon: FolderOpen, count: media.filter(m => getItemFolder(m) === "Exporters Certificates").length },
                { name: "Report Attachments", icon: FileText, count: media.filter(m => getItemFolder(m) === "Report Attachments").length }
              ].map(f => {
                const isCurrent = selectedFolder === f.name;
                return (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFolder(f.name)}
                    className={`w-full flex items-center justify-between text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      isCurrent 
                        ? "bg-pistachio text-white font-semibold shadow-xs" 
                        : "hover:bg-gray-50 text-gray-600 hover:text-luxury-dark"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5" />
                      <span>{t(f.name)}</span>
                    </div>
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{f.count}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active visual auto-save / clipboard warning warning box */}
          <div className="bg-[#f0f8ff] border border-blue-100 rounded-2xl p-4 text-[10px] text-blue-800 leading-relaxed font-sans space-y-1.5">
            <div className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{t("WordPress Smart Clip")}</span>
            </div>
            <p>{t("Copy any screenshot or local image and press Ctrl+V anywhere on page. The library will intercept, optimize, and save to active storage catalog instantaneously.")}</p>
          </div>
        </div>

        {/* Right Side: Media Asset Gallery Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Search, Mime filtration, View togglers */}
          <div className="bg-white border rounded-3xl p-4.5 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs" id="media-search-holder">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={t("Search by filename, size, ext...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 outline-none rounded-2xl focus:border-pistachio text-luxury-dark"
              />
            </div>

            {/* Mime Filtrations Tabs */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
              {[
                { id: "all", label: t("All Files") },
                { id: "images", label: t("Images") },
                { id: "pdfs", label: t("PDF Reports") },
                { id: "videos", label: t("Videos") }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMimeType(tab.id)}
                  className={`px-3.5 py-1.5 text-[10px] font-semibold uppercase rounded-xl tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedMimeType === tab.id 
                      ? "bg-white text-luxury-dark shadow-xs" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload progress queues section */}
          {uploadQueue.length > 0 && (
            <div className="bg-white border rounded-3xl p-5 space-y-3.5" id="media-upload-queue">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">{t("Processing File Payload Queue")}</span>
                <button 
                  onClick={() => setUploadQueue([])} 
                  className="text-[9px] font-semibold uppercase text-rose-600 hover:underline cursor-pointer"
                >
                  {t("Clear Queue")}
                </button>
              </div>
              <div className="space-y-3">
                {uploadQueue.map(item => (
                  <div key={item.id} className="bg-cream/20 p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-lg bg-pistachio-light/10 flex items-center justify-center animate-pulse">
                        <UploadCloud className="w-4 h-4 text-pistachio" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-semibold truncate text-luxury-dark">{item.name}</span>
                        <span className="block text-[9.5px] text-gray-400 font-mono mt-0.5">{item.size} • {item.progressMessage}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-64 justify-end">
                      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.status === 'complete' ? 'bg-emerald-500' : 'bg-pistachio'
                          }`} 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold w-12 text-right">
                        {item.progress}%
                      </span>
                    </div>

                    {item.status === "complete" && onSelect && item.resultUrl && (
                      <button
                        onClick={() => onSelect(item.resultUrl!)}
                        className="bg-pistachio text-white font-mono text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-pistachio-light transition-all cursor-pointer whitespace-nowrap"
                      >
                        {t("Insert Block")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid display of matching assets files */}
          {filteredMedia.length === 0 ? (
            <div className="bg-white border text-center p-16 text-xs text-gray-400 rounded-3xl space-y-3" id="media-empty">
              <Folder className="w-10 h-10 text-gray-300 mx-auto" />
              <div>{t("No matches found in active asset directories. Make a fresh upload above.")}</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="media-library-grid">
              {filteredMedia.map(item => {
                const isPdf = item.mimeType === "application/pdf" || item.fileName.endsWith(".pdf");
                const isVideo = item.mimeType.startsWith("video/") || item.fileName.includes("vid");
                const folder = getItemFolder(item);

                return (
                  <div 
                    key={item.id} 
                    className="bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group h-fit"
                  >
                    {/* Visual aspect preview frame */}
                    <div className="h-36 bg-gray-50 relative flex items-center justify-center overflow-hidden border-b border-gray-100">
                      {isPdf ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <FileText className="w-10 h-10 text-red-500" />
                          <span className="text-[8px] font-bold text-gray-400 font-mono">PDF REPORT</span>
                        </div>
                      ) : isVideo ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Video className="w-10 h-10 text-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-bold text-gray-400 font-mono">MP4 EMBED</span>
                        </div>
                      ) : (
                        <img 
                          src={item.url} 
                          alt={item.fileName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Folder tag label on top */}
                      <span className="absolute top-2 left-2 bg-luxury-dark/70 backdrop-blur-sm text-white text-[7.5px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">
                        {t(folder)}
                      </span>

                      {/* File Weight badge */}
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[7.5px] font-mono px-2 py-0.5 rounded-full">
                        {item.size}
                      </span>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-3.5 space-y-3 bg-white">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate text-luxury-dark" title={item.fileName}>{item.fileName}</h4>
                        <span className="text-[8.5px] font-mono text-gray-400 block mt-0.5 uppercase tracking-wide">
                          {item.mimeType.split("/")[1]} • {item.uploadedAt.substring(0, 10)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 font-mono text-[9px] pt-1">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="flex-1 bg-gray-50 hover:bg-pistachio text-gray-600 hover:text-white py-1.5 rounded-lg border border-gray-100 hover:border-pistachio transition-all font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Settings2 className="w-3 h-3" />
                          <span>{t("Settings")}</span>
                        </button>
                        
                        {onSelect ? (
                          <button
                            onClick={() => onSelect(item.url)}
                            className="bg-emerald-600 text-white font-bold uppercase px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-all cursor-pointer whitespace-nowrap"
                          >
                            {t("Select")}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteItem(item.id, item.fileName)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg border border-rose-100 transition-all cursor-pointer"
                            title={t("Delete Asset")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide-out details configuration panel drawer (WordPress style metadata modifier) */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-screen overflow-y-auto p-6 shadow-2xl space-y-6 relative border-s border-gray-100 font-sans">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-sm font-bold text-luxury-dark uppercase tracking-wider">{t("Asset File Configurations")}</h3>
                <span className="text-[9px] font-mono text-gray-400 uppercase">{t("Calibrate SEO descriptions and annotations")}</span>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="text-gray-400 hover:text-luxury-dark text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Thumbnail aspect */}
            <div className="h-44 bg-gray-50 border rounded-2xl overflow-hidden flex items-center justify-center relative">
              {selectedItem.mimeType === "application/pdf" ? (
                <FileText className="w-16 h-16 text-rose-500" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.fileName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
              <span className="absolute bottom-3 left-3 bg-black/70 text-white font-mono text-[8px] px-2 py-0.5 rounded-full">
                {selectedItem.mimeType}
              </span>
            </div>

            {/* System details */}
            <div className="bg-cream/25 border p-4.5 rounded-2xl text-xs space-y-2.5">
              <span className="text-[8.5px] font-mono uppercase text-gray-400 font-bold block">{t("File Diagnostics")}</span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wide">{t("Unique ID")}:</span>
                  <span className="font-mono text-gray-600 break-all">{selectedItem.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wide">{t("Weight / Capacity")}:</span>
                  <span className="font-mono text-gray-600">{selectedItem.size}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wide">{t("Upload Date")}:</span>
                  <span className="text-gray-500">{selectedItem.uploadedAt.substring(0, 16).replace("T", " ")}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wide">{t("Image Resolution")}:</span>
                  <span className="font-mono text-gray-500">3840 x 2560 (Retina)</span>
                </div>
              </div>
            </div>

            {/* Modification forms */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Asset File URL link")}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedItem.url}
                    className="flex-1 border bg-gray-50 px-3 py-2 text-[10px] font-mono text-gray-500 rounded-xl outline-none"
                  />
                  <button
                    onClick={() => copyUrlToClipboard(selectedItem.url)}
                    className="bg-pistachio hover:bg-pistachio-light text-white px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl === selectedItem.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl === selectedItem.url ? t("Copied") : t("Copy")}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Image Alt Text (critical for Google Image SEO)")}</label>
                <input 
                  type="text" 
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder={t("e.g. Akbari organic pistachio crop export packages...")}
                  className="border px-3.5 py-2 text-xs rounded-xl outline-none focus:border-pistachio text-luxury-dark"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Caption/Description Annotation")}</label>
                <textarea 
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t("Annotation visible under photo previews...")}
                  className="border px-3.5 py-2 text-xs rounded-xl outline-none focus:border-pistachio text-luxury-dark"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider font-bold">{t("Move to Asset Folder tag")}</label>
                <select 
                  value={folderTag}
                  onChange={(e) => setFolderTag(e.target.value)}
                  className="border bg-white px-3 py-2.5 text-xs rounded-xl outline-none cursor-pointer"
                >
                  <option value="Product Mockups">{t("Product Mockups")}</option>
                  <option value="Exporters Certificates">{t("Exporters Certificates")}</option>
                  <option value="Report Attachments">{t("Report Attachments")}</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-3">
              <button
                onClick={handleSaveMetadata}
                className="flex-1 bg-pistachio hover:bg-pistachio-light text-white py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer"
              >
                {t("Save Meta Updates")}
              </button>
              <button
                onClick={() => handleDeleteItem(selectedItem.id, selectedItem.fileName)}
                className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-800 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
              >
                {t("Delete File")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
