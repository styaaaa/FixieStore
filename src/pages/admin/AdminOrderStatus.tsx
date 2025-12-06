import { RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";

import type { Order, OrderStatus } from "@/types/order";

interface AdminOrderStatusProps {
  orders: Order[];
  ordersLoading: boolean;
  getNextStatus: (status: OrderStatus) => OrderStatus | null;
  renderStatusBadge: (status: OrderStatus) => ReactNode;
  handleAdvanceStatus: (order: Order) => void;
  orderSaving: Record<string, boolean>;
  statusLabels: Record<OrderStatus, string>;
  formatCurrency: (value?: number | null) => string;
}

export function AdminOrderStatus({
  orders,
  ordersLoading,
  getNextStatus,
  renderStatusBadge,
  handleAdvanceStatus,
  orderSaving,
  statusLabels,
  formatCurrency,
}: AdminOrderStatusProps) {
  return (
    <Card className="border border-amber-200/70 bg-white/85 shadow-sm shadow-amber-200/40 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Status Pesanan</CardTitle>
            <CardDescription>Perbarui status pesanan pelanggan</CardDescription>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-inner shadow-amber-100 dark:bg-primary/10">
            <RefreshCcw className="h-4 w-4" />
            {ordersLoading ? "Memuat..." : `${orders.length} pesanan`}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {ordersLoading ? (
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
            <div className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            Belum ada pesanan.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-amber-100/80 shadow-sm dark:border-slate-800">
            <Table className="text-sm">
              <TableHeader className="bg-gradient-to-r from-white to-amber-50/70 text-slate-700 dark:from-slate-900 dark:to-slate-900/80 dark:text-slate-200">
                <TableRow className="text-xs uppercase tracking-wide text-muted-foreground">
                  <TableHead>ID & Tanggal</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <TableRow
                      key={order.id}
                      className="align-middle transition hover:bg-primary/5 dark:hover:bg-slate-800"
                    >
                      <TableCell className="align-middle">
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("id-ID")}
                        </p>
                      </TableCell>

                      <TableCell className="align-middle">
                        <p className="font-medium">
                          {[order.firstName, order.lastName].filter(Boolean).join(" ") || "Nama belum diisi"}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.city || "Kota belum diisi"}</p>
                      </TableCell>

                      <TableCell className="align-middle">{renderStatusBadge(order.status)}</TableCell>

                      <TableCell className="align-middle font-medium">{formatCurrency(order.totalPrice)}</TableCell>

                      <TableCell className="align-middle text-right">
                        {nextStatus ? (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={orderSaving[order.id]}
                          >
                            {orderSaving[order.id]
                              ? "Memperbarui..."
                              : `Ke ${statusLabels[nextStatus]}`}
                          </Button>
                        ) : (
                          <Badge variant="outline">Completed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminOrderStatus;
