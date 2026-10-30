import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Award, 
  Clock, 
  Calendar, 
  DollarSign, 
  Check, 
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';
import { BookingModal } from '../components/BookingModal';

export const TrainerProfilePage = ({ trainerId, setCurrentView }) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    setLoading(true);
    fetch(`/api/trainers/${trainerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.trainer) {
          setTrainer(data.trainer);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [trainerId]);

  if (loading || !trainer) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#94A3B8' }}>
        <div className="pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '1rem' }}></div>
        <div>Loading coach profile and schedule...</div>
      </div>
    );
  }

  const availability = typeof trainer.availability === 'object' && trainer.availability !== null
    ? trainer.availability
    : {
        'Monday': '07:00 AM - 12:00 PM, 04:00 PM - 08:00 PM',
        'Wednesday': '07:00 AM - 12:00 PM, 04:00 PM - 08:00 PM',
        'Friday': '07:00 AM - 12:00 PM, 03:00 PM - 07:00 PM',
        'Saturday': '09:00 AM - 02:00 PM'
      };

  return (
    <div style={{ padding: '2rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom" style={{ maxWidth: '980px' }}>
        {/* Back Link */}
        <button
          onClick={() => setCurrentView('trainers')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#B8FF00'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
        >
          <ArrowLeft size={16} />
          <span>Back to All Trainers</span>
        </button>

        {/* Profile Header Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center'
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <img 
                src={trainer.profile_image || trainer.avatar_url} 
                alt={trainer.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #B8FF00', boxShadow: '0 0 25px rgba(184, 255, 0, 0.3)' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: '#07090D',
                borderRadius: '50%',
                padding: '4px'
              }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#B8FF00' }}></div>
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge-lime">★ {trainer.rating || 4.9} Rating</span>
                <span className="badge-cyan">{trainer.experience_years}+ Years Experience</span>
                <span className="badge-orange">₹{Number(trainer.hourly_rate || 1200).toLocaleString('en-IN')} / Hour</span>
              </div>

              <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem', color: '#FFFFFF' }}>{trainer.name}</h1>
              <div style={{ color: '#B8FF00', fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                {trainer.specialization}
              </div>

              {trainer.gym_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.88rem' }}>
                  <MapPin size={15} color="#00F0FF" />
                  <span>Resident Coach at <strong>{trainer.gym_name}</strong> {trainer.gym_city && `(${trainer.gym_city})`}</span>
                </div>
              )}
            </div>

            {/* Book Trainer Button */}
            <div>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn-lime"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Calendar size={18} />
                <span>Book Trainer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Bio & Philosophy */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Coaching Philosophy & Background</h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {trainer.bio}
            </p>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#B8FF00' }}>Qualifications & Certifications</h3>
            <div style={{
              background: '#0D121A',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.88rem',
              color: '#F8FAFC'
            }}>
              {trainer.qualifications}
            </div>
          </div>

          {/* Weekly Availability Schedule */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} color="#00F0FF" />
              <h2 style={{ fontSize: '1.35rem' }}>Weekly Availability Schedule</h2>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Standard training slots open for trainee booking:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(availability).map(([day, hours]) => (
                <div key={day} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <strong style={{ color: '#FFFFFF' }}>{day}</strong>
                  <span style={{ color: '#B8FF00', fontSize: '0.8rem' }}>{hours}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-outline-lime"
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              Request a Specific Date & Time
            </button>
          </div>
        </div>

        {/* Booking Modal */}
        {bookingModalOpen && (
          <BookingModal
            trainer={trainer}
            onClose={() => setBookingModalOpen(false)}
            onSuccess={() => {
              setTimeout(() => {
                setCurrentView('trainee_dashboard');
              }, 1200);
            }}
          />
        )}
      </div>
    </div>
  );
};
