'use client';

import { DbService } from '@/services/dbService';
import { Ad } from '@/services/mockData';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminAdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [newAd, setNewAd] = useState({
        title: '',
        videoUrl: '',
        reward: 100,
        duration: 15,
        minTasks: 0,
        isActive: true
    });

    const refresh = async () => {
        const data = await DbService.getAds(); // returns Ad[] but with potential locked props, ignore for admin
        setAds(data);
    };

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 3000);
        return () => clearInterval(interval);
    }, []);

    const [editId, setEditId] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editId) {
            await DbService.updateAd(editId, { ...newAd });
            setEditId(null);
            alert('Ad Updated');
        } else {
            await DbService.addAd({ ...newAd });
            alert('Ad Added');
        }

        setNewAd({ title: '', videoUrl: '', reward: 100, duration: 15, minTasks: 0, isActive: true });
        refresh();
    };

    const handleEdit = (ad: Ad) => {
        setNewAd({
            title: ad.title,
            videoUrl: ad.videoUrl,
            reward: ad.reward,
            duration: ad.duration,
            minTasks: ad.minTasks || 0,
            isActive: ad.isActive !== false
        });
        setEditId(ad.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setNewAd({ title: '', videoUrl: '', reward: 100, duration: 15, minTasks: 0, isActive: true });
        setEditId(null);
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this ad?')) {
            await DbService.removeAd(id);
            refresh();
        }
    };

    return (
        <div className="container">
            <h3>{editId ? 'Edit Ad' : 'Add New Ad'}</h3>

            <form onSubmit={handleAdd} className="card">
                <input
                    className="input"
                    placeholder="Ad Title (e.g. Nike Promo)"
                    value={newAd.title}
                    onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                    required
                />
                <input
                    className="input"
                    placeholder="Video URL"
                    value={newAd.videoUrl}
                    onChange={e => setNewAd({ ...newAd, videoUrl: e.target.value })}
                    required
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Points</label>
                        <input
                            className="input"
                            type="number"
                            value={newAd.reward}
                            onChange={e => setNewAd({ ...newAd, reward: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Duration (s)</label>
                        <input
                            className="input"
                            type="number"
                            value={newAd.duration}
                            onChange={e => setNewAd({ ...newAd, duration: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                </div>

                {/* New Locking Config */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Min Tasks to Unlock</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            value={newAd.minTasks}
                            onChange={e => setNewAd({ ...newAd, minTasks: parseInt(e.target.value) })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                        <input
                            type="checkbox"
                            style={{ width: '20px', height: '20px' }}
                            checked={newAd.isActive}
                            onChange={e => setNewAd({ ...newAd, isActive: e.target.checked })}
                        />
                        <label style={{ fontWeight: 500 }}>Active (Visible to Users)</label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>{editId ? 'Update Ad' : 'Add Advertisement'}</button>
                    {editId && <button type="button" onClick={handleCancel} className="btn" style={{ background: '#374151', width: 'auto' }}>Cancel</button>}
                </div>
            </form>

            <h4>Active Ads ({ads.length})</h4>
            {ads.map(ad => (
                <div key={ad.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: (ad.isActive !== false) ? 1 : 0.6 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ fontWeight: 'bold' }}>{ad.title}</p>
                            {ad.isActive === false && <span style={{ fontSize: '0.65rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>HIDDEN</span>}
                            {(ad.minTasks ?? 0) > 0 && <span style={{ fontSize: '0.65rem', background: '#eab308', color: 'black', padding: '2px 6px', borderRadius: '4px' }}>LOCK: {ad.minTasks} TASKS</span>}
                        </div>
                        <p style={{ fontSize: '0.8rem' }}>{ad.reward} Pts • {ad.duration}s</p>
                        <p style={{ fontSize: '0.7rem', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.videoUrl}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEdit(ad)} className="btn" style={{ padding: '5px 10px', background: '#3b82f6', fontSize: '0.8rem' }}>
                            Edit
                        </button>
                        <button onClick={() => handleDelete(ad.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
