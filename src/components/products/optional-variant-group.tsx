'use client';

import { VariantGroup, VariantOption } from '@/types/variants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface OptionalVariantGroupProps {
  group: VariantGroup;
  selectedOptionIds: string[];
  onToggle: (optionIds: string[]) => void;
}

/**
 * Componente para grupo de variantes OPCIONALES
 * Usa checkboxes (múltiples selecciones por grupo)
 */
export function OptionalVariantGroup({
  group,
  selectedOptionIds,
  onToggle,
}: OptionalVariantGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-foreground">{group.name}</h3>
        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
          Opcional
        </span>
      </div>
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      
      <div className="space-y-2">
        {group.options.map((option: VariantOption) => {
          const isSelected = selectedOptionIds.includes(option.id);
          
          return (
            <div 
              key={option.id} 
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => {
                const newIds = isSelected 
                  ? selectedOptionIds.filter(id => id !== option.id)
                  : [...selectedOptionIds, option.id];
                onToggle(newIds);
              }}
            >
              <Checkbox 
                id={`${group.id}-${option.id}`}
                checked={isSelected}
                onCheckedChange={() => {
                  const newIds = isSelected 
                    ? selectedOptionIds.filter(id => id !== option.id)
                    : [...selectedOptionIds, option.id];
                  onToggle(newIds);
                }}
              />
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
          );
        })}
      </div>
    </div>
  );
}
