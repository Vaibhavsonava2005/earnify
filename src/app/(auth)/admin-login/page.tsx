'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const { adminLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await adminLogin(password);
        if (result.success) {
            // Redirect handled in context
        } else {
            alert(result.message || 'Invalid Admin Password');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--secondary)' }}>
                    <ShieldAlert size={48} />
                </div>
                <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>Admin Access</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        className="input"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                    />

                    <button className="btn" style={{ background: '#ef4444', color: 'white', width: '100%' }}>
                        Access Panel
                    </button>
                </form>
            </div>
        </div>
    );
}
