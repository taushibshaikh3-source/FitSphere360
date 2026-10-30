import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Users, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Award,
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const HomePage = ({ setCurrentView, setSelectedGymId, setSelectedTrainerId }) => {
  const [featuredGyms, setFeaturedGyms] = useState([]);
  const [featuredTrainers, setFeaturedTrainers] = useState([]);

  useEffect(() => {
    // Fetch top gyms and trainers
    fetch('/api/gyms')
      .then(r => r.json())
      .then(data => setFeaturedGyms((data.gyms || []).slice(0, 3)))
      .catch(err => console.error(err));

    fetch('/api/trainers')
      .then(r => r.json())
      .then(data => setFeaturedTrainers((data.trainers || []).slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const workoutCategories = [
    { name: 'Boxing', icon: '🥊', trainers: '12 Trainers', color: '#FF4560' },
    { name: 'Yoga & Mindfulness', icon: '🧘‍♀️', trainers: '14 Trainers', color: '#A855F7' },
    { name: 'Cardio & HIIT', icon: '⚡', trainers: '18 Trainers', color: '#00F0FF' },
    { name: 'Strength Training', icon: '🏋️‍♂️', trainers: '22 Trainers', color: '#B8FF00' },
    { name: 'Pilates Reformer', icon: '✨', trainers: '9 Trainers', color: '#EC4899' },
    { name: 'CrossFit', icon: '🔥', trainers: '11 Trainers', color: '#FF7A00' },
    { name: 'Cycling & Spin', icon: '🚴', trainers: '8 Trainers', color: '#10B981' },
    { name: 'Martial Arts', icon: '🥋', trainers: '6 Trainers', color: '#EAB308' },
    { name: 'Calisthenics', icon: '🤸', trainers: '10 Trainers', color: '#6366F1' },
    { name: 'Swimming & Aqua', icon: '🏊', trainers: '7 Trainers', color: '#06B6D4' }
  ];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 3.5rem 1.5rem',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(184, 255, 0, 0.12) 0%, rgba(9, 11, 16, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container-custom" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(184, 255, 0, 0.1)',
            border: '1px solid rgba(184, 255, 0, 0.3)',
            borderRadius: '50px',
            padding: '0.4rem 1.2rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#B8FF00',
            marginBottom: '1.75rem'
          }}>
            <Sparkles size={16} />
            <span>THE NEXT-GEN SMART FITNESS & GYM ECOSYSTEM</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.08',
            maxWidth: '920px',
            margin: '0 auto 1.5rem auto',
            letterSpacing: '-0.03em'
          }}>
            Find Your Perfect Fitness Space & <span style={{ color: '#B8FF00' }}>Simplify Your Business</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.22rem)',
            color: '#94A3B8',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.6'
          }}>
            Discover elite gyms verified for safety, book top certified trainers, leverage intelligent rule-based AI fitness matching, and manage fitness operations seamlessly.
          </p>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '4rem'
          }}>
            <button
              onClick={() => setCurrentView('gyms')}
              className="btn-lime"
              style={{ padding: '0.85rem 2.2rem', fontSize: '1.05rem' }}
            >
              <span>Explore Verified Gyms</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setCurrentView('recommendations')}
              className="btn-secondary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
            >
              <Sparkles size={18} color="#B8FF00" />
              <span>Smart AI Match</span>
            </button>
            <button
              onClick={() => setCurrentView('bmi')}
              className="btn-secondary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}
            >
              <span>Calculate BMI</span>
            </button>
          </div>

          {/* 3D Glassmorphic Preview Dashboard (Matching Reference Image 1 & 2) */}
          <div className="glass-panel-elevated" style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '1.5rem',
            textAlign: 'left',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(184, 255, 0, 0.1)',
            position: 'relative'
          }}>
            {/* Top Browser Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.3rem 1.5rem',
                borderRadius: '30px',
                fontSize: '0.78rem',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#B8FF00' }}>🔒</span>
                <span>app.fitsphere360.com / gym-intelligence</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="pulse-dot"></span>
                <span style={{ fontSize: '0.75rem', color: '#B8FF00', fontWeight: '700' }}>LIVE ENGINE</span>
              </div>
            </div>

            {/* Preview Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {/* Stat 1 */}
              <div style={{ background: '#0D121A', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '600' }}>Monthly Revenue</span>
                  <span className="badge-lime">+14.2%</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF' }}>₹4,53,000</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>Verified active subscriptions</div>
              </div>

              {/* Stat 2 */}
              <div style={{ background: '#0D121A', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '600' }}>Active Members</span>
                  <span className="badge-cyan">1,245 Total</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF' }}>89 Today</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>Check-ins logged today</div>
              </div>

              {/* Stat 3 */}
              <div style={{ background: '#0D121A', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '600' }}>Live Floor Capacity</span>
                  <span className="badge-lime">Optimal</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#B8FF00' }}>58% Full</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>Moderate crowd flow</div>
              </div>

              {/* Stat 4 */}
              <div style={{ background: '#0D121A', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '600' }}>Certified Trainers</span>
                  <span className="badge-orange">4 On-Duty</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF' }}>12 Active</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>99.2% satisfaction rate</div>
              </div>
            </div>

            {/* Bottom preview banner: interactive role test CTA */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(184, 255, 0, 0.12) 0%, rgba(0, 240, 255, 0.05) 100%)',
              border: '1px solid rgba(184, 255, 0, 0.25)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} color="#B8FF00" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#FFFFFF' }}>
                    Full Role-Based Architecture & Smart Management
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    Specialized dashboards for Trainees, Gym Owners, and Certified Trainers.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('gyms')}
                className="btn-lime"
                style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
              >
                Browse All Features →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BRAND STRIP */}
      <section style={{
        padding: '2rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.015)'
      }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Trusted by World-Class Fitness Facilities & Leading Sports Academies
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3rem',
            opacity: 0.65
          }}>
            {['IRONPULSE ARENA', 'EQUINOX ELITE', 'GOLD\'S ATHLETICS', '24 HOUR FITNESS', 'AURA WELLNESS', 'TITAN STRENGTH'].map((brand, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '900',
                letterSpacing: '0.12em',
                fontSize: '1rem',
                color: '#CBD5E1'
              }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS (Matching Reference Image 1) */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge-lime" style={{ marginBottom: '0.75rem' }}>ELEVATED CAPABILITIES</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>
              Boost Your Fitness Business & Health Journey
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
              Engineered with modern full-stack architecture to ensure seamless management for owners, reliable bookings for trainers, and rich discovery for trainees.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Card 1 */}
            <div className="glass-panel hover-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: 'rgba(184, 255, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: '#B8FF00'
              }}>
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Member Status & Plans</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Easily manage member profiles, track active passes, view real-time expiration dates, and test 1-click simulated enrollment.
              </p>
              <button 
                onClick={() => setCurrentView('gyms')}
                style={{ background: 'transparent', border: 'none', color: '#B8FF00', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>Learn More</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Card 2 */}
            <div className="glass-panel hover-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: '#00F0FF'
              }}>
                <Award size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Certified Trainer Hub</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Browse qualified master trainers, view specializations, check availability schedules, and submit booking requests with instant status tracking.
              </p>
              <button 
                onClick={() => setCurrentView('trainers')}
                style={{ background: 'transparent', border: 'none', color: '#00F0FF', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>Explore Trainers</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Card 3 */}
            <div className="glass-panel hover-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 107, 53, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: '#FF6B35'
              }}>
                <TrendingUp size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Revenue & Crowd Tracker</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Track gym financial growth trends, monitor floor capacity indicators, and manage equipment status to ensure peak operational performance.
              </p>
              <button 
                onClick={() => setCurrentView('owner_dashboard')}
                style={{ background: 'transparent', border: 'none', color: '#FF6B35', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>View Dashboard</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED GYMS SECTION */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: '#0A0D14' }}>
        <div className="container-custom">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            <div>
              <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>VERIFIED GYM SPACES</span>
              <h2 style={{ fontSize: '2.2rem' }}>Featured Premium Gyms</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
                Hand-picked high-performance gyms with transparent pricing and verified women's safety features.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('gyms')}
              className="btn-outline-lime"
            >
              <span>View All Gyms</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {featuredGyms.map((gym) => (
              <div 
                key={gym.id}
                className="glass-panel hover-card"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Gym Image */}
                <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                  <img 
                    src={gym.image_url} 
                    alt={gym.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <span className="badge-lime">
                      <Star size={12} fill="#B8FF00" />
                      {gym.rating} ({gym.review_count})
                    </span>
                    <span className="badge-cyan">
                      {gym.crowd_level} Crowd ({gym.crowd_percent}%)
                    </span>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(7, 9, 13, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#B8FF00',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '800'
                  }}>
                    From ₹{gym.min_price.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <MapPin size={14} color="#B8FF00" />
                    <span>{gym.address}, {gym.city}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                    {gym.name}
                  </h3>
                  <p style={{
                    color: '#94A3B8',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {gym.description}
                  </p>

                  {/* Women Safety highlight */}
                  <div style={{
                    background: 'rgba(184, 255, 0, 0.05)',
                    border: '1px solid rgba(184, 255, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#E2E8F0',
                    marginBottom: '1.25rem'
                  }}>
                    <ShieldCheck size={16} color="#B8FF00" />
                    <span>Women-Safety Certified Zone & Female Coaches</span>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setSelectedGymId(gym.id);
                        setCurrentView('gym_details');
                      }}
                      className="btn-lime"
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.88rem' }}
                    >
                      View Details & Plans
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FIND TRAINERS SPOTLIGHT (Matching Reference Image 1) */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <span className="badge-cyan" style={{ marginBottom: '0.5rem' }}>ELITE PERFORMANCE COACHES</span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>Find a Certified Trainer</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Work with vetted fitness professionals tailored to your personal goals, from Olympic lifting to clinical rehabilitation.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {featuredTrainers.map((trainer) => (
              <div 
                key={trainer.id}
                className="glass-panel hover-card"
                style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem auto' }}>
                  <img 
                    src={trainer.avatar_url} 
                    alt={trainer.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #B8FF00' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#07090D',
                    borderRadius: '50%',
                    padding: '3px',
                    display: 'flex'
                  }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#B8FF00' }}></div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>{trainer.name}</h3>
                <div style={{ color: '#B8FF00', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {trainer.specialization}
                </div>

                {/* Trainer mini stats */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  padding: '0.6rem 0',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  margin: '0.5rem 0 1rem 0',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{trainer.experience_years}+ Yrs</div>
                    <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Experience</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>★ {trainer.rating}</div>
                    <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Rating</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>₹{trainer.hourly_rate.toLocaleString('en-IN')}/hr</div>
                    <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Rate</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTrainerId(trainer.id);
                    setCurrentView('trainer_profile');
                  }}
                  className="btn-lime"
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', marginTop: 'auto' }}
                >
                  View Profile & Book
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => setCurrentView('trainers')}
              className="btn-secondary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Browse All Trainers ({featuredTrainers.length}+ Available)
            </button>
          </div>
        </div>
      </section>

      {/* 6. WORKOUT CATEGORIES GRID (Matching Reference Image 1) */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: '#090C12' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>TARGETED DISCIPLINES</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Workout Categories</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
              Find gyms and elite trainers tailored to your specific fitness passion.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {workoutCategories.map((cat, i) => (
              <div 
                key={i}
                onClick={() => setCurrentView('workouts')}
                className="glass-panel hover-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  fontSize: '1.6rem',
                  width: '45px',
                  height: '45px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#FFFFFF' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{cat.trainers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIALS (Matching Reference Image 1) */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span className="badge-cyan" style={{ marginBottom: '0.5rem' }}>COMMUNITY VOICES</span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>What Our Clients Say</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Real trainees and facility operators sharing their transformational experience with FitSphere 360.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {[
              {
                quote: "FitSphere 360 transformed how I discover gyms. The dedicated women's safety badges gave me the confidence to join Aura Wellness immediately!",
                author: "Sarah Jenkins",
                role: "Trainee & Marathon Runner",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
              },
              {
                quote: "As a gym director managing 1,200+ members, the analytics panel and revenue tracking give our management team total operational visibility.",
                author: "Marcus Vance",
                role: "Gym Owner, IronPulse Arena",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              },
              {
                quote: "Client scheduling used to be a nightmare of missed DMs. Now my calendar stays booked 3 weeks in advance with committed trainees.",
                author: "Coach John Doe",
                role: "CSCS Master Trainer",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=120&auto=format&fit=crop&q=80"
              }
            ].map((testi, i) => (
              <div key={i} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#B8FF00', fontSize: '1.5rem', marginBottom: '0.75rem' }}>❝</div>
                <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1, fontStyle: 'italic' }}>
                  {testi.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={testi.avatar} 
                    alt={testi.author} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFFFFF' }}>{testi.author}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{testi.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#B8FF00', fontSize: '0.8rem' }}>
                    {'★'.repeat(testi.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(180deg, rgba(9, 11, 16, 0.4) 0%, rgba(184, 255, 0, 0.08) 100%)',
        textAlign: 'center'
      }}>
        <div className="container-custom" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Ready to Take Your Fitness Journey to the <span style={{ color: '#B8FF00' }}>Next Level?</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Join thousands of trainees, gym owners, and certified coaches on FitSphere 360 today. Experience rule-based recommendation and modern gym management.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('signup')}
              className="btn-lime"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}
            >
              Get Started for Free
            </button>
            <button
              onClick={() => setCurrentView('gyms')}
              className="btn-secondary"
              style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem' }}
            >
              Browse Gyms Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
