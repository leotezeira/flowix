'use client';

import { VariantGroup, VariantOption } from '@/types/variants';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RequiredVariantGroupProps {
  group: VariantGroup;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

/**
 * Componente para grupo de variantes OBLIGATORIAS
 * Usa radio buttons (una selección por grupo)
 */
export function RequiredVariantGroup({
  group,
  selectedOptionId,
  onSelect,
}: RequiredVariantGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-foreground">{group.name}</h3>
        <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
          Obligatorio
        </span>
      </div>
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      
      <RadioGroup value={selectedOptionId || ''} onValueChange={(value) => {
        onSelect(value);
      }}>
        <div className="space-y-2">
          {group.options.map((option: VariantOption) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
              <RadioGroupItem value={option.id} id={`${group.id}-${option.id}`} />
              <Label 
                htmlFor={`${group.id}-${option.id}`}
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <span>{option.label}</span>
                {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                  <span className="text-sm font-medium text-primary">
                    +${option.priceModifier.toFixed(2)}
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
