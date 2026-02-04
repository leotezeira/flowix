import { FirebaseClientProvider } from '@/firebase/client-provider';
import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </FirebaseClientProvider>
  );
}
