import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, MessageSquare, Check, Sparkles } from 'lucide-react';

export const BookingModal = ({ trainer, onClose, onSuccess }) => {
  const { user, showToast } = useAuth();
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!trainer) return null;

  const availableSlots = [
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in as a trainee to book a trainer.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: trainer.id,
          gym_id: trainer.gym_id,
          booking_date: bookingDate,
          time_slot: timeSlot,
          notes: notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking');

      showToast(`Booking request submitted for ${trainer.name}! Trainer will review.`, 'success');
      onSuccess && onSuccess(data.booking);
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
          maxWidth: '520px',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={trainer.avatar_url} 
              alt={trainer.name}
              style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #B8FF00' }}
            />
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>Book {trainer.name}</h3>
              <div style={{ fontSize: '0.78rem', color: '#B8FF00' }}>₹{trainer.hourly_rate.toLocaleString('en-IN')}/hr • {trainer.specialization}</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Date Picker */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              <Calendar size={14} color="#B8FF00" />
              <span>Select Date</span>
            </label>
            <input 
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="form-input-dark"
              required
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              <Clock size={14} color="#B8FF00" />
              <span>Select Preferred Time Slot</span>
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="form-input-dark"
            >
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Training Focus & Notes */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              <MessageSquare size={14} color="#B8FF00" />
              <span>Session Focus & Goals (Optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Form check for Barbell Squat, nutrition guidance, or endurance conditioning..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input-dark"
            />
          </div>

          {/* Rate Summary */}
          <div style={{
            background: 'rgba(184, 255, 0, 0.05)',
            border: '1px solid rgba(184, 255, 0, 0.2)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}>
            <span style={{ color: '#CBD5E1' }}>Estimated Session Total:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#B8FF00' }}>
              ₹{trainer.hourly_rate.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-lime"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Submitting Request...' : 'Confirm Demo Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};
