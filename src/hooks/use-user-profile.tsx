'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string;
  role?: string;
  isActive?: boolean;
  isHidden?: boolean;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !firestore) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (!active) return;
        const data = snap.data() || {};
        setProfile({
          uid: user.uid,
          email: user.email,
          displayName: data.displayName || data.name,
          role: data.role,
          isActive: data.isActive !== false,
          isHidden: data.isHidden === true,
        });
      } catch (error) {
        console.error('Failed to load user profile', error);
        if (active) {
          setProfile({
            uid: user.uid,
            email: user.email,
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [user, isUserLoading, firestore]);

  return { profile, isLoading };
}
