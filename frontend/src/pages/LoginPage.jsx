import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, ArrowRight, User, Building2, Award } from 'lucide-react';

export const LoginPage = ({ setCurrentView }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('trainee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    { id: 'trainee', label: 'Trainee', icon: User },
    { id: 'owner', label: 'Gym Owner', icon: Building2 },
    { id: 'trainer', label: 'Trainer', icon: Award }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Authenticate with Supabase & Flask backend, sending selectedRole for verification
      const user = await login(email, password, selectedRole);

      // 2. Client-side double-check for role verification
      if (user.role !== selectedRole) {
        const roleLabels = {
          trainee: 'Trainee',
          owner: 'Gym Owner',
          trainer: 'Trainer'
        };
        const expected = roleLabels[selectedRole] || selectedRole;
        const actual = roleLabels[user.role] || user.role;
        setErrorMsg(`Role Verification Failed: Your account is registered as a ${actual}, but you selected "${expected}". Please select the "${actual}" tab to sign in.`);
        return;
      }

      // 3. Redirect to the correct dashboard based on verified role
      if (user.role === 'owner') setCurrentView('owner_dashboard');
      else if (user.role === 'trainer') setCurrentView('trainer_dashboard');
      else setCurrentView('trainee_dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {/* 1. Logo & Welcome to FitSphere 360 */}
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
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem', color: '#FFFFFF', fontWeight: '800' }}>
            Welcome to FitSphere 360
          </h1>
          {/* 2. Short welcome description */}
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Enter your credentials to access your personalized fitness dashboard.
          </p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 3. Select Your Role (Trainee / Gym Owner / Trainer) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.5rem', fontWeight: '600' }}>
              Select Your Role
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '0.35rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    id={`role-btn-${r.id}`}
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (errorMsg) setErrorMsg('');
                    }}
                    style={{
                      background: isSelected ? '#B8FF00' : 'transparent',
                      color: isSelected ? '#07090D' : '#94A3B8',
                      border: isSelected ? '1px solid #B8FF00' : '1px solid transparent',
                      borderRadius: '9px',
                      padding: '0.65rem 0.35rem',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 12px rgba(184, 255, 0, 0.28)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={15} strokeWidth={isSelected ? 2.5 : 2} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                id="login-email-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          {/* 5. Password & 6. Forgot Password? */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: '600' }}>
                Password
              </label>
              <button
                type="button"
                id="forgot-password-link"
                onClick={() => setCurrentView('forgot_password')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#B8FF00',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                id="login-password-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          {/* 7. Sign In button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="btn-lime"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 8. Create an Account link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: '#94A3B8' }}>
          Don't have an account yet?{' '}
          <button
            onClick={() => setCurrentView('signup')}
            style={{ background: 'transparent', border: 'none', color: '#B8FF00', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
