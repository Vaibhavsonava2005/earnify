'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, ShieldCheck, TrendingUp, DollarSign, Users } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);

  // Sample Reviews Data (Since we want random reviews shown)
  const testimonials = [
    { name: "Rahul S.", rating: 5, comment: "Just withdrew ₹500! Best app for pocket money. 🤑", time: "2 mins ago" },
    { name: "Priya M.", rating: 5, comment: "Legit app. Got my UPI payment instantly.", time: "1 hour ago" },
    { name: "Amit K.", rating: 4, comment: "Tasks are simple and easy to complete.", time: "Yesterday" },
    { name: "Sneha R.", rating: 5, comment: "Earning ₹100 daily just by watching ads!", time: "3 hours ago" },
    { name: "Vikram J.", rating: 5, comment: "Better than other fake apps. Trustworthy.", time: "5 hours ago" }
  ];

  useEffect(() => {
    // Auth Check: Redirect to Dashboard if logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Loading State (while checking auth)
  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#000', color: '#fbbf24'
      }}>
        <div className="animate-pulse">Loading Earnify...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'black',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Navbar (Minimal) */}
      <nav style={{
        padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1200px', margin: '0 auto', width: '100%'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            <Image src="/logo.svg" alt="Earnify Logo" fill style={{ objectFit: 'contain' }} priority />
          </div>
          EARNIFY
        </div>
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24',
            padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '20px', maxWidth: '800px', margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '8px 16px', borderRadius: '50px',
          fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px'
        }}>
          <ShieldCheck size={18} /> Trusted by 50,000+ Registered Users
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Responsive font size
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '20px',
          background: 'linear-gradient(to right, #ffffff, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Start Earning <br />
          <span style={{ color: '#fbbf24', WebkitTextFillColor: '#fbbf24' }}>₹1 Lakh / Month</span>
        </h1>

        <p style={{
          fontSize: '1.1rem', color: '#9ca3af', marginBottom: '40px', maxWidth: '600px', lineHeight: '1.6'
        }}>
          Complete simple tasks, watch ads, and refer friends to earn real cash daily.
          Instant withdrawals via UPI. 100% Safe & Secure.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/login?mode=signup')}
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            color: 'black',
            padding: '18px 40px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
            transition: 'transform 0.2s',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Start Earning Now <TrendingUp size={24} />
        </button>

        {/* Trust Stats */}
        <div style={{
          display: 'flex', gap: '30px', marginTop: '60px', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>₹50L+</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Paid Out</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>50k+</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Happy Users</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>4.8/5</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>User Rating</p>
          </div>
        </div>
      </main>

      {/* Reviews Section */}
      <section style={{ padding: '60px 20px', background: '#111827' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>What Users Say 💬</h2>
        <div style={{
          display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px',
          maxWidth: '1200px', margin: '0 auto', scrollSnapType: 'x mandatory'
        }}>
          {testimonials.map((review, i) => (
            <div key={i} style={{
              minWidth: '300px', background: '#1f2937', padding: '20px', borderRadius: '15px',
              border: '1px solid #374151', scrollSnapAlign: 'start', flex: '0 0 auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold' }}>{review.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{review.time}</div>
              </div>
              <div style={{ display: 'flex', color: '#fbbf24', marginBottom: '10px' }}>
                {[...Array(review.rating)].map((_, j) => <Star key={j} size={16} fill="#fbbf24" />)}
              </div>
              <p style={{ color: '#d1d5db', fontSize: '0.95rem' }}>"{review.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', borderTop: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          <a href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About Earnify</a>
          <a href="/how-it-works" style={{ color: '#9ca3af', textDecoration: 'none' }}>How It Works</a>
          <a href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact Us</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Earnify. All rights reserved. | <a href="https://earnify.site" style={{ color: '#fbbf24', textDecoration: 'none' }}>earnify.site</a></p>
      </footer>
    </div>
  );
}
