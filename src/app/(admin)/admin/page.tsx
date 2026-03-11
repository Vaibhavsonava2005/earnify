'use client';

import { DbService } from '@/services/dbService';
import { User, Ad, Withdrawal } from '@/services/mockData';
import { useEffect, useState } from 'react';
import { Users, PlaySquare, BadgeIndianRupee, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        ads: 0,
        pendingWithdrawals: 0,
        pendingApps: 0,
        totalPaid: 0
    });

    const fetchStats = async () => {
        const users = await DbService.getAllUsers();
        const ads = await DbService.getAds();
        const withdrawals = await DbService.getWithdrawals();
        const pendingApps = await DbService.getPendingAppTasks(); // Fetch pending apps

        const paid = withdrawals
            .filter(w => w.status === 'APPROVED')
            .reduce((sum, w) => sum + w.amount, 0);

        setStats({
            users: users.length,
            ads: ads.length,
            pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING').length,
            pendingApps: pendingApps.length,
            totalPaid: paid
        });
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 3000); // Live Sync every 3s
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ label, value, color, icon: Icon }: any) => (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: `${color}20`, padding: '12px', borderRadius: '12px', color: color }}>
                <Icon size={28} />
            </div>
            <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '4px' }}>{label}</p>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>{value}</h2>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '10px' }}>
            <h3 style={{ marginBottom: '20px' }}>Dashboard Overview</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                <StatCard label="Total Users" value={stats.users} color="#3b82f6" icon={Users} />
                <StatCard label="Active Ads" value={stats.ads} color="#8b5cf6" icon={PlaySquare} />

                {/* Pending Apps Card */}
                <StatCard label="App Verifications" value={stats.pendingApps} color="#ec4899" icon={Activity} />

                <StatCard label="Pending Payouts" value={stats.pendingWithdrawals} color="#fbbf24" icon={BadgeIndianRupee} />
                <StatCard label="Total Paid" value={`₹${stats.totalPaid}`} color="#10b981" icon={BadgeIndianRupee} />
            </div>

            <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
                <h4>Quick Actions</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '15px' }}>Shortcuts to manage your platform.</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a href="/admin/ads" className="btn btn-secondary" style={{ width: 'auto', flex: 1, textAlign: 'center' }}>+ Ads</a>
                    <a href="/admin/apps" className="btn btn-secondary" style={{ width: 'auto', flex: 1, textAlign: 'center', background: '#3b82f6' }}>+ Apps</a>
                    <a href="/admin/withdrawals" className="btn btn-primary" style={{ width: 'auto', flex: 1, textAlign: 'center' }}>Payouts</a>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <a href="/admin/lucky-draw" className="btn" style={{ flex: 1, textAlign: 'center', background: '#8b5cf6' }}>🎲 Lucky Draws</a>
                    <a href="/admin/users" className="btn" style={{ flex: 1, textAlign: 'center', background: '#ef4444' }}>Manage Users</a>
                </div>
            </div>
        </div>
    );
}
