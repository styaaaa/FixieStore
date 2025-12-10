  import { useEffect } from "react";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import {
    fetchOrdersByUser,
    mapOrderRowToOrder,
  } from "@/lib/repositories/orderRepository";
  import { supabase } from "@/lib/supabaseClient";
  import type { Order } from "@/types/order";

  export const useUserOrders = (userId?: string) => {
    const queryClient = useQueryClient();

    const query = useQuery<Order[]>({
      queryKey: ["orders", userId],
      queryFn: () => fetchOrdersByUser(userId!), // Memanggil fetchOrdersByUser yang sudah diperbarui
      enabled: Boolean(userId),
      staleTime: 1000 * 60,
    });

    // Listen to changes on orders for the specific user
    useEffect(() => {
      if (!userId) return undefined;

      const channel = supabase
        .channel(`orders-user-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            queryClient.setQueryData<Order[]>(["orders", userId], (current = []) => {
              const nextOrder = mapOrderRowToOrder(
                (payload.new ?? payload.old) as any
              );

              if (payload.eventType === "INSERT") {
                return [nextOrder, ...current];
              }

              if (payload.eventType === "UPDATE") {
                return current.map((order) =>
                  order.id === nextOrder.id ? nextOrder : order
                );
              }

              if (payload.eventType === "DELETE") {
                return current.filter((order) => order.id !== nextOrder.id);
              }

              return current;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [queryClient, userId]);

    return query;
  };
