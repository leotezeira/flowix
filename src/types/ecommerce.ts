export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string; // references categories.slug
  tags: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
