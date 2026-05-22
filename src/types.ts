export interface Product {
  id: string;
  name: string;
  description: string;
  categories: string[];
  priceRange: string;
  unit: string;
  imageUrl: string;
  origin: string;
  specifications: Record<string, string>;
  hsCode: string;
  leadTime: string;
  minOrder: string;
  purityGrade?: string;
  packaging?: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publicationDate: string;
  readTime: string;
  imageUrl: string;
  author: string;
  tags: string[];
}

export interface RFQ {
  id: string;
  clientName: string;
  email: string;
  company: string;
  country: string;
  productInterestId: string;
  quantityNeeded: string;
  preferredIncoterm: "FOB" | "CIF" | "EXW" | "DDP" | "CFR";
  comment: string;
  spamScore: number;
  status: "Pending" | "Reviewed" | "Contacted" | "Quoted";
  submissionTime: string;
  docUrl?: string; // Standard base64 attached doc simulation
}

export interface SystemLog {
  id: string;
  event: string;
  level: "INFO" | "WARNING" | "SECURITY" | "ALERT";
  ip: string;
  timestamp: string;
  details: string;
}

export interface BackupInfo {
  fileName: string;
  size: string;
  timestamp: string;
}

export interface AdviserMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuedBy: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
}

export interface HomepageTexts {
  heroTag: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  ctaCatalog: string;
  ctaAdvisor: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  stat4Label: string;
  stat4Value: string;
  pillarTitle: string;
  pillarSubtitle: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  journeyTitle: string;
  journeySubtitle: string;
  readMore: string;
}

export interface SiteSettings {
  brandName: string;
  logoText: string;
  logoSubtext: string;
  phone: string;
  whatsApp: string;
  telegram: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  homepageTexts: Record<string, HomepageTexts>; // key represents language (en, es, zh, ar, de)
  sliders: SliderItem[];
  certificates: CertificateItem[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  seo?: SEOSettings;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: "superadmin" | "editor";
  createdAt: string;
  lastLogin?: string;
}

export interface VisitorAnalytics {
  id: string;
  date: string;
  visitors: number;
  pageViews: number;
  inquiries: number;
  byCountry: Array<{ label: string; count: number }>;
  byDevice: { desktop: number; mobile: number; tablet: number };
}

export interface MediaItem {
  id: string;
  fileName: string;
  mimeType: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  sitemapLastUpdated: string;
}

