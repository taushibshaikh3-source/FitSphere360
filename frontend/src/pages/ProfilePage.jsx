import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Target, MapPin, Save, ShieldCheck } from 'lucide-react';

export const ProfilePage = ({ setCurrentView }) => {
  const { user, updateProfile, showToast } = useAuth();
  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user ? user.phone || '' : '');
  const [bio, setBio] = useState(user ? user.bio || '' : '');
  const [fitnessGoal, setFitnessGoal] = useState(user ? user.fitness_goal || 'Muscle Building' : 'Muscle Building');
  const [preferredLocation, setPreferredLocation] = useState(user ? user.preferred_location || 'Downtown' : 'Downtown');
  const [avatar, setAvatar] = useState(user ? user.avatar || '' : '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h3>Please log in to manage your profile.</h3>
        <button onClick={() => setCurrentView('login')} className="btn-lime" style={{ marginTop: '1rem' }}>
          Go to Login
        </button>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        bio,
        fitness_goal: fitnessGoal,
        preferred_location: preferredLocation,
        avatar
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom" style={{ maxWidth: '680px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
            <img 
              src={avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
              alt={user.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #B8FF00' }}
            />
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span className="badge-lime" style={{ textTransform: 'capitalize' }}>Role: {user.role === 'owner' ? 'Gym Owner' : user.role}</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF' }}>{user.name}</h2>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{user.email}</div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input-dark"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input-dark"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Preferred Campus Location
                </label>
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
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
                Primary Fitness Goal / Discipline
              </label>
              <input
                type="text"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="form-input-dark"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="form-input-dark"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Bio & Training Background
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-input-dark"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn-lime"
                style={{ padding: '0.75rem 2rem' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
