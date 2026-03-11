'use client';

import { useAuth } from '@/context/AuthContext';
import { CreditCard, TrendingUp, Video, Download, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { DbService } from '@/services/dbService';
import ScratchCard from '@/components/ScratchCard';

export default function DashboardPage() {
    const { user, refreshUser, logout, updateLocalBalance } = useAuth();
    const router = useRouter();
    const [warning, setWarning] = useState<{ id: string; message: string } | null>(null);
    const [reminders, setReminders] = useState<{ id: string; message: string }[]>([]);

    // Scratch Card State
    const [showScratchCard, setShowScratchCard] = useState(false);
    const [scratchPoints, setScratchPoints] = useState(0);
    const generatedPointsRef = useRef(0);
    const [activeOfferId, setActiveOfferId] = useState<string | null>(null);
    const activeOfferIdRef = useRef<string | null>(null); // Ref to access current state in interval
    const [offers, setOffers] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);

    const SAMPLE_NAMES = [
        "Ankita singh", "Rahul Yadav", "Muhammed Zaid", "Shikhar Jain", "Amaan Khan",
        "Rohan Shrivastav", "Ankush Sharma", "Lokesh Pareek", "Deepak Soni",
        "Hitesh Ramani", "Lavisha Sharma", "Shruti Yadav", "Priyanka Jain"
    ];
    const SAMPLE_REVIEWS = [
        "Best app for earning", "Earnify is 100% real", "I recieved withdrawal from earnify in just 1 day",
        "Best Earning app", "Instant payment received", "Love this app", "Very easy tasks",
        "Trusted Application", "Good support team", "Finally a legit earning app"
    ];

    useEffect(() => {
        // Daily Seed Randomizer
        const dateStr = new Date().toDateString();
        let seed = 0;
        for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);

        const getRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        // Shuffle and slice to ensure NO duplicates
        const shuffledNames = [...SAMPLE_NAMES].sort(() => 0.5 - getRandom());
        const shuffledReviews = [...SAMPLE_REVIEWS].sort(() => 0.5 - getRandom());

        const selected = [];
        for (let i = 0; i < 3; i++) {
            selected.push({ name: shuffledNames[i], text: shuffledReviews[i] });
        }
        setReviews(selected);
    }, []);

    useEffect(() => {
        activeOfferIdRef.current = activeOfferId;
    }, [activeOfferId]);

    // (Unified useEffect implemented in previous step, this block removes the old separate one if confusing, but better to just replace the logic inside the previous call. 
    // Since I replaced the logic in the dismissReminder chunk effectively merging them, I need to be careful.
    // However, the previous chunk REPLACED 'dismissReminder' definition. It did NOT replace the useEffect at line 63.
    // I need to replace the useEffect at line 63 separately.)


    const handleScratchComplete = async () => {
        if (!user) return;
        if (!showScratchCard) return;

        // 1. OPTIMISTIC UPDATE (Immediate Feedback)
        alert(`CONGRATULATIONS! You won ${scratchPoints} Points!`);
        updateLocalBalance(scratchPoints);
        handleClose();

        // 2. BACKGROUND SYNC
        try {
            if (activeOfferId) {
                await DbService.claimOffer(user.id, activeOfferId);
            } else {
                await DbService.claimScratchCard(user.id);
            }
            // Eventual Consistency
            refreshUser();
        } catch (e) {
            console.error("Background sync failed", e);
            // In a real app, you might rollback or queue for retry
        }
    };

    const handleClose = () => {
        setShowScratchCard(false);
        setActiveOfferId(null);
    };

    const dismissedIdsRef = useRef<Set<string>>(new Set());

    // Load dismissed IDs from local storage on mount
    useEffect(() => {
        try {
            const storedDismissed = localStorage.getItem('earnify_dismissed_alerts');
            if (storedDismissed) {
                const ids = JSON.parse(storedDismissed);
                ids.forEach((id: string) => dismissedIdsRef.current.add(id));
            }
        } catch (e) { }
    }, []);

    const saveDismissed = (id: string) => {
        dismissedIdsRef.current.add(id);
        localStorage.setItem('earnify_dismissed_alerts', JSON.stringify(Array.from(dismissedIdsRef.current)));
    };

    useEffect(() => {
        const checkStatus = async () => {
            if (user?.id) {
                const transactions = await DbService.getTransactions(user.id);
                // Also fetch balance silently if needed, but rely on transactions for now

                const fetchedOffers = await DbService.getOffers(user.id);
                const visibleOffers = fetchedOffers.filter((o: any) =>
                    o.config?.isActive &&
                    !o.isClaimed &&
                    (user.balance || 0) >= (o.config?.minBalance || 0)
                );
                setOffers(visibleOffers);

                // Check Warnings & Reminders
                // Find LATEST warning that is NOT dismissed
                const latestWarning = transactions.find((t: any) =>
                    t.type === 'ADMIN_WARNING' && !dismissedIdsRef.current.has(t.id)
                );

                if (latestWarning) {
                    setWarning({ id: latestWarning.id, message: latestWarning.description });
                } else {
                    setWarning(null);
                }

                // Filter out dismissed IDs to prevent flicker
                const activeReminders = transactions
                    .filter(t => t.type === 'TASK_REMINDER' && !dismissedIdsRef.current.has(t.id))
                    .slice(0, 3)
                    .map(t => ({ id: t.id, message: t.description }));

                // Only update state if different to prevent re-renders
                // @ts-ignore
                setReminders(prev => {
                    const isSame = prev.length === activeReminders.length &&
                        prev.every((p, i) => p.id === activeReminders[i].id);
                    return isSame ? prev : activeReminders;
                });
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Increased to 5s for smoother feel
        return () => clearInterval(interval);
    }, [user?.id, user?.balance]); // Removed refreshUser dependency

    // ... (Scratch Card Logic remains same)

    const dismissReminder = (id: string) => {
        // PERMANENT FIX: Optimistic Update (Instant Removal)
        // 1. Mark as dismissed locally to prevent re-fetch appearance
        dismissedIdsRef.current.add(id);

        // 2. Remove from UI immediately
        // @ts-ignore
        setReminders(prev => prev.filter(r => r.id !== id));

        // 3. Delete from DB in background
        DbService.deleteTransaction(id).catch(err => {
            console.error('Failed to delete reminder', err);
        });
    };

    const dismissWarning = () => {
        if (!warning) return;
        saveDismissed(warning.id);
        setWarning(null);
    };

    const openOffer = (offer: any) => {
        setScratchPoints(offer.reward);
        setActiveOfferId(offer.id);
        setShowScratchCard(true);
        generatedPointsRef.current = offer.reward; // Lock it immediately
    };

    return (
        <div className="container">
            {/* Scratch Card Modal */}
            {showScratchCard && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        background: 'white', padding: '20px', borderRadius: '16px',
                        textAlign: 'center', width: '90%', maxWidth: '350px',
                        boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)' // Golden Glow
                    }}>
                        <h2 style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
                            WIN UP TO 250,000!
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                            Do more apps & tasks to win points!
                        </p>

                        <ScratchCard onComplete={handleScratchComplete} width={300} height={300}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#111827' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{scratchPoints}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>POINTS</div>
                            </div>
                        </ScratchCard>

                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#9ca3af' }}>
                            SCRATCH NOW TO CLAIM
                        </p>
                    </div>
                </div>
            )}

            {/* Task Reminders */}
            {/* @ts-ignore */}
            {reminders.map((r: any) => (
                <div key={r.id} style={{
                    background: '#1e293b', padding: '15px', borderRadius: '8px',
                    marginBottom: '15px', borderLeft: '4px solid #8b5cf6',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔔</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '2px' }}>TASK REMINDER</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{r.message.replace('TASK ACTION:', '')}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => dismissReminder(r.id)}
                        style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '5px' }}
                    >
                        ✕
                    </button>
                </div>
            ))}

            {warning && (
                <div style={{
                    background: '#ef4444', color: 'white', padding: '15px', borderRadius: '8px',
                    marginBottom: '20px', border: '2px solid #b91c1c', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 6px rgba(220, 38, 38, 0.4)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <div>
                            <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>SYSTEM ALERT</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{warning.message.replace('SYSTEM DETECTED:', '')}</div>
                        </div>
                    </div>
                    <button
                        onClick={dismissWarning}
                        style={{
                            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white', fontWeight: 'bold'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ marginBottom: '0.2rem' }}>Hello, {user?.name} 👋</h2>
                    <p>Welcome back to Earnify</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        color: 'var(--primary)',
                        fontWeight: 'bold',
                        border: '1px solid var(--primary)'
                    }}>
                        USER
                    </div>
                    <button
                        onClick={logout}
                        className="btn"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            padding: '8px 16px',
                            borderRadius: '50px',
                            border: '1px solid #ef4444',
                            width: 'auto',
                            fontSize: '0.9rem'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Balance Card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Total Balance</p>
                <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>{user?.balance} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>PTS</span></h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        ≈ ₹{(user?.balance || 0) / 100} INR
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/lucky-draw" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: 'white' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎲</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>Lucky Draw</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Win 50,000+ Pts</span>
                </Link>

                <Link href="/quiz" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer', background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)', border: 'none' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: 'white' }}>
                        <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>Quiz / Bet</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Predict & Win</span>
                </Link>

                <Link href="/earn" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: 'var(--secondary)' }}>
                        <Video size={24} />
                    </div>
                    <span style={{ fontWeight: '600' }}>Watch Ads</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Earn Points</span>
                </Link>

                <Link href="/wallet" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: 'var(--primary)' }}>
                        <CreditCard size={24} />
                    </div>
                    <span style={{ fontWeight: '600' }}>Withdraw</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Get Cash</span>
                </Link>

                <Link href="/apps" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer', gridColumn: 'span 2' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: '#3b82f6' }}>
                        <Download size={24} />
                    </div>
                    <span style={{ fontWeight: '600' }}>Apps & Offers</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Install & Earn High Rewards</span>
                </Link>

                <Link href="/refer" className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '120px', cursor: 'pointer', gridColumn: 'span 2' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '10px', color: '#8b5cf6' }}>
                        <Users size={24} />
                    </div>
                    <span style={{ fontWeight: '600' }}>Refer & Earn</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Get 10% Commission Forever</span>
                </Link>
            </div>

            {/* Special Offers Section */}
            {offers.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎁</span> Special Offers
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {offers.map((offer: any) => (
                            <div key={offer.id}
                                onClick={() => openOffer(offer)}
                                className="card"
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)', width: 'fit-content',
                                        padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px'
                                    }}>
                                        LIMITED TIME
                                    </div>
                                    <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '4px' }}>{offer.title}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                        Scratch & Win up to 250,000 Points!
                                    </p>
                                </div>
                                {/* Decorative Circles */}
                                <div style={{
                                    position: 'absolute', right: '-20px', bottom: '-20px',
                                    width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h3>Quick Stats</h3>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <TrendingUp color="var(--primary)" />
                    <div>
                        <p style={{ color: 'white', fontWeight: '500' }}>Earning Rate</p>
                        <p style={{ fontSize: '0.8rem' }}>High (Top 10% users)</p>
                    </div>
                </div>
            </div>

            <div
                className="card"
                style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #0088cc 0%, #0077b5 100%)', // Telegram colors
                    textAlign: 'center',
                    marginTop: '1rem',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
                onClick={() => window.open('https://t.me/earnifyrewards?direct', '_blank')}
            >
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-2.805 1.077-2.916 2.806-.387 3.637l5.222 1.905-.004.008 7.382-6.526c.49-.434.935-.119.53.25l-6.136 5.89-.005.004.005.003L9.6 15l4.897 3.63c2.404 1.761 3.513 1.442 4.122-1.427l3.96-15.684a2.25 2.25 0 0 0-1.381-1.086z" /></svg>
                </div>
                <h3 style={{ color: 'white' }}>Customer Support</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    Need help? Chat with us directly on Telegram.
                </p>
            </div>
            {/* Daily Reviews Section */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⭐</span> User Reviews
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {reviews.map((review, i) => (
                        <div key={i} className="card" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: `hsl(${Math.random() * 360}, 70%, 50%)`,
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1.2rem'
                                }}>
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {review.name} <span style={{ color: '#3b82f6', fontSize: '0.8rem' }}>Verified</span>
                                    </div>
                                    <div style={{ color: '#fbbf24', fontSize: '0.8rem' }}>★★★★★</div>
                                </div>
                            </div>
                            <p style={{ color: '#d1d5db', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                "{review.text}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Floating Lucky Draw Button */}
                <div
                    onClick={() => router.push('/lucky-draw')}
                    style={{
                        position: 'fixed',
                        bottom: '150px', // Raised to avoid overlap with Refer button
                        right: '20px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', // Purple (Lucky)
                        color: 'white',
                        width: '55px', // Slightly smaller
                        height: '55px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                        cursor: 'pointer',
                        zIndex: 90,
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <span style={{ fontSize: '1.6rem' }}>🎟️</span>
                </div>
            </div>
        </div>
    );
}
