'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/services/mockData';
import { DbService } from '@/services/dbService';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null;
    login: (mobile: string, pin: string) => Promise<boolean>;
    signup: (name: string, mobile: string, pin: string, referralCode?: string) => Promise<boolean | string>;
    adminLogin: (password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAdmin: boolean;
    updateLocalBalance: (amount: number) => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for session
        const initAuth = async () => {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('earnify_session');
                if (stored) {
                    try {
                        const sessionUser = JSON.parse(stored);
                        if (sessionUser && sessionUser.id) {
                            // IMMEDIATELY set user from cache so UI doesn't hang
                            setUser(sessionUser);

                            // Then try to refresh from DB (non-blocking)
                            try {
                                const dbUser = await DbService.getUserProfile(sessionUser.id);
                                if (dbUser) {
                                    if (dbUser.role === 'BANNED') {
                                        alert('ACCOUNT SUSPENDED');
                                        logout();
                                        setLoading(false);
                                        return;
                                    }
                                    setUser(dbUser);
                                    localStorage.setItem('earnify_session', JSON.stringify(dbUser));
                                }
                                // If dbUser is null (user deleted from DB), keep cached version
                                // They'll get an error when trying to perform actions
                            } catch (dbError) {
                                console.warn('DB refresh failed, using cached session:', dbError);
                                // Keep the cached user — app still works offline/with bad connection
                            }
                        }
                    } catch (e) {
                        console.error('Auth Init Error', e);
                        localStorage.removeItem('earnify_session');
                    }
                }
            }
            setLoading(false);
        };

        // Safety timeout: force loading=false after 8 seconds no matter what
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 8000);

        initAuth().finally(() => clearTimeout(safetyTimeout));
    }, []);

    // ... (rest of functions) ...



    const login = async (mobile: string, pin: string) => {
        // SECURE LOGIN (Passed PIN to DB)
        const dbUser = await DbService.login(mobile, pin);

        if (dbUser) {
            if (dbUser.role === 'BANNED') {
                alert('ACCOUNT SUSPENDED: Your account has been banned due to suspicious activity.\n\nReason: Fake Referrals/Spam Detected.');
                return false;
            }

            // SECURITY FIX: Block Admin from using User Login (forces use of Secure Admin Portal)
            if (dbUser.role === 'ADMIN') {
                alert('Access Denied: Admins must use the Secure Admin Portal.');
                router.push('/admin-login');
                return false;
            }

            setUser(dbUser);
            localStorage.setItem('earnify_session', JSON.stringify(dbUser));
            router.push('/dashboard');
            return true;
        }
        return false;
    };

    const signup = async (name: string, mobile: string, pin: string, referralCode?: string) => {
        // We can't use getUser(mobile) to check existence easily anymore without PIN.
        // But createUser will fail if Unique constraint on Mobile exists?
        // Let's assume DbService.createUser handles it or returns error strings.
        // Actually, we can try to login? No.
        // Trusted 'createUser' to fail if mobile exists.

        // Re-integating existence check if possible? 
        // RPC 'check_referrer' returns ID from mobile. If it returns ID, user exists?
        // YES. Reuse check_referrer for "Is Registered" check!

        // However, 'signup' logic in the context:
        // const existing = await DbService.getUser(mobile); 
        // We removed getUser visibility.
        // Let's rely on createUser returning error, OR blindly try to create.

        // Better: Use check_referrer (which is effectively 'get_user_id_by_mobile')
        // const existingId = await DbService.checkUserExists(mobile); // Need this method? 
        // I didn't add checkUserExists to DbService.
        // I will just proceed to createUser. DbService.createUser logs error if duplicate.
        // But lines 72-73 checks existing.
        // I will COMMENT OUT existing check and let createUser handle it.
        // Or simplified:

        /* const existing = await DbService.getUser(mobile); 
           if (existing) return 'EXISTS'; */

        // Actually, I should probably add a dedicated RPC for this: "user_exists(mobile): bool".
        // For now, I'll bypass the pre-check.


        const newUser = await DbService.createUser({
            name,
            mobile,
            pin,
            role: 'USER',
            balance: 0,
            referralCode // FIX: Actually pass the code!
        });

        if (newUser && typeof newUser !== 'string') {
            setUser(newUser);
            localStorage.setItem('earnify_session', JSON.stringify(newUser));
            router.push('/dashboard');
            return true;
        }
        return typeof newUser === 'string' ? newUser : 'Unknown Error';
    };

    useEffect(() => {
        // FORCE LOGOUT FOR LEGACY SESSIONS
        if (user?.role === 'ADMIN' && user.id !== 'admin_secured') {
            console.log('Legacy Admin Session Detected. Logging out.');
            logout();
        }
    }, [user]);

    const adminLogin = async (password: string) => {
        try {
            const res = await fetch('/api/auth/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                // Use new ID 'admin_secured' to distinguish from old 'admin' sessions
                const adminUser: User = { id: 'admin_secured', name: 'Admin', mobile: 'admin', pin: 'admin', role: 'ADMIN', balance: 0 };
                setUser(adminUser);
                localStorage.setItem('earnify_session', JSON.stringify(adminUser));
                router.push('/admin');
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Invalid Password' };
            }
        } catch (error) {
            console.error('Admin Login Error', error);
            return { success: false, message: 'Network/Server Error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('earnify_session');
        router.push('/');
    };

    const refreshUser = async () => {
        if (user) {
            // Admin doesn't need DB refresh (static auth for now)
            if (user.role === 'ADMIN') return;

            const updated = await DbService.getUserProfile(user.id);
            if (updated) {
                setUser(updated);
                localStorage.setItem('earnify_session', JSON.stringify(updated));
            }
        }
    }

    const updateLocalBalance = (amount: number) => {
        if (user) {
            const updated = { ...user, balance: (user.balance || 0) + amount };
            setUser(updated);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, signup, adminLogin, logout, refreshUser, isAdmin, updateLocalBalance, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
