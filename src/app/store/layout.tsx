import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
