'use client';

import { ProductWithVariants, VariantSelection } from '@/types/variants';
import { Button } from '@/components/ui/button';

interface HorizontalVariantSelectorProps {
  product: ProductWithVariants;
  selectedVariants: VariantSelection;
  onVariantChange: (variants: VariantSelection) => void;
}

/**
 * Selector de variantes horizontal para bundles
 * Muestra opciones en línea con botones pequeños
 */
export function HorizontalVariantSelector({
  product,
  selectedVariants,
  onVariantChange,
}: HorizontalVariantSelectorProps) {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const handleToggleOption = (groupId: string, optionId: string, isRequired: boolean) => {
    const currentSelection = selectedVariants[groupId] || [];

    if (isRequired) {
      // Para obligatorios, siempre una sola selección
      onVariantChange({
        ...selectedVariants,
        [groupId]: [optionId],
      });
    } else {
      // Para opcionales, toggle
      if (currentSelection.includes(optionId)) {
        onVariantChange({
          ...selectedVariants,
          [groupId]: currentSelection.filter((id) => id !== optionId),
        });
      } else {
        onVariantChange({
          ...selectedVariants,
          [groupId]: [...currentSelection, optionId],
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      {product.variants.map((group) => {
        const selectedInGroup = selectedVariants[group.id] || [];
        const isRequired = group.type === 'required';

        return (
          <div key={group.id} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-fit whitespace-nowrap">
              {group.name}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const isSelected = selectedInGroup.includes(option.id);

                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 px-2 py-1 text-xs whitespace-nowrap"
                    onClick={() => handleToggleOption(group.id, option.id, isRequired)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
