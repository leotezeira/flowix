/**
 * Formatea un precio en pesos argentinos
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

/**
 * Formatea un precio sin símbolo de moneda
 */
export function formatPriceSimple(price: number): string {
  return price.toLocaleString('es-AR');
}
