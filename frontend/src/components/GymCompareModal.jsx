import React from 'react';
import { X, Check, ShieldCheck, Star, Clock, Users, ArrowRight } from 'lucide-react';

export const GymCompareModal = ({ gyms, onClose, onViewDetails }) => {
  if (!gyms || gyms.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Side-by-Side Gym Comparison</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Comparing {gyms.length} fitness facilities across features, safety, and pricing</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.5rem' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `180px repeat(${gyms.length}, minmax(220px, 1fr))`,
          gap: '1rem',
          overflowX: 'auto'
        }}>
          {/* Row: Header / Visual */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
            Facility
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ textAlign: 'center' }}>
              <img 
                src={g.image_url} 
                alt={g.name} 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.5rem' }}
              />
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#FFFFFF' }}>{g.name}</div>
              <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>{g.city}</div>
            </div>
          ))}

          {/* Row: Pricing */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Pricing
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#B8FF00' }}>From ₹{g.min_price.toLocaleString('en-IN')}/mo</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{g.price_range}</div>
            </div>
          ))}

          {/* Row: Rating */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Rating
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', textAlign: 'center' }}>
              <span className="badge-lime">★ {g.rating} / 5.0</span>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>({g.review_count} reviews)</div>
            </div>
          ))}

          {/* Row: Operating Hours */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Operating Hours
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <div>{g.opening_hours} - {g.closing_hours}</div>
            </div>
          ))}

          {/* Row: Crowd Level */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Crowd Level
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', textAlign: 'center' }}>
              <span className="badge-cyan">{g.crowd_level} ({g.crowd_percent}%)</span>
            </div>
          ))}

          {/* Row: Women Safety Features */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Women's Safety
          </div>
          {gyms.map((g) => {
            const features = Array.isArray(g.women_safety_features) ? g.women_safety_features : [];
            return (
              <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', fontSize: '0.78rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {features.slice(0, 3).map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: '#E2E8F0' }}>
                      <Check size={14} color="#B8FF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Row: Specialization Goals */}
          <div style={{ fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            Focus Disciplines
          </div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', textAlign: 'center', fontSize: '0.78rem', color: '#CBD5E1' }}>
              {g.fitness_goals}
            </div>
          ))}

          {/* Row: Actions */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}></div>
          {gyms.map((g) => (
            <div key={g.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => {
                  onClose();
                  onViewDetails(g.id);
                }}
                className="btn-lime"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
              >
                <span>Select & Enroll</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
