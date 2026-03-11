'use client';

import { useAuth } from '@/context/AuthContext';
import { DbService } from '@/services/dbService';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import { useEffect, useState } from 'react';

export default function AdminAppsPage() {
    const { isAdmin } = useAuth();
    const router = useRouter();
    const [apps, setApps] = useState<any[]>([]);
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);

    // New App Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [reward, setReward] = useState('5000');
    const [category, setCategory] = useState('APPS'); // Default category

    // Edit Mode State
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const appsData = await DbService.getApps();
        setApps(appsData);

        const tasksData = await DbService.getPendingAppTasks();
        setPendingTasks(tasksData);
    };

    const handleAddApp = async (e: React.FormEvent) => {
        e.preventDefault();

        const appData = {
            title,
            description,
            link,
            reward: parseInt(reward),
            category
        };

        if (editMode && editId) {
            await DbService.updateApp(editId, appData);
            alert('App Updated');
            setEditMode(false);
            setEditId(null);
        } else {
            await DbService.addApp(appData);
            alert('App Added');
        }

        // Reset Form
        setTitle('');
        setDescription('');
        setLink('');
        setCategory('APPS');
        loadData();
    };

    const handleEditApp = (app: any) => {
        setTitle(app.title);
        setDescription(app.description);
        setLink(app.link);
        setReward(app.reward.toString());
        setCategory(app.category);

        setEditMode(true);
        setEditId(app.id);

        // Scroll to form (optional, but good UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteApp = async (id: string) => {
        if (!confirm('Delete this app?')) return;
        await DbService.deleteApp(id);
        loadData();
    };

    const handleTaskAction = async (taskId: string, userId: string, rewardAmount: number, action: 'APPROVED' | 'REJECTED') => {
        let reason = '';
        if (action === 'REJECTED') {
            const input = prompt("Enter Rejection Reason (e.g., 'Fake Screenshot', 'Task Incomplete'):");
            if (input === null) return; // Cancelled
            reason = input.trim() || 'Verification Failed';
        } else {
            if (!confirm(`Are you sure you want to APPROVED this task?`)) return;
        }

        await DbService.processAppTask(taskId, userId, rewardAmount, action, reason);
        loadData(); // Refresh list
    };

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Apps & Tasks</h1>
                <button onClick={() => router.push('/admin')} className="btn">&larr; Dashboard</button>
            </div>

            {/* 1. Add New App */}
            <section className="card" style={{ marginBottom: '2rem' }}>
                <h2>{editMode ? 'Edit App Offer' : 'Add New App Offer'}</h2>
                <form onSubmit={handleAddApp} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text" placeholder="App Title" className="input"
                        value={title} onChange={e => setTitle(e.target.value)} required
                    />
                    <input
                        type="text" placeholder="Description (e.g. Install and Signup)" className="input"
                        value={description} onChange={e => setDescription(e.target.value)} required
                    />
                    <input
                        type="url" placeholder="App Link (Play Store / APK)" className="input"
                        value={link} onChange={e => setLink(e.target.value)} required
                    />
                    <input
                        type="number" placeholder="Reward Points" className="input"
                        value={reward} onChange={e => setReward(e.target.value)} required
                    />
                    <select
                        className="input"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="APPS">Apps</option>
                        <option value="BANK">Bank Accounts</option>
                        <option value="DEMAT">Demat Accounts</option>
                        <option value="HOT">Hot Projects</option>
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editMode ? 'Update Offer' : 'Add Offer'}
                        </button>
                        {editMode && (
                            <button
                                type="button"
                                className="btn"
                                style={{ background: '#374151', width: 'auto' }}
                                onClick={() => {
                                    setEditMode(false);
                                    setEditId(null);
                                    setTitle('');
                                    setDescription('');
                                    setLink('');
                                    setCategory('APPS');
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* 2. Pending Tasks */}
                <section>
                    <h2>Pending Verifications ({pendingTasks.length})</h2>
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                        {pendingTasks.map((task: any) => (
                            <div key={task.id} className="card">
                                <p><strong>User:</strong> {task.users?.name} ({task.users?.mobile})</p>
                                <p><strong>App:</strong> {task.apps?.title}</p>
                                <p><strong>Reward:</strong> {task.apps?.reward}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        className="btn"
                                        style={{ background: '#10b981', color: 'white' }}
                                        onClick={() => handleTaskAction(task.id, task.user_id, task.apps?.reward, 'APPROVED')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ background: '#ef4444', color: 'white' }}
                                        onClick={() => handleTaskAction(task.id, task.user_id, task.apps?.reward, 'REJECTED')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && <p style={{ color: 'var(--text-gray)' }}>No pending tasks.</p>}
                    </div>
                </section>

                {/* 3. Active Apps List */}
                <section>
                    <h2>Active Apps</h2>
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                        {apps.map(app => (
                            <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>{app.title}</strong>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px',
                                        backgroundColor: '#374151', marginLeft: '8px', color: '#d1d5db'
                                    }}>
                                        {app.category}
                                    </span>
                                    <br />
                                    <small>{app.reward} Pts</small>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn"
                                        onClick={() => handleEditApp(app)}
                                        style={{ background: '#3b82f6', color: 'white', padding: '6px 12px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => handleDeleteApp(app.id)}
                                        style={{ background: '#ef4444', color: 'white', padding: '6px 12px' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
