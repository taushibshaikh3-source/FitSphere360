import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage = ({ setCurrentView }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!validateEmail(targetEmail)) {
      setErrorMsg('Please enter a valid email format (e.g. alex@example.com).');
      return;
    }

    setLoading(true);

    try {
      // Dynamic redirect URL supporting both local dev and production deployment
      const redirectUrl = `${window.location.origin}/#reset-password`;

      // Supabase Auth password recovery call
      const { data, error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.warn('[FitSphere 360] Supabase recovery notice:', error.message);
      }

      // Security requirement: Do not reveal whether an email is registered or not
      setSubmittedEmail(targetEmail);
      setSubmitted(true);
    } catch (err) {
      console.warn('[FitSphere 360] Reset request error handled securely:', err.message);
      setSubmittedEmail(targetEmail);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        {/* Top Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            backgroundColor: '#B8FF00',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 25px rgba(184, 255, 0, 0.35)'
          }}>
            <KeyRound size={26} color="#07090D" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem', color: '#FFFFFF', fontWeight: '800' }}>
            Reset Your Password
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {submitted
              ? 'Password recovery instructions have been dispatched.'
              : 'Enter your registered email address and we will send you a secure password recovery link.'}
          </p>
        </div>

        {/* Success Confirmation State */}
        {submitted ? (
          <div>
            <div style={{
              background: 'rgba(184, 255, 0, 0.08)',
              border: '1px solid rgba(184, 255, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.75rem 1.5rem',
              marginBottom: '1.75rem',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={40} color="#B8FF00" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: '700' }}>
                Reset Link Dispatched
              </h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                If an account exists for <strong style={{ color: '#B8FF00' }}>{submittedEmail}</strong>,
                a secure password reset link has been sent. Please check your email inbox and spam folder.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.7rem' }}
              >
                Send to a Different Email
              </button>
              <button
                type="button"
                id="back-to-login-link-submitted"
                onClick={() => setCurrentView('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.target.style.color = '#94A3B8'}
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    id="forgot-email-input"
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="form-input-dark"
                    style={{ paddingLeft: '40px' }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="send-reset-link-btn"
                disabled={loading}
                className="btn-lime"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.25rem' }}
              >
                <span>{loading ? 'Sending Recovery Link...' : 'Send Reset Link'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem' }}>
              <button
                type="button"
                id="back-to-login-link"
                onClick={() => setCurrentView('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.88rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#B8FF00'}
                onMouseOut={(e) => e.target.style.color = '#94A3B8'}
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
