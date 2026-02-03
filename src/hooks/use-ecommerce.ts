'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { firebaseDb as db } from '@/firebase/client';
import { Category, Product } from '@/types/ecommerce';

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useCategories(): UseFirestoreReturn<Category> {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'categories'),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Category));
        setData(categories);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
}

export function useProductsByCategory(
  categorySlug: string
): UseFirestoreReturn<Product> {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'products'),
          where('category', '==', categorySlug)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setData(products);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug]);

  return { data, loading, error };
}

export function useProductsAll(): UseFirestoreReturn<Product> {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setData(products);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { data, loading, error };
}

export function useCategoryBySlug(slug: string): UseFirestoreReturn<Category> {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'categories'),
          where('slug', '==', slug)
        );
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Category));
        setData(categories);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { data, loading, error };
}
