import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function StoreSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
