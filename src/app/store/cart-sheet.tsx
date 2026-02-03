'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShoppingCart, Trash2 } from 'lucide-react';
import type { CartItem, Store } from './page';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

interface CartSheetProps {
    cart: CartItem[];
    store: Store | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onCartChange: (newCart: CartItem[]) => void;
}

const checkoutFormSchema = z.object({
  name: z.string().min(1, "Tu nombre es requerido"),
  phone: z.string().min(6, "Tu teléfono es requerido"),
  deliveryMethod: z.enum(["pickup", "delivery"], { required_error: "Debes seleccionar un método."}),
  address: z.string().optional(),
}).refine(data => {
    if (data.deliveryMethod === 'delivery') {
        return !!data.address && data.address.trim().length > 0;
    }
    return true;
}, {
    message: "La dirección es requerida para envíos",
    path: ["address"],
});

export function CartSheet({ cart, store, isOpen, onOpenChange, onCartChange }: CartSheetProps) {
    const firestore = useFirestore();
    const form = useForm<z.infer<typeof checkoutFormSchema>>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: { name: "", deliveryMethod: "pickup", address: "", phone: "" },
    });

    const deliveryMethod = form.watch('deliveryMethod');
    const deliveryAvailable = store?.deliveryEnabled ?? false;
    const deliveryFee = deliveryMethod === 'delivery' ? (store?.deliveryFee || 0) : 0;

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.totalPrice, 0);
    }, [cart]);
    const totalWithDelivery = total + deliveryFee;

    const handleRemoveItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        onCartChange(newCart);
    };

    async function persistOrder(values: z.infer<typeof checkoutFormSchema>) {
        if (!firestore || !store?.id) return;

        const orderItems = cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            variants: item.selectedVariants || {},
        }));

        await addDoc(collection(firestore, 'stores', store.id, 'orders'), {
            createdAt: serverTimestamp(),
            status: 'new',
            customerName: values.name,
            customerPhone: values.phone,
            deliveryMethod: values.deliveryMethod,
            address: values.deliveryMethod === 'delivery' ? values.address || '' : '',
            deliveryFee,
            total: totalWithDelivery,
            items: orderItems,
        });

        const customerId = values.phone.replace(/\D/g, '') || values.phone;
        await setDoc(
            doc(firestore, 'stores', store.id, 'customers', customerId),
            {
                name: values.name,
                phone: values.phone,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    }

    async function onSubmit(values: z.infer<typeof checkoutFormSchema>) {
        if (!store?.phone) return;

        try {
            await persistOrder(values);
        } catch (error) {
            console.error('Error guardando el pedido:', error);
        }

        let orderSummary = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
        cart.forEach(item => {
            orderSummary += `*${item.quantity}x ${item.product.name}* - $${item.totalPrice.toFixed(2)}\n`;
            Object.entries(item.selectedVariants || {}).forEach(([variant, options]) => {
                const optionList = Array.isArray(options) ? options : [options];
                optionList.forEach((option) => {
                    orderSummary += `  - ${variant}: ${option}\n`;
                });
            });
            orderSummary += '\n';
        });
        if (deliveryFee > 0) {
            orderSummary += `*Envío: $${deliveryFee.toFixed(2)}*\n`;
        }
        orderSummary += `*Total: $${totalWithDelivery.toFixed(2)}*\n\n`;

        orderSummary += "Mis datos:\n";
        orderSummary += `- Nombre: ${values.name}\n`;
        orderSummary += `- Teléfono: ${values.phone}\n`;
        orderSummary += `- Método: ${values.deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Retiro en local'}\n`;
        if (values.deliveryMethod === 'delivery') {
            orderSummary += `- Dirección: ${values.address}\n`;
        }

        const whatsappUrl = `https://wa.me/${store.phone}?text=${encodeURIComponent(orderSummary)}`;
        window.open(whatsappUrl, '_blank');
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-md">
                <SheetHeader className='pr-6'>
                    <SheetTitle>Tu Pedido</SheetTitle>
                    <SheetDescription>
                        Revisá los productos y completá tus datos para finalizar.
                    </SheetDescription>
                </SheetHeader>
                
                {cart.length > 0 ? (
                    <ScrollArea className="flex-grow -mx-6">
                        <div className="px-6 space-y-4">
                            {cart.map((item, index) => (
                                <div key={index} className="flex gap-4 py-2 border-b">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.quantity}x {item.product.name}</p>
                                        <div className="text-sm text-muted-foreground">
                                            {Object.entries(item.selectedVariants || {}).map(([variant, options]) => {
                                                const optionList = Array.isArray(options) ? options : [options];
                                                return optionList.map((option) => (
                                                    <p key={`${variant}-${option}`}>{variant}: {option}</p>
                                                ));
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <p className="font-semibold whitespace-nowrap">$ {item.totalPrice.toFixed(2)}</p>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 mt-4">
                            {deliveryFee > 0 && (
                                <div className="flex justify-between text-sm text-muted-foreground mt-4">
                                    <span>Envío</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg my-4">
                                <span>Total</span>
                                <span>${totalWithDelivery.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                     <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu nombre" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Tu número de teléfono" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Método de Entrega</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="pickup" /></FormControl>
                                                    <FormLabel className="font-normal">Retiro en el local</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="delivery" disabled={!deliveryAvailable} />
                                                    </FormControl>
                                                    <FormLabel className={`font-normal ${!deliveryAvailable ? 'text-muted-foreground' : ''}`}>
                                                        Envío a domicilio
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl><FormMessage /></FormItem>
                                    )} />
                                    {deliveryMethod === 'delivery' && (
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem><FormLabel>Dirección de envío</FormLabel><FormControl><Input placeholder="Tu dirección completa" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}
                                    <SheetFooter className="pt-4 !mt-6 -mx-6 px-6 pb-6 bg-background sticky bottom-0">
                                        <Button type="submit" className="w-full" size="lg">Encargar por WhatsApp</Button>
                                    </SheetFooter>
                                </form>
                            </Form>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="font-semibold">Tu carrito está vacío</p>
                        <p className="text-sm text-muted-foreground">Agregá productos para verlos acá.</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
