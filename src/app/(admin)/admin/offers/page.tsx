'use client';

import { useState, useEffect } from 'react';
import { DbService } from '@/services/dbService';
import { Trash2, Plus, Edit2, AlertCircle, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [reward, setReward] = useState('');
    const [minBalance, setMinBalance] = useState('0');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setLoading(true);
        const data = await DbService.getOffers();
        setOffers(data);
        setLoading(false);
    };

    const resetForm = () => {
        setTitle('');
        setReward('');
        setMinBalance('0');
        setIsActive(true);
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (offer: any) => {
        setIsEditing(true);
        setEditId(offer.id);
        setTitle(offer.title);
        setReward(offer.reward.toString());
        setMinBalance(offer.config?.minBalance || '0');
        setIsActive(offer.config?.isActive ?? true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const config = {
            type: 'SCRATCH', // Default for now, can extend later
            minBalance: parseInt(minBalance) || 0,
            isActive: isActive,
            target: 'ALL'
        };

        const offerData = {
            title,
            reward: parseInt(reward) || 0,
            config
        };

        if (isEditing && editId) {
            await DbService.updateOffer(editId, offerData);
        } else {
            await DbService.createOffer(offerData);
        }

        resetForm();
        fetchOffers();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this offer?')) {
            await DbService.deleteOffer(id);
            fetchOffers();
        }
    };

    const handleToggle = async (offer: any) => {
        await DbService.toggleOfferStatus(offer.id, offer.config, !offer.config?.isActive);
        fetchOffers();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>Manage Offers</h1>

            {/* Create/Edit Form */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {isEditing ? 'Edit Offer' : 'Create New Offer'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Offer Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Weekend Bonus"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Reward Points</label>
                        <input
                            type="number"
                            placeholder="e.g. 50"
                            value={reward}
                            onChange={(e) => setReward(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Min User Balance Required</label>
                        <input
                            type="number"
                            placeholder="0 for all users"
                            value={minBalance}
                            onChange={(e) => setMinBalance(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span>Active by Default</span>
                        </label>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            style={{
                                background: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px',
                                border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {isEditing ? <Check size={18} /> : <Plus size={18} />}
                            {isEditing ? 'Update Offer' : 'Add Offer'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{
                                    background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px',
                                    border: 'none', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {loading ? <p>Loading offers...</p> : offers.map(offer => (
                    <div key={offer.id} style={{
                        background: 'white', padding: '1rem', borderRadius: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                background: offer.config?.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                padding: '10px', borderRadius: '50%',
                                color: offer.config?.isActive ? '#10b981' : '#64748b'
                            }}>
                                {offer.config?.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{offer.title}</h4>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '15px' }}>
                                    <span>🏆 {offer.reward} Pts</span>
                                    <span>💰 Min Bal: {offer.config?.minBalance || 0}</span>
                                    <span>🏷️ Type: {offer.config?.type || 'SCRATCH'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleToggle(offer)}
                                style={{
                                    padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                    background: 'white', cursor: 'pointer', fontSize: '0.8rem'
                                }}
                            >
                                {offer.config?.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => handleEdit(offer)}
                                style={{
                                    padding: '8px', borderRadius: '6px', border: 'none',
                                    background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', cursor: 'pointer'
                                }}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(offer.id)}
                                style={{
                                    padding: '8px', borderRadius: '6px', border: 'none',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {offers.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>No offers created yet.</p>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                await DbService.createOffer({
                                    title: "🎉 Special Welcome Bonus",
                                    reward: 25,
                                    config: { minBalance: 0, isActive: true }
                                });
                                fetchOffers();
                            }}
                            style={{
                                background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px',
                                border: 'none', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Plus size={18} /> Generate Demo Offer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
