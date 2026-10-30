import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Award, 
  MapPin, 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  User,
  Activity
} from 'lucide-react';

export const TraineeDashboard = ({ setCurrentView, setSelectedGymId, setSelectedTrainerId }) => {
  const { user, showToast } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTraineeData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/memberships/my').then(r => r.json()),
      fetch('/api/bookings/my').then(r => r.json())
    ])
      .then(([mRes, bRes]) => {
        setMemberships(mRes.memberships || []);
        setBookings(bRes.bookings || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTraineeData();
  }, []);

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        {/* Welcome Banner */}
        <div className="glass-panel" style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          borderLeft: '4px solid #B8FF00'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="badge-lime">TRAINEE CONTROL HUB</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Goal: {user ? user.fitness_goal : 'General Fitness'}</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>
              Welcome back, {user ? user.name : 'Athlete'}!
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
              Track your gym passes, manage scheduled personal trainer sessions, and monitor your fitness progress.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('trainers')}
              className="btn-lime"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
            >
              <Award size={16} />
              <span>Find Master Trainers</span>
            </button>
            <button
              onClick={() => setCurrentView('gyms')}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem' }}
            >
              <Dumbbell size={16} />
              <span>Explore New Gyms</span>
            </button>
            <button
              onClick={() => setCurrentView('bmi')}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.9rem' }}
            >
              <Calculator size={16} />
              <span>BMI Calculator</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Active Memberships
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#B8FF00' }}>
              {memberships.filter(m => m.status === 'active').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Enrolled fitness clubs</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Upcoming Sessions
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#00F0FF' }}>
              {bookings.filter(b => b.status === 'accepted').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Confirmed coach appointments</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Pending Requests
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FF7A00' }}>
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>Awaiting trainer confirmation</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Primary Fitness Target
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', marginTop: '0.4rem' }}>
              {user?.fitness_goal || 'Muscle Building'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#B8FF00', marginTop: '0.3rem' }}>Personalized plan active</div>
          </div>
        </div>

        {/* Section 1: My Active Memberships */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>My Enrolled Gym Passes</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Membership plans saved permanently in the SQLite database</p>
            </div>
            <button
              onClick={() => setCurrentView('gyms')}
              style={{ background: 'transparent', border: 'none', color: '#B8FF00', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Browse More Plans →
            </button>
          </div>

          {memberships.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎟️</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No active membership passes yet</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Browse our verified gym partners and select a plan to test 1-click simulated enrollment.
              </p>
              <button onClick={() => setCurrentView('gyms')} className="btn-lime">
                Explore Verified Gyms
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {memberships.map((m) => (
                <div key={m.id} className="glass-panel hover-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span className="badge-lime" style={{ marginBottom: '0.4rem' }}>{m.status.toUpperCase()}</span>
                      <h3 style={{ fontSize: '1.3rem' }}>{m.plan_name}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#B8FF00', fontWeight: '700' }}>
                        {m.gym_name} ({m.gym_city})
                      </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF' }}>
                      ₹{m.plan_price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{
                    background: '#0D121A',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#94A3B8' }}>Start Date:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{m.start_date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#94A3B8' }}>Valid Until:</span>
                      <span style={{ color: '#B8FF00', fontWeight: '700' }}>{m.expiry_date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94A3B8' }}>Demo Receipt:</span>
                      <span style={{ color: '#64748B' }}>{m.payment_demo_id || 'FS360-PAID'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGymId(m.gym_id);
                      setCurrentView('gym_details');
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                  >
                    View Facility Details & Hours
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Trainer Bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>My Personal Trainer Bookings</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Direct 1-on-1 coaching requests with status feedback</p>
            </div>
            <button
              onClick={() => setCurrentView('trainers')}
              style={{ background: 'transparent', border: 'none', color: '#00F0FF', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Book Another Trainer →
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🥊</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No trainer appointments booked</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Browse our directory of certified master trainers and request a training session.
              </p>
              <button onClick={() => setCurrentView('trainers')} className="btn-lime">
                Browse Master Trainers
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {bookings.map((b) => {
                const isAccepted = b.status === 'accepted';
                const isPending = b.status === 'pending';
                const isRejected = b.status === 'rejected';

                return (
                  <div key={b.id} className="glass-panel hover-card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <img 
                        src={b.trainer_avatar} 
                        alt={b.trainer_name}
                        style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #B8FF00' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>{b.trainer_name}</h4>
                        <div style={{ color: '#B8FF00', fontSize: '0.8rem', fontWeight: '700' }}>
                          {b.specialization}
                        </div>
                        {b.gym_name && (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{b.gym_name}</div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      background: '#0D121A',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.82rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#94A3B8' }}>Date:</span>
                        <strong style={{ color: '#FFFFFF' }}>{b.booking_date}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#94A3B8' }}>Time Slot:</span>
                        <strong style={{ color: '#00F0FF' }}>{b.time_slot}</strong>
                      </div>
                      {b.notes && (
                        <div style={{ color: '#CBD5E1', fontSize: '0.78rem', marginTop: '0.5rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                          "{b.notes}"
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={
                        isAccepted ? 'badge-lime' : isPending ? 'badge-orange' : 'badge-cyan'
                      }>
                        {isAccepted ? '✓ Confirmed by Coach' : isPending ? '⏳ Pending Coach Review' : 'Session Completed'}
                      </span>
                      <span style={{ color: '#B8FF00', fontWeight: '800', fontSize: '0.9rem' }}>
                        ₹{b.hourly_rate.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
