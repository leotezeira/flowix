/**
 * Sistema de variantes de productos
 * Soporta variantes obligatorias (radio) y opcionales (checkbox)
 */

/** Opción individual dentro de un grupo de variantes */
export interface VariantOption {
  id: string;
  label: string;
  priceModifier?: number; // Suma al precio base
}

/** Grupo de variantes (ej: "Talle", "Color") */
export interface VariantGroup {
  id: string;
  name: string;
  type: 'required' | 'optional';
  options: VariantOption[];
  description?: string;
}

/** Selección del usuario para una opción */
export interface SelectedVariantOption {
  groupId: string;
  optionId: string;
}

/** Estado completo de variantes seleccionadas - mapeo de groupId -> array de optionIds */
export type VariantSelection = Record<string, string[]>;

/** Producto con variantes */
export interface ProductWithVariants {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  image?: string;
  variants: VariantGroup[];
}
