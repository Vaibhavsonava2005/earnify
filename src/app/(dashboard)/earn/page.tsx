'use client';

import { useAuth } from '@/context/AuthContext';
import { DbService } from '@/services/dbService';
import { Ad } from '@/services/mockData';
import { Play, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function EarnPage() {
    const { user, refreshUser } = useAuth();
    const [ads, setAds] = useState<Ad[]>([]);
    const [watching, setWatching] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [loading, setLoading] = useState(true);

    // Track when the user left the tab
    const lastLeftTime = useRef<number | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            // Don't set loading true on every poll (avoids flicker)
            const data = await DbService.getAds(user?.id);
            setAds(data);
            if (loading) setLoading(false);
        };
        fetchAds();
        // Poll less frequently (5s) to reduce network load
        const interval = setInterval(fetchAds, 5000);
        return () => clearInterval(interval);
    }, [user, loading]); // Depend on 'loading' to trigger initial set

    // Visibility Logic: Only count time when user is AWAY (watching ad)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left the tab (went to watch ad)
                lastLeftTime.current = Date.now();
            } else {
                // User came back
                if (watching && lastLeftTime.current) {
                    const timeAway = (Date.now() - lastLeftTime.current) / 1000;
                    setTimeLeft((prev) => {
                        const newTime = Math.max(0, prev - timeAway);
                        if (newTime <= 0) {
                            setCanClaim(true);
                            return 0;
                        }
                        return newTime;
                    });
                }
                lastLeftTime.current = null;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [watching]);

    const handleWatch = (ad: Ad) => {
        if (watching) return;

        // 1. Redirect to Ad Link
        window.open(ad.videoUrl, '_blank');

        // 2. Setup State
        setWatching(ad.id);
        setTimeLeft(ad.duration);
        setCanClaim(false);
        // Initialize leave time since window.open usually blurs, but just in case
        lastLeftTime.current = Date.now();
    };

    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaim = async (ad: Ad) => {
        if (isClaiming) return;
        setIsClaiming(true);

        if (user) {
            // 1. Call Secure Claim Method
            const result = await DbService.claimAdReward(user.id, ad.id, ad.reward);

            if (result.success) {
                // 2. Refresh UI if successful
                await refreshUser();
                const updatedAds = await DbService.getAds(user.id);
                setAds(updatedAds);

                // alert(`Ad Completed! You earned ${ad.reward} points.`);
            } else {
                // 3. Handle Failure (e.g., Requirements not met, or already claimed)
                alert(result.message || 'Claim Failed');

                // If failed, we stop here (button stays enabled if it was a temporary error, or let user refresh)
                // But generally, reset watching state so they can try again or see specific error
                setIsClaiming(false);
                setWatching(null);
                setCanClaim(false);
                return;
            }
        }

        setWatching(null);
        setCanClaim(false);
        setIsClaiming(false);
    };

    return (
        <div className="container">
            <style jsx>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
            <h1>Watch & Earn</h1>
            <p style={{ marginBottom: '1.5rem' }}>Click "Watch" and stay on the ad page. The timer <b>pauses</b> if you come back here!</p>

            {/* Loading Skeleton */}
            {loading && ads.length === 0 && (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ height: '80px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }}></div>
                    ))}
                </div>
            )}

            {!loading && ads.map((ad: any) => {
                const isPremium = (ad.minTasks ?? 0) > 0;
                // Randomize urgency text based on ID (consistent per session)
                const urgencyTexts = ["⚡ LIMITED TIME", "🔥 DO FAST", "⏳ ENDING SOON", "🚀 HIGH REWARD"];
                const urgencyText = urgencyTexts[ad.id.charCodeAt(0) % urgencyTexts.length];

                return (
                    <div key={ad.id} className="card" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        // Premium Styling: Gold Border + Gradient vs Standard Border
                        border: isPremium ? '1px solid #ef4444' : (ad.locked ? '1px solid #71717a' : 'none'), // Red Border for Urgency
                        background: isPremium ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(71, 85, 105, 0.3))' : undefined,
                        opacity: 1, // ALWAYS VISIBLE
                        position: 'relative',
                        overflow: 'visible', // Allow badge to pop out slightly if needed
                        boxShadow: isPremium ? '0 4px 15px rgba(239, 68, 68, 0.2)' : undefined,
                        marginBottom: '15px'
                    }}>
                        {isPremium && (
                            <div style={{
                                position: 'absolute',
                                top: '-1px', // Sit on border
                                left: '20px',
                                background: 'linear-gradient(to right, #ef4444, #f97316)', // Red/Orange Logic
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                padding: '4px 12px',
                                borderBottomLeftRadius: '6px',
                                borderBottomRightRadius: '6px',
                                zIndex: 2,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                animation: 'pulse-red 2s infinite'
                            }}>
                                {urgencyText}
                            </div>
                        )}

                        {/* LEFT SIDE: Text Content (Fully Visible) */}
                        <div style={{ flex: 1, paddingRight: '10px' }}>
                            <h3 style={{
                                marginBottom: '0.3rem',
                                color: isPremium ? '#fef08a' : 'inherit',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                filter: ad.locked ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'none'
                            }}>
                                {ad.title}
                            </h3>
                            <p style={{
                                color: isPremium ? '#facc15' : 'var(--secondary)',
                                fontSize: '0.95rem',
                                fontWeight: isPremium ? 600 : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    background: isPremium ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    border: isPremium ? '1px solid rgba(234, 179, 8, 0.4)' : 'none'
                                }}>
                                    +{ad.reward} Points
                                </span>
                                <span>•</span>
                                <span>{ad.duration}s</span>
                            </p>
                        </div>

                        {/* RIGHT SIDE: Action Area (Watch or Lock UI) */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' }}>

                            {ad.locked ? (
                                // LOCKED STATE UI
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '6px',
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(234, 179, 8, 0.3)'
                                }}>
                                    <div style={{
                                        color: '#eab308',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textAlign: 'right',
                                        marginBottom: '4px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Lock size={12} /> Locked
                                        </div>
                                        <span style={{ fontWeight: 'normal', opacity: 0.9 }}>
                                            Complete <b style={{ color: 'white' }}>{ad.tasksNeeded} Offers</b> to Unlock
                                        </span>
                                    </div>
                                    <button
                                        className="btn"
                                        style={{
                                            background: 'linear-gradient(to right, #eab308, #d97706)',
                                            color: 'black',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            width: '100%',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 5px rgba(234, 179, 8, 0.3)'
                                        }}
                                        onClick={(e) => {
                                            window.location.href = '/apps';
                                        }}
                                    >
                                        🚀 Unlock
                                    </button>
                                </div>
                            ) : (
                                // ACTIVE STATE UI
                                <>
                                    {watching === ad.id ? (
                                        canClaim ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleClaim(ad)}
                                                disabled={isClaiming}
                                                style={{ backgroundColor: '#10b981', opacity: isClaiming ? 0.7 : 1 }}
                                            >
                                                {isClaiming ? 'Claiming...' : `Claim +${ad.reward}`}
                                            </button>
                                        ) : (
                                            <button className="btn" disabled style={{ opacity: 0.7, backgroundColor: '#f59e0b', color: '#fff' }}>
                                                {Math.ceil(timeLeft)}s left...
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            disabled={!!watching}
                                            style={{
                                                opacity: watching ? 0.5 : 1,
                                                background: isPremium ? 'linear-gradient(to right, #eab308, #d97706)' : undefined,
                                                border: 'none',
                                                color: isPremium ? 'black' : 'white',
                                                fontWeight: isPremium ? 'bold' : 'normal',
                                                minWidth: '100px'
                                            }}
                                            onClick={() => handleWatch(ad)}
                                        >
                                            <Play size={18} style={{ marginRight: '5px' }} /> Watch
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            })}

            {!loading && ads.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(135deg, #1f2937, #111827)', borderRadius: '12px', border: '1px solid #374151', marginTop: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚀</div>
                    <h2 style={{ color: 'white', marginBottom: '10px' }}>No Ads Available?</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
                        Don't stop earning! Complete <b>Apps & Offers</b> to earn 5x - 10x more points instantly.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', fontSize: '1.1rem', background: 'linear-gradient(to right, #ef4444, #f97316)' }}
                        onClick={() => window.location.href = '/apps'}
                    >
                        🔥 Go to Offers
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px' }}>New ads refresh every hour.</p>
                </div>
            )}
        </div>
    );
}
