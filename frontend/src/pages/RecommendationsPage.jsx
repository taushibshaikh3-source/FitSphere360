import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Target, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Star,
  CheckCircle2
} from 'lucide-react';

export const RecommendationsPage = ({ setCurrentView, setSelectedGymId }) => {
  const [budget, setBudget] = useState(3500);
  const [location, setLocation] = useState('All');
  const [goal, setGoal] = useState('Muscle Building');
  const [needsTrainer, setNeedsTrainer] = useState(true);
  const [safetyPriority, setSafetyPriority] = useState(true);

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e && e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: Number(budget),
          location: location === 'All' ? '' : location,
          goal: goal,
          needs_trainer: needsTrainer,
          safety_priority: safetyPriority
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom" style={{ maxWidth: '980px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(184, 255, 0, 0.12)',
            border: '1px solid rgba(184, 255, 0, 0.3)',
            borderRadius: '50px',
            padding: '0.4rem 1.25rem',
            color: '#B8FF00',
            fontWeight: '700',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <Sparkles size={16} />
            <span>RULE-BASED AI RECOMMENDATION ENGINE</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', marginBottom: '0.75rem' }}>
            Find Your Optimal Gym Match
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
            Our smart fitness algorithm evaluates facility pricing, geographic proximity, coaching talent, and dedicated women's safety zones to pinpoint your ideal workout space.
          </p>
        </div>

        {/* Questionnaire Form Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <form onSubmit={handleGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* Question 1: Fitness Goal */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '700', marginBottom: '0.75rem' }}>
                  <Target size={18} color="#B8FF00" />
                  <span>1. Primary Fitness Goal</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: 'Muscle Building', label: 'Hypertrophy & Muscle Building' },
                    { id: 'Strength Training', label: 'Powerlifting & Olympic Iron' },
                    { id: 'Yoga', label: 'Yoga, Pilates & Mobility' },
                    { id: 'Cardio', label: 'Fat Loss & High-Intensity Cardio' },
                    { id: 'Boxing', label: 'Boxing & Combat Conditioning' }
                  ].map((item) => (
                    <label 
                      key={item.id}
                      style={{
                        background: goal === item.id ? '#1C2433' : 'rgba(255, 255, 255, 0.02)',
                        border: goal === item.id ? '1px solid #B8FF00' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '0.65rem 0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        color: goal === item.id ? '#FFFFFF' : '#CBD5E1'
                      }}
                    >
                      <input
                        type="radio"
                        name="goal"
                        value={item.id}
                        checked={goal === item.id}
                        onChange={() => setGoal(item.id)}
                        style={{ accentColor: '#B8FF00' }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2: Monthly Budget */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '700', marginBottom: '0.75rem' }}>
                  <DollarSign size={18} color="#B8FF00" />
                  <span>2. Maximum Monthly Budget</span>
                </label>
                <div style={{
                  background: '#0D121A',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Budget Target:</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#B8FF00' }}>₹{budget.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="250"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem' }}>
                    <span>₹1,000 (Starter)</span>
                    <span>₹3,500 (Average)</span>
                    <span>₹10,000 (VIP)</span>
                  </div>
                </div>

                {/* Question 3: Preferred City/Location */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: '700', marginBottom: '0.5rem' }}>
                  <MapPin size={18} color="#00F0FF" />
                  <span>3. Preferred Campus Location</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input-dark"
                >
                  <option value="All">Any Campus Location</option>
                  <option value="Downtown">Downtown Campus</option>
                  <option value="Uptown">Uptown Highland</option>
                  <option value="Westside">Westside Industrial</option>
                  <option value="Metro Hub">Metro Hub Transit</option>
                  <option value="Eastside">Eastside Combat Zone</option>
                </select>
              </div>

              {/* Question 4 & 5: Trainer & Women Safety Preferences */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* Trainer checkbox */}
                  <label style={{
                    background: needsTrainer ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: needsTrainer ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={needsTrainer}
                      onChange={(e) => setNeedsTrainer(e.target.checked)}
                      style={{ accentColor: '#00F0FF', width: '18px', height: '18px', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>
                        Require Onsite Certified Trainers
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                        Match gyms with top CSCS and Olympic lifting coaches available.
                      </div>
                    </div>
                  </label>

                  {/* Women Safety priority */}
                  <label style={{
                    background: safetyPriority ? 'rgba(184, 255, 0, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: safetyPriority ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={safetyPriority}
                      onChange={(e) => setSafetyPriority(e.target.checked)}
                      style={{ accentColor: '#B8FF00', width: '18px', height: '18px', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>
                        High Priority: Women's Safety & Female Zones
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                        Boost gyms with private female workout floors and female staff.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-lime"
                style={{ padding: '0.95rem 3rem', fontSize: '1.05rem' }}
              >
                <Sparkles size={18} />
                <span>{loading ? 'Evaluating Facilities...' : 'Generate Smart Gym Recommendations'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recommendation Results Showcase */}
        {recommendations && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Recommended Gyms For You</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Ranked by rule-based algorithmic fitness compatibility</p>
              </div>
              <span className="badge-lime">{recommendations.length} Facilities Evaluated</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recommendations.map((rec, index) => {
                const gym = rec.gym;
                const matchPct = rec.match_percent;
                const isTopPick = index === 0;

                return (
                  <div 
                    key={gym.id}
                    className="glass-panel hover-card"
                    style={{
                      padding: '1.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '1.5rem',
                      alignItems: 'center',
                      border: isTopPick ? '2px solid #B8FF00' : '1px solid rgba(255, 255, 255, 0.08)',
                      position: 'relative'
                    }}
                  >
                    {isTopPick && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '24px',
                        background: '#B8FF00',
                        color: '#07090D',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        padding: '0.25rem 0.85rem',
                        borderRadius: '20px',
                        letterSpacing: '0.05em'
                      }}>
                        ★ TOP AI MATCH
                      </div>
                    )}

                    {/* Left: Image & Badge */}
                    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '180px' }}>
                      <img 
                        src={gym.image_url} 
                        alt={gym.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(7, 9, 13, 0.9)',
                        color: '#B8FF00',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '800'
                      }}>
                        From ₹{gym.min_price.toLocaleString('en-IN')}/mo
                      </div>
                    </div>

                    {/* Center: Details & Why it Matched */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{gym.city}</span>
                        <span>•</span>
                        <span style={{ color: '#B8FF00', fontSize: '0.85rem', fontWeight: '700' }}>★ {gym.rating}</span>
                      </div>

                      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{gym.name}</h3>
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                        {gym.tagline || gym.description}
                      </p>

                      {/* Match reasons pills */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {rec.reasons.map((r, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                            <CheckCircle2 size={14} color="#B8FF00" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Score Dial & CTA */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '75px',
                        height: '75px',
                        borderRadius: '50%',
                        border: `4px solid ${matchPct > 80 ? '#B8FF00' : '#00F0FF'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        fontWeight: '900',
                        color: matchPct > 80 ? '#B8FF00' : '#00F0FF',
                        marginBottom: '0.5rem',
                        boxShadow: `0 0 15px ${matchPct > 80 ? 'rgba(184, 255, 0, 0.25)' : 'rgba(0, 240, 255, 0.25)'}`
                      }}>
                        {matchPct}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        Compatibility Score
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGymId(gym.id);
                          setCurrentView('gym_details');
                        }}
                        className="btn-lime"
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                      >
                        <span>View Plans</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
