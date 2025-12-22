import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { syncUser, getUserUserData } from '../services/userService';
import { DBUser } from '../types';

interface AuthContextType {
    currentUser: User | null;
    dbUser: DBUser | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshDbUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DBUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshDbUser = async () => {
        if (currentUser) {
            const data = await getUserUserData(currentUser.uid);
            // @ts-ignore
            setDbUser(data);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Sync user data to Firestore on login/refresh
                await syncUser(user);
                const userData = await getUserUserData(user.uid);
                // @ts-ignore
                setDbUser(userData);
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setDbUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        currentUser,
        dbUser,
        loading,
        login,
        logout,
        refreshDbUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
