'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DbService } from '@/services/dbService';
import { supabase } from '@/lib/supabase';
import { Trash2, Trophy, Clock, Users, Plus, X, Eye } from 'lucide-react';

export default function AdminQuizPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']); // Start with 2 empty options
    const [fee, setFee] = useState('50');
    const [hours, setHours] = useState('24');

    // Participant View State
    const [viewingParticipants, setViewingParticipants] = useState<string | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);

    // Resolve State
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [resolveParticipants, setResolveParticipants] = useState<any[]>([]);
    const [winningOption, setWinningOption] = useState<string>('');

    useEffect(() => {
        // checkAdmin(); // Handled by Layout
        loadQuizzes();
    }, []);

    useEffect(() => {
        if (selectedQuiz) {
            // Load participants when modal opens to show counts
            DbService.getQuizParticipants(selectedQuiz.id).then(data => {
                setResolveParticipants(data);
            });
        } else {
            setResolveParticipants([]);
            setWinningOption('');
        }
    }, [selectedQuiz]);

    const loadQuizzes = async () => {
        const { data } = await supabase
            .from('apps')
            .select('*')
            .eq('category', 'QUIZ')
            .order('created_at', { ascending: false });

        if (data) {
            const parsed = data.map(q => {
                try { return { ...q, config: JSON.parse(q.description) }; }
                catch (e) { return q; }
            });
            setQuizzes(parsed);
        }
        setIsLoading(false);
    };

    const handleCreate = async () => {
        if (!title || !question || options.some(o => !o.trim())) return alert('Fill all fields');
        if (options.length < 2) return alert('Need at least 2 options');

        const endTime = new Date();
        endTime.setHours(endTime.getHours() + parseInt(hours));

        try {
            await DbService.createQuiz(
                title,
                question,
                options,
                parseInt(fee),
                endTime.toISOString()
            );
            alert('Quiz Created');
            resetForm();
            loadQuizzes();
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const resetForm = () => {
        setTitle(''); setQuestion(''); setOptions(['', '']);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 4) setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const loadParticipants = async (quizId: string) => {
        if (viewingParticipants === quizId) {
            setViewingParticipants(null); // Toggle off
            return;
        }
        setViewingParticipants(quizId);
        setParticipants([]); // Clear prev
        const data = await DbService.getQuizParticipants(quizId);
        setParticipants(data);
    };

    const handleResolve = async () => {
        if (!selectedQuiz || !winningOption) return;

        // Final Confirmation
        const winnerCount = resolveParticipants.filter(p => p.option === winningOption).length;
        const confirm = window.confirm(`Declare "${winningOption}" as Winner?\n\n${winnerCount} users will share the pool.`);
        if (!confirm) return;

        try {
            const res = await DbService.resolveQuiz(selectedQuiz.id, winningOption);
            if (res.success) {
                alert(`Resolved! ${res.winners} winners got ${res.prize} points each.`);
                setSelectedQuiz(null);
                loadQuizzes();
            } else {
                alert('Error: ' + res.message);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this Quiz?')) return;
        await DbService.deleteApp(id);
        loadQuizzes();
    };

    const handleManualPayout = async (userId: string, quizId: string) => {
        const amountStr = prompt('Enter Amount to Credit (e.g. 100):');
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount <= 0) return alert('Invalid Amount');

        try {
            await DbService.manualQuizPayout(userId, amount, quizId);
            alert(`Success! Credited ${amount} pts.`);
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#e5e7eb' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Prediction / Quiz Manager</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* CREATE FORM */}
                <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '15px' }}>Create New Quiz</h2>
                    <input className="input" placeholder="Event Title (e.g. IPL Final)" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: '10px', width: '100%', padding: '10px', background: '#374151', border: 'none', color: 'white', borderRadius: '6px' }} />
                    <textarea className="input" placeholder="Question (e.g. Who will win?)" value={question} onChange={e => setQuestion(e.target.value)} rows={3} style={{ marginBottom: '10px', width: '100%', padding: '10px', background: '#374151', border: 'none', color: 'white', borderRadius: '6px' }} />

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '5px', display: 'block' }}>Options (Min 2, Max 4)</label>
                        {options.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                                <input
                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    style={{ flex: 1, padding: '10px', background: '#374151', border: 'none', color: 'white', borderRadius: '6px' }}
                                />
                                {options.length > 2 && (
                                    <button onClick={() => removeOption(idx)} style={{ background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', padding: '0 10px', cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 4 && (
                            <button onClick={addOption} style={{ background: 'none', border: '1px dashed #6b7280', color: '#9ca3af', width: '100%', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <Plus size={16} /> Add Option
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem' }}>Entry Fee (Pts)</label>
                            <input type="number" value={fee} onChange={e => setFee(e.target.value)} style={{ width: '100%', padding: '10px', background: '#374151', border: 'none', color: 'white', borderRadius: '6px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem' }}>Duration (Hours)</label>
                            <input type="number" value={hours} onChange={e => setHours(e.target.value)} style={{ width: '100%', padding: '10px', background: '#374151', border: 'none', color: 'white', borderRadius: '6px' }} />
                        </div>
                    </div>

                    <button onClick={handleCreate} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Publish Quiz
                    </button>
                </div>

                {/* LIST */}
                <div style={{ display: 'grid', gap: '15px' }}>
                    {isLoading ? <p>Loading...</p> : quizzes.map(q => {
                        const isEnded = new Date() > new Date(q.config?.endTime);
                        const isResolved = !!q.config?.result;

                        return (
                            <div key={q.id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#fbbf24' }}>{q.title}</h3>
                                        <p style={{ color: '#9ca3af', marginBottom: '10px' }}>{q.config?.question}</p>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Users size={16} /> Pool: <b style={{ color: '#34d399' }}>{q.reward} Pts</b></span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} /> Ends: {new Date(q.config?.endTime).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {isResolved ? (
                                            <span style={{ background: '#10b981', color: '#064e3b', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                Won by: {q.config.result}
                                            </span>
                                        ) : isEnded ? (
                                            <button
                                                onClick={() => setSelectedQuiz(q)}
                                                style={{ background: '#f59e0b', color: 'white', padding: '6px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                            >
                                                Resolve Now
                                            </button>
                                        ) : (
                                            <span style={{ color: '#3b82f6', fontSize: '0.9rem' }}>• Active</span>
                                        )}
                                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button
                                                onClick={() => loadParticipants(q.id)}
                                                style={{ background: '#374151', padding: '6px 12px', borderRadius: '6px', border: 'none', color: viewingParticipants === q.id ? '#60a5fa' : '#e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                                            >
                                                <Eye size={16} /> {viewingParticipants === q.id ? 'Hide Bets' : 'View Bets'}
                                            </button>
                                            <button onClick={() => handleDelete(q.id)} style={{ background: '#ef4444', padding: '6px', borderRadius: '6px', border: 'none', color: 'white', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* PARTICIPANTS TABLE */}
                                {viewingParticipants === q.id && (
                                    <div style={{ marginTop: '15px', background: '#111827', padding: '15px', borderRadius: '8px', borderTop: '1px solid #374151' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#e5e7eb' }}>Participants ({participants.length})</h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ color: '#9ca3af', textAlign: 'left' }}>
                                                        <th style={{ padding: '5px' }}>User</th>
                                                        <th style={{ padding: '5px' }}>Prediction</th>
                                                        <th style={{ padding: '5px' }}>Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {participants.map((p, i) => (
                                                        <tr key={i} style={{ borderTop: '1px solid #374151' }}>
                                                            <td style={{ padding: '8px 5px' }}>{p.name}<br /><span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.mobile}</span></td>
                                                            <td style={{ padding: '8px 5px', color: '#fbbf24', fontWeight: 'bold' }}>{p.option}</td>
                                                            <td style={{ padding: '8px 5px', color: '#fbbf24', fontWeight: 'bold' }}>{p.option}</td>
                                                            <td style={{ padding: '8px 5px' }}>{new Date(p.date).toLocaleTimeString()}</td>
                                                            <td style={{ padding: '8px 5px', textAlign: 'right' }}>
                                                                <button
                                                                    onClick={() => handleManualPayout(p.userId, q.id)}
                                                                    style={{ background: '#059669', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                    title="Pick as Winner (Manual Payout)"
                                                                >
                                                                    <Trophy size={14} /> Pay
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {participants.length === 0 && (
                                                        <tr><td colSpan={3} style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>No bets placed yet.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RESOLVE MODAL */}
            {selectedQuiz && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90vw' }}>
                        <h2>Resolve: {selectedQuiz.title}</h2>
                        <p style={{ margin: '10px 0', color: '#9ca3af' }}>Select the correct outcome to see potential winners:</p>

                        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                            {selectedQuiz.config.options.map((opt: string) => {
                                const count = resolveParticipants.filter(p => p.option === opt).length;
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => setWinningOption(opt)}
                                        style={{
                                            padding: '12px', borderRadius: '6px', border: '2px solid',
                                            borderColor: winningOption === opt ? '#10b981' : '#374151',
                                            background: winningOption === opt ? 'rgba(16,185,129,0.1)' : 'transparent',
                                            color: 'white', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        <span>{opt}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>{count} Votes</span>
                                    </button>
                                );
                            })}
                        </div>

                        {winningOption && (
                            <div style={{ background: '#111827', padding: '10px', borderRadius: '8px', marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Potential Winners ({resolveParticipants.filter(p => p.option === winningOption).length}):
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#d1d5db', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {resolveParticipants.filter(p => p.option === winningOption).map((p, i) => (
                                        <span key={i} style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>
                                            {p.name}
                                        </span>
                                    ))}
                                    {resolveParticipants.filter(p => p.option === winningOption).length === 0 && (
                                        <span style={{ color: '#9ca3af' }}>No winners for this option.</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setSelectedQuiz(null)} style={{ flex: 1, padding: '10px', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleResolve}
                                disabled={!winningOption}
                                style={{ flex: 1, padding: '10px', background: winningOption ? '#10b981' : '#4b5563', color: 'white', border: 'none', borderRadius: '6px', cursor: winningOption ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                            >
                                Confirm Winner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
