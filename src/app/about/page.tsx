import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Earnify - India\'s Trusted Online Earning Platform',
    description: 'Learn about Earnify, India\'s most trusted online earning platform. Earn real money by watching ads, completing tasks, and referring friends. Instant UPI withdrawals. Safe & Secure.',
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'About Earnify - India\'s Trusted Online Earning Platform',
        description: 'Earnify is a trusted platform where users earn real money daily through ads, tasks, and referrals.',
        url: 'https://earnify.site/about',
    },
};

export default function AboutPage() {
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
                    fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px',
                    background: 'linear-gradient(to right, #fff, #fbbf24)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    About Earnify
                </h1>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '15px' }}>What is Earnify?</h2>
                    <p style={{ color: '#d1d5db', lineHeight: '1.8', marginBottom: '15px' }}>
                        <strong style={{ color: 'white' }}>Earnify</strong> is India&apos;s leading online earning platform where users can earn real money from the comfort of their homes.
                        Founded with the mission to provide a legitimate and transparent way to earn daily income, Earnify allows users to complete simple tasks
                        like watching advertisements, downloading apps, participating in quizzes, and referring friends — all while earning real cash.
                    </p>
                    <p style={{ color: '#d1d5db', lineHeight: '1.8' }}>
                        Unlike other fake earning apps, <strong style={{ color: 'white' }}>Earnify.site</strong> is 100% genuine and offers instant withdrawals directly to your UPI (PhonePe, Google Pay, Paytm) or bank account.
                        We have already paid out over ₹50 Lakhs to our 50,000+ registered users.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '15px' }}>Why Choose Earnify?</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {[
                            { title: '💰 Real Money Earnings', desc: 'Earn up to ₹1 Lakh per month by watching ads, completing tasks, and building your referral network.' },
                            { title: '⚡ Instant UPI Withdrawals', desc: 'Withdraw your earnings instantly to any UPI app — Google Pay, PhonePe, Paytm, or direct bank transfer.' },
                            { title: '🛡️ 100% Safe & Secure', desc: 'Your data is encrypted and secure. We use industry-standard security practices to protect your account.' },
                            { title: '📱 Works on Any Device', desc: 'Earnify works on any smartphone browser. No app download needed — just visit earnify.site and start earning.' },
                            { title: '👥 Referral Commission', desc: 'Earn commission when your referred friends complete tasks. Build a passive income stream through referrals.' },
                            { title: '🎮 Fun Games & Quizzes', desc: 'Play lucky draw, scratch cards, and quiz games for bonus rewards on top of your regular earnings.' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: '#1f2937', padding: '20px', borderRadius: '12px',
                                border: '1px solid #374151',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h3>
                                <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '15px' }}>How Much Can I Earn on Earnify?</h2>
                    <p style={{ color: '#d1d5db', lineHeight: '1.8', marginBottom: '15px' }}>
                        Your earnings on Earnify depend on your activity level. Here is a typical breakdown:
                    </p>
                    <div style={{
                        background: '#1f2937', padding: '20px', borderRadius: '12px',
                        border: '1px solid #374151',
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #374151' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', color: '#fbbf24' }}>Activity</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: '#fbbf24' }}>Daily Earning</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#d1d5db' }}>
                                <tr style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>Watching Ads</td>
                                    <td style={{ padding: '10px' }}>₹50 - ₹200</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>Downloading Apps</td>
                                    <td style={{ padding: '10px' }}>₹20 - ₹100</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>Referral Commission</td>
                                    <td style={{ padding: '10px' }}>₹10 - ₹500+</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #374151' }}>
                                    <td style={{ padding: '10px' }}>Games & Quizzes</td>
                                    <td style={{ padding: '10px' }}>₹5 - ₹50</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#fbbf24' }}>Total (Active User)</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#fbbf24' }}>₹100 - ₹1000+ /day</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '15px' }}>Is Earnify Real or Fake?</h2>
                    <p style={{ color: '#d1d5db', lineHeight: '1.8', marginBottom: '15px' }}>
                        <strong style={{ color: 'white' }}>Earnify is 100% real and genuine.</strong> We have thousands of payment proofs, over 50,000 registered users,
                        and a transparent earning system. Unlike scam apps that ask for deposits or investments, Earnify is completely free to use.
                        You never need to pay any money. Just sign up, complete tasks, and withdraw your earnings via UPI.
                    </p>
                </section>

                <section style={{ textAlign: 'center', padding: '40px 0' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Ready to Start Earning?</h2>
                    <a href="/login?mode=signup" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                        color: 'black', padding: '18px 40px', fontSize: '1.2rem', fontWeight: 'bold',
                        borderRadius: '50px', textDecoration: 'none',
                        boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                    }}>
                        Join Earnify Now — It&apos;s Free! 🚀
                    </a>
                </section>
            </main>

            <footer style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', borderTop: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
                    <a href="/about" style={{ color: '#fbbf24', textDecoration: 'none' }}>About</a>
                    <a href="/how-it-works" style={{ color: '#9ca3af', textDecoration: 'none' }}>How It Works</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </div>
                <p>&copy; {new Date().getFullYear()} Earnify. All rights reserved. | <a href="https://earnify.site" style={{ color: '#fbbf24', textDecoration: 'none' }}>earnify.site</a></p>
            </footer>
        </div>
    );
}
