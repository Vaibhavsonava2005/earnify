import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Earnify - Support, Help & Feedback',
    description: 'Need help with Earnify? Contact our support team for questions about earnings, withdrawals, account issues, or feedback. We respond within 24 hours.',
    alternates: {
        canonical: '/contact',
    },
    openGraph: {
        title: 'Contact Earnify Support',
        description: 'Get help with your Earnify account, withdrawals, and more.',
        url: 'https://earnify.site/contact',
    },
};

export default function ContactPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* Nav */}
            <nav style={{
                padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: '900px', margin: '0 auto',
            }}>
                <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', textDecoration: 'none' }}>EARNIFY</a>
                <a href="/login" style={{
                    border: '1px solid #fbbf24', color: '#fbbf24', padding: '8px 20px', borderRadius: '50px',
                    textDecoration: 'none', fontWeight: 'bold',
                }}>Login</a>
            </nav>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px',
                    background: 'linear-gradient(to right, #fff, #fbbf24)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Contact Us
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
                    Have a question, issue, or feedback? We&apos;re here to help. Reach out to us using any of the methods below.
                </p>

                <div style={{ display: 'grid', gap: '20px', marginBottom: '50px' }}>
                    <div style={{
                        background: '#1f2937', padding: '25px', borderRadius: '12px',
                        border: '1px solid #374151',
                    }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>📧 Email Support</h2>
                        <p style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                            For general inquiries, account issues, or withdrawal problems, email us at:
                        </p>
                        <a href="mailto:earnifyr@gmail.com" style={{ color: '#fbbf24', fontSize: '1.1rem', marginTop: '8px', fontWeight: 'bold', display: 'block', textDecoration: 'none' }}>
                            earnifyr@gmail.com
                        </a>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '5px' }}>
                            We typically respond within 24 hours.
                        </p>
                    </div>

                    <div style={{
                        background: '#1f2937', padding: '25px', borderRadius: '12px',
                        border: '1px solid #374151',
                    }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>💬 Telegram Community</h2>
                        <p style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                            Join our official Telegram channel for latest updates, tips, and community support.
                        </p>
                        <a href="https://t.me/earnifyrewards" target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', fontSize: '1.1rem', marginTop: '8px', fontWeight: 'bold', display: 'block', textDecoration: 'none' }}>
                            Earn Rewards — @earnifyrewards
                        </a>
                    </div>

                    <div style={{
                        background: '#1f2937', padding: '25px', borderRadius: '12px',
                        border: '1px solid #374151',
                    }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>⏰ Support Hours</h2>
                        <p style={{ color: '#d1d5db', lineHeight: '1.7' }}>
                            Monday to Saturday: 10:00 AM - 8:00 PM IST<br />
                            Sunday: Closed (email support available)
                        </p>
                    </div>
                </div>

                <section style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '20px' }}>Common Questions</h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {[
                            { q: 'My withdrawal is pending for more than 24 hours', a: 'Withdrawals are manually processed by our admin team. During high traffic, it may take up to 48 hours. If it exceeds 48 hours, please contact us via email.' },
                            { q: 'I forgot my PIN', a: 'Currently, PIN reset is handled through our support team. Email us with your registered mobile number and we will help you reset it.' },
                            { q: 'My referral bonus was not credited', a: 'Referral bonuses are credited when your referred friend completes their first task. If the bonus is still missing, email us with both mobile numbers.' },
                            { q: 'Is there a minimum withdrawal amount?', a: 'Yes, the minimum withdrawal amount varies based on your account level. Check your Wallet page for current limits.' },
                        ].map((item, i) => (
                            <details key={i} style={{
                                background: '#111827', padding: '18px', borderRadius: '12px',
                                border: '1px solid #374151', cursor: 'pointer',
                            }}>
                                <summary style={{ fontWeight: '600', color: 'white' }}>{item.q}</summary>
                                <p style={{ color: '#d1d5db', marginTop: '10px', lineHeight: '1.6', fontSize: '0.95rem' }}>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <section style={{ textAlign: 'center', padding: '30px 0' }}>
                    <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Not a member yet?</p>
                    <a href="/login?mode=signup" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                        color: 'black', padding: '15px 35px', fontSize: '1.1rem', fontWeight: 'bold',
                        borderRadius: '50px', textDecoration: 'none',
                    }}>
                        Join Earnify Free 🚀
                    </a>
                </section>
            </main>

            <footer style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', borderTop: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
                    <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a>
                    <a href="/how-it-works" style={{ color: '#9ca3af', textDecoration: 'none' }}>How It Works</a>
                    <a href="/contact" style={{ color: '#fbbf24', textDecoration: 'none' }}>Contact</a>
                </div>
                <p>&copy; {new Date().getFullYear()} Earnify. All rights reserved. | <a href="https://earnify.site" style={{ color: '#fbbf24', textDecoration: 'none' }}>earnify.site</a></p>
            </footer>
        </div>
    );
}
