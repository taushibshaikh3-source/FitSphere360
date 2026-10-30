import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  ArrowRight,
  Layers,
  X
} from 'lucide-react';
import { GymCompareModal } from '../components/GymCompareModal';

export const GymListingPage = ({ setCurrentView, setSelectedGymId }) => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [womenSafetyOnly, setWomenSafetyOnly] = useState(false);

  // Compare states
  const [compareIds, setCompareIds] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const fetchGyms = () => {
    setLoading(true);
    let url = `/api/gyms?search=${encodeURIComponent(search)}`;
    if (selectedCity !== 'All') url += `&city=${encodeURIComponent(selectedCity)}`;
    if (maxPrice < 10000) url += `&max_price=${maxPrice}`;
    if (minRating > 0) url += `&min_rating=${minRating}`;
    if (selectedGoal !== 'All') url += `&fitness_goal=${encodeURIComponent(selectedGoal)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        let results = data.gyms || [];
        if (womenSafetyOnly) {
          results = results.filter(g => {
            const sf = g.women_safety_features;
            return Array.isArray(sf) ? sf.length >= 3 : true;
          });
        }
        setGyms(results);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGyms();
  }, [search, selectedCity, maxPrice, minRating, selectedGoal, womenSafetyOnly]);

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(item => item !== id));
    } else {
      if (compareIds.length >= 3) {
        alert('You can compare a maximum of 3 gyms simultaneously.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const comparedGymsData = gyms.filter(g => compareIds.includes(g.id));

  return (
    <div style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div className="container-custom">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>VERIFIED COMMERCIAL NETWORK</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>
            Explore & Discover Fitness Spaces
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '700px' }}>
            Find high-performance gyms filtered by location, budget, crowd density, and verified women's safety certifications.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Top row: search + city */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by gym name, amenity, or goal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {/* City Dropdown */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="form-input-dark"
              >
                <option value="All">All Locations & Cities</option>
                <option value="Downtown">Downtown</option>
                <option value="Uptown">Uptown</option>
                <option value="Westside">Westside</option>
                <option value="Metro Hub">Metro Hub</option>
                <option value="Eastside">Eastside</option>
              </select>
            </div>

            {/* Goal Filter */}
            <div>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="form-input-dark"
              >
                <option value="All">All Fitness Goals</option>
                <option value="Muscle Building">Muscle Building / Hypertrophy</option>
                <option value="Strength Training">Powerlifting / Heavy Iron</option>
                <option value="Yoga">Yoga & Reformer Pilates</option>
                <option value="Cardio">Cardio & HIIT</option>
                <option value="Boxing">Boxing & Combat</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Price slider, rating, women's safety */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Max Price Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>
                Max Budget: <strong style={{ color: '#B8FF00' }}>₹{maxPrice.toLocaleString('en-IN')}/mo</strong>
              </span>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>

            {/* Rating Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '600' }}>Rating:</span>
              {[0, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  style={{
                    background: minRating === r ? '#B8FF00' : 'rgba(255, 255, 255, 0.06)',
                    color: minRating === r ? '#07090D' : '#CBD5E1',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {r === 0 ? 'All' : `★ ${r}+`}
                </button>
              ))}
            </div>

            {/* Women's Safety Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#FFFFFF'
            }}>
              <input
                type="checkbox"
                checked={womenSafetyOnly}
                onChange={(e) => setWomenSafetyOnly(e.target.checked)}
                style={{ accentColor: '#B8FF00', width: '16px', height: '16px' }}
              />
              <ShieldCheck size={16} color="#B8FF00" />
              <span>Certified Women-Safe Only</span>
            </label>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('All');
                setMaxPrice(10000);
                setMinRating(0);
                setSelectedGoal('All');
                setWomenSafetyOnly(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Showing <strong style={{ color: '#FFFFFF' }}>{gyms.length}</strong> available fitness facilities
          </div>

          {compareIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#B8FF00', fontWeight: '700' }}>
                {compareIds.length} Gyms Selected for Comparison
              </span>
              <button
                onClick={() => setCompareModalOpen(true)}
                className="btn-lime"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                <Layers size={14} />
                <span>Compare Now</span>
              </button>
              <button
                onClick={() => setCompareIds([])}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Gyms Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94A3B8' }}>
            <div className="pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '1rem' }}></div>
            <div>Loading verified gyms...</div>
          </div>
        ) : gyms.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No gyms match your current filters</h3>
            <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
              Try broadening your budget slider or choosing "All Locations".
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('All');
                setMaxPrice(10000);
                setMinRating(0);
                setSelectedGoal('All');
                setWomenSafetyOnly(false);
              }}
              className="btn-lime"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            gap: '2rem'
          }}>
            {gyms.map((gym) => {
              const isCompared = compareIds.includes(gym.id);
              return (
                <div 
                  key={gym.id}
                  className="glass-panel hover-card"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isCompared ? '2px solid #B8FF00' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Gym Card Image */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img 
                      src={gym.image_url} 
                      alt={gym.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Top Badges */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap'
                    }}>
                      <span className="badge-lime">
                        <Star size={12} fill="#B8FF00" />
                        {gym.rating} ({gym.review_count})
                      </span>
                      <span className="badge-cyan">
                        {gym.crowd_level} ({gym.crowd_percent}%)
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(7, 9, 13, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#B8FF00',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '800'
                    }}>
                      From ₹{gym.min_price.toLocaleString('en-IN')}/mo
                    </div>

                    {/* Compare checkbox in image corner */}
                    <button
                      onClick={() => toggleCompare(gym.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: isCompared ? '#B8FF00' : 'rgba(7, 9, 13, 0.8)',
                        color: isCompared ? '#07090D' : '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {isCompared && <Check size={12} />}
                      <span>{isCompared ? 'Comparing' : '+ Compare'}</span>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                      <MapPin size={14} color="#B8FF00" />
                      <span>{gym.address}, {gym.city}</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                      {gym.name}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: '#B8FF00', marginBottom: '0.65rem', fontWeight: '600' }}>
                      {gym.tagline}
                    </div>

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

                    {/* Women Safety highlights */}
                    <div style={{
                      background: 'rgba(184, 255, 0, 0.05)',
                      border: '1px solid rgba(184, 255, 0, 0.2)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      color: '#E2E8F0',
                      marginBottom: '1.25rem'
                    }}>
                      <ShieldCheck size={16} color="#B8FF00" />
                      <span>Female Zones & Biometric Security</span>
                    </div>

                    {/* Bottom Action */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          setSelectedGymId(gym.id);
                          setCurrentView('gym_details');
                        }}
                        className="btn-lime"
                        style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem' }}
                      >
                        <span>View Plans & Facilities</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison Modal */}
        {compareModalOpen && (
          <GymCompareModal
            gyms={comparedGymsData}
            onClose={() => setCompareModalOpen(false)}
            onViewDetails={(id) => {
              setSelectedGymId(id);
              setCurrentView('gym_details');
            }}
          />
        )}
      </div>
    </div>
  );
};
