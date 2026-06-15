import { useState, useEffect } from "react";
import { Order } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, this would fetch from Supabase
    // e.g., const { data, error } = await supabase.from('orders').select('*');
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulating API call latency
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data based on the design requested
        const mockOrders: Order[] = [
          {
            id: "ord-1",
            serviceId: "srv-1",
            serviceName: "Web App Bug Fix",
            serviceCategory: "Technical Support",
            serviceImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop",
            freelancerId: "free-1",
            freelancerName: "Budi W.",
            freelancerAvatar: "https://i.pravatar.cc/150?u=budi",
            status: "in_progress",
            totalPrice: 250000,
            createdAt: "2026-10-24T10:00:00Z",
            reviewed: false,
          },
          {
            id: "ord-2",
            serviceId: "srv-2",
            serviceName: "Logo Redesign",
            serviceCategory: "Graphic Design",
            serviceImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=100&h=100&fit=crop",
            freelancerId: "free-2",
            freelancerName: "Alex R.",
            freelancerAvatar: "https://i.pravatar.cc/150?u=alex",
            status: "completed",
            totalPrice: 500000,
            createdAt: "2026-10-20T14:30:00Z",
            reviewed: false,
          },
          {
            id: "ord-3",
            serviceId: "srv-3",
            serviceName: "Calculus II Exam Prep",
            serviceCategory: "Tutoring",
            serviceImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop",
            freelancerId: "free-3",
            freelancerName: "Sarah J.",
            freelancerAvatar: "https://i.pravatar.cc/150?u=sarah",
            status: "completed",
            totalPrice: 700000,
            createdAt: "2026-10-15T09:15:00Z",
            reviewed: true,
          },
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "in_progress"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const totalSpent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalPrice, 0);

  return {
    orders,
    loading,
    error,
    activeOrders,
    completedOrders,
    totalSpent,
  };
}
