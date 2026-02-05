'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsManager } from './products-manager';
import { CategoriesManager } from './categories-manager';

interface ProductosContentProps {
  storeId: string;
}

export function ProductosContent({ storeId }: ProductosContentProps) {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-[320px]">
        <TabsTrigger value="products">Productos</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
      </TabsList>
      <TabsContent value="products" className="mt-6">
        <ProductsManager storeId={storeId} />
      </TabsContent>
      <TabsContent value="categories" className="mt-6">
        <CategoriesManager storeId={storeId} />
      </TabsContent>
    </Tabs>
  );
}
