'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { BundleSelection, CartItem, Product } from './page';
import { SimpleVariantSelector } from '@/components/products/simplified-selector';
import type { VariantSelection } from '@/types/variants';

interface BundleDetailDialogProps {
  product: Product | null;
  availableProducts: Product[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (item: CartItem) => void;
}

const DEFAULT_ITEM_COUNT = 3;

export function BundleDetailDialog({
  product,
  availableProducts,
  isOpen,
  onOpenChange,
  onAddToCart,
}: BundleDetailDialogProps) {
  const bundleConfig = product?.bundleConfig;
  const itemCount = bundleConfig?.itemCount || DEFAULT_ITEM_COUNT;
  const allowRepeat = bundleConfig?.allowRepeat ?? true;
  const maxPerProduct = bundleConfig?.maxPerProduct ?? itemCount;
  const allowedProductIds = bundleConfig?.productIds || [];

  const eligibleProducts = useMemo(() => {
    const list = availableProducts.filter((p) => (p.type ?? 'simple') === 'simple');
    if (allowedProductIds.length === 0) return list;
    return list.filter((p) => allowedProductIds.includes(p.id));
  }, [availableProducts, allowedProductIds]);

  const [selections, setSelections] = useState<BundleSelection[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelections([]);
      setErrorMessage(null);
      return;
    }
    const initialSelections = Array.from({ length: itemCount }, (_, index) => ({
      slot: index,
      productId: '',
      productName: '',
      variants: {},
    }));
    setSelections(initialSelections);
    setErrorMessage(null);
  }, [isOpen, itemCount]);

  if (!product) return null;

  const selectionCounts = selections.reduce((acc, selection) => {
    if (!selection.productId) return acc;
    acc[selection.productId] = (acc[selection.productId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getProductById = (id: string) => eligibleProducts.find((p) => p.id === id);

  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = getProductById(productId);
    setSelections((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              productId,
              productName: selectedProduct?.name || '',
              variants: {},
            }
          : item
      )
    );
  };

  const handleVariantsChange = (index: number, variants: VariantSelection) => {
    setSelections((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, variants } : item))
    );
  };

  const hasRequiredVariants = (productForSlot: Product | undefined, variants: VariantSelection) => {
    if (!productForSlot?.variants || productForSlot.variants.length === 0) return true;
    return productForSlot.variants.every((group) => {
      if (group.type !== 'required') return true;
      const selected = variants[group.id];
      return Array.isArray(selected) && selected.length > 0;
    });
  };

  const validateBundle = () => {
    if (selections.some((selection) => !selection.productId)) {
      return 'Completa los 3 ítems del pack antes de continuar.';
    }

    if (!allowRepeat) {
      const uniqueIds = new Set(selections.map((selection) => selection.productId));
      if (uniqueIds.size !== selections.length) {
        return 'Este bundle no permite repetir productos.';
      }
    }

    for (const [productId, count] of Object.entries(selectionCounts)) {
      if (count > maxPerProduct) {
        const name = getProductById(productId)?.name || 'Producto';
        return `Máximo ${maxPerProduct} unidades para ${name}.`;
      }
    }

    for (const selection of selections) {
      const productForSlot = getProductById(selection.productId);
      if (!productForSlot) return 'Producto inválido en el pack.';
      if ((productForSlot.stock ?? 0) <= 0) {
        return `El producto ${productForSlot.name} no tiene stock.`;
      }
      if (!hasRequiredVariants(productForSlot, selection.variants)) {
        return `Completa las variantes obligatorias de ${productForSlot.name}.`;
      }
    }

    return null;
  };

  const validationError = validateBundle();
  const isValid = !validationError;

  const handleAddBundle = () => {
    const error = validateBundle();
    if (error) {
      setErrorMessage(error);
      return;
    }

    const cartItem: CartItem = {
      product,
      quantity: 1,
      totalPrice: product.price,
      isBundle: true,
      bundleSelections: selections.map((selection) => ({
        slot: selection.slot,
        productId: selection.productId,
        productName: selection.productName,
        variants: selection.variants,
      })),
    };

    onAddToCart(cartItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Configurá tu pack seleccionando productos y variantes para cada ítem</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Arma tu pack de {itemCount} ítems. Precio fijo: ${product.price.toFixed(2)}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-1">{allowRepeat ? 'Permite repetir' : 'Sin repetición'}</span>
            <span className="rounded-full bg-muted px-2 py-1">Máx {maxPerProduct} por producto</span>
          </div>

          <div className="space-y-4">
            {selections.map((selection, index) => {
              const selectedProduct = getProductById(selection.productId);
              const countForProduct = selection.productId ? selectionCounts[selection.productId] || 0 : 0;

              return (
                <Card key={index} className="p-4 border border-primary/20 bg-primary/5">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Ítem {index + 1}</div>
                    <Select
                      value={selection.productId}
                      onValueChange={(value) => handleProductChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná un producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleProducts.map((option) => {
                          const optionCount = selectionCounts[option.id] || 0;
                          const disabledByRepeat =
                            (!allowRepeat && optionCount > 0 && option.id !== selection.productId) ||
                            (allowRepeat && optionCount >= maxPerProduct && option.id !== selection.productId);
                          const disabledByStock = (option.stock ?? 0) <= 0;

                          return (
                            <SelectItem
                              key={option.id}
                              value={option.id}
                              disabled={disabledByRepeat || disabledByStock}
                            >
                              {option.name} {(option.stock ?? 0) <= 0 ? '• Sin stock' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {selectedProduct ? (
                      <div className="space-y-3">
                        {(selectedProduct.variants?.length ?? 0) > 0 ? (
                          <div className="rounded-md bg-white p-3 border border-muted">
                            <p className="text-sm font-medium text-muted-foreground mb-3">Variantes:</p>
                            <SimpleVariantSelector
                              product={{
                                id: selectedProduct.id,
                                name: selectedProduct.name,
                                basePrice: selectedProduct.basePrice || selectedProduct.price,
                                variants: selectedProduct.variants || [],
                              }}
                              open
                              hideDialog
                              onOpenChange={() => undefined}
                              onConfirm={(variantSelections) => handleVariantsChange(index, variantSelections)}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Este producto no tiene variantes.</p>
                        )}
                        {allowRepeat && countForProduct >= maxPerProduct && (
                          <p className="text-xs text-destructive">Se alcanzó el máximo por producto.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Seleccioná un producto para ver variantes.</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {(errorMessage || validationError) && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{errorMessage || validationError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddBundle} disabled={!isValid}>
            Agregar pack
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
