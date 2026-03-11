'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [pin, setPin] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const { login, signup } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        const mode = searchParams.get('mode');

        if (ref) {
            console.log("Referral Code Found:", ref);
            setReferralCode(ref);
            setIsLogin(false);
        } else if (mode === 'signup' || mode === 'register') {
            setIsLogin(false);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        if (isLogin) {
            const success = await login(mobile, pin);
            if (!success) {
                // Check if user exists
                try {
                    // We need direct DB access or AuthContext helper. DbService is CLIENT safe here.
                    const { DbService } = require('@/services/dbService');
                    const exists = await DbService.checkUserExists(mobile);

                    if (!exists) {
                        // Redirect to Signup
                        // alert("Account not found. Redirecting to Registration.");
                        setIsLogin(false); // Switch to Signup Mode
                        return;
                    } else {
                        alert('Invalid Credentials (Wrong PIN)');
                    }
                } catch (e) {
                    alert('Invalid Credentials');
                }
            }
        } else {
            const result = await signup(name, mobile, pin, referralCode);
            if (result === true) {
                // Success: Implicit redirect happens in login/signup context or just let them login
                // alert('Account Created! Logging in...'); 
            } else if (typeof result === 'string') {
                alert('Error: ' + result);
            } else {
                alert('Error creating account. Please try again.');
            }
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', color: 'var(--primary)' }}>EARNIFY</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Watch Ads. Earn Money.</p>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            className="input"
                            placeholder="Full Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    )}
                    <input
                        className="input"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} // Digits only
                        type="tel"
                        maxLength={10}
                    />
                    <input
                        className="input"
                        placeholder="4 Digit PIN"
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        type="password"
                        maxLength={4}
                    />

                    {isLogin && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px' }}>
                            <a
                                href="https://t.me/earnifyrewards?direct"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Forgot PIN?
                            </a>
                        </div>
                    )}

                    {!isLogin && (
                        <input
                            className="input"
                            placeholder="Referral Code (Referrer's Mobile)"
                            value={referralCode}
                            onChange={e => setReferralCode(e.target.value.replace(/\D/g, ''))} // Digits only
                            maxLength={10}
                            readOnly={!!searchParams.get('ref')} // Lock if from URL
                        />
                    )}

                    <button className="btn btn-primary" style={{ marginBottom: '1rem' }}>
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <p
                    style={{ textAlign: 'center', cursor: 'pointer', color: 'var(--primary)' }}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'New user? Create Account' : 'Already have an account? Login'}
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
