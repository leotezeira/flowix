'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../client-provider';

type UseUserReturn = {
  user: User | null;
  isLoading: boolean;
};

export const useUser = (): UseUserReturn => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // If auth is not available, we are not loading and there's no user.
      // This can happen if Firebase is not initialized yet.
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun effect if auth instance changes

  return { user, isLoading };
};
