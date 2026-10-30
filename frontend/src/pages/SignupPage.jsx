import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, User, Phone, Target, ArrowRight, ShieldCheck } from 'lucide-react';

export const SignupPage = ({ setCurrentView }) => {
  const { register } = useAuth();
  const [role, setRole] = useState('trainee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        fitness_goal: fitnessGoal,
        bio
      });
      if (user.role === 'owner') setCurrentView('owner_dashboard');
      else if (user.role === 'trainer') setCurrentView('trainer_dashboard');
      else setCurrentView('trainee_dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1.5rem 6rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            backgroundColor: '#B8FF00',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(184, 255, 0, 0.35)'
          }}>
            <Dumbbell size={24} color="#07090D" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>Join FitSphere 360</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Choose your account role to get started with tailored tools.
          </p>
        </div>

        {/* Role Selector Pills */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.35rem',
          borderRadius: '50px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.25rem',
          marginBottom: '1.75rem'
        }}>
          <button
            type="button"
            onClick={() => setRole('trainee')}
            style={{
              background: role === 'trainee' ? '#00F0FF' : 'transparent',
              color: role === 'trainee' ? '#07090D' : '#CBD5E1',
              border: 'none',
              borderRadius: '30px',
              padding: '0.5rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Trainee
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            style={{
              background: role === 'owner' ? '#B8FF00' : 'transparent',
              color: role === 'owner' ? '#07090D' : '#CBD5E1',
              border: 'none',
              borderRadius: '30px',
              padding: '0.5rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Gym Owner
          </button>
          <button
            type="button"
            onClick={() => setRole('trainer')}
            style={{
              background: role === 'trainer' ? '#FF7A00' : 'transparent',
              color: role === 'trainer' ? '#07090D' : '#CBD5E1',
              border: 'none',
              borderRadius: '30px',
              padding: '0.5rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Trainer
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#FCA5A5',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="e.g. Jordan Hayes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="jordan@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Password (Min 6 chars) *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Contact Phone
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {role === 'trainee' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Primary Fitness Goal
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="form-input-dark"
              >
                <option value="Muscle Building">Muscle Building & Hypertrophy</option>
                <option value="Strength Training">Powerlifting / Heavy Strength</option>
                <option value="Yoga & Pilates">Yoga, Reformer Pilates & Flexibility</option>
                <option value="Cardio & Fat Loss">Cardio, HIIT & Weight Loss</option>
                <option value="Boxing">Boxing & Combat Conditioning</option>
              </select>
            </div>
          )}

          {role === 'trainer' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                Coaching Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Strength & Conditioning / Pilates"
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="form-input-dark"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-lime"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Creating Account...' : `Register as ${role === 'owner' ? 'Gym Owner' : role}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: '#94A3B8' }}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentView('login')}
            style={{ background: 'transparent', border: 'none', color: '#B8FF00', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
