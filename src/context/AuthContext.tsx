import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';

export type UserRole = 'pending' | 'rep' | 'admin' | null;

export interface AppUser {
  uid: string;
  email: string | null;
  role: UserRole;
  plan_id?: string;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Fetch the user's role from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              role: data.role as UserRole,
              plan_id: data.plan_id,
              status: data.status || 'active'
            });
          } else {
            // New user signed up, but Firestore doc hasn't been created yet.
            // Wait for the signup flow to create it and reload, or set default to pending.
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              role: 'pending',
              status: 'active'
            });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
