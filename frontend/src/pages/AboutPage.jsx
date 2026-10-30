import React from 'react';
import { 
  Dumbbell, 
  Code2, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Server, 
  Layers, 
  CheckCircle2, 
  Users,
  Award
} from 'lucide-react';

export const AboutPage = ({ setCurrentView }) => {
  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom" style={{ maxWidth: '980px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge-lime" style={{ marginBottom: '0.75rem' }}>ACADEMIC MINI PROJECT DOCUMENTATION</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '0.75rem' }}>
            About FitSphere <span style={{ color: '#B8FF00' }}>360</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            A high-performance smart gym management and rule-based recommendation platform engineered for modern commercial athletics, certified coaching talent, and trainee safety.
          </p>
        </div>

        {/* System Architecture Grid */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Layers size={22} color="#B8FF00" />
            <h2 style={{ fontSize: '1.6rem' }}>Full-Stack Technology Stack</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Tech 1 */}
            <div style={{ background: '#0D121A', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8FF00', fontWeight: '700', marginBottom: '0.5rem' }}>
                <Server size={18} />
                <span>Backend Architecture</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>• Python Flask 3.1+ RESTful API</li>
                <li>• Werkzeug SHA-256 password hashing</li>
                <li>• Flask session management & role decorators</li>
                <li>• Rule-based multi-factor recommendation engine</li>
              </ul>
            </div>

            {/* Tech 2 */}
            <div style={{ background: '#0D121A', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00F0FF', fontWeight: '700', marginBottom: '0.5rem' }}>
                <Code2 size={18} />
                <span>Frontend & UI/UX</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>• React 18 & Vite.js Single Page App</li>
                <li>• Custom Vanilla CSS Design System</li>
                <li>• Electric Lime (#B8FF00) Dark Theme</li>
                <li>• Lucide icons & Google Typography (Outfit)</li>
              </ul>
            </div>

            {/* Tech 3 */}
            <div style={{ background: '#0D121A', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF7A00', fontWeight: '700', marginBottom: '0.5rem' }}>
                <Database size={18} />
                <span>Database Design</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>• SQLite (fitsphere360.db) with Foreign Keys</li>
                <li>• Auto-initializing schema & realistic seed data</li>
                <li>• Relational schema ready for PostgreSQL</li>
                <li>• Complete CRUD operations across all tables</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3 User Roles in Detail */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Users size={22} color="#00F0FF" />
            <h2 style={{ fontSize: '1.6rem' }}>Three Distinct User Roles</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #00F0FF' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#00F0FF', marginBottom: '0.3rem' }}>1. Trainee</h3>
              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                Can explore verified gyms, filter by price and rating, select demo membership plans, calculate BMI, generate rule-based smart recommendations, book certified personal trainers, and leave reviews.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #B8FF00' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#B8FF00', marginBottom: '0.3rem' }}>2. Gym Owner</h3>
              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                Has an exclusive commercial control panel. Can add new gyms, edit gym info and opening hours, create and manage membership pricing plans, monitor active enrollees in the Member Intelligence Panel, and review crowd levels.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #FF7A00' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#FF7A00', marginBottom: '0.3rem' }}>3. Certified Trainer</h3>
              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                Has a dedicated coach dashboard to review trainee booking requests, 1-click accept or decline sessions, set hourly rates, and customize weekly training availability schedules.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(184, 255, 0, 0.1) 0%, rgba(0, 240, 255, 0.05) 100%)',
          border: '1px solid rgba(184, 255, 0, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            Ready to Experience FitSphere 360?
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Explore verified gyms, connect with certified fitness trainers, or create your account to unlock your personalized fitness journey.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('gyms')}
              className="btn-lime"
              style={{ padding: '0.75rem 2rem' }}
            >
              Explore Gyms
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className="btn-secondary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
