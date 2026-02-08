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
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
          <DialogHeader className="no-print">
            <DialogTitle>Detalle del pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <>
              {/* Printable Area */}
              <div id="printable-order" className="space-y-4">
                {/* Print Header */}
                <div className="print-only hidden">
                  <h1 className="text-2xl font-bold mb-2">PEDIDO</h1>
                  <p className="text-sm text-gray-600">
                    Fecha: {resolveMillis(selectedOrder.createdAt)
                      ? new Date(resolveMillis(selectedOrder.createdAt) || 0).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    ID: {selectedOrder.id.substring(0, 8)}
                  </p>
                  <hr className="my-4 border-gray-300" />
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Cliente</p>
                    <p className="text-sm text-muted-foreground mt-1 print:text-gray-700">
                      {selectedOrder.customerName || '-'}
                    </p>
                    <p className="text-sm text-muted-foreground print:text-gray-700">
                      {selectedOrder.customerPhone || '-'}
                    </p>
                    {selectedOrder.deliveryMethod && (
                      <p className="text-sm text-muted-foreground mt-1 print:text-gray-700">
                        <span className="font-medium">Método:</span> {selectedOrder.deliveryMethod}
                      </p>
                    )}
                    {selectedOrder.address && (
                      <p className="text-sm text-muted-foreground print:text-gray-700">
                        <span className="font-medium">Dirección:</span> {selectedOrder.address}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1 print:text-gray-700">Total</p>
                    <p className="text-2xl font-bold print:text-3xl">
                      ${(selectedOrder.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator className="print:border-gray-300" />

                {/* Items */}
                <div className="space-y-3">
                  <p className="font-medium text-sm print:text-base print:font-bold">Productos:</p>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="border-b pb-3 last:border-b-0 print:border-gray-300">
                      <div className="flex justify-between">
                        <span className="print:text-base">
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-medium print:text-base">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 ml-4 print:text-sm print:text-gray-600">
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

                <Separator className="print:border-gray-300 print:border-2" />

                {/* Print Footer */}
                <div className="print-only hidden">
                  <div className="text-right text-lg font-bold mt-4">
                    <p>TOTAL: ${(selectedOrder.total || 0).toFixed(2)}</p>
                  </div>
                  <div className="mt-8 text-center text-sm text-gray-500">
                    <p>¡Gracias por tu compra!</p>
                  </div>
                </div>
              </div>

              {/* Actions - No Print */}
              <div className="flex gap-2 no-print">
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
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Ocultar todo excepto el contenido del pedido */
          body * {
            visibility: hidden;
          }
          
          #printable-order,
          #printable-order * {
            visibility: visible;
          }
          
          #printable-order {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* Mostrar elementos solo para impresión */
          .print-only {
            display: block !important;
          }

          /* Ocultar elementos que no deben imprimirse */
          .no-print {
            display: none !important;
          }

          /* Ajustar estilos para impresión */
          .print\\:text-gray-700 {
            color: #374151 !important;
          }

          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }

          .print\\:text-base {
            font-size: 1rem !important;
          }

          .print\\:text-3xl {
            font-size: 1.875rem !important;
          }

          .print\\:font-bold {
            font-weight: 700 !important;
          }

          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }

          .print\\:border-2 {
            border-width: 2px !important;
          }

          /* Quitar colores de fondo */
          * {
            background: white !important;
            color: black !important;
          }

          /* Mantener bordes visibles */
          .border-b {
            border-bottom: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </>
  );
}
