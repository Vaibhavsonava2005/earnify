'use client';

import { useAuth } from '@/context/AuthContext';
import { DbService } from '@/services/dbService';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LuckyDrawPage() {
    const { user, refreshUser } = useAuth();
    const [draws, setDraws] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            loadDraws();
            const interval = setInterval(() => {
                setDraws(prev => [...prev]); // Force re-render for countdown
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadDraws = async () => {
        const data = await DbService.getLuckyDraws(user?.id);
        setDraws(data);
        setLoading(false);
    };

    const handleEnter = async (draw: any) => {
        if (!user) return;

        if (user.balance < draw.entryFee) {
            alert('Insufficient Balance! Perform tasks to earn points.');
            return;
        }

        if (confirm(`Confirm Entry Fee: ${draw.entryFee} Points?\n\nWin up to ${draw.prize}!`)) {
            const res = await DbService.enterLuckyDraw(user.id, draw.id, draw.entryFee);
            if (res.success) {
                alert('Entry Confirmed! Good Luck! 🍀');
                refreshUser();
                loadDraws();
            } else {
                alert(res.message);
            }
        }
    };

    // Helper for Countdown (Static for now, could be dynamic hook)
    // Helper for Countdown
    const getTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000); // Added seconds for precision

        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `${hours}h ${mins}m ${secs}s`;
    };

    return (
        <div className="container">
            <button onClick={() => router.back()} className="btn" style={{ marginBottom: '1rem' }}>&larr; Back</button>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎰 Lucky Draw</h1>
                <p style={{ color: '#d1d5db' }}>Participate to win massive jackpots daily!</p>
            </div>

            {loading ? <p style={{ textAlign: 'center' }}>Loading events...</p> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {draws.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                            <h2>No Active Draws</h2>
                            <p style={{ color: '#9ca3af' }}>Check back later for new contests!</p>
                        </div>
                    )}

                    {draws.map(draw => {
                        const isEnded = new Date(draw.endTime).getTime() < new Date().getTime();
                        const timeDisplay = getTimeLeft(draw.endTime);

                        return (
                            <div key={draw.id} className="card" style={{
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95))',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Decoration */}
                                <div style={{
                                    position: 'absolute', top: -20, right: -20,
                                    width: '100px', height: '100px',
                                    background: 'rgba(251, 191, 36, 0.1)', borderRadius: '50%', filter: 'blur(20px)'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>🎁</span>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{draw.title}</h3>
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Prize Pool</div>
                                                <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1.2rem' }}>{draw.prize} Pts</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Entry Fee</div>
                                                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>{draw.entryFee} Pts</div>
                                            </div>
                                        </div>

                                        {!isEnded && !draw.announced && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f87171' }}>
                                                <Clock size={16} />
                                                <span style={{ fontWeight: 'bold' }}>Ends in: {timeDisplay}</span>
                                            </div>
                                        )}
                                        {isEnded && !draw.announced && (
                                            <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                                ⏳ Calculating Results...
                                            </div>
                                        )}
                                        {draw.announced && (
                                            <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Trophy size={18} /> Winner Announced!
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '150px' }}>
                                        {draw.hasEntered ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                                                    padding: '10px 20px', borderRadius: '8px', marginBottom: '5px',
                                                    display: 'flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    <CheckCircle size={20} /> Entry Confirmed
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Result next day!</span>
                                            </div>
                                        ) : isEnded ? (
                                            <button disabled className="btn" style={{ background: '#374151', color: '#9ca3af' }}>
                                                Entry Closed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEnter(draw)}
                                                className="btn btn-primary"
                                                style={{
                                                    fontSize: '1.1rem', padding: '12px 25px',
                                                    background: 'linear-gradient(to right, #f59e0b, #d97706)',
                                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                                                }}
                                            >
                                                Enter Now
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
