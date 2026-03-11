'use client';

import { useState, useEffect } from 'react';
import { DbService } from '@/services/dbService';
import { User } from '@/services/mockData';
import { Loader2, Search, Ban, ShieldAlert, Trash2, RotateCcw, CheckCircle, BadgeIndianRupee, Bell } from 'lucide-react';

export default function AdminUsersPage() {
    // ... items ...
    const [remindUserId, setRemindUserId] = useState<string | null>(null);
    const [reminderMessage, setReminderMessage] = useState('');

    const handleRemind = async () => {
        if (!reminderMessage) return alert('Please enter a reminder message');
        await DbService.adminTaskReminder(remindUserId!, reminderMessage);
        alert('Reminder Sent');
        setRemindUserId(null); // Close modal
        setReminderMessage('');
    };

    // ... inside return ...
    // ... inside return ...
    // Note: The previous JSX was misplaced here by mistake. Removing it.

    // ...

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [warnUserId, setWarnUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await DbService.getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBan = async (userId: string, currentRole: string) => {
        if (currentRole === 'BANNED') {
            if (confirm('Unban this user?')) {
                await DbService.adminUnbanUser(userId);
                alert('User Unbanned');
                fetchUsers();
            }
        } else {
            if (confirm('Ban this user? They will not be able to login.')) {
                await DbService.adminBanUser(userId);
                alert('User Banned');
                fetchUsers();
            }
        }
    };

    const handleRevoke = async (userId: string) => {
        if (confirm('Are you sure you want to RESET this user\'s balance to 0? This cannot be undone.')) {
            await DbService.adminRevokeBalance(userId);
            alert('Balance Revoked');
            fetchUsers();
        }
    };

    const handleDelete = async (userId: string) => {
        const confirm1 = confirm('DELETE USER? This is permanent.');
        if (confirm1) {
            const confirm2 = confirm('Are you absolutely sure? All data will be lost.');
            if (confirm2) {
                await DbService.adminDeleteUser(userId);
                alert('User Deleted');
                fetchUsers();
            }
        }
    };

    const handleWarn = async (userId: string) => {
        if (!warningMessage) return alert('Please enter a warning message');
        await DbService.adminWarnUser(userId, warningMessage);
        alert('Warning Sent');
        setWarnUserId(null); // Close modal
        setWarningMessage('');
    };

    const [manageBalanceUserId, setManageBalanceUserId] = useState<string | null>(null);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceReason, setBalanceReason] = useState('');

    const handleManageBalance = async () => {
        const amount = parseInt(balanceAmount);
        if (isNaN(amount) || amount === 0) return alert('Please enter a valid non-zero amount');
        if (!balanceReason) return alert('Please enter a reason');

        // Use 'ADMIN_ADJUSTMENT' for strict typing in mockData, or 'REFUND'/'GENERIC' if loose.
        await DbService.updateBalance(manageBalanceUserId!, amount, 'ADMIN_ADJUSTMENT', balanceReason);

        alert('Balance Updated Successfully');
        setManageBalanceUserId(null);
        setBalanceAmount('');
        setBalanceReason('');
        fetchUsers();
    };

    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');

    const handleBroadcast = async () => {
        if (!broadcastMessage) return alert('Enter a message');
        if (confirm('Are you sure you want to send this to ALL users?')) {
            try {
                await DbService.broadcastReminder(broadcastMessage);
                alert('Broadcast Sent Successfully!');
                setBroadcastOpen(false);
                setBroadcastMessage('');
            } catch (e) {
                alert('Error sending broadcast');
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.includes(searchQuery)
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>User Management</h1>

            {/* Search */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div className="input-group" style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#1f2937', padding: '10px', borderRadius: '8px' }}>
                    <Search size={20} color="#9ca3af" />
                    <input
                        style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '10px', width: '100%', outline: 'none' }}
                        placeholder="Search by Name or Mobile..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
                <button
                    className="btn"
                    style={{ background: '#8b5cf6', color: 'white', border: 'none' }}
                    onClick={() => setBroadcastOpen(true)}
                >
                    📢 Broadcast
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                                <th style={{ padding: '10px' }}>User</th>
                                <th style={{ padding: '10px' }}>Mobile</th>
                                <th style={{ padding: '10px' }}>PIN</th>
                                <th style={{ padding: '10px' }}>Balance</th>
                                <th style={{ padding: '10px' }}>Tasks</th>
                                <th style={{ padding: '10px' }}>Referrals</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {user.id.substr(0, 6)}</div>
                                    </td>
                                    <td style={{ padding: '10px' }}>{user.mobile}</td>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#e5e7eb' }}>{user.pin}</td>
                                    <td style={{ padding: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{user.balance.toLocaleString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            background: (user.taskCount || 0) > 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.taskCount || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>{user.referralCount || 0}</td>
                                    <td style={{ padding: '10px' }}>
                                        {user.role === 'BANNED' ? (
                                            <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>BANNED</span>
                                        ) : (
                                            <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>ACTIVE</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'right', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                        {/* Warn */}
                                        <button
                                            title="Send Warning"
                                            onClick={() => setWarnUserId(user.id)}
                                            style={{ padding: '5px', borderRadius: '4px', background: '#f59e0b', border: 'none', cursor: 'pointer' }}
                                        >
                                            <ShieldAlert size={16} color="white" />
                                        </button>

                                        {/* Remind */}
                                        <button
                                            title="Send Task Reminder"
                                            onClick={() => setRemindUserId(user.id)}
                                            style={{ padding: '5px', borderRadius: '4px', background: '#8b5cf6', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Bell size={16} color="white" />
                                        </button>

                                        {/* Manage Balance */}
                                        <button
                                            title="Add/Deduct Balance"
                                            onClick={() => setManageBalanceUserId(user.id)}
                                            style={{ padding: '5px', borderRadius: '4px', background: '#3b82f6', border: 'none', cursor: 'pointer' }}
                                        >
                                            <BadgeIndianRupee size={16} color="white" />
                                        </button>

                                        {/* Revoke */}
                                        <button
                                            title="Revoke Balance (Set to 0)"
                                            onClick={() => handleRevoke(user.id)}
                                            style={{ padding: '5px', borderRadius: '4px', background: '#6366f1', border: 'none', cursor: 'pointer' }}
                                        >
                                            <RotateCcw size={16} color="white" />
                                        </button>

                                        {/* Ban/Unban */}
                                        <button
                                            title={user.role === 'BANNED' ? "Unban User" : "Ban User"}
                                            onClick={() => handleBan(user.id, user.role)}
                                            style={{ padding: '5px', borderRadius: '4px', background: user.role === 'BANNED' ? '#10b981' : '#ef4444', border: 'none', cursor: 'pointer' }}
                                        >
                                            {user.role === 'BANNED' ? <CheckCircle size={16} color="white" /> : <Ban size={16} color="white" />}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            title="Delete User Permanently"
                                            onClick={() => handleDelete(user.id)}
                                            style={{ padding: '5px', borderRadius: '4px', background: '#374151', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} color="white" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reminder Modal */}
            {remindUserId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>Send Task Reminder</h3>
                        <p style={{ marginBottom: '10px', color: '#9ca3af' }}>Remind user to complete a step (e.g. "Deposit ₹100").</p>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="e.g. Complete 1st Payment in Jupiter App..."
                            value={reminderMessage}
                            onChange={e => setReminderMessage(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="btn" style={{ flex: 1, background: '#374151' }} onClick={() => setRemindUserId(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleRemind}>Send Reminder</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Balance Modal */}
            {manageBalanceUserId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>Manage Balance</h3>
                        <p style={{ marginBottom: '10px', color: '#9ca3af' }}>Add (positive) or Deduct (negative) points.</p>

                        <input
                            type="number"
                            className="input"
                            placeholder="Amount (e.g. 500 or -500)"
                            value={balanceAmount}
                            onChange={e => setBalanceAmount(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />

                        <textarea
                            className="input"
                            rows={3}
                            placeholder="Reason (e.g. Bonus, Correction, Spam Penalty)"
                            value={balanceReason}
                            onChange={e => setBalanceReason(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="btn" style={{ flex: 1, background: '#374151' }} onClick={() => setManageBalanceUserId(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleManageBalance}>Update Balance</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Modal */}
            {warnUserId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>Send Warning</h3>
                        <p style={{ marginBottom: '10px', color: '#9ca3af' }}>This will appear on the user's dashboard.</p>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="e.g. Stop making fake referrals or you will be banned."
                            value={warningMessage}
                            onChange={e => setWarningMessage(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="btn" style={{ flex: 1, background: '#374151' }} onClick={() => setWarnUserId(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleWarn(warnUserId)}>Send Warning</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Modal */}
            {broadcastOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3>📢 Broadcast Message</h3>
                        <p style={{ marginBottom: '10px', color: '#9ca3af' }}>Send a notification to ALL users.</p>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="e.g. Server maintenance in 10 mins..."
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button className="btn" style={{ flex: 1, background: '#374151' }} onClick={() => setBroadcastOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBroadcast}>Send to All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
