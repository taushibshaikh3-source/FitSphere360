import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password, role = null) => {
    try {
      // 1. Authenticate with Supabase Auth
      try {
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (sbError) {
          console.warn('[FitSphere 360] Supabase auth notice:', sbError.message);
        }
      } catch (sbErr) {
        console.warn('[FitSphere 360] Supabase auth notice:', sbErr.message);
      }

      // 2. Authenticate with Flask backend & verify role
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      setUser(data.user);
      showToast(`Account created successfully! Welcome to FitSphere 360, ${data.user.name}.`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      try {
        await supabase.auth.signOut();
      } catch (sbErr) {
        // ignore
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      showToast('Logged out successfully', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      setUser(data.user);
      showToast('Profile updated successfully!', 'success');
      return data.user;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        showToast,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 22px',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#B8FF00',
          color: toast.type === 'error' || toast.type === 'info' ? '#ffffff' : '#07090D',
          fontWeight: '700',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
