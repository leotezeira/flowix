'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProductSearch } from '@/hooks/use-product-search';

interface ProductSearchProps<T = any> {
    storeId: string;
    onProductSelect: (product: T) => void;
    className?: string;
}

/**
 * Componente de búsqueda de productos optimizado para mobile con Firestore
 * - Sticky search bar
 * - Debounce de 300ms
 * - Case-insensitive usando name_lower
 * - Grid 2 columnas en mobile
 * - Tap targets grandes (min 48px)
 */
export function ProductSearch<T extends { id: string; name: string; price?: number; basePrice?: number; imageUrl?: string; stock?: number }>({ 
    storeId, 
    onProductSelect, 
    className = '' 
}: ProductSearchProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const { products, isLoading, error } = useProductSearch(searchQuery, { storeId });

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const isSearching = searchQuery.length >= 2;
    const hasResults = products.length > 0;

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Barra de búsqueda sticky */}
            <div className="bg-background border rounded-lg px-4 py-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-10 pr-10 text-base"
                        autoComplete="off"
                        enterKeyHint="search"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-transparent"
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    )}
                </div>
                
                {/* Contador de resultados */}
                {isSearching && !isLoading && (
                    <p className="text-xs text-muted-foreground mt-2">
                        {hasResults 
                            ? `${products.length} ${products.length === 1 ? 'resultado' : 'resultados'}`
                            : 'No se encontraron productos'
                        }
                    </p>
                )}

                {/* Estado de carga */}
                {isLoading && isSearching && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Buscando...
                    </p>
                )}
            </div>

            {/* Resultados */}
            {isSearching && (
                <div className="mt-4">
                    {error ? (
                        // Error
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm text-red-500">Error al buscar productos</p>
                        </div>
                    ) : !hasResults && !isLoading ? (
                        // Sin resultados
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <h3 className="text-base font-semibold mb-1">
                                No se encontraron productos
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Intenta con otros términos de búsqueda
                            </p>
                        </div>
                    ) : hasResults ? (
                        // Grid de productos (2 columnas en mobile)
                        <div className="grid grid-cols-2 gap-3">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => onProductSelect(product as T)}
                                    className="flex flex-col bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary active:scale-[0.98]"
                                    disabled={(product.stock ?? 0) <= 0}
                                >
                                    {/* Imagen del producto */}
                                    <div className="relative w-full aspect-square bg-muted rounded-t-lg overflow-hidden">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-muted-foreground text-xs">Sin imagen</span>
                                            </div>
                                        )}
                                        
                                        {/* Badge de sin stock */}
                                        {(product.stock ?? 0) <= 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold px-2 py-1 bg-red-500 rounded">
                                                    Sin stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info del producto */}
                                    <div className="p-3 flex flex-col gap-1">
                                        <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                                            {product.name}
                                        </h3>
                                        <p className="text-base font-bold text-primary">
                                            ${(product.basePrice || product.price).toFixed(2)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
