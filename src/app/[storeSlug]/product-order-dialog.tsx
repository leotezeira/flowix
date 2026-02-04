'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product, CartItem } from './StoreClient';
import { Minus, Plus } from 'lucide-react';

interface ProductOrderDialogProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddToCart: (item: CartItem) => void;
}

export function ProductOrderDialog({ product, isOpen, onOpenChange, onAddToCart }: ProductOrderDialogProps) {
  const [quantity, setQuantity] = useState(1);

  const formSchema = useMemo(() => {
    return z.object(
      (product.variants || []).reduce((acc, variant) => {
        acc[variant.name] = z.string().min(1, `Debes seleccionar una opción para ${variant.name}`);
        return acc;
      }, {} as Record<string, z.ZodString>)
    );
  }, [product.variants]);
  
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(data: FormValues) {
    const cartItem: CartItem = {
      product,
      quantity,
      selectedVariants: data,
      totalPrice: product.price * quantity,
    };
    onAddToCart(cartItem);
    form.reset();
    setQuantity(1);
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if(!open) { form.reset(); setQuantity(1); }}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {product.imageUrl && (
            <div className="relative -mx-6 -mt-6 mb-4 h-48">
              <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover rounded-t-lg" />
            </div>
          )}
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          {product.description && <DialogDescription>{product.description}</DialogDescription>}
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                    {product.variants.map((variant) => (
                    <Controller
                        key={variant.name}
                        name={variant.name as any}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div>
                                <Label htmlFor={`variant-${product.id}-${variant.name}`} className="text-sm font-medium">{variant.name}</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id={`variant-${product.id}-${variant.name}`} className="mt-1">
                                        <SelectValue placeholder={`Seleccionar ${variant.name}...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {variant.options.map(option => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <p className="text-sm font-medium text-destructive mt-1">{fieldState.error.message}</p>}
                            </div>
                        )}
                    />
                    ))}
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <Label>Cantidad</Label>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                     <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <DialogFooter>
                <Button type="submit" className="w-full" size="lg">
                    Agregar al pedido por ${ (product.price * quantity).toFixed(2) }
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
