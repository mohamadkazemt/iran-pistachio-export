import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Product } from "../types.js";
import { Scale, ShieldCheck, Mail, Building, Globe2, FileUp, AlertTriangle, FileText, CheckCircle } from "lucide-react";

interface RfqFormProps {
  preSelectedProductId: string;
  lang: string;
}

const DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    clientName: "Consignee full Name",
    email: "Corporate email address",
    company: "Vested legal enterprise",
    country: "Destination State (Jurisdiction)",
    selectProd: "Selected Export Commodity Profile",
    qty: "Requested volume / metric weight",
    incoterm: "Incoterm 2020 delivery liability standard",
    comments: "Special logistics criteria & phytosanitary directives",
    attach: "Upload customs specifications or phyto directives",
    submit: "Initiate verified lead clearance",
    successTitle: "Inquiry Ingestion Completed",
    successText: "Your official request has been secured under audit signature. Eslami logistics specialists will issue a comprehensive Pro-Forma Invoice matching your requested incoterm shortly."
  },
  es: {
    clientName: "Nombre completo del consignatario",
    email: "Dirección de correo corporativo",
    company: "Empresa legal registrada",
    country: "Estado de destino (Jurisdicción)",
    selectProd: "Perfil del commodity de exportación",
    qty: "Volumen solicitado / Peso métrico",
    incoterm: "Incoterms de distribución de riesgos",
    comments: "Criterios especiales de logística y aduanas",
    attach: "Subir especificaciones de aduanas o phyto",
    submit: "Iniciar despacho verificado",
    successTitle: "Inscripción del trámite exitoso",
    successText: "Su consulta ha sido asegurada. Los especialistas logísticos de Eslami emitirán una Factura Pro-Forma que coincida con su incoterm solicitado en breve."
  },
  zh: {
    clientName: "收货人全称 / 采购代表",
    email: "企业电子邮箱",
    company: "注册法人企业全称",
    country: "目的港国家 (管辖法域)",
    selectProd: "选定的出口大宗商品资产",
    qty: "要求的承运货量 / 公制吨位",
    incoterm: "国际贸易术语 (Incoterm 2020) 责任转移选择",
    comments: "海关装运、检验检疫特殊物流合规指示",
    attach: "上传海关申报规范或检疫指令材料",
    submit: "提交已核实货运询价清单",
    successTitle: "询价清单接收就绪",
    successText: "您的询价已存盘至审核记录。Eslami物流部门将遵循您要求的贸易术语(Incoterms)在短时间内为您呈报正式形式发票(Pro-Forma Invoice)。"
  },
  ar: {
    clientName: "اسم المرسل إليه بالكامل / الممثل التجاري",
    email: "عنوان البريد الإلكتروني للمؤسسة",
    company: "الكيان القانوني المسجل للمؤسسة",
    country: "الدولة الوجهة (الاختصاص القضائي)",
    selectProd: "تحديد السلعة ومواصفات التصدير",
    qty: "الحجم المطلوب / الوزن المتري المقدر",
    incoterm: "معيار Incoterms 2020 لتوزيع مخاطر الشحن",
    comments: "متطلبات لوجستية خاصة وتوجيهات صحية نباتية",
    attach: "إرفاق مستندات الجمارك أو التوجيهات الفنية",
    submit: "تقديم وثيقة طلب التسعيرة الآمنة",
    successTitle: "تم استيعاب طلب التسعير بنجاح",
    successText: "تم توثيق طلبكم رسمياً وتوفير الحماية الأمنية له. سيقوم أخصائي اللوجستيات في Eslami بإصدار فاتورة شكلية شاملة تطابق شروط الشحن الدولية المختارة قريباً."
  },
  de: {
    clientName: "Vollständiger Name des Empfängers",
    email: "Geschäftliche E-Mail-Adresse",
    company: "Eingetragenes Unternehmen",
    country: "Bestimmungsland (Jurisdiktion)",
    selectProd: "Ausgewählte Export-Rohstoffkategorie",
    qty: "Gewünschtes Volumen / Metrisches Gewicht",
    incoterm: "Incoterms 2020 Gefahrenübergang-Kriterium",
    comments: "Besondere Logistikkriterien & Zollrichtlinien",
    attach: "Zollspezifikationen oder EU-Richtlinien hochladen",
    submit: "Bestätigtes Anfrageverfahren einleiten",
    successTitle: "Anfrageerfassungsverfahren Erfolgreich",
    successText: "Ihre offizielle Anfrage wurde unter Sicherheitsprüfung archiviert. Eslami Logistik-Auditoren werden in Kürze eine Pro-Forma-Rechnung gemäß Ihren ausgewählten Incoterms ausstellen."
  },
  fa: {
    clientName: "نام و نام خانوادگی گیرنده",
    email: "آدرس ایمیل سازمانی",
    company: "نام شرکت یا بنگاه حقوقی",
    country: "کشور مقصد (حوزه قضایی)",
    selectProd: "پروفایل محصول صادراتی انتخاب شده",
    qty: "حجم درخواستی / وزن متریک",
    incoterm: "مقررات و مسئولیت تحویل اینکوترمز ۲۰۲۰",
    comments: "شرایط لجستیک ویژه و دستورالعمل‌های بهداشتی",
    attach: "برگ مشخصات گمرکی یا اسناد قرنطینه دکومیانه",
    submit: "ارسال و ثبت نهایی استعلام قیمت مقتدرانه",
    successTitle: "استعلام سفارش با موفقیت ثبت شد",
    successText: "درخواست رسمی شما تحت امضای دیجیتال ممیزی با موفقیت دریافت و بایگانی گردید. متخصصان لجستیک بین‌الملل کمپانی Eslami به‌زودی پیش‌فاکتور رسمی منطبق با اینکوترمز انتخابی شما را صادر خواهند کرد."
  }
};

