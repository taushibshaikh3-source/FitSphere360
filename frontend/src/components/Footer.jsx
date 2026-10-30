import React from 'react';
import { Dumbbell, ShieldCheck, Heart, Sparkles, Code2, ExternalLink } from 'lucide-react';

export const Footer = ({ setCurrentView }) => {
  return (
    <footer style={{
      backgroundColor: '#06080B',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '4rem 1.5rem 2rem 1.5rem',
      marginTop: '5rem'
    }}>
      <div className="container-custom">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#B8FF00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Dumbbell size={20} color="#07090D" strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '900', color: '#FFFFFF' }}>
                FitSphere <span style={{ color: '#B8FF00' }}>360</span>
              </div>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              The next-generation smart fitness platform unifying gym discovery, intelligent rule-based recommendations, verified trainer bookings, and high-performance commercial facility analytics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8FF00', fontSize: '0.82rem', fontWeight: '700' }}>
              <ShieldCheck size={18} />
              <span>100% Women-Safe Verified Facilities</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '1.2rem', fontWeight: '700' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { id: 'gyms', label: 'Explore & Compare Gyms' },
                { id: 'trainers', label: 'Find Certified Trainers' },
                { id: 'recommendations', label: 'AI Smart Match Engine' },
                { id: 'bmi', label: 'Interactive BMI Calculator' },
                { id: 'workouts', label: 'Workout & Equipment Guide' },
                { id: 'about', label: 'About FitSphere 360' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      setCurrentView(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'color 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#B8FF00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                  >
                    → {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Role-Based Portals Info Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8FF00', marginBottom: '0.75rem', fontWeight: '700', fontSize: '0.9rem' }}>
              <Sparkles size={16} />
              <span>Role-Based Portals</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
              FitSphere 360 supports specialized experiences tailored to each user type:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#0D121A', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#00F0FF', fontWeight: '700' }}>Trainee Portal: </span>
                <span style={{ color: '#94A3B8' }}>Browse gyms, track BMI & schedule sessions</span>
              </div>
              <div style={{ background: '#0D121A', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#B8FF00', fontWeight: '700' }}>Gym Owner Portal: </span>
                <span style={{ color: '#94A3B8' }}>Facility analytics, trainer rosters & plans</span>
              </div>
              <div style={{ background: '#0D121A', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#FF7A00', fontWeight: '700' }}>Trainer Portal: </span>
                <span style={{ color: '#94A3B8' }}>Accept client bookings & manage schedule</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} FitSphere 360 – Smart Gym Management & Recommendation System.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Backend: Python Flask + SQLite</span>
            <span>•</span>
            <span>Frontend: React + Vite</span>
            <span>•</span>
            <span style={{ color: '#B8FF00' }}>Smart Fitness Ecosystem</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
