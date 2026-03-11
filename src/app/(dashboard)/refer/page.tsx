'use client';

import { useAuth } from '@/context/AuthContext';
import { Copy, Gift, Users } from 'lucide-react';
import { DbService } from '@/services/dbService';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ReferPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [referralLink, setReferralLink] = useState('');
    const [spinStatus, setSpinStatus] = useState<any>(null);
    const [spinning, setSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);

    // Initial Link Setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const code = user?.mobile || 'JOIN'; // Use Mobile Number as Code
            setReferralLink(`${window.location.origin}/login?ref=${code}`);
        }
    }, [user]);

    // Fast Check Spin Status
    const checkSpin = async () => {
        if (user) {
            const status = await DbService.getSpinStatus(user.id);
            setSpinStatus(status);
        }
    };

    useEffect(() => {
        checkSpin();
    }, [user]);

    // Auto Share Logic
    useEffect(() => {
        const autoShare = searchParams.get('autoShare');
        if (autoShare === 'true' && user && referralLink) {
            // Slight delay to ensure UI is visible first
            const timer = setTimeout(() => {
                handleNativeShare();
                // Remove param so it doesn't trigger again on refresh
                router.replace('/refer');
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [searchParams, user, referralLink]);

    const copyToClipboard = () => {
        if (user?.mobile) {
            navigator.clipboard.writeText(user.mobile);
            alert('Referral Code Copied!');
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Earnify',
                    text: `Join me on Earnify and earn money watching ads! Use my code ${user?.mobile} to get 500 points bonus!`,
                    url: referralLink
                });
            } catch (err) {
                console.log('Share cancelled or failed', err);
            }
        } else {
            // Fallback for desktop: Copy link
            navigator.clipboard.writeText(user?.mobile || '');
            alert('Referral Code Copied to Clipboard!');
        }
    };

    const handleSpin = async (milestone: 3 | 10) => {
        if (spinning) return;
        setSpinning(true);

        const segments = [100, 200, 400, 600, 1000, 1900, 2500, 3500];
        const targetValue = milestone === 3 ? 100 : 400;
        const targetIndex = segments.indexOf(targetValue);
        const fullRotations = 360 * (5 + Math.floor(Math.random() * 5));
        const stopAngle = 360 - (targetIndex * 45);
        const totalRotation = wheelRotation + fullRotations + stopAngle;

        setWheelRotation(totalRotation);
        playTickSound(3000);

        setTimeout(async () => {
            setSpinning(false);
            await DbService.claimSpinReward(user!.id, milestone);
            checkSpin(); // Refresh status (disables button)
            alert(`Congratulations! You won ${targetValue} Points!`);
        }, 5000); // 5s animation
    };

    const playTickSound = (duration: number) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';

            // Ratchet effect
            let i = 0;
            const interval = setInterval(() => {
                i++;
                if (i * 100 > duration) clearInterval(interval);
                osc.frequency.setValueAtTime(200 + Math.random() * 100, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            }, 100);

            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, duration);
        } catch (e) {
            console.error('Audio error', e);
        }
    }

    return (
        <div className="container">
            <h1>Refer & Earn</h1>

            {/* Invite Friends Card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', border: 'none', textAlign: 'center', padding: '2rem 1rem' }}>
                <Gift size={48} color="white" style={{ marginBottom: '1rem' }} />
                <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Invite Friends & Earn</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Get <strong style={{ color: '#fbbf24' }}>10% commission</strong> of your friend's earnings forever!
                    <br />
                    Your friend gets <strong style={{ color: '#fbbf24' }}>500 Points</strong> instantly.
                </p>
            </div>

            {/* SPIN WHEEL SECTION */}
            {spinStatus && (
                <div className="card" style={{ marginTop: '20px', textAlign: 'center', background: '#111827', border: '1px solid #374151' }}>
                    <h3 style={{ color: '#fbbf24' }}>🎉 Bonus Spin Wheel</h3>

                    <div style={{ position: 'relative', width: '250px', height: '250px', margin: '20px auto', overflow: 'hidden', borderRadius: '50%', border: '5px solid #fbbf24' }}>
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'conic-gradient(#ef4444 0deg 45deg, #f97316 45deg 90deg, #f59e0b 90deg 135deg, #eab308 135deg 180deg, #84cc16 180deg 225deg, #10b981 225deg 270deg, #06b6d4 270deg 315deg, #3b82f6 315deg 360deg)',
                            borderRadius: '50%',
                            transform: `rotate(${wheelRotation}deg)`,
                            transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)'
                        }}>
                            {[100, 200, 400, 600, 1000, 10000, 2500, 3500].map((val, i) => (
                                <span key={i} style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: `rotate(${i * 45 + 22.5}deg) translate(0, -90px) rotate(-${i * 45 + 22.5}deg)`,
                                    color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
                                    textShadow: '0 1px 2px black'
                                }}>
                                    {val}
                                </span>
                            ))}
                        </div>
                        <div style={{
                            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid white',
                            zIndex: 10
                        }} />
                    </div>

                    <p style={{ marginBottom: '10px' }}>Referrals: {spinStatus.referralCount}</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <div>
                            <button
                                className="btn"
                                disabled={spinStatus.claimed3 || spinning}
                                onClick={() => spinStatus.canSpin3 ? handleSpin(3) : handleNativeShare()}
                                style={{
                                    background: spinStatus.claimed3 ? '#374151' : spinStatus.canSpin3 ? '#10b981' : '#dc2626',
                                    opacity: spinStatus.claimed3 ? 0.6 : 1,
                                    color: 'white', fontWeight: 'bold', fontSize: '1rem', padding: '12px',
                                    cursor: spinStatus.claimed3 ? 'default' : 'pointer'
                                }}
                            >
                                {spinStatus.claimed3 ? 'Claimed (100)' : spinStatus.canSpin3 ? 'Spin (3 Refs)' : '🔒 Share to Unlock (3 Refs)'}
                            </button>
                        </div>

                        <div>
                            <button
                                className="btn"
                                disabled={spinStatus.claimed10 || spinning}
                                onClick={() => spinStatus.canSpin10 ? handleSpin(10) : handleNativeShare()}
                                style={{
                                    background: spinStatus.claimed10 ? '#374151' : spinStatus.canSpin10 ? '#8b5cf6' : '#dc2626',
                                    opacity: spinStatus.claimed10 ? 0.6 : 1,
                                    color: 'white', fontWeight: 'bold', fontSize: '1rem', padding: '12px',
                                    cursor: spinStatus.claimed10 ? 'default' : 'pointer'
                                }}
                            >
                                {spinStatus.claimed10 ? 'Claimed (400)' : spinStatus.canSpin10 ? 'Spin (10 Refs)' : '🔒 Share to Unlock (10 Refs)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Referral Link & Code Section */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-gray)' }}>YOUR REFERRAL LINK</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#1f2937', padding: '10px', borderRadius: '8px', border: '1px border #374151', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#9ca3af' }}>
                        {referralLink}
                    </span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            alert('Link Copied!');
                        }}
                        className="btn"
                        style={{ padding: '8px', width: 'auto', background: 'var(--primary)' }}
                    >
                        <Copy size={20} />
                    </button>
                </div>

                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-gray)' }}>YOUR CODE</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#1f2937', padding: '10px', borderRadius: '8px', border: '1px border #374151' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', flex: 1, textAlign: 'center' }}>
                        {user?.mobile || 'LOADING...'}
                    </span>
                    <button
                        onClick={handleNativeShare}
                        className="btn"
                        style={{ padding: '8px', width: 'auto', background: '#8b5cf6' }}
                    >
                        Share
                    </button>
                </div>
            </div>

            <div className="card">
                <h3>How it works?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#8b5cf6' }}>1</div>
                        <p style={{ fontSize: '0.9rem' }}>Share your code with friends.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#8b5cf6' }}>2</div>
                        <p style={{ fontSize: '0.9rem' }}>They enter code during signup.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#8b5cf6' }}>3</div>
                        <p style={{ fontSize: '0.9rem' }}>You earn 10% of their task earnings!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
