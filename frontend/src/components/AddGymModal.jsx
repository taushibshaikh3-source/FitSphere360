import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Building2, MapPin, DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const AddGymModal = ({ gymToEdit, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [name, setName] = useState(gymToEdit ? gymToEdit.name : '');
  const [tagline, setTagline] = useState(gymToEdit ? gymToEdit.tagline : 'Where Elite Performance Meets Innovation');
  const [description, setDescription] = useState(gymToEdit ? gymToEdit.description : '');
  const [address, setAddress] = useState(gymToEdit ? gymToEdit.address : '');
  const [city, setCity] = useState(gymToEdit ? gymToEdit.city : 'Downtown');
  const [minPrice, setMinPrice] = useState(gymToEdit ? gymToEdit.min_price : 1499);
  const [openingHours, setOpeningHours] = useState(gymToEdit ? gymToEdit.opening_hours : '05:30 AM');
  const [closingHours, setClosingHours] = useState(gymToEdit ? gymToEdit.closing_hours : '11:00 PM');
  const [contactPhone, setContactPhone] = useState(gymToEdit ? gymToEdit.contact_phone : '+1 (555) 019-2834');
  const [crowdLevel, setCrowdLevel] = useState(gymToEdit ? gymToEdit.crowd_level : 'Moderate');
  const [fitnessGoals, setFitnessGoals] = useState(gymToEdit ? gymToEdit.fitness_goals : 'Strength Training, CrossFit, Cardio, Muscle Building');
  const [imageUrl, setImageUrl] = useState(gymToEdit ? gymToEdit.image_url : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      tagline,
      description,
      address,
      city,
      price_range: `₹${Number(minPrice).toLocaleString('en-IN')} - ₹${Number(minPrice * 2).toLocaleString('en-IN')}/mo`,
      min_price: Number(minPrice),
      image_url: imageUrl,
      opening_hours: openingHours,
      closing_hours: closingHours,
      contact_phone: contactPhone,
      crowd_level: crowdLevel,
      crowd_percent: crowdLevel === 'Low' ? 30 : crowdLevel === 'Moderate' ? 55 : 85,
      fitness_goals: fitnessGoals,
      women_safety_features: [
        'Dedicated Women-Only Training Zone (2,500 sq ft)',
        '24/7 CCTV & Private Biometric Keycard Access',
        'Certified Female Coaches on Staff 7 Days/Week',
        'Direct Panic Assistance and Well-Lit Parking Patrols'
      ]
    };

    try {
      const url = gymToEdit ? `/api/gyms/${gymToEdit.id}` : '/api/gyms';
      const method = gymToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save gym record');

      showToast(data.message || (gymToEdit ? 'Gym updated successfully!' : 'Gym added successfully!'), 'success');
      onSuccess && onSuccess(data.gym);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>
              {gymToEdit ? 'Edit Gym Information' : 'Add New Commercial Gym'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
              All records are stored permanently in the SQLite database
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Gym Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. IronPulse Apex Arena"
                className="form-input-dark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Campus City / Area *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input-dark"
              >
                <option value="Downtown">Downtown</option>
                <option value="Uptown">Uptown</option>
                <option value="Westside">Westside</option>
                <option value="Metro Hub">Metro Hub</option>
                <option value="Eastside">Eastside</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Marketing Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Where High-Tech Athletic Conditioning Meets Luxury"
              className="form-input-dark"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Detailed Description *
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe square footage, equipment brands, platforms, saunas, and unique amenities..."
              className="form-input-dark"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Street Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Grand Avenue, Suite 10"
                className="form-input-dark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Base Price (₹ / mo) *
              </label>
              <input
                type="number"
                min="15"
                max="300"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="form-input-dark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="form-input-dark"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="05:30 AM"
                className="form-input-dark"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Closing Hours
              </label>
              <input
                type="text"
                value={closingHours}
                onChange={(e) => setClosingHours(e.target.value)}
                placeholder="11:00 PM"
                className="form-input-dark"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Current Crowd Level
              </label>
              <select
                value={crowdLevel}
                onChange={(e) => setCrowdLevel(e.target.value)}
                className="form-input-dark"
              >
                <option value="Low">Low (&lt; 35%)</option>
                <option value="Moderate">Moderate (50-60%)</option>
                <option value="Brisk">Brisk (65-75%)</option>
                <option value="Peak">Peak Rush (80%+)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Target Fitness Goals & Disciplines (comma separated)
            </label>
            <input
              type="text"
              value={fitnessGoals}
              onChange={(e) => setFitnessGoals(e.target.value)}
              placeholder="e.g. Muscle Building, Powerlifting, CrossFit, Yoga, Boxing"
              className="form-input-dark"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Cover Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input-dark"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-lime">
              {submitting ? 'Saving to Database...' : (gymToEdit ? 'Save Changes' : 'Create Gym Facility')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
