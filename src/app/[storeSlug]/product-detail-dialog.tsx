'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Send } from 'lucide-react';
import type { Product, CartItem } from './StoreClient';
import { SimpleVariantSelector } from '@/components/products/simplified-selector';
import type { VariantSelection } from '@/types/variants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (item: CartItem) => void;
  storePhone?: string;
}

const directOrderSchema = z.object({
  name: z.string().min(1, 'Tu nombre es requerido'),
  phone: z.string().min(6, 'Tu teléfono es requerido'),
});

type DirectOrderFormValues = z.infer<typeof directOrderSchema>;

export function ProductDetailDialog({
  product,
  isOpen,
  onOpenChange,
  onAddToCart,
  storePhone,
}: ProductDetailDialogProps) {
  const [showDirectOrderForm, setShowDirectOrderForm] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<VariantSelection>({});
  const [variantPrice, setVariantPrice] = useState(0);

  const form = useForm<DirectOrderFormValues>({
    resolver: zodResolver(directOrderSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  if (!product) return null;

  const hasMissingRequiredVariants = () => {
    if (!product.variants || product.variants.length === 0) return false;
    return product.variants.some((group) => {
      if (group.type !== 'required') return false;
      const selected = selectedVariants[group.id];
      return !selected || selected.length === 0;
    });
  };

  const warnMissingVariants = () => {
    alert('Debes elegir las variantes obligatorias');
  };

  const handleAddToCart = () => {
    if (hasMissingRequiredVariants()) {
      warnMissingVariants();
      return;
    }
    const cartItem: CartItem = {
      product,
      quantity: 1,
      selectedVariants,
      totalPrice: (product.basePrice || product.price) + variantPrice,
    };
    onAddToCart(cartItem);
    onOpenChange(false);
    resetDialog();
  };

  const handleDirectOrder = () => {
    if (hasMissingRequiredVariants()) {
      warnMissingVariants();
      return;
    }
    setShowDirectOrderForm(true);
  };

  const handleConfirmDirectOrder = (values: DirectOrderFormValues) => {
    if (!storePhone) return;
    if (hasMissingRequiredVariants()) {
      warnMissingVariants();
      return;
    }

    const basePrice = product.basePrice || product.price;
    const totalPrice = basePrice + variantPrice;

    let orderSummary = `🛒 *Nuevo Pedido*\n\n`;
    orderSummary += `👤 *Cliente:* ${values.name}\n`;
    orderSummary += `📞 *Teléfono:* ${values.phone}\n\n`;
    orderSummary += `📦 *Producto:*\n`;
    orderSummary += `- ${product.name}\n`;
    
    if (product.variants && product.variants.length > 0 && Object.keys(selectedVariants).length > 0) {
      orderSummary += `\n*Variantes:*\n`;
      Object.entries(selectedVariants).forEach(([groupId, optionIds]) => {
        const group = product.variants?.find(v => v.id === groupId);
        if (group && Array.isArray(optionIds)) {
          const selectedOptions = optionIds
            .map(optId => group.options.find(o => o.id === optId)?.label)
            .filter(Boolean);
          orderSummary += `- ${group.name}: ${selectedOptions.join(', ')}\n`;
        }
      });
    }

    orderSummary += `\n💰 *Total:* $${totalPrice.toFixed(2)}`;

    const phoneDigits = String(storePhone).replace(/\D/g, '');
    if (!phoneDigits) return;

    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(orderSummary)}`;
    window.location.assign(whatsappUrl);

    onOpenChange(false);
    resetDialog();
  };

  const resetDialog = () => {
    setShowDirectOrderForm(false);
    setSelectedVariants({});
    setVariantPrice(0);
    form.reset();
  };

  const handleVariantChange = (selections: VariantSelection, price: number) => {
    setSelectedVariants(selections);
    setVariantPrice(price);
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {!showDirectOrderForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl uppercase">{product.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {product.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="mb-2 font-semibold text-sm text-muted-foreground">Descripción</h3>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-semibold text-sm text-muted-foreground">Precio</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ${((product.basePrice || product.price) + variantPrice).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">ARS</span>
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground">Variantes</h3>
                  <SimpleVariantSelector
                    product={product as any}
                    open={true}
                    onOpenChange={() => {}}
                    onConfirm={handleVariantChange}
                    hideDialog={true}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </Button>
              <Button
                onClick={handleDirectOrder}
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Encargar ahora
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Completar pedido</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleConfirmDirectOrder)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 1123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">Resumen del pedido:</p>
                  <p className="text-sm">{product.name}</p>
                  <p className="text-lg font-bold mt-2">
                    Total: ${((product.basePrice || product.price) + variantPrice).toFixed(2)}
                  </p>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDirectOrderForm(false)}
                    className="w-full sm:w-auto"
                  >
                    Volver
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar pedido
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
