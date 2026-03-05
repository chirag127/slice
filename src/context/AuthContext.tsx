import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    type User as FirebaseUser,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'admin' | 'rep' | 'pending';

export interface UserProfile {
    uid: string;
    email: string | null;
    role: UserRole;
    plan_id?: string;
    status: 'active' | 'inactive' | 'pending';
    displayName?: string;
}

interface AuthContextType {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Setup real-time listener for user profile
                const userDocRef = doc(db, 'users', currentUser.uid);

                const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setProfile({
                            uid: currentUser.uid,
                            ...docSnap.data()
                        } as UserProfile);
                    } else {
                        // Document might not exist yet if just signed up
                        setProfile({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            role: 'pending',
                            status: 'pending'
                        });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    setLoading(false);
                });

                return () => unsubscribeProfile();
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    };

    const value = {
        user,
        profile,
        loading,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
