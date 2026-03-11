'use client';

import { useAuth } from '@/context/AuthContext';
import { DbService } from '@/services/dbService';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WalletPage() {
    const { user, refreshUser } = useAuth();
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
    const [accountNo, setAccountNo] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [items, setItems] = useState<any[]>([]);

    // Confirmation Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false); // To toggle full history logic

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                const withdrawals = await DbService.getWithdrawals(user.id);
                const transactions = await DbService.getTransactions(user.id);
                // Filter out non-financial notifications
                const financialTransactions = transactions.filter(t =>
                    !['TASK_REMINDER', 'ADMIN_WARNING'].includes(t.type)
                );

                // Format withdrawals to match transaction shape for display
                const withdrawItems = withdrawals.map(w => ({
                    id: w.id,
                    type: 'WITHDRAWAL',
                    amount: w.points, // Show points in history logic
                    description: `Withdrawal via ${w.method}`,
                    created_at: w.date,
                    status: w.status,
                    isWithdrawal: true
                }));

                // Combine and Sort
                const Combined = [...financialTransactions, ...withdrawItems].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setItems(Combined);
            };

            fetchData();
        }
    }, [user]);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const pointsToWithdraw = parseInt(amount) * 100; // 1 Rs = 100 Points
        if (pointsToWithdraw > user.balance) return alert('Insufficient Balance!');
        if (pointsToWithdraw < 10000) return alert('Minimum withdrawal is 100 Rs (10000 Points)');

        // Show Confirmation Modal
        setShowConfirm(true);
    };

    const confirmWithdrawal = async () => {
        if (!user || isSubmitting) return;
        setIsSubmitting(true);

        const params = {
            requestedAmount: parseInt(amount),
            pointsToWithdraw: parseInt(amount) * 100,
            tdsDeduction: parseInt(amount) * 0.20,
            finalPayout: parseInt(amount) * 0.80
        };

        try {
            // Note: We send 'pointsToWithdraw'. Server calculates TDS and Final Payout.
            await DbService.requestWithdrawal(user.id, params.pointsToWithdraw, {
                method,
                name,
                upiId: method === 'UPI' ? upiId : undefined,
                accountNo: method === 'BANK' ? accountNo : undefined,
                ifsc: method === 'BANK' ? ifsc : undefined
            });

            alert('Withdrawal Request Sent Successfully!');
            // Reset
            setAmount('');
            setName('');
            setUpiId('');
            setAccountNo('');
            setIfsc('');
            setShowConfirm(false);
            await refreshUser(); // Update balance in UI
            // Force reload items to show new pending request immediately
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ position: 'relative' }}>
            <h1>My Wallet</h1>

            <div className="card" style={{ background: '#1f2937' }}>
                <p>Current Balance</p>
                <h2 style={{ color: 'var(--primary)', fontSize: '2rem' }}>₹{(user?.balance || 0) / 100}</h2>
                <p style={{ fontSize: '0.8rem' }}>{user?.balance} Points</p>
            </div>

            <div className="card">
                <h3>Request Withdrawal</h3>
                <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>100 Points = ₹1.00</p>
                <form onSubmit={handleInitialSubmit}>
                    <input
                        className="input"
                        placeholder="Amount (in Rupees)"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        min="10"
                    />

                    <input
                        className="input"
                        placeholder="Account Holder Name / Name on UPI"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ marginTop: '10px' }}
                    />


                    {/* Method Selector */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', marginTop: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio" name="method" value="UPI"
                                checked={method === 'UPI'} onChange={() => setMethod('UPI')}
                            />
                            UPI ID
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio" name="method" value="BANK"
                                checked={method === 'BANK'} onChange={() => setMethod('BANK')}
                            />
                            Bank Transfer
                        </label>
                    </div>

                    {method === 'UPI' ? (
                        <input
                            className="input"
                            placeholder="UPI ID (e.g. 9876543210@ybl)"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            required
                        />
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input
                                className="input"
                                placeholder="Account Number"
                                value={accountNo}
                                onChange={e => setAccountNo(e.target.value)}
                                required
                            />
                            <input
                                className="input"
                                placeholder="IFSC Code"
                                value={ifsc}
                                onChange={e => setIfsc(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Withdraw Money</button>
                </form>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} /> Transaction History
            </h3>

            {
                items.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '1rem' }}>No transactions yet.</p>
                ) : (
                    <>
                        {items.slice(0, showAllHistory ? undefined : 5).map(item => (
                            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '600', color: 'white' }}>
                                        {item.isWithdrawal ? 'Withdrawal Request' : item.type.replace('_', ' ')}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{item.description}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{new Date(item.created_at).toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        fontWeight: 'bold',
                                        color: item.isWithdrawal || item.amount < 0 ? '#ef4444' : '#10b981',
                                        fontSize: '1.1rem'
                                    }}>
                                        {item.isWithdrawal || item.amount < 0 ? '-' : '+'}{Math.abs(item.amount)}
                                    </p>
                                    {item.isWithdrawal && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            display: 'inline-block',
                                            background: item.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : item.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                            color: item.status === 'APPROVED' ? '#10b981' : item.status === 'REJECTED' ? '#ef4444' : '#fbbf24'
                                        }}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {!showAllHistory && items.length > 5 && (
                            <button
                                className="btn"
                                style={{ width: '100%', marginTop: '10px', background: '#374151', color: '#e5e7eb' }}
                                onClick={() => setShowAllHistory(true)}
                            >
                                See Details (View All)
                            </button>
                        )}
                    </>
                )
            }

            {/* TDS Confirmation Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '350px', border: '1px solid #374151', padding: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>Confirm Withdrawal</h2>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                            <span style={{ color: '#9ca3af' }}>Requested Amount:</span>
                            <span style={{ fontWeight: 'bold' }}>₹{amount}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ color: '#ef4444' }}>Less: 20% TDS:</span>
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>- ₹{(parseInt(amount) * 0.20).toFixed(0)}</span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '15px', textAlign: 'right' }}>*As per new Government Tax Policy</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #374151' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Net Payable:</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#10b981' }}>₹{(parseInt(amount) * 0.80).toFixed(0)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                            <button className="btn" style={{ flex: 1, background: '#374151' }} onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={confirmWithdrawal}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm & Withdraw'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
