'use client';

import { useState } from 'react';
import { ProductWithVariants, VariantSelection } from '@/types/variants';
import { RequiredVariantGroup } from './required-variant-group';
import { OptionalVariantGroup } from './optional-variant-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimpleVariantSelectorProps {
  product: ProductWithVariants;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selections: VariantSelection) => void;
}

/**
 * Selector simplificado de variantes en modal/dialog
 * Se abre cuando el cliente aprieta "Agregar al carrito"
 * Solo muestra los grupos de variantes relevantes
 */
export function SimpleVariantSelector({
  product,
  open,
  onOpenChange,
  onConfirm,
}: SimpleVariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<VariantSelection>({});

  // Validar que todas las variantes obligatorias están seleccionadas
  const isValid = () => {
    for (const group of product.variants) {
      if (group.type === 'required') {
        const selected = selectedVariants[group.id];
        if (!selected || selected.length === 0) {
          return false;
        }
      }
    }
    return true;
  };

  // Calcular precio total con modificadores
  const calculatePrice = () => {
    let total = product.basePrice || 0;
    for (const [groupId, optionIds] of Object.entries(selectedVariants)) {
      const group = product.variants.find((g) => g.id === groupId);
      if (group) {
        for (const optionId of optionIds) {
          const option = group.options.find((o) => o.id === optionId);
          if (option && option.priceModifier) {
            total += option.priceModifier;
          }
        }
      }
    }
    return total;
  };

  // Manejar confirmación
  const handleConfirm = () => {
    if (!isValid()) {
      alert('Completa todas las variantes obligatorias');
      return;
    }

    onConfirm(selectedVariants);
    onOpenChange(false);
    setSelectedVariants({});
  };

  // Si no hay variantes, confirmar directamente
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar {product.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-auto max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {product.variants.map((group) =>
              group.type === 'required' ? (
                <RequiredVariantGroup
                  key={group.id}
                  group={group}
                  selectedOptionId={selectedVariants[group.id]?.[0]}
                  onSelect={(optionId) => {
                    setSelectedVariants({
                      ...selectedVariants,
                      [group.id]: [optionId],
                    });
                  }}
                />
              ) : (
                <OptionalVariantGroup
                  key={group.id}
                  group={group}
                  selectedOptionIds={selectedVariants[group.id] || []}
                  onToggle={(optionIds) => {
                    setSelectedVariants({
                      ...selectedVariants,
                      [group.id]: optionIds,
                    });
                  }}
                />
              )
            )}
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <div className="text-2xl font-bold">
            Total: ${calculatePrice().toFixed(2)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!isValid()}>
              Agregar al carrito
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}