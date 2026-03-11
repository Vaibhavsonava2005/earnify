'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PromoPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkPopup = () => {
            const lastShown = localStorage.getItem('earnify_popup_last_shown');
            const now = Date.now();
            const OneDay = 12 * 60 * 60 * 1000; // 12 Hours

            if (!lastShown || now - parseInt(lastShown) > OneDay) {
                // Show after small delay for effect
                setTimeout(() => setIsVisible(true), 1500);
            }
        };
        checkPopup();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('earnify_popup_last_shown', Date.now().toString());
    };

    const handleAction = () => {
        handleClose();
        router.push('/refer');
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="card" style={{
                background: '#1f2937',
                border: '1px solid #374151',
                maxWidth: '400px',
                width: '100%',
                position: 'relative',
                animation: 'slideUp 0.3s ease-out'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎡</div>
                    <h2 style={{ color: '#fbbf24', marginBottom: '10px' }}>Spin & Win Big!</h2>
                    <p style={{ color: '#e5e7eb', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Refer friends and unlock the <b>Golden Spin Wheel</b>!
                    </p>
                    <ul style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                        <li style={{ marginBottom: '8px' }}>✅ 3 Referrals = <b>Win up to 3,500 Points!</b></li>
                        <li>✅ 10 Referrals = <b>Win up to 10,000 Points!</b></li>
                    </ul>

                    <button
                        onClick={handleAction}
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(to right, #8b5cf6, #6d28d9)', fontSize: '1.1rem', padding: '12px' }}
                    >
                        Spin the Wheel Now!
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px' }}>Limited time offer. Terms apply.</p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
