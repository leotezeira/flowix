'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Phone, Printer } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  variants?: Record<string, string[]>;
}

interface Order {
  id: string;
  createdAt?: any;
  status?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  address?: string;
  total?: number;
  items?: OrderItem[];
}

interface PedidosContentProps {
  orders: Order[];
  resolveMillis: (value: any) => number | undefined;
}

export function PedidosContent({ orders, resolveMillis }: PedidosContentProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const sortedOrders = [...orders].sort((a, b) => {
    const aTime = resolveMillis(a.createdAt) || 0;
    const bTime = resolveMillis(b.createdAt) || 0;
    return bTime - aTime;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recibidos</CardTitle>
          <CardDescription>
            {orders.length === 0
              ? 'No has recibido pedidos aún'
              : `Total: ${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">
                        {resolveMillis(order.createdAt)
                          ? new Date(resolveMillis(order.createdAt) || 0).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">{order.customerName || '-'}</TableCell>
                      <TableCell className="font-medium">
                        ${(order.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.status || 'nuevo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs"
                        >
                          Ver
                        </Button>
                        {order.customerPhone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              window.open(`https://wa.me/${order.customerPhone}`, '_blank')
                            }
                            className="text-xs"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay pedidos registrados aún
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Cliente</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.customerName || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customerPhone || '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold">
                    ${(selectedOrder.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-3">
                <p className="font-medium text-sm">Productos:</p>
                {selectedOrder.items?.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between">
                      <span>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 ml-4">
                        {Object.entries(item.variants).map(([variant, options]) => (
                          <div key={variant}>
                            <span className="font-medium">{variant}:</span>{' '}
                            {options.join(', ')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                {selectedOrder.customerPhone && (
                  <Button
                    onClick={() =>
                      window.open(
                        `https://wa.me/${selectedOrder.customerPhone}`,
                        '_blank'
                      )
                    }
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
