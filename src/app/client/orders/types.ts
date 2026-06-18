export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceImage?: string;

  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;

  status: OrderStatus;

  totalPrice: number;

  createdAt: string;

  reviewed: boolean;

  actionType?: 'solid' | 'outline' | 'disabled';
  actionLabel?: string;
}