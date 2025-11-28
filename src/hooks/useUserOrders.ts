import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByUser } from "@/lib/repositories/orderRepository";
import type { Order } from "@/types/order";

export const useUserOrders = (userId?: string) =>
  useQuery<Order[]>({
    queryKey: ["orders", userId],
    queryFn: () => fetchOrdersByUser(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
