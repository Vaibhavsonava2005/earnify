'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DbService } from '@/services/dbService';
import { Trophy, Clock, Users, Plus, Trash2, Eye, CheckCircle } from 'lucide-react';

export default function AdminLuckyDrawPage() {
    const router = useRouter();
    const [draws, setDraws] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [entryFee, setEntryFee] = useState('10');
    const [prize, setPrize] = useState('1000');
    const [hours, setHours] = useState('24');

    // Participant View
    const [viewingParticipants, setViewingParticipants] = useState<string | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await DbService.getLuckyDraws();
        setDraws(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + parseInt(hours));

        try {
            await DbService.createLuckyDraw({
                title,
                entryFee: parseInt(entryFee),
                endTime: endTime.toISOString(),
                prize: parseInt(prize)
            });
            alert('Lucky Draw Created!');
            setTitle('');
            loadData();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this Lucky Draw?')) return;
        await DbService.deleteLuckyDraw(id);
        loadData();
    };

    const loadParticipants = async (drawId: string) => {
        if (viewingParticipants === drawId) {
            setViewingParticipants(null);
            return;
        }
        setViewingParticipants(drawId);
        const data = await DbService.getDrawParticipants(drawId);
        setParticipants(data);
    };

    const handlePickWinner = async (drawId: string, userId: string, prizeAmount: number) => {
        if (!confirm('Are you sure you want to pick this winner and credit the prize?')) return;
        try {
            await DbService.pickDrawWinner(drawId, userId, prizeAmount);
            alert('Winner Picked and Prize Credited!');
            loadData();
            setViewingParticipants(null);
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Lucky Draws</h1>
                <button onClick={() => router.push('/admin')} className="btn">&larr; Dashboard</button>
            </div>

            {/* Create Form */}
            <section className="card" style={{ marginBottom: '2rem' }}>
                <h2>Create New Event</h2>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text" placeholder="Title (e.g. Weekly Jackpot)" className="input"
                        value={title} onChange={e => setTitle(e.target.value)} required
                    />
                    <input
                        type="number" placeholder="Prize Amount" className="input"
                        value={prize} onChange={e => setPrize(e.target.value)} required
                    />
                    <input
                        type="number" placeholder="Entry Fee" className="input"
                        value={entryFee} onChange={e => setEntryFee(e.target.value)} required
                    />
                    <input
                        type="number" placeholder="Duration (Hours)" className="input"
                        value={hours} onChange={e => setHours(e.target.value)} required
                    />
                    <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
                        Create Lucky Draw
                    </button>
                </form>
            </section>

            {/* List of Draws */}
            <section>
                <h2>Active & Past Events</h2>
                <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                    {loading ? <p>Loading...</p> : draws.map(draw => {
                        const isEnded = new Date(draw.endTime) < new Date();
                        return (
                            <div key={draw.id} className="card" style={{ borderLeft: `4px solid ${isEnded ? '#9ca3af' : '#fbbf24'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3>{draw.title}</h3>
                                        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                            Prize: {draw.prize} Pts | Fee: {draw.entryFee} Pts
                                        </p>
                                        <p style={{ fontSize: '0.85rem' }}>
                                            Ends: {new Date(draw.endTime).toLocaleString()}
                                        </p>
                                        {draw.announced && (
                                            <p style={{ color: '#10b981', fontWeight: 'bold', marginTop: '5px' }}>
                                                ✅ Results Announced
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn"
                                            style={{ background: '#3b82f6', color: 'white', padding: '6px 12px' }}
                                            onClick={() => loadParticipants(draw.id)}
                                        >
                                            <Eye size={16} /> Participants
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ background: '#ef4444', color: 'white', padding: '6px 12px' }}
                                            onClick={() => handleDelete(draw.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Participants View */}
                                {viewingParticipants === draw.id && (
                                    <div style={{ marginTop: '1.5rem', background: '#111827', padding: '1rem', borderRadius: '8px' }}>
                                        <h4>Candidates ({participants.length})</h4>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                                            {participants.map((p: any) => (
                                                <div key={p.userId} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '8px 0', borderBottom: '1px solid #374151'
                                                }}>
                                                    <div>
                                                        <p style={{ margin: 0 }}>{p.name}</p>
                                                        <small style={{ color: 'var(--text-gray)' }}>{p.mobile}</small>
                                                    </div>
                                                    {!draw.announced && isEnded && (
                                                        <button
                                                            className="btn"
                                                            style={{ background: '#10b981', color: 'white', fontSize: '0.8rem', padding: '4px 10px' }}
                                                            onClick={() => handlePickWinner(draw.id, p.userId, draw.prize)}
                                                        >
                                                            Winner
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {participants.length === 0 && <p style={{ color: 'var(--text-gray)' }}>No participants yet.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
