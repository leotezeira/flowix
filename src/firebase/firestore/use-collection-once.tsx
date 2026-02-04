'use client';

import { useEffect, useState } from 'react';
import {
  Query,
  DocumentData,
  FirestoreError,
  getDocs,
  CollectionReference,
} from 'firebase/firestore';

export type WithId<T> = T & { id: string };

export interface UseCollectionOnceResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useCollectionOnce<T = any>(
  memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean }) | null | undefined,
): UseCollectionOnceResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchOnce = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(memoizedTargetRefOrQuery);
        if (!isMounted) return;
        const results: ResultItemType[] = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(results);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('useCollectionOnce error:', err);
        setError(err as FirestoreError);
        setData(null);
        setIsLoading(false);
      }
    };

    fetchOnce();

    return () => {
      isMounted = false;
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
