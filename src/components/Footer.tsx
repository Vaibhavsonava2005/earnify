'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Shield } from 'lucide-react';

export default function Footer() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-gray)',
            fontSize: '0.85rem',
            borderTop: '1px solid var(--border)',
            marginTop: '2rem',
            marginBottom: '4rem' // Space for Floating Button
        }}>
            <p style={{ marginBottom: '1rem' }}>
                © 2026 Earnify. All rights reserved.
            </p>

            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    color: 'var(--primary)',
                    fontWeight: 500,
                    marginBottom: '1rem'
                }}
            >
                <Shield size={16} />
                <span>Privacy Policy & Contact</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isOpen && (
                <div className="animate-slide-up" style={{
                    textAlign: 'left',
                    background: 'var(--bg-card)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginTop: '1rem',
                    border: '1px solid var(--border)'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>Privacy Policy</h3>

                    <p style={{ marginBottom: '1rem' }}>
                        At Earnify, we value your privacy. This policy explains how we handle your data.
                    </p>

                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Information We Collect</h4>
                    <p style={{ marginBottom: '1rem' }}>
                        We collect your name, UPI ID (for payouts).
                    </p>

                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Third-Party Tasks</h4>
                    <p style={{ marginBottom: '1rem' }}>
                        When you perform tasks like opening a Bank or Demat account, you are providing data to those third-party institutions. Their privacy policies apply to those specific tasks and Payout may take upto 7 working days after pending verification.
                    </p>

                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.95rem' }}>How We Use Data</h4>
                    <p style={{ marginBottom: '1rem' }}>
                        Your data is used only to track task completion, process payouts, and improve app security. We do not sell your personal data to 3rd party marketers.
                    </p>

                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Data Security</h4>
                    <p style={{ marginBottom: '1.5rem' }}>
                        We use industry-standard encryption to protect your UPI ID and personal details.
                    </p>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={16} /> Contact Us
                        </h4>
                        <p>
                            For inquiries, email us at: <a href="mailto:earnifyr@gmail.com" style={{ color: 'var(--primary)' }}>earnifyr@gmail.com</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
