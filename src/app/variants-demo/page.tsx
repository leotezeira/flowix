'use client';

import { useState } from 'react';
import { EXAMPLE_PRODUCTS } from '@/lib/example-products';
import { VariantSelection } from '@/types/variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de demostración del sistema de variantes de productos
 * Muestra ejemplos funcionales de productos con variantes obligatorias y opcionales
 */
export default function VariantsDemo() {
  const { toast } = useToast();
  const [addedItems, setAddedItems] = useState<
    Array<{ product: string; variant: VariantSelection; price: number }>
  >([]);

  const handleAddToCart = (product: string, variant: VariantSelection, totalPrice: number) => {
    setAddedItems((prev) => [...prev, { product, variant, price: totalPrice }]);
    toast({
      title: '✅ Agregado al carrito',
      description: `Producto: ${product} - $${totalPrice.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Sistema de Variantes de Productos</h1>
          <p className="text-muted-foreground">
            Demo completa con variantes obligatorias (radio) y opcionales (checkbox)
          </p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="cart">Carrito ({addedItems.length})</TabsTrigger>
          </TabsList>

          {/* Tab de productos */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid gap-8 md:grid-cols-2">
              {EXAMPLE_PRODUCTS.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold mb-2">Precio base:</p>
                        <p className="text-2xl font-bold text-primary">
                          ${product.basePrice?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Variantes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {product.variants.map((v) => (
                            <li key={v.id}>
                              • {v.name} ({v.type === 'required' ? 'Obligatorio' : 'Opcional'})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de carrito */}
          <TabsContent value="cart">
            {addedItems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecciona un producto y sus variantes para agregarlo
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {addedItems.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.product}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold text-foreground mb-2">
                            Variantes seleccionadas:
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            {Object.keys(item.variant).length === 0 ? (
                              <p>Ninguna variante</p>
                            ) : (
                              Object.entries(item.variant).map(([groupId, optionIds]) => (
                                <div key={groupId}>
                                  <p className="font-medium">{groupId}:</p>
                                  {Array.isArray(optionIds) &&
                                    optionIds.map((optId) => (
                                      <p key={optId} className="pl-4">
                                        • {optId}
                                      </p>
                                    ))}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Documentación */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold">📋 Documentación</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Componentes incluidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>ProductVariantSelector:</strong> Componente principal que maneja toda la
                  lógica
                </p>
                <p>
                  <strong>RequiredVariantGroup:</strong> Grupo con radio buttons para variantes
                  obligatorias
                </p>
                <p>
                  <strong>OptionalVariantGroup:</strong> Grupo con checkboxes para variantes
                  opcionales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✅ Variantes obligatorias con validación</p>
                <p>✅ Variantes opcionales con múltiples selecciones</p>
                <p>✅ Cálculo dinámico de precio</p>
                <p>✅ Mobile-first responsive</p>
                <p>✅ Accordion colapsable</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Cómo usar en tu app</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <pre className="bg-secondary p-3 rounded overflow-auto">
{`import { ProductVariantSelector } from '@/components/products/product-variant-selector';
import { ProductWithVariants, VariantSelection } from '@/types/variants';

// Tu producto con variantes
const product: ProductWithVariants = {
  id: 'prod-1',
  name: 'Tu Producto',
  basePrice: 10.00,
  variants: [
    {
      id: 'group-1',
      name: 'Opciones',
      type: 'required',
      options: [
        { id: 'opt-1', label: 'Opción 1', priceModifier: 0 }
      ]
    }
  ]
};

// Usar en tu componente
<ProductVariantSelector
  product={product}
  onAddToCart={(variant, totalPrice) => {
    console.log('Agregar:', variant, totalPrice);
  }}
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
