import StorePage from '../../[storeSlug]/page';

export default function StorePageWrapper() {
  // This is a server component that simply renders the client Store page
  // so /store/<slug> behaves the same as /<slug>.
  return <StorePage />;
}
