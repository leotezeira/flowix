'use client';
import { useState, useMemo } from 'react';
import { collection } from "firebase/firestore";
import { useFirestore, useCollection } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CartSheet } from './cart-sheet';
import Image from 'next/image';
import type { VariantGroup, VariantSelection } from '@/types/variants';
import { SimpleVariantSelector } from '@/components/products/simplified-selector';

export type Store = {
    id: string;
    name: string;
    slug: string;
    phone: string;
    bannerUrl?: string;
    deliveryEnabled?: boolean;
    deliveryFee?: number;
    subscription?: {
        status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'expired';
        trialEndsAt?: any;
    };
}

export type Category = {
    id: string;
    name: string;
    imageUrl?: string;
    order?: number;
}

export type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
        basePrice?: number;
    stock?: number;
    order?: number;
        variants?: VariantGroup[];
}

export type CartItem = {
  product: Product;
  quantity: number;
    selectedVariants?: VariantSelection;
  totalPrice: number;
}

export default function StoreClient({ initialStore }: { initialStore?: Store }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [store, setStore] = useState<Store | null>(initialStore ?? null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showVariantSelector, setShowVariantSelector] = useState(false);
    const [variantSelectorPending, setVariantSelectorPending] = useState<{ product: Product; quantity: number } | null>(null);

    // `initialStore` is provided by the server page; client fetch is not needed here.
    
    const categoriesQuery = useMemo(() => {
        if (!firestore || !store?.id) return null;
        return collection(firestore, 'stores', store.id, 'categories');
    }, [firestore, store?.id]);
    const { data: categories, isLoading: loadingCategories } = useCollection<Category>(categoriesQuery);
    
    const productsQuery = useMemo(() => {
        if (!firestore || !store?.id) return null;
        return collection(firestore, 'stores', store.id, 'products');
    }, [firestore, store?.id]);
    const { data: products, isLoading: loadingProducts } = useCollection<Product>(productsQuery);

    const sortedCategories = useMemo(() => {
        if (!categories) return [];
        return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [categories]);

    const productsByCategory = useMemo(() => {
        if (!products || !sortedCategories) return {};
        return sortedCategories.reduce((acc, category) => {
            acc[category.id] = [...products.filter(p => p.categoryId === category.id)].sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0)
            );
            return acc;
        }, {} as Record<string, Product[]>);
    }, [products, sortedCategories]);

    const handleAddToCart = (item: CartItem) => {
        setCart(currentCart => {
             const existingItemIndex = currentCart.findIndex(
                cartItem =>
                cartItem.product.id === item.product.id &&
                JSON.stringify(cartItem.selectedVariants) === JSON.stringify(item.selectedVariants)
            );

            if (existingItemIndex > -1) {
                const newCart = [...currentCart];
                newCart[existingItemIndex].quantity += item.quantity;
                newCart[existingItemIndex].totalPrice += item.totalPrice;
                return newCart;
            } else {
                return [...currentCart, item];
            }
        });
        // no-op
        setShowVariantSelector(false);
        toast({ title: "Producto agregado", description: `${item.product.name} fue añadido a tu pedido.` });
    };

    const handleSelectProduct = (product: Product) => {
        if (product.variants && product.variants.length > 0) {
            setVariantSelectorPending({ product, quantity: 1 });
            setShowVariantSelector(true);
        } else {
            handleAddToCart({
                product,
                quantity: 1,
                selectedVariants: {},
                totalPrice: product.price || product.basePrice || 0,
            });
        }
    };

    const handleVariantSelection = (selections: VariantSelection) => {
        if (!variantSelectorPending) return;

        let totalPrice = variantSelectorPending.product.price || variantSelectorPending.product.basePrice || 0;
        for (const [groupId, optionIds] of Object.entries(selections)) {
            const group = variantSelectorPending.product.variants?.find((g) => g.id === groupId);
            if (group) {
                for (const optionId of optionIds) {
                    const option = group.options.find((o) => o.id === optionId);
                    if (option?.priceModifier) {
                        totalPrice += option.priceModifier;
                    }
                }
            }
        }

        handleAddToCart({
            product: variantSelectorPending.product,
            quantity: variantSelectorPending.quantity,
            selectedVariants: selections,
            totalPrice,
        });

        setVariantSelectorPending(null);
    };

     const handleCartChange = (newCart: CartItem[]) => {
        setCart(newCart);
    };

    const cartItemCount = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);


    if (!store) {
        return <div className="flex h-screen items-center justify-center">Tienda no encontrada.</div>;
    }

    const resolveMillis = (value: any) => {
        if (!value) return undefined;
        if (typeof value === 'number') return value;
        if (typeof value?.toMillis === 'function') return value.toMillis();
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const trialEndsAt = resolveMillis(store.subscription?.trialEndsAt);
    const isSubscriptionActive =
        store.subscription?.status === 'active' ||
        (store.subscription?.status === 'trialing' && trialEndsAt && Date.now() < trialEndsAt) ||
        (!store.subscription && true);

    if (!isSubscriptionActive) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
                <h1 className="text-2xl font-bold">Tienda no disponible por el momento</h1>
                <p className="text-muted-foreground">La suscripción de esta tienda venció.</p>
            </div>
        );
    }

    const isLoadingMenu = loadingCategories || loadingProducts;

    return (
        <div className="bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{store.name}</h1>
                    <Button variant="outline" className="relative" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Ver Pedido</span>
                         {cartItemCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                {cartItemCount}
                            </span>
                        )}
                    </Button>
                </div>
            </header>

            <main className="container mx-auto py-8">
                 {store.bannerUrl && (
                    <div className="relative mb-12 w-full overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: '851 / 315' }}>
                        <Image
                            src={store.bannerUrl}
                            alt={`Banner de ${store.name}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}
                 <div className="mb-12 text-center">
                    <p className="mt-4 text-xl text-muted-foreground">¡Bienvenido a nuestra tienda!</p>
                </div>

                {isLoadingMenu ? (
                     <div className="text-center">Cargando menú...</div>
                ) : sortedCategories && sortedCategories.length > 0 ? (
                    <div className="space-y-12">
                        {sortedCategories.map(category => (
                            (productsByCategory[category.id] && productsByCategory[category.id].length > 0) && (
                                <section key={category.id}>
                                    <h2 className="text-3xl font-bold mb-6">{category.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {productsByCategory[category.id].map(product => (
                                            <Card key={product.id} className={`flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg ${((product.stock ?? 0) <= 0) ? 'opacity-70' : ''}`}>
                                                {product.imageUrl && (
                                                    <div className="relative aspect-video w-full">
                                                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col flex-grow p-6">
                                                    <CardHeader className="p-0">
                                                        <CardTitle>{product.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0 pt-2 flex-grow">
                                                        {product.description && <p className="text-muted-foreground mb-4 text-sm">{product.description}</p>}
                                                    </CardContent>
                                                    <CardFooter className="p-0 pt-4 flex items-center justify-between">
                                                        <p className="text-xl font-semibold">${(product.basePrice || product.price).toFixed(2)}</p>
                                                        <Button
                                                            disabled={(product.stock ?? 0) <= 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectProduct(product);
                                                            }}
                                                        >
                                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                                            {(product.stock ?? 0) <= 0 ? 'Sin stock' : 'Agregar'}
                                                        </Button>
                                                    </CardFooter>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground mt-16">
                        <p>Esta tienda aún no tiene productos cargados.</p>
                        <p>¡Vuelve pronto!</p>
                    </div>
                )}
            </main>

            {store && (
                <CartSheet
                    cart={cart}
                    store={store}
                    isOpen={isCartOpen}
                    onOpenChange={setIsCartOpen}
                    onCartChange={handleCartChange}
                />
            )}

            {variantSelectorPending && (
                <SimpleVariantSelector
                    product={variantSelectorPending.product as any}
                    open={showVariantSelector}
                    onOpenChange={setShowVariantSelector}
                    onConfirm={handleVariantSelection}
                />
            )}
        </div>
    );
}
