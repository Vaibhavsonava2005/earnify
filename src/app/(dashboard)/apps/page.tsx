/* eslint-disable */
'use client';

import { useAuth } from '@/context/AuthContext';
import { DbService } from '@/services/dbService';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import { useEffect, useState } from 'react';
import { Download, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function AppsPage() {
    const { user, refreshUser } = useAuth();
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    // State to track which app card is expanded
    const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (user) {
            loadApps();
            const interval = setInterval(loadApps, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [user, activeTab]);

    const loadApps = async () => {
        // Don't set loading(true) on poll to avoid flickering
        const data = await DbService.getApps(user?.id);
        // Filter out 'OFFER' (Scratch Cards) and 'QUIZ' (redundant with backend filter for safety)
        setApps(data.filter(app => app.category !== 'OFFER' && app.category !== 'QUIZ'));
        if (loading) setLoading(false);
    };

    const handleStartTask = (app: any) => {
        if (!app.link) return;
        window.open(app.link, '_blank');
    };

    const handleVerify = async (appId: string) => {
        if (!user) return;

        const confirm = window.confirm("Have you installed the app and signed up? False claims may lead to a ban.");
        if (!confirm) return;

        await DbService.submitAppTask(user.id, appId);
        alert('Verification Submitted! Admin will review shortly.');
        loadApps();
    };

    const filteredApps = apps.filter(app => activeTab === 'ALL' || app.category === activeTab);

    // Toggle expand/collapse
    const toggleDetails = (id: string) => {
        setExpandedAppId(prev => prev === id ? null : id);
    };

    const handleShare = async (app: any) => {
        const shareData = {
            title: `Earn with ${app.title}`,
            text: `Check out this task on Earnify: ${app.title}\n${app.description}\nPoints: ${app.reward}`,
            url: app.link
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link and details copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="container">
            <button onClick={() => router.back()} className="btn" style={{ marginBottom: '1rem' }}>&larr; Back</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <h1>Apps & Tasks</h1>
                <span style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    animation: 'pulse 2s infinite'
                }}>
                    LIVE
                </span>
            </div>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
                ⚡ <b>High Rewards!</b> Complete simple tasks below to earn massive points instantly.
            </p>


            {/* Categories */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '5px' }}>
                {['ALL', 'APPS', 'BANK', 'DEMAT', 'HOT'].map(tab => (
                    <button
                        key={tab}
                        className="btn"
                        style={{
                            background: activeTab === tab ? 'var(--primary)' : '#374151',
                            color: 'white',
                            whiteSpace: 'nowrap'
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'ALL' ? 'All Offers' : tab}
                    </button>
                ))}
            </div>

            {loading ? <p>Loading tasks...</p> : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredApps.map(app => {
                        const isExpanded = expandedAppId === app.id;

                        return (
                            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', transition: 'all 0.3s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h3 style={{ margin: 0, textDecoration: app.status === 'APPROVED' ? 'line-through' : 'none', opacity: app.status === 'APPROVED' ? 0.7 : 1 }}>
                                                {app.title}
                                            </h3>
                                            {app.status === 'APPROVED' && (
                                                <span title="Completed" style={{ fontSize: '1.2rem' }}>✅</span>
                                            )}
                                            {app.category === 'HOT' && (
                                                <span style={{ fontSize: '0.6rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>HOT</span>
                                            )}
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px',
                                            backgroundColor: '#374151', color: '#9ca3af', marginTop: '4px', display: 'inline-block'
                                        }}>
                                            {app.category}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {app.status === 'APPROVED' ? (
                                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>Done</span>
                                        ) : app.status === 'PENDING' ? (
                                            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={16} /> Pending
                                            </span>
                                        ) : (
                                            <div className="badge" style={{ fontSize: '1rem', background: 'var(--primary)', color: 'white', whiteSpace: 'nowrap' }}>
                                                +{app.reward}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Collapsed State: Just the See Details Button */}
                                {!isExpanded && (
                                    <button
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            marginTop: '10px',
                                            background: '#374151',
                                            color: '#f3f4f6',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px',
                                            padding: '12px'
                                        }}
                                        onClick={() => toggleDetails(app.id)}
                                    >
                                        See Details ▼
                                    </button>
                                )}

                                {/* Expanded State: Description & Actions */}
                                {isExpanded && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #374151' }}>

                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '15px' }}>{app.description}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                                Status: <span style={{ fontWeight: 'bold' }}>{app.status || 'Not Started'}</span>
                                            </span>

                                            {!app.status && (
                                                <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                                                    <button className="btn" style={{ background: '#374151', padding: '10px' }} onClick={() => handleShare(app)}>
                                                        📤
                                                    </button>
                                                    <button className="btn" onClick={() => handleStartTask(app)}>
                                                        <Download size={16} /> Install
                                                    </button>
                                                    <button className="btn btn-primary" onClick={() => handleVerify(app.id)}>
                                                        Verify
                                                    </button>
                                                </div>
                                            )}

                                            {app.status === 'PENDING' && (
                                                <button className="btn" disabled style={{ opacity: 0.7, background: '#f59e0b', color: 'white', flex: 1 }}>
                                                    <Clock size={16} /> Pending Review
                                                </button>
                                            )}

                                            {app.status === 'APPROVED' && (
                                                <button className="btn" disabled style={{ opacity: 0.7, background: '#10b981', color: 'white', flex: 1 }}>
                                                    <CheckCircle size={16} /> Completed
                                                </button>
                                            )}

                                            {app.status === 'REJECTED' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '5px', flex: 1 }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                                                        Reason: {app.rejectionReason}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                        <button className="btn" style={{ flex: 1 }} onClick={() => handleStartTask(app)}>
                                                            Retry
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleVerify(app.id)}
                                                            style={{ background: '#3b82f6', flex: 1 }}
                                                        >
                                                            Resubmit
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="btn"
                                            style={{
                                                width: '100%',
                                                marginTop: '15px',
                                                background: 'transparent',
                                                color: '#9ca3af',
                                                fontSize: '0.8rem',
                                                border: '1px dashed #374151',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'
                                            }}
                                            onClick={() => toggleDetails(app.id)}
                                        >
                                            Hide Details ▲
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {filteredApps.length === 0 && (
                        <div>
                            <p>No offers in this category.</p>
                            <small style={{ color: '#555' }}>Debug: Total={apps.length}, Filtered={filteredApps.length}, Tab={activeTab}</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
