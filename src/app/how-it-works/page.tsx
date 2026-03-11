import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Earnify Works - Step by Step Guide to Earning Money Online',
    description: 'Learn how Earnify works in 4 simple steps. Sign up free, complete tasks like watching ads, earn real money, and withdraw instantly via UPI. No investment needed.',
    alternates: {
        canonical: '/how-it-works',
    },
    openGraph: {
        title: 'How Earnify Works - Earn Money Online in 4 Steps',
        description: 'Sign up → Watch Ads → Earn Money → Withdraw via UPI. Start earning today on earnify.site!',
        url: 'https://earnify.site/how-it-works',
    },
};

export default function HowItWorksPage() {
    const steps = [
        {
            number: '01',
            title: 'Create Your Free Account',
            desc: 'Sign up on earnify.site with your mobile number and a 4-digit PIN. It takes just 30 seconds. No email, no app download needed.',
            icon: '📱',
        },
        {
            number: '02',
            title: 'Complete Simple Tasks',
            desc: 'Watch short video ads, download sponsored apps, take fun quizzes, or play games like scratch cards and lucky draw. Each task earns you real money.',
            icon: '✅',
        },
        {
            number: '03',
            title: 'Refer Friends & Earn More',
            desc: 'Share your unique referral code with friends and family. When they sign up and start earning, you get commission on their earnings automatically.',
            icon: '👥',
        },
        {
            number: '04',
            title: 'Withdraw to UPI Instantly',
            desc: 'Once you reach the minimum withdrawal amount, cash out directly to your UPI (Google Pay, PhonePe, Paytm) or bank account. Payments are processed within 24 hours.',
            icon: '💰',
        },
    ];

    const faqs = [
        {
            q: 'Is Earnify free to join?',
            a: 'Yes! Earnify is 100% free. You never need to pay any money or make any investment. Just sign up and start earning.',
        },
        {
            q: 'How much can I earn on Earnify?',
            a: 'Active users earn between ₹100 to ₹1000+ per day depending on the number of tasks completed and referrals. Top earners make over ₹1 Lakh per month.',
        },
        {
            q: 'How do withdrawals work?',
            a: 'Go to your Wallet page, enter the amount you want to withdraw, provide your UPI ID or bank details, and submit. Withdrawals are processed within 24 hours by our admin team.',
        },
        {
            q: 'Is Earnify safe and legitimate?',
            a: 'Absolutely. Earnify has 50,000+ registered users and has paid out over ₹50 Lakhs in total. We never ask for your bank password or OTP. Your data is encrypted and secure.',
        },
        {
            q: 'Do I need to download an app?',
            a: 'No app download is required. Earnify works directly in your mobile browser. Just visit earnify.site. You can also add it to your home screen for quick access like a native app.',
        },
        {
            q: 'What is the referral program?',
            a: 'Every user gets a unique referral code. When someone signs up using your code, you earn a bonus. Plus, you get commission on their future earnings. It\'s a great way to build passive income.',
        },
        {
            q: 'What payment methods are supported?',
            a: 'We support UPI (Google Pay, PhonePe, Paytm, BHIM) and direct bank transfer (NEFT/IMPS). UPI is the fastest method with payments processed within hours.',
        },
        {
            q: 'Can I use Earnify on a computer?',
            a: 'Yes! Earnify works on any device with a web browser — Android phones, iPhones, tablets, laptops, and desktop computers.',
        },
    ];

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
                    How Earnify Works
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '50px', lineHeight: '1.6' }}>
                    Start earning money online in just 4 simple steps. No investment, no experience, no app download needed.
                </p>

                {/* Steps */}
                <section style={{ marginBottom: '60px' }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'flex-start',
                        }}>
                            <div style={{
                                minWidth: '60px', height: '60px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 'bold', color: 'black',
                            }}>
                                {step.icon}
                            </div>
                            <div>
                                <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>STEP {step.number}</div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{step.title}</h2>
                                <p style={{ color: '#d1d5db', lineHeight: '1.7' }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Earning Methods */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#fbbf24', marginBottom: '25px', fontWeight: '800' }}>
                        Ways to Earn Money on Earnify
                    </h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {[
                            { title: '🎬 Watch Video Ads', desc: 'Watch short advertisements from top brands and earn ₹2-₹50 per ad. New ads are available daily.' },
                            { title: '📱 Download & Try Apps', desc: 'Download sponsored apps, try them for a few minutes, and earn ₹20-₹100 per app.' },
                            { title: '👥 Refer & Earn Commission', desc: 'Share your referral code. Earn signup bonus + lifetime commission on your referrals\' earnings.' },
                            { title: '❓ Play Quizzes', desc: 'Test your knowledge in fun quizzes and earn bonus rewards for correct answers.' },
                            { title: '🎰 Lucky Draw & Scratch Cards', desc: 'Win surprise rewards through daily lucky draws and scratch card games.' },
                            { title: '🎡 Spin the Wheel', desc: 'Complete task milestones to unlock spins and win bonus rewards.' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: '#1f2937', padding: '18px', borderRadius: '12px',
                                border: '1px solid #374151',
                            }}>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{item.title}</h3>
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: '#fbbf24', marginBottom: '25px', fontWeight: '800' }}>
                        Frequently Asked Questions about Earnify
                    </h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {faqs.map((faq, i) => (
                            <details key={i} style={{
                                background: '#1f2937', padding: '18px', borderRadius: '12px',
                                border: '1px solid #374151', cursor: 'pointer',
                            }}>
                                <summary style={{ fontWeight: '600', fontSize: '1rem', color: 'white' }}>
                                    {faq.q}
                                </summary>
                                <p style={{ color: '#d1d5db', marginTop: '10px', lineHeight: '1.7', fontSize: '0.95rem' }}>
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ textAlign: 'center', padding: '40px 0' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Start Earning on Earnify Today!</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Join 50,000+ users who are already earning daily cash.</p>
                    <a href="/login?mode=signup" style={{
                        display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                        color: 'black', padding: '18px 40px', fontSize: '1.2rem', fontWeight: 'bold',
                        borderRadius: '50px', textDecoration: 'none',
                        boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                    }}>
                        Create Free Account 🚀
                    </a>
                </section>
            </main>

            <footer style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', borderTop: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
                    <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</a>
                    <a href="/how-it-works" style={{ color: '#fbbf24', textDecoration: 'none' }}>How It Works</a>
                    <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
                </div>
                <p>&copy; {new Date().getFullYear()} Earnify. All rights reserved. | <a href="https://earnify.site" style={{ color: '#fbbf24', textDecoration: 'none' }}>earnify.site</a></p>
            </footer>

            {/* FAQ Schema for Google Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map(faq => ({
                            '@type': 'Question',
                            name: faq.q,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.a,
                            },
                        })),
                    }),
                }}
            />
        </div>
    );
}
