export type UserRole = 'admin' | 'freelancer' | 'client';
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  nim?: string;
  program_study?: string;
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  freelancer?: Profile;
  category?: Category;
}

export interface Portfolio {
  id: string;
  freelancer_id: string;
  title: string;
  description?: string;
  file_url: string;
  is_verified: boolean;
  created_at: string;
  freelancer?: Profile;
}

export interface Order {
  id: string;
  client_id: string;
  service_id: string;
  price: number;
  status: OrderStatus;
  requirements?: string;
  created_at: string;
  updated_at: string;
  client?: Profile;
  service?: Service;
}

export interface Review {
  id: string;
  order_id: string;
  client_id: string;
  freelancer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  client?: Profile;
  order?: Order;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  service_id?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  created_at: string;
  reporter?: Profile;
  reported_user?: Profile;
  service?: Service;
}
