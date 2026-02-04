'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useFirestore, useCollection } from '@/firebase';
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CartSheet } from './cart-sheet';
import type { VariantGroup, VariantSelection } from '@/types/variants';
import { SimpleVariantSelector } from '@/components/products/simplified-selector';
import { ProductDetailDialog } from './product-detail-dialog';

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

export default function StorePage() {
    const firestore = useFirestore();
    const pathname = usePathname();
    const { toast } = useToast();

    const [storeSlug, setStoreSlug] = useState('');
    const [store, setStore] = useState<Store | null>(null);
    const [loadingStore, setLoadingStore] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showVariantSelector, setShowVariantSelector] = useState(false);
    const [variantSelectorPending, setVariantSelectorPending] = useState<{ product: Product; quantity: number } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showProductDetail, setShowProductDetail] = useState(false);

    useEffect(() => {
        if (pathname) {
            const parts = pathname.split('/');
            const slug = parts[parts.length - 1];
            setStoreSlug(slug);
        }
    }, [pathname]);

    useEffect(() => {
        if (!firestore || !storeSlug) return;

        const getStoreData = async () => {
            setLoadingStore(true);
            const storesRef = collection(firestore, "stores");
            const q = query(storesRef, where("slug", "==", storeSlug), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setStore(null);
            } else {
                const storeDoc = querySnapshot.docs[0];
                setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
            }
            setLoadingStore(false);
        };

        getStoreData();
    }, [firestore, storeSlug]);
    
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
        setSelectedProduct(product);
        setShowProductDetail(true);
    };

    const handleVariantSelection = (selections: VariantSelection, priceModifier: number) => {
        if (!variantSelectorPending) return;
        
        const totalPrice = (variantSelectorPending.product.basePrice || variantSelectorPending.product.price) + priceModifier;
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


    if (loadingStore) {
        return <div className="flex h-screen items-center justify-center">Cargando tienda...</div>;
    }

    if (!store) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Tienda no encontrada</h1>
                <p className="text-muted-foreground">No existe una tienda con el slug <strong>{storeSlug}</strong>.</p>
                <p className="text-muted-foreground">Si acabás de crearla, debería aparecer inmediatamente. Si no, comprobá la URL o creá la tienda desde el panel de administración.</p>
            </div>
        );
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
        <div className="flex min-h-[100dvh] flex-col bg-background max-w-[100vw] overflow-x-hidden">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-full max-w-[100vw] items-center justify-between px-4">
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

            <main className="mx-auto w-full max-w-[100vw] flex-1 overflow-y-auto px-4 py-6">
                 {store.bannerUrl && (
                    <div className="relative mb-12 w-full overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: '851 / 315' }}>
                        <img
                            src={store.bannerUrl}
                            alt={`Banner de ${store.name}`}
                            className="w-full h-full object-cover"
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
                                    <div className="flex flex-col gap-3">
                                        {productsByCategory[category.id].map(product => {
                                            const variantTags = (product.variants ?? []).map(variant => variant.name);

                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product)}
                                                    className={`flex min-h-[96px] items-center gap-3 rounded-[10px] bg-white p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${((product.stock ?? 0) <= 0) ? 'opacity-70' : ''}`}
                                                >
                                                    <div className="flex h-24 w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                                                            <h3 className="line-clamp-2 text-sm font-bold uppercase text-foreground">
                                                                {product.name}
                                                            </h3>
                                                            <div className="mt-1 flex items-baseline gap-1">
                                                                <span className="text-[18px] font-bold text-foreground">
                                                                    ${(product.basePrice || product.price).toFixed(2)}
                                                                </span>
                                                                <span className="text-xs font-normal text-muted-foreground">ARS</span>
                                                            </div>
                                                            {(variantTags.length > 0 || (product.stock ?? 0) <= 0) && (
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {variantTags.map(tag => (
                                                                        <span
                                                                            key={tag}
                                                                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                    {(product.stock ?? 0) <= 0 && (
                                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                                                            Sin stock
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

            {selectedProduct && (
                <ProductDetailDialog
                    product={selectedProduct}
                    isOpen={showProductDetail}
                    onOpenChange={setShowProductDetail}
                    onAddToCart={handleAddToCart}
                    storePhone={store?.phone}
                />
            )}
        </div>
    );
}
