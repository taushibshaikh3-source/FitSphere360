import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard,
  User, 
  Users, 
  Calendar, 
  Clock, 
  Dumbbell, 
  MessageSquare, 
  LogOut,
  Award, 
  Check, 
  X, 
  DollarSign, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  Activity,
  Plus,
  Trash2,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TrainerDashboard = ({ setCurrentView, setSelectedTrainerId, initialSection = 'dashboard', setTrainerSection }) => {
  const { user, logout, showToast, fetchCurrentUser } = useAuth();
  const [activeNav, setActiveNav] = useState(initialSection || 'dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSection) {
      setActiveNav(initialSection);
    }
  }, [initialSection]);

  const handleNavClick = (section) => {
    setActiveNav(section);
    if (setTrainerSection) setTrainerSection(section);
  };

  // Stats & Overview Data
  const [stats, setStats] = useState({
    total_clients: 0,
    upcoming_sessions: 0,
    pending_requests: 0,
    completed_sessions: 0
  });
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingList, setUpcomingList] = useState([]);

  // Bookings State
  const [allBookings, setAllBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Clients State
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');

  // Workout Plans State
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: '',
    category: 'Hypertrophy & Strength',
    difficulty: 'Intermediate',
    target_muscle: 'Full Body',
    duration_weeks: 4,
    trainee_id: '',
    instructions: '',
    exercises: [
      { name: 'Barbell Back Squat', sets: '4', reps: '8-10', notes: 'RPE 8, 2s eccentric' },
      { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', notes: 'Focus on chest contraction' }
    ]
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: '',
    experience_years: 5,
    qualifications: '',
    hourly_rate: 1000,
    phone: '',
    bio: '',
    avatar_url: '',
    status: 'active'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Schedule State
  const [scheduleDays, setScheduleDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [scheduleSlots, setScheduleSlots] = useState(['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM']);
  const [scheduleStatus, setScheduleStatus] = useState('active');
  const [customSlot, setCustomSlot] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Messaging State
  const [messages, setMessages] = useState([]);
  const [activeChatClientId, setActiveChatClientId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // All 7 days of the week for schedule selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const commonSlots = [
    '06:00 AM - 10:00 AM',
    '07:00 AM - 11:00 AM',
    '10:00 AM - 02:00 PM',
    '04:00 PM - 08:00 PM',
    '05:00 PM - 09:00 PM',
    '06:00 PM - 10:00 PM'
  ];

  // Load All Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Overview & Stats
      const overviewRes = await fetch('/api/trainer/overview');
      if (overviewRes.ok) {
        const oData = await overviewRes.json();
        setStats(oData.stats || { total_clients: 0, upcoming_sessions: 0, pending_requests: 0, completed_sessions: 0 });
        setTodaySessions(oData.today_sessions || []);
        setRecentRequests(oData.recent_requests || []);
        setUpcomingList(oData.upcoming_sessions_list || []);
        
        if (oData.trainer) {
          const t = oData.trainer;
          setProfileForm({
            name: t.name || t.full_name || user?.name || '',
            specialization: t.specialization || 'Strength & Conditioning',
            experience_years: t.experience_years || 5,
            qualifications: t.qualifications || 'Certified Personal Coach',
            hourly_rate: t.hourly_rate || 1000,
            phone: t.phone || user?.phone || '',
            bio: t.bio || '',
            avatar_url: t.avatar_url || t.profile_image || user?.avatar || '',
            status: t.status || 'active'
          });

          // Set schedule days & slots
          if (Array.isArray(t.available_days)) {
            setScheduleDays(t.available_days);
          } else if (typeof t.available_days === 'string') {
            try { setScheduleDays(JSON.parse(t.available_days)); } catch(e) {}
          }
          if (Array.isArray(t.available_time_slots)) {
            setScheduleSlots(t.available_time_slots);
          } else if (typeof t.available_time_slots === 'string') {
            try { setScheduleSlots(JSON.parse(t.available_time_slots)); } catch(e) {}
          }
          setScheduleStatus(t.status || 'active');
        }
      }

      // 2. All Bookings
      const bookingsRes = await fetch('/api/bookings/trainer');
      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setAllBookings(bData.bookings || []);
      }

      // 3. My Clients
      const clientsRes = await fetch('/api/trainer/clients');
      if (clientsRes.ok) {
        const cData = await clientsRes.json();
        const clientList = cData.clients || [];
        setClients(clientList);
        if (clientList.length > 0 && !activeChatClientId) {
          setActiveChatClientId(clientList[0].trainee_id);
        }
      }

      // 4. Workout Plans
      const wpRes = await fetch('/api/trainer/workout-plans');
      if (wpRes.ok) {
        const wpData = await wpRes.json();
        setWorkoutPlans(wpData.workout_plans || []);
      }

      // 5. Messages
      const msgRes = await fetch('/api/trainer/messages');
      if (msgRes.ok) {
        const mData = await msgRes.json();
        setMessages(mData.messages || []);
      }
    } catch (err) {
      console.error('Failed to load trainer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle Booking Status Update (Accept, Reject, Complete)
  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking');

      showToast(`Booking #${bookingId} marked as ${newStatus}!`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/trainers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          full_name: profileForm.name,
          specialization: profileForm.specialization,
          experience_years: Number(profileForm.experience_years),
          qualifications: profileForm.qualifications,
          hourly_rate: Number(profileForm.hourly_rate),
          phone: profileForm.phone,
          bio: profileForm.bio,
          avatar_url: profileForm.avatar_url,
          status: profileForm.status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      showToast('Profile credentials and rates saved successfully!', 'success');
      if (fetchCurrentUser) fetchCurrentUser();
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Schedule Update
  const handleScheduleSubmit = async (e) => {
    e?.preventDefault?.();
    setSavingSchedule(true);
    try {
      const res = await fetch('/api/trainer/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_days: scheduleDays,
          available_time_slots: scheduleSlots,
          status: scheduleStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save schedule');

      showToast('Working days & coaching time slots saved!', 'success');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const toggleScheduleDay = (day) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const toggleScheduleSlot = (slot) => {
    if (scheduleSlots.includes(slot)) {
      setScheduleSlots(scheduleSlots.filter(s => s !== slot));
    } else {
      setScheduleSlots([...scheduleSlots, slot]);
    }
  };

  const addCustomSlot = () => {
    if (customSlot.trim() && !scheduleSlots.includes(customSlot.trim())) {
      setScheduleSlots([...scheduleSlots, customSlot.trim()]);
      setCustomSlot('');
    }
  };

  // Workout Plan Modal & Form Handlers
  const addExerciseRow = () => {
    setPlanForm({
      ...planForm,
      exercises: [...planForm.exercises, { name: '', sets: '3', reps: '10', notes: '' }]
    });
  };

  const removeExerciseRow = (index) => {
    setPlanForm({
      ...planForm,
      exercises: planForm.exercises.filter((_, i) => i !== index)
    });
  };

  const updateExerciseRow = (index, field, value) => {
    const updated = [...planForm.exercises];
    updated[index][field] = value;
    setPlanForm({ ...planForm, exercises: updated });
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!planForm.title.trim()) {
      showToast('Please provide a workout plan title', 'error');
      return;
    }
    setSavingPlan(true);
    try {
      const res = await fetch('/api/trainer/workout-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create plan');

      showToast(`Workout Plan "${planForm.title}" published!`, 'success');
      setShowPlanModal(false);
      setPlanForm({
        title: '',
        category: 'Hypertrophy & Strength',
        difficulty: 'Intermediate',
        target_muscle: 'Full Body',
        duration_weeks: 4,
        trainee_id: '',
        instructions: '',
        exercises: [{ name: '', sets: '3', reps: '10', notes: '' }]
      });
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      const res = await fetch(`/api/trainer/workout-plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete workout plan');
      showToast('Workout plan deleted successfully', 'success');
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Messaging
  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    if (!chatInput.trim() || !activeChatClientId) return;
    setSendingMsg(true);
    try {
      const res = await fetch('/api/trainer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainee_id: activeChatClientId,
          message: chatInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setChatInput('');
      const msgRes = await fetch('/api/trainer/messages');
      if (msgRes.ok) {
        const mData = await msgRes.json();
        setMessages(mData.messages || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm('Are you sure you want to log out of your Trainer Hub?')) {
      await logout();
      if (setCurrentView) setCurrentView('home');
    }
  };

  // Filtered Bookings
  const filteredBookings = allBookings.filter(b => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    if (!clientSearch.trim()) return true;
    const q = clientSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.fitness_goal && c.fitness_goal.toLowerCase().includes(q))
    );
  });

  // Messages for active client
  const activeConversation = messages.filter(m => m.trainee_id === activeChatClientId);
  const activeChatClient = clients.find(c => c.trainee_id === activeChatClientId);

  return (
    <div style={{ backgroundColor: '#07090D', minHeight: '100vh', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 80px)' }}>
        
        {/* ===================== SIDEBAR NAVIGATION ===================== */}
        <aside style={{
          width: '280px',
          backgroundColor: '#0D121A',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.75rem 1.25rem',
          flexShrink: 0
        }}>
          <div>
            {/* Coach Profile Card */}
            <div style={{
              background: '#151B26',
              border: '1px solid rgba(184, 255, 0, 0.25)',
              borderRadius: '16px',
              padding: '1.25rem 1rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={profileForm.avatar_url || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80'}
                  alt={profileForm.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #B8FF00'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: scheduleStatus === 'active' ? '#B8FF00' : '#64748B',
                  borderRadius: '50%',
                  border: '2px solid #0D121A'
                }}></span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.72rem', color: '#B8FF00', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Master Coach Hub
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileForm.name || user?.name || 'Coach'}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileForm.specialization || 'Fitness Specialist'}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                onClick={() => handleNavClick('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'dashboard' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'dashboard' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'dashboard' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'dashboard' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <LayoutDashboard size={18} color={activeNav === 'dashboard' ? '#B8FF00' : '#94A3B8'} />
                  <span>Dashboard</span>
                </div>
                {stats.pending_requests > 0 && (
                  <span style={{
                    backgroundColor: '#FF7A00',
                    color: '#07090D',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '20px'
                  }}>
                    {stats.pending_requests}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'profile' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'profile' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'profile' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'profile' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <User size={18} color={activeNav === 'profile' ? '#B8FF00' : '#94A3B8'} />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleNavClick('clients')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'clients' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'clients' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'clients' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'clients' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={18} color={activeNav === 'clients' ? '#B8FF00' : '#94A3B8'} />
                  <span>My Clients</span>
                </div>
                <span style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px'
                }}>
                  {clients.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('bookings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'bookings' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'bookings' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'bookings' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'bookings' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} color={activeNav === 'bookings' ? '#B8FF00' : '#94A3B8'} />
                  <span>Session Bookings</span>
                </div>
                <span style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px'
                }}>
                  {allBookings.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('schedule')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'schedule' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'schedule' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'schedule' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'schedule' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <Clock size={18} color={activeNav === 'schedule' ? '#B8FF00' : '#94A3B8'} />
                <span>My Schedule</span>
              </button>

              <button
                onClick={() => handleNavClick('workouts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'workouts' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'workouts' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'workouts' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'workouts' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Dumbbell size={18} color={activeNav === 'workouts' ? '#B8FF00' : '#94A3B8'} />
                  <span>Workout Plans</span>
                </div>
                <span style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px'
                }}>
                  {workoutPlans.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('messages')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeNav === 'messages' ? 'rgba(184, 255, 0, 0.12)' : 'transparent',
                  color: activeNav === 'messages' ? '#B8FF00' : '#94A3B8',
                  border: activeNav === 'messages' ? '1px solid rgba(184, 255, 0, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: activeNav === 'messages' ? '700' : '500',
                  fontSize: '0.92rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageSquare size={18} color={activeNav === 'messages' ? '#B8FF00' : '#94A3B8'} />
                  <span>Messages</span>
                </div>
                <span style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px'
                }}>
                  {messages.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer: Public Profile Preview & Logout */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => {
                if (setSelectedTrainerId && user?.trainer_profile?.id) {
                  setSelectedTrainerId(user.trainer_profile.id);
                  if (setCurrentView) setCurrentView('trainer_profile');
                } else if (setCurrentView) {
                  setCurrentView('trainers');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.82rem',
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                textAlign: 'left',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#B8FF00'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <ArrowUpRight size={15} />
              <span>View Public Roster Profile</span>
            </button>

            <button
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#FF6B6B',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT AREA ===================== */}
        <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeNav === 'dashboard' && (
            <div>
              {/* Welcome Banner */}
              <div className="glass-panel" style={{
                padding: '2.2rem 2.5rem',
                marginBottom: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                borderLeft: '4px solid #B8FF00',
                background: 'linear-gradient(135deg, rgba(13,18,26,0.95) 0%, rgba(21,27,38,0.7) 100%)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span className="badge-lime">TRAINER COMMAND CENTER</span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• On-Duty Session Manager</span>
                  </div>
                  <h1 style={{ fontSize: '2.3rem', marginBottom: '0.3rem', fontWeight: '800' }}>
                    Welcome back, Coach {profileForm.name || user?.name || ''}!
                  </h1>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '650px' }}>
                    Monitor your assigned trainees, confirm pending session requests, manage weekly time slots, and build customized progressive workout plans.
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setActiveNav('workouts');
                      setShowPlanModal(true);
                    }}
                    className="btn-lime"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                  >
                    <Plus size={16} />
                    <span>Add Workout Plan</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('schedule')}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                  >
                    <Clock size={16} />
                    <span>Manage Availability</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('bookings')}
                    className="btn-secondary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                  >
                    <Calendar size={16} />
                    <span>Review Bookings</span>
                  </button>
                </div>
              </div>

              {/* 4 Summary Cards (Real DB Metrics) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                {/* 1. Total Clients */}
                <div className="glass-panel hover-card" style={{ padding: '1.6rem', borderLeft: '4px solid #B8FF00' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Clients
                    </span>
                    <Users size={18} color="#B8FF00" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#B8FF00', lineHeight: 1.1 }}>
                    {stats.total_clients}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem' }}>
                    Unique trainees coached
                  </div>
                </div>

                {/* 2. Upcoming Sessions */}
                <div className="glass-panel hover-card" style={{ padding: '1.6rem', borderLeft: '4px solid #00F0FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Upcoming Sessions
                    </span>
                    <Calendar size={18} color="#00F0FF" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#00F0FF', lineHeight: 1.1 }}>
                    {stats.upcoming_sessions}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem' }}>
                    Confirmed & scheduled
                  </div>
                </div>

                {/* 3. Pending Requests */}
                <div 
                  onClick={() => setActiveNav('bookings')}
                  className="glass-panel hover-card" 
                  style={{ padding: '1.6rem', borderLeft: '4px solid #FF7A00', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Pending Requests
                    </span>
                    <Clock size={18} color="#FF7A00" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FF7A00', lineHeight: 1.1 }}>
                    {stats.pending_requests}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem' }}>
                    Awaiting your confirmation
                  </div>
                </div>

                {/* 4. Completed Sessions */}
                <div className="glass-panel hover-card" style={{ padding: '1.6rem', borderLeft: '4px solid #A855F7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Completed Sessions
                    </span>
                    <CheckCircle2 size={18} color="#A855F7" />
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#A855F7', lineHeight: 1.1 }}>
                    {stats.completed_sessions}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem' }}>
                    Successful sessions logged
                  </div>
                </div>
              </div>

              {/* Today's Scheduled Sessions */}
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Activity size={20} color="#B8FF00" />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Today's Scheduled Sessions</h3>
                  </div>
                  <span className="badge-lime">{todaySessions.length} Scheduled Today</span>
                </div>

                {todaySessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
                    <Clock size={32} color="#64748B" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                    <p style={{ fontSize: '0.92rem' }}>No sessions scheduled for today. Review your upcoming roster or adjust availability.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {todaySessions.map((s) => (
                      <div key={s.id} style={{
                        background: '#0D121A',
                        padding: '1.2rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(184, 255, 0, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#B8FF00', fontWeight: '700' }}>{s.time_slot}</span>
                            <span className={s.status === 'accepted' ? 'badge-lime' : 'badge-orange'}>{s.status.toUpperCase()}</span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{s.trainee_name}</h4>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Goal: {s.fitness_goal || 'General Fitness'}</div>
                        </div>
                        {s.status === 'accepted' && (
                          <button
                            onClick={() => handleBookingStatus(s.id, 'completed')}
                            className="btn-secondary"
                            style={{ marginTop: '0.85rem', width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Two Column Grid: Recent Booking Requests & Upcoming Sessions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                
                {/* Recent Booking Requests */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Booking Requests</h3>
                    <span className="badge-orange">{recentRequests.length} Pending</span>
                  </div>

                  {recentRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94A3B8' }}>
                      <CheckCircle2 size={32} color="#B8FF00" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                      <p style={{ fontSize: '0.9rem' }}>All pending requests have been addressed!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {recentRequests.map((req) => (
                        <div key={req.id} style={{
                          background: '#0D121A',
                          border: '1px solid rgba(255, 122, 0, 0.25)',
                          borderRadius: '12px',
                          padding: '1.1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{req.trainee_name}</h4>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{req.trainee_email}</div>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#B8FF00', fontWeight: '700' }}>{req.booking_date}</span>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.75rem' }}>
                            <div><strong>Slot:</strong> {req.time_slot}</div>
                            {req.notes && <div style={{ fontStyle: 'italic', color: '#94A3B8', marginTop: '0.2rem' }}>"{req.notes}"</div>}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleBookingStatus(req.id, 'accepted')}
                              className="btn-lime"
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                            >
                              <Check size={14} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleBookingStatus(req.id, 'rejected')}
                              className="btn-secondary"
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', color: '#FF6B6B' }}
                            >
                              <X size={14} />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Confirmed Sessions */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Sessions</h3>
                    <span className="badge-lime">{upcomingList.length} Scheduled</span>
                  </div>

                  {upcomingList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94A3B8' }}>
                      <Calendar size={32} color="#64748B" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                      <p style={{ fontSize: '0.9rem' }}>No upcoming sessions yet. Accept requests or publish availability.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {upcomingList.map((ses) => (
                        <div key={ses.id} style={{
                          background: '#0D121A',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{ses.trainee_name}</h4>
                            <span className="badge-lime">CONFIRMED</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                            <div>📅 {ses.booking_date} • {ses.time_slot}</div>
                            {ses.fitness_goal && <div>🎯 Goal: {ses.fitness_goal}</div>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                            <button
                              onClick={() => handleBookingStatus(ses.id, 'completed')}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                            >
                              Mark Completed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeNav === 'profile' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>Trainer Profile Credentials</h1>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
                  Manage your public profile displayed to prospective gym trainees across FitSphere 360.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                {/* Profile Edit Form */}
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                        Trainer Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="form-input-dark"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={profileForm.experience_years}
                          onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                          className="form-input-dark"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Hourly Rate (₹ INR / hr)
                        </label>
                        <input
                          type="number"
                          min="200"
                          max="20000"
                          value={profileForm.hourly_rate}
                          onChange={(e) => setProfileForm({ ...profileForm, hourly_rate: e.target.value })}
                          className="form-input-dark"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                        Primary Specialization
                      </label>
                      <input
                        type="text"
                        value={profileForm.specialization}
                        onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                        placeholder="e.g. Olympic Weightlifting, Strength & Conditioning, Calisthenics"
                        className="form-input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                        Qualifications & Certifications
                      </label>
                      <input
                        type="text"
                        value={profileForm.qualifications}
                        onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                        placeholder="e.g. CSCS, USAW Level 2, NASM-CPT, B.S. Kinesiology"
                        className="form-input-dark"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="form-input-dark"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Coaching Status
                        </label>
                        <select
                          value={profileForm.status}
                          onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                          className="form-input-dark"
                        >
                          <option value="active">Active (Accepting Clients)</option>
                          <option value="inactive">Inactive / On Leave</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                        Profile Photo / Avatar Image URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="form-input-dark"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                        Coaching Bio & Athletic Philosophy
                      </label>
                      <textarea
                        rows="4"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Describe your training methodology, client results, and credentials..."
                        className="form-input-dark"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="btn-lime"
                        style={{ padding: '0.75rem 2rem' }}
                      >
                        <Save size={16} />
                        <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Card Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <Sparkles size={18} color="#B8FF00" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Public Directory Card Preview</h3>
                    </div>

                    <div style={{
                      background: '#0D121A',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(184, 255, 0, 0.25)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={profileForm.avatar_url || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80'}
                          alt={profileForm.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(7, 9, 13, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          border: '1px solid rgba(184, 255, 0, 0.3)',
                          fontSize: '0.8rem',
                          color: '#B8FF00',
                          fontWeight: '800'
                        }}>
                          ₹{Number(profileForm.hourly_rate).toLocaleString('en-IN')} / hr
                        </div>
                      </div>

                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#B8FF00', fontWeight: '700' }}>
                            {profileForm.experience_years} Years Experience
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#F59E0B' }}>★ 4.95 Rating</span>
                        </div>
                        <h4 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{profileForm.name || 'Coach Name'}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#00F0FF', fontWeight: '600', marginBottom: '0.75rem' }}>
                          {profileForm.specialization}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {profileForm.bio || 'Professional trainer dedicated to helping you achieve athletic milestones.'}
                        </p>
                        <div style={{ fontSize: '0.78rem', color: '#CBD5E1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                          <strong>Credentials:</strong> {profileForm.qualifications}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: MY CLIENTS */}
          {activeNav === 'clients' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>My Trainees Roster</h1>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Trainees who have booked 1-on-1 coaching sessions with you</p>
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search client by name..."
                    className="form-input-dark"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {filteredClients.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Users size={48} color="#64748B" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No clients found</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                    {clientSearch ? 'Try a different search term.' : 'Trainees who book your sessions will appear in this active roster.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {filteredClients.map((c) => (
                    <div key={c.trainee_id} className="glass-panel hover-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                          <img
                            src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={c.name}
                            style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #B8FF00' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <h4 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{c.name}</h4>
                            <div style={{ fontSize: '0.8rem', color: '#00F0FF', fontWeight: '600' }}>{c.fitness_goal || 'General Fitness'}</div>
                          </div>
                        </div>

                        <div style={{ background: '#0D121A', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#94A3B8' }}>Total Sessions:</span>
                            <strong style={{ color: '#FFFFFF' }}>{c.total_bookings}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#94A3B8' }}>Latest Session:</span>
                            <strong style={{ color: '#B8FF00' }}>{c.latest_booking_date} ({c.latest_status})</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94A3B8' }}>Active Plan:</span>
                            <strong style={{ color: c.active_workout_plan ? '#A855F7' : '#64748B' }}>
                              {c.active_workout_plan || 'None Assigned'}
                            </strong>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.25rem' }}>
                          <div><Mail size={12} style={{ display: 'inline', marginRight: '5px' }} /> {c.email}</div>
                          {c.phone && <div><Phone size={12} style={{ display: 'inline', marginRight: '5px' }} /> {c.phone}</div>}
                        </div>
                      </div>

                      {/* Client Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => {
                            setActiveChatClientId(c.trainee_id);
                            setActiveNav('messages');
                          }}
                          className="btn-lime"
                          style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
                        >
                          <MessageSquare size={14} />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => {
                            setPlanForm({ ...planForm, trainee_id: c.trainee_id });
                            setShowPlanModal(true);
                            setActiveNav('workouts');
                          }}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
                        >
                          <Dumbbell size={14} />
                          <span>Assign Plan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SESSION BOOKINGS */}
          {activeNav === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>Session Bookings Manager</h1>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Review all booking requests, accept or reject incoming sessions</p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#0D121A', padding: '0.35rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        background: bookingFilter === f ? '#B8FF00' : 'transparent',
                        color: bookingFilter === f ? '#07090D' : '#94A3B8',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Calendar size={48} color="#64748B" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No bookings matching "{bookingFilter}"</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>All requests in this category have been processed.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.5rem' }}>
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="glass-panel hover-card" style={{
                      padding: '1.75rem',
                      borderLeft: b.status === 'accepted' ? '4px solid #B8FF00' : b.status === 'pending' ? '4px solid #FF7A00' : b.status === 'completed' ? '4px solid #A855F7' : '4px solid #EF4444'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <img
                            src={b.trainee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={b.trainee_name}
                            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <h4 style={{ fontSize: '1.15rem' }}>{b.trainee_name}</h4>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{b.trainee_email}</div>
                          </div>
                        </div>
                        <span className={
                          b.status === 'accepted' ? 'badge-lime' :
                          b.status === 'pending' ? 'badge-orange' :
                          b.status === 'completed' ? 'badge-purple' : 'badge-red'
                        }>
                          {b.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ background: '#0D121A', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ color: '#94A3B8' }}>Date & Slot:</span>
                          <strong style={{ color: '#FFFFFF' }}>{b.booking_date} • {b.time_slot}</strong>
                        </div>
                        {b.gym_name && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#94A3B8' }}>Gym Facility:</span>
                            <span style={{ color: '#00F0FF' }}>{b.gym_name}</span>
                          </div>
                        )}
                        {b.notes && (
                          <div style={{ color: '#CBD5E1', fontSize: '0.78rem', marginTop: '0.5rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem' }}>
                            Goal: "{b.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons based on status */}
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBookingStatus(b.id, 'accepted')}
                              className="btn-lime"
                              style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
                            >
                              <Check size={14} />
                              <span>Accept Session</span>
                            </button>
                            <button
                              onClick={() => handleBookingStatus(b.id, 'rejected')}
                              className="btn-secondary"
                              style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem', color: '#FF6B6B' }}
                            >
                              <X size={14} />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {b.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleBookingStatus(b.id, 'completed')}
                              className="btn-lime"
                              style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark Completed</span>
                            </button>
                            <button
                              onClick={() => handleBookingStatus(b.id, 'rejected')}
                              className="btn-secondary"
                              style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', color: '#FF6B6B' }}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {(b.status === 'completed' || b.status === 'rejected') && (
                          <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                            Session archived as {b.status}.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY SCHEDULE & AVAILABILITY */}
          {activeNav === 'schedule' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>My Schedule & Availability</h1>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
                  Set your working days and daily coaching slots for trainee bookings.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '800px' }}>
                <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Status Toggle */}
                  <div style={{ background: '#0D121A', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF' }}>Accepting Trainee Bookings</div>
                      <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Allow prospective clients to book sessions with you on the platform</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScheduleStatus(scheduleStatus === 'active' ? 'inactive' : 'active')}
                      style={{
                        padding: '0.6rem 1.4rem',
                        borderRadius: '30px',
                        background: scheduleStatus === 'active' ? '#B8FF00' : '#1E293B',
                        color: scheduleStatus === 'active' ? '#07090D' : '#94A3B8',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: scheduleStatus === 'active' ? '#07090D' : '#64748B'
                      }}></span>
                      <span>{scheduleStatus === 'active' ? 'Active Duty' : 'On Leave'}</span>
                    </button>
                  </div>

                  {/* Available Days */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#FFFFFF' }}>
                      Active Working Days
                    </label>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem' }}>
                      Click days to toggle your availability. Trainees can only select active days.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                      {daysOfWeek.map((day) => {
                        const isSelected = scheduleDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleScheduleDay(day)}
                            style={{
                              padding: '0.7rem 1.25rem',
                              borderRadius: '30px',
                              background: isSelected ? 'rgba(184, 255, 0, 0.15)' : '#0D121A',
                              color: isSelected ? '#B8FF00' : '#94A3B8',
                              border: isSelected ? '1px solid #B8FF00' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              fontWeight: isSelected ? '700' : '500',
                              fontSize: '0.88rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#FFFFFF' }}>
                      Daily Coaching Time Shifts
                    </label>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem' }}>
                      Select the slots during which you are on gym duty for 1-on-1 sessions.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.25rem' }}>
                      {commonSlots.map((slot) => {
                        const isSelected = scheduleSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleScheduleSlot(slot)}
                            style={{
                              padding: '0.6rem 1.15rem',
                              borderRadius: '10px',
                              background: isSelected ? 'rgba(0, 240, 255, 0.15)' : '#0D121A',
                              color: isSelected ? '#00F0FF' : '#94A3B8',
                              border: isSelected ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              fontWeight: isSelected ? '700' : '500',
                              fontSize: '0.85rem'
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{slot}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Slot */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        value={customSlot}
                        onChange={(e) => setCustomSlot(e.target.value)}
                        placeholder="Add custom slot, e.g. 02:00 PM - 05:00 PM"
                        className="form-input-dark"
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={addCustomSlot}
                        className="btn-secondary"
                        style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
                      >
                        <Plus size={16} />
                        <span>Add Slot</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="btn-lime"
                      style={{ padding: '0.8rem 2.2rem' }}
                    >
                      <Save size={16} />
                      <span>{savingSchedule ? 'Updating Schedule...' : 'Save Availability & Slots'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: WORKOUT PLANS */}
          {activeNav === 'workouts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>Custom Workout Plans</h1>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
                    Author and assign structured training regimens to your booked trainees.
                  </p>
                </div>

                <button
                  onClick={() => setShowPlanModal(true)}
                  className="btn-lime"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  <Plus size={18} />
                  <span>Create New Workout Plan</span>
                </button>
              </div>

              {/* Workout Plans Grid */}
              {workoutPlans.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Dumbbell size={48} color="#64748B" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No workout plans created yet</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Build your first customized progressive overload plan for your trainees.
                  </p>
                  <button onClick={() => setShowPlanModal(true)} className="btn-lime">
                    <Plus size={16} />
                    <span>Create Workout Plan</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                  {workoutPlans.map((wp) => {
                    let exercises = [];
                    try {
                      exercises = typeof wp.exercises === 'string' ? JSON.parse(wp.exercises) : wp.exercises || [];
                    } catch (e) {
                      exercises = [];
                    }

                    return (
                      <div key={wp.id} className="glass-panel hover-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span className="badge-lime">{wp.category || 'Strength'}</span>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#00F0FF', background: 'rgba(0, 240, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                                {wp.difficulty}
                              </span>
                              <button
                                onClick={() => handleDeletePlan(wp.id)}
                                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.2rem' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#FFFFFF' }}>{wp.title}</h3>
                          
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <span>🎯 {wp.target_muscle}</span>
                            <span>⏱ {wp.duration_weeks} Weeks</span>
                            {wp.trainee_name && (
                              <span style={{ color: '#B8FF00', fontWeight: '700' }}>👤 Assigned: {wp.trainee_name}</span>
                            )}
                          </div>

                          {/* Exercise List */}
                          <div style={{ background: '#0D121A', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                              Exercises ({exercises.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              {exercises.slice(0, 4).map((ex, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                  <span style={{ color: '#FFFFFF' }}>{ex.name}</span>
                                  <span style={{ color: '#B8FF00', fontWeight: '700' }}>{ex.sets} × {ex.reps}</span>
                                </div>
                              ))}
                              {exercises.length > 4 && (
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                  +{exercises.length - 4} more exercises in full program
                                </div>
                              )}
                            </div>
                          </div>

                          {wp.instructions && (
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                              "{wp.instructions}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CREATE WORKOUT PLAN MODAL */}
              {showPlanModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(7, 9, 13, 0.85)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  padding: '1.5rem'
                }}>
                  <div className="glass-panel" style={{
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2.5rem',
                    border: '1px solid rgba(184, 255, 0, 0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Dumbbell size={22} color="#B8FF00" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Author Workout Plan</h2>
                      </div>
                      <button
                        onClick={() => setShowPlanModal(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Workout Plan Title *
                        </label>
                        <input
                          type="text"
                          value={planForm.title}
                          onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                          placeholder="e.g. 6-Week Hypertrophy Specialist Protocol"
                          className="form-input-dark"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Category
                          </label>
                          <select
                            value={planForm.category}
                            onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })}
                            className="form-input-dark"
                          >
                            <option value="Hypertrophy & Strength">Hypertrophy & Strength</option>
                            <option value="Olympic Weightlifting">Olympic Weightlifting</option>
                            <option value="Calisthenics & Bodyweight">Calisthenics & Bodyweight</option>
                            <option value="HIIT & Conditioning">HIIT & Conditioning</option>
                            <option value="Mobility & Rehab">Mobility & Rehab</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Difficulty Level
                          </label>
                          <select
                            value={planForm.difficulty}
                            onChange={(e) => setPlanForm({ ...planForm, difficulty: e.target.value })}
                            className="form-input-dark"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Duration (Weeks)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="52"
                            value={planForm.duration_weeks}
                            onChange={(e) => setPlanForm({ ...planForm, duration_weeks: Number(e.target.value) })}
                            className="form-input-dark"
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Target Muscle Group
                          </label>
                          <input
                            type="text"
                            value={planForm.target_muscle}
                            onChange={(e) => setPlanForm({ ...planForm, target_muscle: e.target.value })}
                            placeholder="e.g. Posterior Chain, Full Body, Chest & Triceps"
                            className="form-input-dark"
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                            Assign to Trainee (Optional)
                          </label>
                          <select
                            value={planForm.trainee_id}
                            onChange={(e) => setPlanForm({ ...planForm, trainee_id: e.target.value })}
                            className="form-input-dark"
                          >
                            <option value="">General Plan (All Clients)</option>
                            {clients.map(c => (
                              <option key={c.trainee_id} value={c.trainee_id}>
                                {c.name} ({c.fitness_goal})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dynamic Exercise List */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF' }}>
                            Exercises Roster
                          </label>
                          <button
                            type="button"
                            onClick={addExerciseRow}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#B8FF00',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Plus size={14} /> Add Exercise
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {planForm.exercises.map((ex, index) => (
                            <div key={index} style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1fr 1fr 2fr 35px',
                              gap: '0.5rem',
                              alignItems: 'center',
                              background: '#0D121A',
                              padding: '0.6rem 0.8rem',
                              borderRadius: '8px'
                            }}>
                              <input
                                type="text"
                                placeholder="Exercise Name"
                                value={ex.name}
                                onChange={(e) => updateExerciseRow(index, 'name', e.target.value)}
                                className="form-input-dark"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                required
                              />
                              <input
                                type="text"
                                placeholder="Sets (e.g. 4)"
                                value={ex.sets}
                                onChange={(e) => updateExerciseRow(index, 'sets', e.target.value)}
                                className="form-input-dark"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                required
                              />
                              <input
                                type="text"
                                placeholder="Reps (e.g. 8-10)"
                                value={ex.reps}
                                onChange={(e) => updateExerciseRow(index, 'reps', e.target.value)}
                                className="form-input-dark"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                required
                              />
                              <input
                                type="text"
                                placeholder="Coaching Notes / RPE"
                                value={ex.notes}
                                onChange={(e) => updateExerciseRow(index, 'notes', e.target.value)}
                                className="form-input-dark"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeExerciseRow(index)}
                                disabled={planForm.exercises.length <= 1}
                                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                          Coaching Instructions & Progressive Overload Guidelines
                        </label>
                        <textarea
                          rows="3"
                          value={planForm.instructions}
                          onChange={(e) => setPlanForm({ ...planForm, instructions: e.target.value })}
                          placeholder="Rest intervals, hydration notes, warm-up routine..."
                          className="form-input-dark"
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowPlanModal(false)}
                          className="btn-secondary"
                          style={{ padding: '0.7rem 1.5rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingPlan}
                          className="btn-lime"
                          style={{ padding: '0.7rem 2rem' }}
                        >
                          {savingPlan ? 'Publishing Plan...' : 'Publish Workout Plan'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MESSAGES */}
          {activeNav === 'messages' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.3rem' }}>Client Communications</h1>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Direct messaging and session notes with your booked trainees</p>
              </div>

              {clients.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <MessageSquare size={48} color="#64748B" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No client chats yet</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                    Once trainees book sessions with you, direct messaging channels will be activated here.
                  </p>
                </div>
              ) : (
                <div className="glass-panel" style={{
                  display: 'grid',
                  gridTemplateColumns: '300px 1fr',
                  height: '620px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {/* Left Column: Client List */}
                  <div style={{
                    background: '#0D121A',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF' }}>Clients ({clients.length})</h4>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {clients.map((c) => {
                        const isSelected = c.trainee_id === activeChatClientId;
                        return (
                          <div
                            key={c.trainee_id}
                            onClick={() => setActiveChatClientId(c.trainee_id)}
                            style={{
                              padding: '1rem 1.25rem',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              background: isSelected ? 'rgba(184, 255, 0, 0.1)' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <img
                              src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={c.name}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: isSelected ? '2px solid #B8FF00' : '1px solid rgba(255,255,255,0.1)' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div style={{ overflow: 'hidden' }}>
                              <h5 style={{ fontSize: '0.95rem', color: isSelected ? '#B8FF00' : '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.name}
                              </h5>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.fitness_goal || 'General Fitness'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Chat Stream */}
                  <div style={{ display: 'flex', flexDirection: 'column', background: '#07090D' }}>
                    {activeChatClient ? (
                      <>
                        {/* Chat Header */}
                        <div style={{
                          padding: '1rem 1.5rem',
                          background: '#0D121A',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={activeChatClient.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={activeChatClient.name}
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{activeChatClient.name}</h4>
                              <div style={{ fontSize: '0.75rem', color: '#B8FF00' }}>Active Trainee • {activeChatClient.fitness_goal}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{activeChatClient.email}</div>
                        </div>

                        {/* Chat Message Stream */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {activeConversation.length === 0 ? (
                            <div style={{ textAlign: 'center', margin: 'auto', color: '#64748B' }}>
                              <MessageSquare size={36} color="#252F40" style={{ margin: '0 auto 0.5rem auto' }} />
                              <p style={{ fontSize: '0.88rem' }}>No messages exchanged yet. Send a note to welcome {activeChatClient.name}!</p>
                            </div>
                          ) : (
                            activeConversation.map((m) => {
                              const isMe = m.sender_role === 'trainer';
                              return (
                                <div
                                  key={m.id}
                                  style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '75%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                  }}
                                >
                                  <div style={{
                                    padding: '0.85rem 1.15rem',
                                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                    background: isMe ? '#B8FF00' : '#151B26',
                                    color: isMe ? '#07090D' : '#FFFFFF',
                                    fontWeight: isMe ? '600' : '400',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.5,
                                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                                  }}>
                                    {m.message}
                                  </div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>
                                    {isMe ? 'Coach You' : activeChatClient.name} • {m.created_at ? m.created_at.slice(11, 16) : 'Now'}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} style={{
                          padding: '1rem 1.5rem',
                          background: '#0D121A',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          gap: '0.75rem'
                        }}>
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={`Message ${activeChatClient.name}...`}
                            className="form-input-dark"
                            style={{ flex: 1, fontSize: '0.88rem' }}
                          />
                          <button
                            type="submit"
                            disabled={sendingMsg || !chatInput.trim()}
                            className="btn-lime"
                            style={{ padding: '0.65rem 1.25rem' }}
                          >
                            <Send size={16} />
                            <span>Send</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748B' }}>
                        Select a client from the list to start messaging.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
