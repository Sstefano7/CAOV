// ============================================================
// CAOV — TypeScript Types
// ============================================================

export type Role = 'admin' | 'socio' | 'jugador' | 'user_basico';
export type MemberStatus = 'al_dia' | 'moroso' | 'no_socio' | 'pendiente';
export type PaymentMethod = 'mercadopago' | 'transferencia' | 'efectivo';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type Location = 'local' | 'visitante';
export type SponsorTier = 'principal' | 'oficial' | 'colaborador';
export type ProductCategory = 'camisetas' | 'shorts' | 'accesorios' | 'otros';
export type SubscriptionPlan = 'cuota_individual' | 'grupo_familiar' | 'jugador';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  dni?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  role: Role;
  member_status: MemberStatus;
  member_number?: number;
  created_at: string;
}

export interface Discipline {
  id: string;
  name: string;
  category: string;
  icon_url?: string;
  is_active: boolean;
  schedules?: string;
  created_at: string;
}

export interface Player {
  id: string;
  profile_id?: string;
  discipline_id: string;
  discipline?: Discipline;
  position: string;
  shirt_number?: number;
  photo_url?: string;
  full_name: string;
  stats_summary?: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
}

export interface TechnicalStaff {
  id: string;
  discipline_id: string;
  discipline?: Discipline;
  full_name: string;
  role: string;
  photo_url?: string;
  bio?: string;
  is_archived: boolean;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  category: string;
  is_published: boolean;
  author_id?: string;
  author?: Profile;
  published_at?: string;
  created_at: string;
}

export interface Match {
  id: string;
  discipline_id: string;
  discipline?: Discipline;
  opponent_name: string;
  opponent_logo_url?: string;
  match_date: string;
  location: Location;
  venue_name?: string;
  result: string;
  is_featured: boolean;
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  tier: SponsorTier;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: ProductCategory;
  whatsapp_link?: string;
  is_available: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title?: string;
  image_url: string;
  event_name?: string;
  discipline_id?: string;
  discipline?: Discipline;
  uploaded_by?: string;
  created_at: string;
}

export interface PalmaresEntry {
  id: string;
  discipline_id?: string;
  discipline?: Discipline;
  title: string;
  competition: string;
  year: number;
  image_url?: string;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  profile_id: string;
  profile?: Profile;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  period_month: number;
  period_year: number;
  mp_payment_id?: string;
  receipt_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  mp_subscription_id?: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  next_billing_date?: string;
  created_at: string;
}
