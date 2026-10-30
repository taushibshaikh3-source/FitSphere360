import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Award, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Filter,
  User,
  ArrowRight
} from 'lucide-react';
import { BookingModal } from '../components/BookingModal';

export const TrainerListingPage = ({ setCurrentView, setSelectedTrainerId }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');

  // Booking Modal
  const [activeTrainerForBooking, setActiveTrainerForBooking] = useState(null);

  const fetchTrainers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSpec !== 'All') params.append('specialization', selectedSpec);
    if (selectedExp !== 'All') params.append('experience', selectedExp);
    if (selectedLocation !== 'All') params.append('location', selectedLocation);
    if (selectedDay !== 'All') params.append('available_day', selectedDay);

    const url = `/api/trainers?${params.toString()}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        let list = data.trainers || [];
        if (search.trim()) {
          const q = search.toLowerCase();
          list = list.filter(t => 
            (t.name && t.name.toLowerCase().includes(q)) || 
            (t.specialization && t.specialization.toLowerCase().includes(q)) ||
            (t.gym_name && t.gym_name.toLowerCase().includes(q)) ||
            (t.qualifications && t.qualifications.toLowerCase().includes(q))
          );
        }
        setTrainers(list);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrainers();
  }, [selectedSpec, selectedExp, selectedLocation, selectedDay, search]);

  const specializations = [
    'All',
    'Strength',
    'Pilates',
    'Endurance',
    'Boxing',
    'CrossFit',
    'Conditioning'
  ];

  const locations = [
    'All',
    'Downtown',
    'Westside',
    'North End',
    'Uptown',
    'Midtown'
  ];

  const daysOfWeek = [
    'All',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge-cyan" style={{ marginBottom: '0.5rem' }}>FIND VERIFIED PERSONAL TRAINERS</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            Discover & Book Certified Master Trainers
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '750px' }}>
            Connect with CSCS, NASM, and Olympic certified coaches. Compare specializations, review facility assignments, check weekly working slots, and book 1-on-1 sessions.
          </p>
        </div>

        {/* Filter Bar with 4 Filter Dimensions */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Top Search Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search coach by name, focus area, credentials, or gym..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {/* Quick Specialization Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  style={{
                    background: selectedSpec === spec ? '#B8FF00' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedSpec === spec ? '#07090D' : '#CBD5E1',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {spec === 'All' ? 'All Focus' : spec}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Filter Controls (Experience, Location, Availability) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}>
            {/* Filter 1: Experience */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={15} color="#B8FF00" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Experience:</span>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="form-input-dark"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', minWidth: '130px' }}
              >
                <option value="All">All Years</option>
                <option value="1">1+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="8">8+ Years</option>
              </select>
            </div>

            {/* Filter 2: Gym Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={15} color="#00F0FF" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Gym Location:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="form-input-dark"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', minWidth: '140px' }}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>

            {/* Filter 3: Day Availability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} color="#FF7A00" />
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Available Day:</span>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="form-input-dark"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', minWidth: '140px' }}
              >
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'Any Day' : d}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedSpec !== 'All' || selectedExp !== 'All' || selectedLocation !== 'All' || selectedDay !== 'All' || search) && (
              <button
                onClick={() => {
                  setSelectedSpec('All');
                  setSelectedExp('All');
                  setSelectedLocation('All');
                  setSelectedDay('All');
                  setSearch('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F87171',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                ✕ Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94A3B8' }}>
            <div className="pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '1rem' }}></div>
            <div>Loading verified coaches...</div>
          </div>
        ) : trainers.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>No coaches match your filters</h3>
            <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
              Try broadening your search or resetting the specialization, location, or day filters.
            </p>
            <button
              onClick={() => {
                setSelectedSpec('All');
                setSelectedExp('All');
                setSelectedLocation('All');
                setSelectedDay('All');
                setSearch('');
              }}
              className="btn-lime"
            >
              Show All Coaches
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem'
          }}>
            {trainers.map((trainer) => {
              const days = Array.isArray(trainer.available_days)
                ? trainer.available_days
                : typeof trainer.available_days === 'string'
                ? JSON.parse(trainer.available_days || '[]')
                : ['Monday', 'Wednesday', 'Friday'];

              const timeSlots = Array.isArray(trainer.available_time_slots)
                ? trainer.available_time_slots
                : typeof trainer.available_time_slots === 'string'
                ? JSON.parse(trainer.available_time_slots || '[]')
                : ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM'];

              return (
                <div 
                  key={trainer.id}
                  className="glass-panel hover-card"
                  style={{ 
                    padding: '1.75rem', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {/* Header Row: Avatar + Basic Info */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                      <img 
                        src={trainer.profile_image || trainer.avatar_url} 
                        alt={trainer.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          border: '2px solid #B8FF00',
                          boxShadow: '0 0 15px rgba(184, 255, 0, 0.25)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#07090D',
                        borderRadius: '50%',
                        padding: '3px'
                      }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#B8FF00' }}></div>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem', color: '#FFFFFF' }}>{trainer.name}</h3>
                      <div style={{ color: '#B8FF00', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                        {trainer.specialization}
                      </div>
                      {trainer.gym_name && (
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} color="#00F0FF" />
                          <span>{trainer.gym_name} {trainer.gym_city && `• ${trainer.gym_city}`}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Short Biography */}
                  <p style={{
                    color: '#CBD5E1',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {trainer.bio || 'Dedicated elite fitness instructor passionate about science-backed hypertrophy, functional strength, and athletic longevity.'}
                  </p>

                  {/* Qualifications Banner */}
                  {trainer.qualifications && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.78rem',
                      color: '#94A3B8',
                      marginBottom: '1rem'
                    }}>
                      <strong style={{ color: '#FFFFFF' }}>Credentials:</strong> {trainer.qualifications}
                    </div>
                  )}

                  {/* Availability Badge Row */}
                  <div style={{
                    background: '#0D121A',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                      <Calendar size={13} color="#B8FF00" />
                      <span>Days:</span>
                      <strong style={{ color: '#FFFFFF' }}>{days.join(', ')}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8' }}>
                      <Clock size={13} color="#00F0FF" />
                      <span>Hours:</span>
                      <span style={{ color: '#00F0FF' }}>{timeSlots.join(', ')}</span>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{trainer.experience_years}+ Yrs</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Experience</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#B8FF00' }}>★ {trainer.rating || 4.9}</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Rating</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#00F0FF' }}>₹{Number(trainer.hourly_rate || 1200).toLocaleString('en-IN')}/hr</div>
                      <div style={{ color: '#64748B', fontSize: '0.7rem' }}>Session Rate</div>
                    </div>
                  </div>

                  {/* Action Buttons: View Profile and Book Trainer */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setSelectedTrainerId(trainer.id);
                        setCurrentView('trainer_profile');
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setActiveTrainerForBooking(trainer)}
                      className="btn-lime"
                      style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Calendar size={14} />
                      <span>Book Trainer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Booking Modal */}
        {activeTrainerForBooking && (
          <BookingModal
            trainer={activeTrainerForBooking}
            onClose={() => setActiveTrainerForBooking(null)}
            onSuccess={() => {
              setActiveTrainerForBooking(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
