'use client';

import { Users, LayoutDashboard, BadgeIndianRupee, PlaySquare, LogOut, Gift, Dice5, Brain } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNav() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const isActive = (path: string) => pathname === path;

    // Helper for Nav Items
    const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
        <Link
            href={href}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: isActive(href) ? 'var(--secondary)' : 'var(--text-gray)',
                textDecoration: 'none'
            }}
        >
            <Icon size={24} />
            <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{label}</span>
        </Link>
    );

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#1f2937', // Explicit dark gray
            borderTop: '1px solid var(--border)',
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <NavItem href="/admin" icon={LayoutDashboard} label="Home" />
            <NavItem href="/admin/offers" icon={Gift} label="Offers" />
            <NavItem href="/admin/ads" icon={PlaySquare} label="Ads" />
            <NavItem href="/admin/lucky-draw" icon={Dice5} label="Luck" />
            <NavItem href="/admin/quiz" icon={Brain} label="Quiz" />
            <NavItem href="/admin/withdrawals" icon={BadgeIndianRupee} label="Payouts" />
            <NavItem href="/admin/users" icon={Users} label="Users" />

            <div
                onClick={logout}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#ef4444',
                    cursor: 'pointer'
                }}
            >
                <LogOut size={24} />
                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Logout</span>
            </div>
        </nav>
    );
}
