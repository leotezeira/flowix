'use client';

import dynamic from 'next/dynamic';

// Cargamos el componente de administración que es "use client" de forma dinámica
// y sin SSR para evitar que errores de hooks/cliente se ejecuten en build.
const AdminStorePage = dynamic(() => import('../page'), { ssr: false });

export default function AdminStoreClient() {
    return <AdminStorePage />;
}
