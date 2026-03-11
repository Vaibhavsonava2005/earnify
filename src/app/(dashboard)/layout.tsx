'use client';

import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Gift } from 'lucide-react';

import Footer from '@/components/Footer';

import PromoPopup from '@/components/PromoPopup';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect AFTER auth has finished loading
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Show loading spinner ONLY while auth is initializing
    if (loading) return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111827',
            color: '#fbbf24',
            gap: '15px',
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #374151',
                borderTopColor: '#fbbf24',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Loading Earnify...</p>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    // Auth done but no user → redirect happening, show nothing
    if (!user) return null;

    return (
        <div style={{ paddingBottom: '70px' }}>
            {children}
            <Footer />
            <PromoPopup />
            <BottomNav />

            {/* Floating Refer Button */}
            <button
                onClick={() => router.push('/refer?autoShare=true')}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.5)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    zIndex: 99,
                    animation: 'float 3s ease-in-out infinite'
                }}
            >
                <Gift size={24} />
            </button>
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
}
