import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { GymListingPage } from './pages/GymListingPage';
import { GymDetailsPage } from './pages/GymDetailsPage';
import { TrainerListingPage } from './pages/TrainerListingPage';
import { TrainerProfilePage } from './pages/TrainerProfilePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { BMICalculatorPage } from './pages/BMICalculatorPage';
import { WorkoutsGuidePage } from './pages/WorkoutsGuidePage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { TraineeDashboard } from './pages/TraineeDashboard';
import { GymOwnerDashboard } from './pages/GymOwnerDashboard';
import { TrainerDashboard } from './pages/TrainerDashboard';
import { ManageTrainersPage } from './pages/ManageTrainersPage';
import { supabase } from './lib/supabaseClient';

import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

const MainContent = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedGymId, setSelectedGymId] = useState(1);
  const [selectedTrainerId, setSelectedTrainerId] = useState(1);
  const [trainerSection, setTrainerSection] = useState('dashboard');

  // Automatic Role-Based Redirection on Login or Page Load
  React.useEffect(() => {
    if (user) {
      if (user.role === 'trainer') {
        if (currentView !== 'trainer_dashboard') {
          setCurrentView('trainer_dashboard');
        }
      } else if (user.role === 'owner' && (currentView === 'home' || currentView === 'login')) {
        setCurrentView('owner_dashboard');
      }
    }
  }, [user]);

  // Supabase Password Recovery and URL Hash Detection
  React.useEffect(() => {
    const handleUrlHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || hash.includes('#reset-password')) {
        setCurrentView('reset_password');
      }
    };

    handleUrlHash();
    window.addEventListener('hashchange', handleUrlHash);

    // Also listen to Supabase Auth state changes for PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('reset_password');
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleUrlHash);
      subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94A3B8'
      }}>
        <div className="pulse-dot" style={{ width: '20px', height: '20px', marginBottom: '1.25rem' }}></div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.2rem', color: '#FFFFFF' }}>
          Loading FitSphere <span style={{ color: '#B8FF00' }}>360</span>...
        </div>
      </div>
    );
  }

  // Strict Role-Based View Guard
  const renderView = () => {
    // If a trainer is logged in, restrict them strictly to Trainer Dashboard
    // to completely prevent trainee gym content / exploration pages from appearing.
    if (user && user.role === 'trainer') {
      if (currentView === 'about') {
        return <AboutPage setCurrentView={setCurrentView} />;
      }
      return (
        <TrainerDashboard
          setCurrentView={setCurrentView}
          setSelectedTrainerId={setSelectedTrainerId}
          initialSection={currentView === 'profile' ? 'profile' : trainerSection}
          setTrainerSection={setTrainerSection}
        />
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <HomePage
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );

      case 'gyms':
        return (
          <GymListingPage
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
          />
        );

      case 'gym_details':
        return (
          <GymDetailsPage
            gymId={selectedGymId}
            setCurrentView={setCurrentView}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );

      case 'trainers':
        return (
          <TrainerListingPage
            setCurrentView={setCurrentView}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );

      case 'trainer_profile':
        return (
          <TrainerProfilePage
            trainerId={selectedTrainerId}
            setCurrentView={setCurrentView}
          />
        );

      case 'recommendations':
        return (
          <RecommendationsPage
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
          />
        );

      case 'bmi':
        return <BMICalculatorPage setCurrentView={setCurrentView} />;

      case 'workouts':
        return <WorkoutsGuidePage />;

      case 'about':
        return <AboutPage setCurrentView={setCurrentView} />;

      case 'login':
        return <LoginPage setCurrentView={setCurrentView} />;

      case 'forgot_password':
        return <ForgotPasswordPage setCurrentView={setCurrentView} />;

      case 'reset_password':
        return <ResetPasswordPage setCurrentView={setCurrentView} />;

      case 'signup':
        return <SignupPage setCurrentView={setCurrentView} />;

      case 'profile':
        return <ProfilePage setCurrentView={setCurrentView} />;

      // Protected Trainee Dashboard
      case 'trainee_dashboard':
        if (!user || user.role !== 'trainee') {
          return (
            <UnauthorizedNotice
              requiredRole="trainee"
              onLoginClick={() => setCurrentView('login')}
            />
          );
        }
        return (
          <TraineeDashboard
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );

      // Protected Gym Owner Dashboard
      case 'owner_dashboard':
        if (!user || user.role !== 'owner') {
          return (
            <UnauthorizedNotice
              requiredRole="owner"
              user={user}
              onLoginClick={() => setCurrentView('login')}
            />
          );
        }
        return (
          <GymOwnerDashboard
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
          />
        );

      // Dedicated Manage Trainers Page for Gym Owners
      case 'manage_trainers':
        if (!user || user.role !== 'owner') {
          return (
            <UnauthorizedNotice
              requiredRole="owner"
              user={user}
              onLoginClick={() => setCurrentView('login')}
            />
          );
        }
        return (
          <ManageTrainersPage
            setCurrentView={setCurrentView}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );

      // Protected Trainer Dashboard
      case 'trainer_dashboard':
        if (!user || user.role !== 'trainer') {
          return (
            <UnauthorizedNotice
              requiredRole="trainer"
              user={user}
              onLoginClick={() => setCurrentView('login')}
            />
          );
        }
        return (
          <TrainerDashboard
            setCurrentView={setCurrentView}
            setSelectedTrainerId={setSelectedTrainerId}
            initialSection={trainerSection}
            setTrainerSection={setTrainerSection}
          />
        );

      default:
        return (
          <HomePage
            setCurrentView={setCurrentView}
            setSelectedGymId={setSelectedGymId}
            setSelectedTrainerId={setSelectedTrainerId}
          />
        );
    }
  };

  const isTrainer = user?.role === 'trainer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setTrainerSection={setTrainerSection}
      />
      <main style={{ flex: 1 }}>{renderView()}</main>
      {!isTrainer && currentView !== 'trainer_dashboard' && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
};

// Protected Access Denied Notice
const UnauthorizedNotice = ({ requiredRole, user, onLoginClick }) => {
  const roleLabels = {
    owner: 'Gym Owner',
    trainer: 'Certified Trainer',
    trainee: 'Trainee'
  };

  return (
    <div style={{ padding: '6rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '520px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          marginBottom: '1rem'
        }}>
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Restricted Dashboard Access</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          This control panel requires active <strong>{roleLabels[requiredRole]}</strong> authorization.
          {user ? ` You are currently logged in as ${user.role}.` : ' You are currently not signed in.'}
        </p>

        <button
          onClick={onLoginClick}
          className="btn-lime"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
        >
          <span>Sign In to Continue</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
