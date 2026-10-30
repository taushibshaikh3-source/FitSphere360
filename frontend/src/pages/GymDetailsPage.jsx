import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ShieldCheck, 
  Users, 
  Check, 
  Award, 
  Dumbbell, 
  ArrowLeft, 
  Sparkles,
  Send,
  Calendar,
  Activity
} from 'lucide-react';

export const GymDetailsPage = ({ gymId, setCurrentView, setSelectedTrainerId, setPreSelectedPlan }) => {
  const { user, showToast } = useAuth();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Selected plan processing
  const [enrollingPlanId, setEnrollingPlanId] = useState(null);

  const fetchGymDetails = () => {
    if (!gymId) return;
    setLoading(false);
    fetch(`/api/gyms/${gymId}`)
      .then(r => r.json())
      .then(data => {
        if (data.gym) {
          setGym(data.gym);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGymDetails();
  }, [gymId]);

  const handleSelectPlan = async (plan) => {
    if (!user) {
      showToast('Please log in as a trainee to select a membership plan.', 'info');
      setCurrentView('login');
      return;
    }

    setEnrollingPlanId(plan.id);
    try {
      const res = await fetch('/api/memberships/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          gym_id: gym.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll');

      showToast(data.message, 'success');
      // Navigate to Trainee dashboard to view the enrolled plan
      setTimeout(() => {
        setCurrentView('trainee_dashboard');
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEnrollingPlanId(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to submit a review.', 'info');
      setCurrentView('login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/gyms/${gym.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      showToast('Review submitted successfully!', 'success');
      setReviewComment('');
      fetchGymDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !gym) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#94A3B8' }}>
        <div className="pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '1rem' }}></div>
        <div>Loading gym information and facilities...</div>
      </div>
    );
  }

  const safetyFeatures = Array.isArray(gym.women_safety_features) 
    ? gym.women_safety_features 
    : [
        'Dedicated Women-Only Training Zone (2,500 sq ft)',
        'Female Certified Coaches on Duty 7 Days a Week',
        '24/7 CCTV & Private Biometric Keycard Access',
        'Locker Room Panic Call Buttons & Night Safety Escorts'
      ];

  return (
    <div style={{ padding: '2rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        {/* Back Link */}
        <button
          onClick={() => setCurrentView('gyms')}
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
          <span>Back to All Gyms</span>
        </button>

        {/* Hero Banner Showcase */}
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '360px', marginBottom: '2.5rem' }}>
          <img 
            src={gym.image_url} 
            alt={gym.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(7,9,13,0.3) 0%, rgba(7,9,13,0.92) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '2.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge-lime">★ {gym.rating} ({gym.review_count} Reviews)</span>
              <span className="badge-cyan">{gym.crowd_level} Crowd</span>
              <span className="badge-orange">{gym.city} Campus</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>
              {gym.name}
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', maxWidth: '800px', fontWeight: '500' }}>
              {gym.tagline || gym.description}
            </p>
          </div>
        </div>

        {/* Core Layout: Left Main Info + Right Quick Facts Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About Facility */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Facility Overview</h2>
              <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                {gym.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {(gym.fitness_goals || 'Strength, Cardio, Functional').split(',').map((goal, i) => (
                  <span key={i} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#B8FF00'
                  }}>
                    #{goal.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Women's Safety Information Breakdown */}
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(184, 255, 0, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <ShieldCheck size={24} color="#B8FF00" />
                <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF' }}>Women's Safety & Dedicated Zones</h2>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                FitSphere 360 verifies partner facilities to ensure comfortable, private, and secure workout environments for female athletes:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                {safetyFeatures.map((feature, i) => (
                  <div key={i} style={{
                    background: 'rgba(184, 255, 0, 0.05)',
                    border: '1px solid rgba(184, 255, 0, 0.15)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#E2E8F0'
                  }}>
                    <Check size={16} color="#B8FF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Inventory */}
            {gym.equipment && gym.equipment.length > 0 && (
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Dumbbell size={22} color="#00F0FF" />
                  <h2 style={{ fontSize: '1.35rem' }}>Equipment & Machinery Onsite</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {gym.equipment.map((eq) => (
                    <div key={eq.id} style={{
                      background: '#0D121A',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '0.2rem' }}>
                        {eq.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#B8FF00', marginBottom: '0.4rem' }}>
                        {eq.category} • {eq.target_muscle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
                        <span>Units: {eq.quantity}</span>
                        <span style={{ color: '#10B981' }}>Condition: {eq.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quick Facts & Live Crowd Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Quick Details Box */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Facility Logistics</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} color="#B8FF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: '700', color: '#FFFFFF' }}>Address</div>
                    <div style={{ color: '#94A3B8' }}>{gym.address}, {gym.city}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Clock size={18} color="#B8FF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: '700', color: '#FFFFFF' }}>Operating Hours</div>
                    <div style={{ color: '#94A3B8' }}>{gym.opening_hours} – {gym.closing_hours}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Phone size={18} color="#B8FF00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: '700', color: '#FFFFFF' }}>Contact Desk</div>
                    <div style={{ color: '#94A3B8' }}>{gym.contact_phone || '+1 (555) 901-2000'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustrative Live Crowd Meter (Practical & Honest as per instructions) */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="#00F0FF" />
                  <h3 style={{ fontSize: '1.15rem' }}>Gym Crowd Level</h3>
                </div>
                <span className="badge-cyan">{gym.crowd_level}</span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '1rem' }}>
                Illustrative floor capacity indicator based on regular scheduled attendance patterns:
              </p>

              {/* Meter Bar */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{
                  width: `${gym.crowd_percent || 55}%`,
                  height: '100%',
                  background: gym.crowd_percent > 75 ? '#FF4560' : gym.crowd_percent > 45 ? '#B8FF00' : '#00F0FF',
                  borderRadius: '10px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
                <span>Low (Early Morning)</span>
                <span style={{ color: '#B8FF00', fontWeight: '700' }}>{gym.crowd_percent}% Occupied</span>
                <span>Peak (Evening)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MEMBERSHIP PLANS SECTION */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>MEMBERSHIP ACCESS</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Choose Your Membership Plan</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Select a pass to simulate instant 1-click enrollment. Saved directly into your Trainee Dashboard.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {(gym.plans || []).map((plan) => {
              const features = Array.isArray(plan.features) ? plan.features : ['Full Floor Access', 'Locker Room Privileges'];
              const isEnrolling = enrollingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="glass-panel hover-card"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.is_popular ? '2px solid #B8FF00' : '1px solid rgba(255,255,255,0.08)',
                    background: plan.is_popular ? 'rgba(21, 27, 38, 0.95)' : 'var(--bg-glass)'
                  }}
                >
                  {plan.is_popular === 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#B8FF00',
                      color: '#07090D',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.8rem',
                      borderRadius: '20px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      MOST POPULAR
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{plan.name}</h3>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Duration: <strong style={{ color: '#FFFFFF' }}>{plan.duration}</strong>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#B8FF00' }}>₹{plan.price.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}> / {plan.duration}</span>
                  </div>

                  <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    {plan.description}
                  </p>

                  {/* Plan Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#E2E8F0' }}>
                        <Check size={16} color="#B8FF00" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Plan Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isEnrolling}
                    className="btn-lime"
                    style={{ width: '100%', padding: '0.75rem', marginTop: 'auto' }}
                  >
                    {isEnrolling ? 'Enrolling...' : 'Select Plan (Demo Pass)'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ASSIGNED TRAINERS AT THIS GYM */}
        {gym.trainers && gym.trainers.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Personal Coaches at this Location</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {gym.trainers.map((trainer) => (
                <div key={trainer.id} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <img 
                    src={trainer.avatar_url} 
                    alt={trainer.name}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem auto', border: '2px solid #B8FF00' }}
                  />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{trainer.name}</h4>
                  <div style={{ color: '#B8FF00', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {trainer.specialization}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
                    Rate: <strong style={{ color: '#FFFFFF' }}>₹{trainer.hourly_rate.toLocaleString('en-IN')}/hr</strong>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTrainerId(trainer.id);
                      setCurrentView('trainer_profile');
                    }}
                    className="btn-lime"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}
                  >
                    View Schedule & Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. REVIEWS & RATINGS */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Trainee Reviews & Ratings</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                Community feedback saved permanently in the database.
              </p>
            </div>
            <div className="badge-lime" style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
              ★ {gym.rating} Average Rating ({gym.reviews ? gym.reviews.length : 0} reviews)
            </div>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} style={{
            background: '#0D121A',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Leave a Review for {gym.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: star <= reviewRating ? '#B8FF00' : '#475569',
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#B8FF00' }}>({reviewRating} Stars)</span>
            </div>

            <textarea
              rows="3"
              placeholder="Describe your training experience, coaching quality, or equipment condition..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="form-input-dark"
              style={{ marginBottom: '1rem' }}
              required
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-lime"
              style={{ padding: '0.55rem 1.4rem', fontSize: '0.88rem' }}
            >
              <Send size={15} />
              <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(!gym.reviews || gym.reviews.length === 0) ? (
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              gym.reviews.map((rev) => (
                <div key={rev.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        color: '#B8FF00'
                      }}>
                        {rev.reviewer_name ? rev.reviewer_name[0] : 'U'}
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>{rev.reviewer_name}</span>
                    </div>
                    <span style={{ color: '#B8FF00', fontSize: '0.85rem' }}>
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: '1.6' }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
