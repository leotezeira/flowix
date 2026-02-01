'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useFirestore, useCollection } from '@/firebase';
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductOrderDialog } from './product-order-dialog';
import { CartSheet } from './cart-sheet';
import Image from 'next/image';

export type Store = {
    id: string;
    name: string;
    slug: string;
    phone: string;
    bannerUrl?: string;
}

export type Category = {
    id: string;
    name: string;
    imageUrl?: string;
}

export type ProductVariant = {
  name: string;
  options: string[];
}

export type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    variants?: ProductVariant[];
}

export type CartItem = {
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

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

    const productsByCategory = useMemo(() => {
        if (!products || !categories) return {};
        return categories.reduce((acc, category) => {
            acc[category.id] = products.filter(p => p.categoryId === category.id);
            return acc;
        }, {} as Record<string, Product[]>);
    }, [products, categories]);

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
        setSelectedProduct(null); // Close dialog on add
        toast({ title: "Producto agregado", description: `${item.product.name} fue añadido a tu pedido.` });
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
                ) : categories && categories.length > 0 ? (
                    <div className="space-y-12">
                        {categories.map(category => (
                            (productsByCategory[category.id] && productsByCategory[category.id].length > 0) && (
                                <section key={category.id}>
                                    <h2 className="text-3xl font-bold mb-6">{category.name}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {productsByCategory[category.id].map(product => (
                                            <Card key={product.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg cursor-pointer" onClick={() => setSelectedProduct(product)}>
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
                                                        <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
                                                        <Button>
                                                            Agregar
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

            {selectedProduct && (
                <ProductOrderDialog 
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onOpenChange={(open) => !open && setSelectedProduct(null)}
                    onAddToCart={handleAddToCart}
                />
            )}

            {store && (
                <CartSheet
                    cart={cart}
                    store={store}
                    isOpen={isCartOpen}
                    onOpenChange={setIsCartOpen}
                    onCartChange={handleCartChange}
                />
            )}
        </div>
    );
}
