'use client';

import { DbService } from '@/services/dbService';
import { Withdrawal } from '@/services/mockData';
import { useEffect, useState } from 'react';

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

    const refresh = async () => {
        const data = await DbService.getWithdrawals();
        setWithdrawals(data.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()));
    };

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        await DbService.updateWithdrawalStatus(id, status);
        refresh();
    };

    return (
        <div className="container">
            <h3>Withdrawal Requests</h3>

            {withdrawals.length === 0 && <p>No requests found.</p>}

            {withdrawals.map(w => (
                <div key={w.id} className="card" style={{ borderLeft: `4px solid ${w.status === 'PENDING' ? '#fbbf24' : w.status === 'APPROVED' ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>₹{w.amount}</span>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(w.date).toLocaleDateString()}</span>
                    </div>
                    {w.method === 'BANK' ? (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <p><strong>Bank Transfer</strong></p>
                            <p>Acc: <span style={{ fontFamily: 'monospace' }}>{w.accountNo}</span></p>
                            <p>IFSC: <span style={{ fontFamily: 'monospace' }}>{w.ifsc}</span></p>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.9rem' }}>UPI: <span style={{ color: 'white' }}>{w.upiId || 'N/A'}</span></p>
                    )}
                    <p style={{ fontSize: '0.9rem' }}>Name: <strong style={{ color: '#fff' }}>{(w as any).accountHolderName}</strong></p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>User: <strong style={{ color: '#ddd' }}>{(w as any).userName}</strong> ({(w as any).userMobile})</p>

                    {w.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn"
                                style={{ background: '#10b981', color: 'white', padding: '8px' }}
                                onClick={() => handleAction(w.id, 'APPROVED')}
                            >
                                Approve
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#ef4444', color: 'white', padding: '8px' }}
                                onClick={() => handleAction(w.id, 'REJECTED')}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                    {w.status !== 'PENDING' && (
                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: w.status === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                            {w.status}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
