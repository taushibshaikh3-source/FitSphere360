import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export const ResetPasswordPage = ({ setCurrentView }) => {
  const { showToast } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Verify Supabase Auth Recovery Session on mount
  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        // 1. Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setSessionUser(session.user);
          setVerifyingSession(false);
          return;
        }

        // 2. Listen for auth state change (PASSWORD_RECOVERY or SIGNED_IN)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (event === 'PASSWORD_RECOVERY' || (session?.user && event === 'SIGNED_IN')) {
            setSessionUser(session.user);
            setVerifyingSession(false);
          }
        });

        // 3. Grace period to allow URL hash processing
        setTimeout(async () => {
          if (!mounted) return;
          const { data: { session: secondCheck } } = await supabase.auth.getSession();
          if (secondCheck?.user) {
            setSessionUser(secondCheck.user);
          }
          setVerifyingSession(false);
        }, 800);

        return () => {
          subscription?.unsubscribe?.();
        };
      } catch (err) {
        console.warn('[FitSphere 360] Recovery session verification notice:', err);
        if (mounted) setVerifyingSession(false);
      }
    };

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle countdown redirection after success
  useEffect(() => {
    let timer;
    if (success && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && redirectCountdown === 0) {
      setCurrentView('login');
    }
    return () => clearTimeout(timer);
  }, [success, redirectCountdown, setCurrentView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Password length validation
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // 2. Matching confirmation validation
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      let resolvedEmail = sessionUser?.email || fallbackEmail.trim().toLowerCase();

      // Update password in Supabase Auth if session exists
      if (sessionUser) {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          console.warn('[FitSphere 360] Supabase auth update warning:', error.message);
          // If session expired or invalid, throw friendly message
          if (error.message.toLowerCase().includes('token has expired') || error.message.toLowerCase().includes('session')) {
            throw new Error('Your reset session has expired. Please request a new password reset link.');
          }
        }
        if (data?.user?.email) {
          resolvedEmail = data.user.email;
        }
      }

      // Synchronize new password with Flask backend SQLite database
      if (resolvedEmail) {
        try {
          const syncRes = await fetch('/api/auth/reset-password-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: resolvedEmail,
              password: newPassword
            })
          });
          if (!syncRes.ok) {
            const syncData = await syncRes.json().catch(() => ({}));
            console.warn('[FitSphere 360] Sync note:', syncData.error);
          }
        } catch (syncErr) {
          console.warn('[FitSphere 360] Sync endpoint note:', syncErr.message);
        }
      }

      setSuccess(true);
      showToast('Password updated successfully! Redirecting to login...', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {/* Top Header */}
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
            <ShieldCheck size={26} color="#07090D" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem', color: '#FFFFFF', fontWeight: '800' }}>
            {success ? 'Password Reset Complete' : 'Create New Password'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {success
              ? 'Your password has been changed. You can now log in securely.'
              : 'Choose a strong, secure password for your FitSphere 360 account.'}
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(184, 255, 0, 0.08)',
              border: '1px solid rgba(184, 255, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.75rem 1.5rem',
              marginBottom: '1.75rem'
            }}>
              <CheckCircle2 size={44} color="#B8FF00" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem', fontWeight: '700' }}>
                Password Updated Successfully
              </h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Your account password has been updated. Redirecting to the login page in{' '}
                <strong style={{ color: '#B8FF00', fontSize: '1.1rem' }}>{redirectCountdown}</strong> seconds...
              </p>
            </div>

            <button
              type="button"
              id="proceed-to-login-btn"
              onClick={() => setCurrentView('login')}
              className="btn-lime"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              <span>Proceed to Login Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Form State */
          <div>
            {/* Active Session Badge or Fallback Notice */}
            {sessionUser?.email ? (
              <div style={{
                background: 'rgba(184, 255, 0, 0.05)',
                border: '1px solid rgba(184, 255, 0, 0.25)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#B8FF00'
              }}>
                <ShieldCheck size={16} />
                <span>Verified Recovery Session for: <strong>{sessionUser.email}</strong></span>
              </div>
            ) : null}

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
              {/* Fallback Email Input if session was not detected (e.g. testing directly) */}
              {!sessionUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Confirm Your Account Email
                  </label>
                  <input
                    type="email"
                    id="reset-fallback-email"
                    placeholder="trainee@fitsphere360.com"
                    value={fallbackEmail}
                    onChange={(e) => setFallbackEmail(e.target.value)}
                    className="form-input-dark"
                    required
                  />
                </div>
              )}

              {/* New Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password-input"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="form-input-dark"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password-input"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="form-input-dark"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements hint */}
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: '1.4' }}>
                • Password must be at least 6 characters long.<br />
                • Passwords in both fields must match exactly.
              </div>

              <button
                type="submit"
                id="update-password-btn"
                disabled={loading}
                className="btn-lime"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Cancel and return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
