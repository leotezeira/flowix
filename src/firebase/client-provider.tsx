'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Storage } from 'firebase/storage';

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: Storage;
}

// State for the Firebase context
export interface FirebaseContextState {
    areServicesAvailable: boolean;
    firebaseApp: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
    storage: Storage | null;
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
    const [services, setServices] = useState<FirebaseServices | null>(null);
    const [userAuthState, setUserAuthState] = useState<{user: User | null; isUserLoading: boolean; userError: Error | null;}>({
        user: null,
        isUserLoading: true,
        userError: null,
    });

    useEffect(() => {
        import('@/firebase/init').then(module => {
            setServices(module.initializeFirebase());
        }).catch(err => {
            console.error("Failed to load Firebase module", err);
            setUserAuthState({ user: null, isUserLoading: false, userError: err });
        });
    }, []);

    useEffect(() => {
        if (!services?.auth) {
            if (!services) { // Still loading services
                setUserAuthState({ user: null, isUserLoading: true, userError: null });
            } else { // Services loaded, but auth is missing for some reason
                setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not available.") });
            }
            return;
        }

        const unsubscribe = onAuthStateChanged(
            services.auth,
            (firebaseUser) => {
                setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
            },
            (error) => {
                console.error("FirebaseClientProvider: onAuthStateChanged error:", error);
                setUserAuthState({ user: null, isUserLoading: false, userError: error });
            }
        );
        return () => unsubscribe();
    }, [services]);

    const contextValue = useMemo((): FirebaseContextState => {
        const servicesAvailable = !!services;
        return {
            areServicesAvailable: servicesAvailable,
            firebaseApp: services?.firebaseApp || null,
            firestore: services?.firestore || null,
            auth: services?.auth || null,
            storage: services?.storage || null,
            user: userAuthState.user,
            isUserLoading: userAuthState.isUserLoading,
            userError: userAuthState.userError,
        };
    }, [services, userAuthState]);

    return (
        <FirebaseContext.Provider value={contextValue}>
            {children}
        </FirebaseContext.Provider>
    );
}

const useFirebaseContext = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseContext must be used within a FirebaseClientProvider.');
  }
  return context;
};

export const useAuth = (): Auth | null => useFirebaseContext().auth;
export const useFirestore = (): Firestore | null => useFirebaseContext().firestore;
export const useFirebaseApp = (): FirebaseApp | null => useFirebaseContext().firebaseApp;
export const useStorage = (): Storage | null => useFirebaseContext().storage;
