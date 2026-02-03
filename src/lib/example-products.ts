/**
 * Ejemplos de productos con variantes para testing
 */

import { ProductWithVariants } from '@/types/variants';

export const EXAMPLE_PRODUCTS: ProductWithVariants[] = [
  {
    id: 'pizza-classic',
    name: 'Pizza Clásica',
    description: 'Nuestra pizza tradicional con salsa de tomate y queso mozzarella',
    basePrice: 15.99,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
    variants: [
      {
        id: 'size-group',
        name: 'Tamaño',
        type: 'required',
        description: 'Selecciona el tamaño de tu pizza',
        options: [
          { id: 'small', label: 'Pequeña (8")', priceModifier: 0 },
          { id: 'medium', label: 'Mediana (10")', priceModifier: 3.0 },
          { id: 'large', label: 'Grande (12")', priceModifier: 5.0 },
          { id: 'xlarge', label: 'Extra Large (14")', priceModifier: 8.0 },
        ],
      },
      {
        id: 'crust-group',
        name: 'Tipo de masa',
        type: 'required',
        description: 'Elige tu tipo de masa preferido',
        options: [
          { id: 'thin', label: 'Masa fina', priceModifier: 0 },
          { id: 'regular', label: 'Masa normal', priceModifier: 0 },
          { id: 'thick', label: 'Masa gruesa', priceModifier: 2.0 },
          { id: 'stuffed', label: 'Masa rellena de queso', priceModifier: 4.0 },
        ],
      },
      {
        id: 'extras-group',
        name: 'Extras',
        type: 'optional',
        description: 'Agrega extras a tu pizza',
        options: [
          { id: 'extra-cheese', label: 'Queso extra', priceModifier: 2.0 },
          { id: 'bacon', label: 'Bacon', priceModifier: 2.5 },
          { id: 'pepperoni', label: 'Pepperoni', priceModifier: 2.5 },
          { id: 'mushrooms', label: 'Champiñones', priceModifier: 1.5 },
          { id: 'onions', label: 'Cebolla caramelizada', priceModifier: 1.0 },
        ],
      },
      {
        id: 'sauce-group',
        name: 'Salsa adicional',
        type: 'optional',
        description: 'Agrega una salsa para acompañar (sin costo)',
        options: [
          { id: 'garlic', label: 'Ajo y aceite', priceModifier: 0 },
          { id: 'ranch', label: 'Ranch', priceModifier: 0 },
          { id: 'bbq', label: 'BBQ', priceModifier: 0 },
          { id: 'hot', label: 'Picante', priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: 'burger-deluxe',
    name: 'Burger Deluxe',
    description: 'Hamburguesa premium con carnes de calidad y salsas gourmet',
    basePrice: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    variants: [
      {
        id: 'meat-group',
        name: 'Tipo de carne',
        type: 'required',
        description: 'Elige tu tipo de carne',
        options: [
          { id: 'beef', label: 'Carne vacuna (150g)', priceModifier: 0 },
          { id: 'chicken', label: 'Pollo (150g)', priceModifier: -1.0 },
          { id: 'double', label: 'Doble carne (300g)', priceModifier: 4.0 },
          { id: 'veggie', label: 'Hamburguesa vegetariana', priceModifier: -0.5 },
        ],
      },
      {
        id: 'cooking-group',
        name: 'Cocción',
        type: 'required',
        options: [
          { id: 'rare', label: 'Rojo' },
          { id: 'medium-rare', label: 'Tres cuartos' },
          { id: 'medium', label: 'Medio' },
          { id: 'well-done', label: 'Bien cocida' },
        ],
      },
      {
        id: 'toppings-group',
        name: 'Toppings',
        type: 'optional',
        description: 'Agrega tus toppings favoritos',
        options: [
          { id: 'bacon-topping', label: 'Bacon crujiente', priceModifier: 1.5 },
          { id: 'cheese-slice', label: 'Queso extra', priceModifier: 1.0 },
          { id: 'fried-egg', label: 'Huevo frito', priceModifier: 1.0 },
          { id: 'avocado', label: 'Aguacate', priceModifier: 2.0 },
          { id: 'onion-rings', label: 'Aros de cebolla', priceModifier: 1.5 },
          { id: 'caramelized', label: 'Cebolla caramelizada', priceModifier: 0.5 },
        ],
      },
      {
        id: 'sauce-burger-group',
        name: 'Salsas',
        type: 'optional',
        description: 'Elige tus salsas',
        options: [
          { id: 'mayo', label: 'Mayonesa', priceModifier: 0 },
          { id: 'ketchup', label: 'Ketchup', priceModifier: 0 },
          { id: 'mustard', label: 'Mostaza Dijon', priceModifier: 0 },
          { id: 'sriracha', label: 'Sriracha', priceModifier: 0 },
        ],
      },
    ],
  },
];
