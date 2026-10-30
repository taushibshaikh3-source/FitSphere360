import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Tag, Calendar, DollarSign, Check } from 'lucide-react';

export const AddPlanModal = ({ gymId, planToEdit, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [name, setName] = useState(planToEdit ? planToEdit.name : '');
  const [duration, setDuration] = useState(planToEdit ? planToEdit.duration : '1 Month');
  const [durationMonths, setDurationMonths] = useState(planToEdit ? planToEdit.duration_months : 1);
  const [price, setPrice] = useState(planToEdit ? planToEdit.price : 1499);
  const [description, setDescription] = useState(planToEdit ? planToEdit.description : '');
  const [isPopular, setIsPopular] = useState(planToEdit ? Boolean(planToEdit.is_popular) : false);
  const [featuresStr, setFeaturesStr] = useState(() => {
    if (planToEdit && Array.isArray(planToEdit.features)) {
      return planToEdit.features.join(', ');
    }
    return 'Full Gym Floor Access, Locker Room & Sauna, FitSphere 360 App Integration, 1 Free Trainer Consult';
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const featuresArray = featuresStr.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      duration,
      duration_months: Number(durationMonths),
      price: Number(price),
      description,
      features: featuresArray,
      is_popular: isPopular ? 1 : 0
    };

    try {
      const url = planToEdit ? `/api/plans/${planToEdit.id}` : `/api/gyms/${gymId}/plans`;
      const method = planToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save membership plan');

      showToast(data.message || 'Membership plan saved successfully!', 'success');
      onSuccess && onSuccess(data.plan);
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
          maxWidth: '560px',
          padding: '2rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>
              {planToEdit ? 'Edit Membership Plan' : 'Create New Membership Plan'}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Set pricing, duration, and member perks</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Plan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pro Athlete Tier or VIP Black Pass"
              className="form-input-dark"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Duration Label *
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1 Month, 3 Months, 1 Year"
                className="form-input-dark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Duration in Months
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="form-input-dark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Price (₹ INR) *
              </label>
              <input
                type="number"
                min="100"
                max="100000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="form-input-dark"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Plan Description
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of who this plan is tailored for..."
              className="form-input-dark"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Features & Perks (comma separated)
            </label>
            <textarea
              rows="2"
              value={featuresStr}
              onChange={(e) => setFeaturesStr(e.target.value)}
              placeholder="Full Gym Access, Towel Service, Sauna Access, Free Assessment..."
              className="form-input-dark"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#FFFFFF' }}>
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              style={{ accentColor: '#B8FF00', width: '16px', height: '16px' }}
            />
            <span style={{ fontWeight: '600' }}>Highlight as "Most Popular" Plan</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-lime">
              {submitting ? 'Saving Plan...' : (planToEdit ? 'Save Changes' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