export default function RfqForm({ preSelectedProductId, lang }: RfqFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    clientName: "",
    email: "",
    company: "",
    country: "United States",
    productInterestId: preSelectedProductId || "",
    quantityNeeded: "",
    preferredIncoterm: "FOB",
    comment: ""
  });

  const [docBase64, setDocBase64] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);
  const [csrfToken, setCsrfToken] = useState("");

  const labels = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    // Sync preSelected parameter changes
    if (preSelectedProductId) {
      setForm(f => ({ ...f, productInterestId: preSelectedProductId }));
    }
  }, [preSelectedProductId]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        if (!form.productInterestId && data.length > 0) {
          setForm(f => ({ ...f, productInterestId: data[0].id }));
        }
      })
      .catch(err => console.error("Catalog mapping failure", err));

    fetch("/api/csrf")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(err => console.error("CSRF token loading error", err));
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorStatus(null);

    // Client-side file size guard: 2.5MB max as required
    if (file.size > 2.5 * 1024 * 1024) {
      setErrorStatus("Supplied file exceeds maximum secure size envelope of 2.5MB. Please compress and resubmit.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocBase64(reader.result as string);
      setDocName(file.name);
    };
    reader.onerror = () => {
      setErrorStatus("Failed to properly read validation certificates. Package may be malformed.");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    setSuccessInfo(null);

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
          ...form,
          docUrl: docBase64
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Compliance failed during intake.");
      }

      setSuccessInfo(data);
      // Clean form on success
      setForm({
        clientName: "",
        email: "",
        company: "",
        country: "United States",
        productInterestId: products[0]?.id || "",
        quantityNeeded: "",
        preferredIncoterm: "FOB",
        comment: ""
      });
      setDocBase64(null);
      setDocName("");
    } catch (err: any) {
      setErrorStatus(err.message || "Failed connecting to logistics service registers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-sans" id="rfq-intake-panel">
      
      {/* Exquisite Lead Ingestion Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] tracking-[0.2em] font-mono text-luxury-gold uppercase mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>Global Commodity RFQ Registrar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-luxury-dark mb-3">
          Verified Cargo Inquiries
        </h1>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          Provide complete corporate profiles and transport routing identifiers. Inbound payloads are scanned for regulatory compliance safeguards.
        </p>
      </div>

      {/* Submission Messages */}
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xs mb-8 animate-fadeIn" id="rfq-success-alert">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-widest text-emerald-800 mb-1">{labels.successTitle}</h3>
              <p className="text-xs font-light tracking-wide text-emerald-700 leading-relaxed-strict mb-4">{labels.successText}</p>
              <div className="bg-white border border-emerald-100 p-4 rounded-xs font-mono text-[10px] text-gray-500">
                <span className="block font-bold mb-1 uppercase tracking-wider text-emerald-800">Secure Audit Intake ID</span>
                <span className="text-luxury-dark">{successInfo.rfq?.id}</span>
                <span className="block mt-2 font-bold mb-1 uppercase tracking-wider text-[#a4865e]">Lead Signature Rating</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${successInfo.needsVerification ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {successInfo.needsVerification ? "AWAITING COMPLIANCE SCAN" : "VERIFIED EXPORT LEAD CLASSIFICATION"}
                </span>
                <p className="mt-2 text-gray-400 italic font-sans">{successInfo.statusMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorStatus && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-xs mb-8 flex gap-3 animate-fadeIn" id="rfq-error-alert">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="block font-bold text-xs uppercase tracking-wider text-rose-800 mb-0.5">Customs Entry Rejection Alert</span>
            <p className="text-xs text-rose-700 font-light leading-relaxed-strict">{errorStatus}</p>
          </div>
        </div>
      )}

      {/* Main Interactive Form Body */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-gray-100 rounded-none p-6 sm:p-10 shadow-lg space-y-8" id="rfq-actual-form">
        
        {/* Core Block 1: Importer Authentics */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold pb-2 border-b border-gray-100 mb-6 flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span>1. Corporate Identity Credentials</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-client-name" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.clientName} <span className="text-luxury-gold">*</span>
              </label>
              <input
                id="rfq-client-name"
                type="text"
                required
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="e.g. Dr. Arthur Pendelton"
                className="border border-gray-200 focus:border-luxury-gold px-4 py-3 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-client-email" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.email} <span className="text-luxury-gold">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-300 pointer-events-none" />
                <input
                  id="rfq-client-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. procurement@pendeltonscale.com"
                  className="w-full border border-gray-200 focus:border-luxury-gold pl-11 pr-4 py-3 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-client-company" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.company} <span className="text-luxury-gold">*</span>
              </label>
              <input
                id="rfq-client-company"
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Pendelton Aerospace Corp"
                className="border border-gray-200 focus:border-luxury-gold px-4 py-3 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-client-country" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.country} <span className="text-luxury-gold">*</span>
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-300 pointer-events-none" />
                <input
                  id="rfq-client-country"
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. Germany"
                  className="w-full border border-gray-200 focus:border-luxury-gold pl-11 pr-4 py-3 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Core Block 2: Commodities Logistics */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold pb-2 border-b border-gray-100 mb-6 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span>2. Customs & Cargo Parameters</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-select-product" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.selectProd} <span className="text-luxury-gold">*</span>
              </label>
              <select
                id="rfq-select-product"
                required
                value={form.productInterestId}
                onChange={(e) => setForm({ ...form, productInterestId: e.target.value })}
                className="border border-gray-200 focus:border-luxury-gold bg-[#fbfbfc] px-4 py-3 text-xs outline-none cursor-pointer text-luxury-dark"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} className="text-xs text-luxury-dark">
                    {p.name.replace(" (Sargol Grade S+)", "")} ({p.hsCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-qty" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.qty} <span className="text-luxury-gold">*</span>
              </label>
              <input
                id="rfq-qty"
                type="text"
                required
                value={form.quantityNeeded}
                onChange={(e) => setForm({ ...form, quantityNeeded: e.target.value })}
                placeholder="e.g. 50 Metric Tons / 80 Kilograms"
                className="border border-gray-200 focus:border-luxury-gold px-4 py-3 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="rfq-incoterm" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.incoterm}
              </label>
              <div className="grid grid-cols-5 gap-2" id="incoterm-pills-container">
                {["FOB", "CIF", "EXW", "DDP", "CFR"].map(inco => (
                  <button
                    key={inco}
                    type="button"
                    onClick={() => setForm({ ...form, preferredIncoterm: inco })}
                    className={`py-3.5 border rounded-xs text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors ${
                      form.preferredIncoterm === inco
                        ? "bg-luxury-dark text-white border-luxury-dark"
                        : "bg-white text-gray-500 border-gray-200 hover:border-luxury-gold"
                    }`}
                    id={`rfq-incoterm-btn-${inco.toLowerCase()}`}
                  >
                    {inco}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core Block 3: Verification Attachments & Directives */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold pb-2 border-b border-gray-100 mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>3. Technical Directives & Phyto Certificates</span>
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-comments" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.comments}
              </label>
              <textarea
                id="rfq-comments"
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="State customized physical specifications tolerances, particular port of delivery protocols, or quarantine certificate details..."
                className="border border-gray-200 focus:border-luxury-gold px-4 py-3.5 text-xs outline-none bg-luxury-light/20 focus:bg-white transition-colors text-luxury-dark"
              />
            </div>

            {/* Certificate Document Upload Box with Drag & Drop styling */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rfq-file-uploader" className="text-[10px] font-mono font-medium uppercase text-gray-400 tracking-wider">
                {labels.attach}
              </label>
              <div className="border border-dashed border-gray-300 hover:border-luxury-gold/50 bg-[#fdfdfd] p-6 text-center rounded-xs transition-all relative">
                <FileUp className="w-8 h-8 mx-auto mb-3 text-gray-300 group-hover:text-luxury-gold" />
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Drag and drop compliance document sheets here, or click to explore your computer
                </span>
                <span className="block text-[10px] text-gray-400 font-mono tracking-wider">
                  PDF, PNG, JPG, WEBP formats. Size restricted to &lt; 2.5 Megabytes.
                </span>

                <input
                  id="rfq-file-uploader"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload specs"
                />

                {docName && (
                  <div className="mt-4 bg-[#f1fcf6] border border-emerald-100 px-3.5 py-3 rounded-xs flex items-center justify-center gap-2 text-[10px] text-emerald-800 font-mono animate-fadeIn z-10 relative">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SECURED ATTACHMENT: {docName} ({(docBase64 ? (docBase64.length * 3 / 4 / 1024).toFixed(1) : 0)} KB)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Trigger */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-luxury-dark hover:bg-transparent text-white hover:text-luxury-dark border border-luxury-dark transition-all duration-300 py-4 px-6 rounded-xs text-xs font-semibold uppercase tracking-[0.25em] font-sans flex items-center justify-center gap-3 cursor-pointer"
          id="rfq-submit-button"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              <span>Securing Compliance Registers...</span>
            </>
          ) : (
            <>
              <span>{labels.submit}</span>
              <ShieldCheck className="w-4.5 h-4.5 text-luxury-gold" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}
