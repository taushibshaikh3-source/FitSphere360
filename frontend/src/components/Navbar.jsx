import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Compass, 
  Users, 
  Calculator, 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, setTrainerSection }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardView = () => {
    if (!user) return 'login';
    if (user.role === 'owner') return 'owner_dashboard';
    if (user.role === 'trainer') return 'trainer_dashboard';
    return 'trainee_dashboard';
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900 }}>
      {/* Top Banner */}
      {user?.role === 'trainer' ? (
        <div style={{
          backgroundColor: '#0D121A',
          color: '#B8FF00',
          borderBottom: '1px solid rgba(184, 255, 0, 0.25)',
          fontSize: '0.82rem',
          fontWeight: '700',
          padding: '0.45rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          letterSpacing: '0.01em',
          textAlign: 'center'
        }}>
          <span className="pulse-dot"></span>
          <span>⚡ FitSphere 360 Trainer Hub: Certified Master Coach Portal – Live Schedule & Bookings Active</span>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#B8FF00',
          color: '#07090D',
          fontSize: '0.82rem',
          fontWeight: '700',
          padding: '0.45rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          letterSpacing: '0.01em',
          textAlign: 'center'
        }}>
          <span>⚡ New Features Just Launched: Explore the Latest in Smart Gym Management & AI Recommendation</span>
          <button 
            onClick={() => navigate('recommendations')}
            style={{
              background: 'transparent',
              border: 'none',
              fontWeight: '800',
              textDecoration: 'underline',
              cursor: 'pointer',
              color: '#07090D',
              fontSize: '0.82rem'
            }}
          >
            Discover More ↗
          </button>
        </div>
      )}

      {/* Main Glass Navbar */}
      <nav style={{
        backgroundColor: 'rgba(9, 11, 16, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.85rem 1.5rem'
      }}>
        <div className="container-custom" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Brand Logo */}
          <div 
            onClick={() => {
              if (user?.role === 'trainer') {
                if (setTrainerSection) setTrainerSection('dashboard');
                navigate('trainer_dashboard');
              } else if (user?.role === 'owner') {
                navigate('owner_dashboard');
              } else {
                navigate('home');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#B8FF00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(184, 255, 0, 0.35)'
            }}>
              <Dumbbell size={22} color="#07090D" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: '900',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                color: '#FFFFFF'
              }}>
                FitSphere <span style={{ color: '#B8FF00' }}>360</span>
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: '#94A3B8',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Smart Gym Ecosystem
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links: Hidden for Trainers to eliminate trainee exploration content */}
          {user?.role === 'trainer' ? (
            <div className="desktop-links" style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#0D121A',
              padding: '0.4rem 1.25rem',
              borderRadius: '50px',
              border: '1px solid rgba(184, 255, 0, 0.3)'
            }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: '0.85rem', color: '#B8FF00', fontWeight: '800' }}>
                Coach Command Center
              </span>
            </div>
          ) : (
            <div style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.35rem 0.6rem',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
            className="desktop-links"
            >
              {[
                { id: 'home', label: 'Home' },
                { id: 'gyms', label: 'Explore Gyms' },
                { id: 'trainers', label: 'Trainers' },
                { id: 'recommendations', label: 'Smart Match' },
                { id: 'bmi', label: 'BMI Calculator' },
                { id: 'workouts', label: 'Workouts & Guide' },
                { id: 'about', label: 'About' },
              ].map((link) => {
                const active = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => navigate(link.id)}
                    style={{
                      background: active ? '#1C2433' : 'transparent',
                      color: active ? '#B8FF00' : '#94A3B8',
                      border: 'none',
                      borderRadius: '30px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.88rem',
                      fontWeight: active ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = '#94A3B8';
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  onClick={() => navigate(getDashboardView())}
                  className="btn-lime"
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem' }}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>

                {/* User Dropdown trigger */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      background: '#151B26',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50px',
                      padding: '0.35rem 0.8rem 0.35rem 0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt={user.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} color="#94A3B8" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      width: '210px',
                      background: '#151B26',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                      padding: '0.5rem',
                      zIndex: 1000
                    }}>
                      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#B8FF00', textTransform: 'capitalize' }}>
                          Role: {user.role === 'owner' ? 'Gym Owner' : user.role}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(getDashboardView())}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: '#F8FAFC',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1C2433'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={15} color="#B8FF00" />
                        <span>Go to Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          if (user.role === 'trainer') {
                            if (setTrainerSection) setTrainerSection('profile');
                            navigate('trainer_dashboard');
                          } else {
                            navigate('profile');
                          }
                          setUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: '#F8FAFC',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1C2433'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={15} color="#00F0FF" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('home'); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: '#FF6B6B',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1C2433'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={() => navigate('login')}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Log In
                </button>

                <button
                  onClick={() => navigate('signup')}
                  className="btn-lime"
                  style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '0.4rem'
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            padding: '1rem',
            marginTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {user?.role === 'trainer' ? (
              <button
                onClick={() => navigate('trainer_dashboard')}
                style={{
                  textAlign: 'left',
                  background: '#1C2433',
                  color: '#B8FF00',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Trainer Dashboard
              </button>
            ) : (
              [
                { id: 'home', label: 'Home' },
                { id: 'gyms', label: 'Explore Gyms' },
                { id: 'trainers', label: 'Trainers' },
                { id: 'recommendations', label: 'Smart Match' },
                { id: 'bmi', label: 'BMI Calculator' },
                { id: 'workouts', label: 'Workouts & Guide' },
                { id: 'about', label: 'About' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  style={{
                    textAlign: 'left',
                    background: currentView === link.id ? '#1C2433' : 'transparent',
                    color: currentView === link.id ? '#B8FF00' : '#E2E8F0',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  {link.label}
                </button>
              ))
            )}

            {user ? (
              <button
                onClick={() => navigate(getDashboardView())}
                className="btn-lime"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                Go to Dashboard
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => navigate('login')}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="btn-lime"
                  style={{ flex: 1 }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Media query helper styles */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-links {
            display: flex !important;
          }
        }
        @media (max-width: 899px) {
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
