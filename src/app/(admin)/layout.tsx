'use client';

import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // We strictly check for session + role
        // Using a timeout to allow AuthContext to hydrate (though it should be fast)
        const checkAuth = () => {
            const stored = localStorage.getItem('earnify_session');
            const sessionUser = stored ? JSON.parse(stored) : null;

            if (!sessionUser) {
                router.push('/login');
                return;
            }

            if (sessionUser.role !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }

            setIsAuthorized(true);
        };
        checkAuth();
    }, [user, router]);

    if (!isAuthorized) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Admin Panel...</div>;

    return (
        <div style={{ paddingBottom: '80px', minHeight: '100vh', background: '#111827' }}>
            <header style={{
                padding: '1rem',
                background: '#1f2937',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ color: 'var(--secondary)', fontSize: '1.25rem', margin: 0, fontWeight: '800' }}>EARNIFY ADMIN</h2>
                <span style={{ fontSize: '0.8rem', background: '#374151', padding: '4px 8px', borderRadius: '4px' }}>v1.0</span>
            </header>

            <main style={{ padding: '10px 0' }}>
                {children}
            </main>

            <AdminNav />
        </div>
    );
}
