'use client';

export function CategorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-lg h-48 bg-gray-300 animate-pulse" />
      ))}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="w-full h-48 bg-gray-300 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-300 rounded animate-pulse w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-300 rounded-full animate-pulse w-16" />
          <div className="h-6 bg-gray-300 rounded-full animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProductsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
