'use client';

import { useState, useEffect } from 'react';
import { DbService } from '@/services/dbService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Clock, Trophy, CheckCircle, XCircle, AlertCircle, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function QuizPage() {
    const { user, updateLocalBalance } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [myEntries, setMyEntries] = useState<any[]>([]); // Track user's bets
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        // 1. Fetch Quizzes
        const { data: qData } = await supabase
            .from('apps')
            .select('*')
            .eq('category', 'QUIZ')
            .order('created_at', { ascending: false });

        let parsedQuizzes: any[] = [];
        if (qData) {
            parsedQuizzes = qData.map(q => {
                try { return { ...q, config: JSON.parse(q.description) }; }
                catch (e) { return q; }
            });
        }

        // 2. Fetch My Entries
        const { data: eData } = await supabase
            .from('user_apps')
            .select('*')
            .eq('user_id', user!.id)
            .in('app_id', parsedQuizzes.map(q => q.id)); // Optimization: Only related to these quizzes

        setQuizzes(parsedQuizzes);
        setMyEntries(eData || []);
        setIsLoading(false);
    };

    const handleEnter = (quiz: any) => {
        setSelectedQuiz(quiz);
        setSelectedOption('');
    };

    const submitPrediction = async () => {
        if (!selectedQuiz || !selectedOption || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await DbService.enterQuiz(user!.id, selectedQuiz.id, selectedOption);
            if (res.success) {
                // Success Animation
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                await updateLocalBalance(-selectedQuiz.config.entryFee); // Optimistic Update
                alert('Prediction Placed! Good Luck! 🍀');
                setSelectedQuiz(null);
                loadData(); // Refresh to show "Participated"
            } else {
                alert(res.message);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTimeLeft = (isoDate: string) => {
        const diff = new Date(isoDate).getTime() - new Date().getTime();
        if (diff <= 0) return 'Ended';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m left`;
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Link href="/dashboard" style={{ background: '#374151', padding: '10px', borderRadius: '50%', color: 'white', display: 'flex' }}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <span style={{ fontSize: '2rem' }}>🧠</span> Quiz & Predictions
                </h1>
            </div>

            <div style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)', padding: '2px', borderRadius: '12px', marginBottom: '25px' }}>
                <div style={{ background: '#1f2937', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#fbbf24', fontWeight: 'bold' }}>
                        🏆 Win up to <span style={{ fontSize: '1.3rem', color: '#fff' }}>100,000 Points</span> on Correct Answer!
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading events...</div>
            ) : quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No active events right now. Check back later!</div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {quizzes.map(quiz => {
                        const myEntry = myEntries.find(e => e.app_id === quiz.id);
                        const isEnded = new Date() > new Date(quiz.config.endTime);
                        const isResolved = !!quiz.config.result;
                        const mySelection = myEntry?.rejection_reason; // Stored here

                        // Status Logic
                        // Status Logic
                        let statusColor = '#3b82f6'; // Active Blue
                        let statusText = 'Predict Now';

                        if (isResolved) {
                            statusText = `Winner Announced`;
                            if (myEntry) {
                                if (myEntry.status === 'APPROVED' || mySelection === quiz.config.result) {
                                    statusColor = '#10b981'; // Green Won
                                    statusText = 'YOU WON! 🎉';
                                } else {
                                    statusColor = '#ef4444'; // Red Lost
                                    statusText = 'Better luck next time';
                                }
                            } else {
                                statusColor = '#10b981';
                            }
                        } else if (isEnded) {
                            statusColor = '#fbbf24'; // Yellow Calculating
                            statusText = 'Calculating Results...';
                        } else if (myEntry) {
                            statusColor = '#8b5cf6'; // Purple Waiting
                            statusText = 'Prediction Placed';
                        }

                        return (
                            <div key={quiz.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginBottom: '5px' }}>{quiz.title}</h3>
                                        <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{quiz.config.question}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <Trophy size={14} color="#fbbf24" />
                                            <span>Pool: {quiz.reward}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timer / Result */}
                                <div style={{ marginBottom: '20px' }}>
                                    {isResolved ? (
                                        <p style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle size={16} /> Winner: {quiz.config.result}
                                        </p>
                                    ) : (
                                        <p style={{ color: isEnded ? '#ef4444' : '#60a5fa', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                            <Clock size={16} /> {getTimeLeft(quiz.config.endTime)}
                                        </p>
                                    )}
                                </div>

                                {/* Action Area */}
                                {myEntry ? (
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: `1px solid ${statusColor}` }}>
                                        <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '5px' }}>Your Prediction:</p>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{mySelection}</p>
                                        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: statusColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {statusText.includes('WON') ? <Trophy size={16} /> : statusText.includes('luck') ? <XCircle size={16} /> : <Clock size={16} />}
                                            {statusText}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEnter(quiz)}
                                        disabled={isEnded}
                                        className="btn btn-primary"
                                        style={{ width: '100%', opacity: isEnded ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span>{isEnded ? 'Entries Closed' : 'Predict & Win'}</span>
                                        {!isEnded && <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Entry: {quiz.config.entryFee} pts</span>}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PREDICT MODAL */}
            {selectedQuiz && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', background: '#1f2937', border: '1px solid #374151' }}>
                        <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>Make Your Prediction</h3>
                        <p style={{ textAlign: 'center', color: '#fbbf24', fontSize: '1.1rem', marginBottom: '20px' }}>{selectedQuiz.config.question}</p>

                        <div style={{ display: 'grid', gap: '10px', marginBottom: '25px' }}>
                            {selectedQuiz.config.options.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedOption(opt)}
                                    style={{
                                        padding: '15px', borderRadius: '8px', border: '2px solid',
                                        borderColor: selectedOption === opt ? '#3b82f6' : '#374151',
                                        background: selectedOption === opt ? 'rgba(59,130,246,0.1)' : 'transparent',
                                        color: 'white', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '1rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                >
                                    {opt}
                                    {selectedOption === opt && <CheckCircle size={20} color="#3b82f6" />}
                                </button>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '6px', marginBottom: '20px', border: '1px dashed #ef4444' }}>
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', textAlign: 'center' }}>
                                <AlertCircle size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Entry Fee of <b>{selectedQuiz.config.entryFee} Points</b> will be deducted.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setSelectedQuiz(null)} style={{ flex: 1, padding: '12px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px' }}>Cancel</button>
                            <button
                                onClick={submitPrediction}
                                disabled={!selectedOption || isSubmitting}
                                style={{ flex: 1, padding: '12px', background: !selectedOption ? '#4b5563' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: !selectedOption ? 'not-allowed' : 'pointer' }}
                            >
                                {isSubmitting ? 'Placing Bet...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
