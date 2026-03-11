'use client';

import { Home, PlayCircle, Wallet, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-around',
            zIndex: 50
        }}>
            <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-gray)' }}>
                <Home size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Home</span>
            </Link>

            <Link href="/earn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('/earn') ? 'var(--primary)' : 'var(--text-gray)' }}>
                <PlayCircle size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Earn</span>
            </Link>

            <Link href="/apps" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('/apps') ? 'var(--primary)' : 'var(--text-gray)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <PlayCircle size={24} /> {/* Or Grid/Gift icon? strict PlayCircle is fine or maybe LayoutGrid */}
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        border: '1px solid var(--bg-card)'
                    }} />
                </div>
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Offers</span>
            </Link>

            <Link href="/wallet" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isActive('/wallet') ? 'var(--primary)' : 'var(--text-gray)' }}>
                <Wallet size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Wallet</span>
            </Link>
        </nav>
    );
}
