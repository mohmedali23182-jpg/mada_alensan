// ============================================
// أنواع البيانات الكاملة - مدى الإنسان
// مُصمَّمة للتكامل المستقبلي مع Supabase + CMS
// ============================================

// ----- الفئات -----
export type ArticleCategory =
  | "news"       // الأخبار الإنسانية
  | "life"       // حياة الناس
  | "stories"    // قصة وكفاح
  | "letters"    // رسالة إنسان
  | "issues"     // قضايا وملفات
  | "opinions";  // أقلام الناس

export type CaseStatus =
  | "urgent"
  | "under-review"
  | "in-progress"
  | "resolved";

export type CaseType =
  | "poverty"
  | "disease"
  | "displacement"
  | "education"
  | "housing"
  | "other";

export type ArticleStatus =
  | "draft"
  | "under-review"
  | "published"
  | "archived";

export type UserRole =
  | "admin"
  | "editor"
  | "author"
  | "contributor";

// ----- الوسائط (جاهز للتوسع) -----
export type MediaType =
  | "image"
  | "thumbnail"
  | "cover"
  | "avatar"
  | "pdf"
  | "audio"
  | "video"
  | "youtube"
  | "external";

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  alt?: string;
  caption?: string;
  mimeType?: string;
  size?: number;        // bytes
  width?: number;
  height?: number;
  duration?: number;    // seconds for audio/video
  youtubeId?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

// ----- روابط التواصل الاجتماعي -----
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  twitter?: string;   // X
  telegram?: string;
  youtube?: string;
  email?: string;
  phone?: string;
  website?: string;
}

// ----- SEO + GEO (جاهز للتوسع) -----
export interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface GeoMeta {
  region?: string;
  city?: string;
  country?: string;
  countryCode?: string;    // ISO 3166-1
  lat?: number;
  lng?: number;
  geoTag?: string;
}

// ----- المستخدم / المؤلف -----
export interface Author {
  id: string;
  name: string;
  slug?: string;
  avatar?: string;
  bio: string;
  role?: string;
  userRole?: UserRole;
  social?: SocialLinks;
  articlesCount?: number;
  joinedAt?: string;
  isVerified?: boolean;
  // جاهز للربط مع Supabase auth
  supabaseId?: string;
}

// ----- القسم (جاهز للإدارة الديناميكية) -----
export interface Section {
  id: string;
  slug: ArticleCategory | string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  seo?: SEOMeta;
}

// ----- الوسم -----
export interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// ----- المقال -----
export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  thumbnail?: string;
  category: ArticleCategory;
  section?: Section;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  featured?: boolean;
  quote?: string;
  tags?: string[];
  status?: ArticleStatus;
  viewCount?: number;
  seo?: SEOMeta;
  geo?: GeoMeta;
  media?: MediaItem[];
  // جاهز للربط مع Supabase
  supabaseId?: string;
}

// ----- القضية -----
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status?: CaseStatus;
}

export interface Case {
  id: string;
  slug: string;
  title: string;
  region: string;
  type: CaseType;
  status: CaseStatus;
  urgencyLevel: 1 | 2 | 3;
  description: string;
  fullDescription?: string;
  lastUpdated: string;
  publishedAt: string;
  timeline?: TimelineEvent[];
  coverImage?: string;
  geo?: GeoMeta;
  seo?: SEOMeta;
  assignedEditor?: string;
  supabaseId?: string;
}

// ----- الإحصائيات -----
export interface Stats {
  stories: number;
  cases: number;
  articles: number;
  regions: number;
}

// ----- نماذج الإرسال -----
export interface StorySubmission {
  name?: string;
  isAnonymous: boolean;
  phone?: string;
  region: string;
  storyType: string;
  details: string;
  allowPublish: boolean;
  files?: File[];
}

export interface ArticleSubmission {
  fullName: string;
  email: string;
  whatsapp?: string;
  authorBio: string;
  authorPhoto?: File;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  coverImage?: File;
  social?: SocialLinks;
  publishWithName: boolean;
}

export interface CaseReport {
  caseType: string;
  region: string;
  urgencyLevel: "low" | "medium" | "high";
  description: string;
  contactInfo?: string;
  files?: File[];
}

// ----- لوحة الإدارة (هياكل جاهزة) -----
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  supabaseId?: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  totalAuthors: number;
  totalStorySubmissions: number;
  pendingSubmissions: number;
  totalViews: number;
}

// ----- التنقل -----
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
  isExternal?: boolean;
}
