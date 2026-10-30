import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Search, 
  Calendar, 
  Clock, 
  Building2, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Filter, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';
import { AddTrainerModal } from '../components/AddTrainerModal';

export const ManageTrainersPage = ({ setCurrentView, setSelectedTrainerId }) => {
  const { user, showToast } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [ownerGyms, setOwnerGyms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'bookings'
  const [search, setSearch] = useState('');
  const [selectedGymFilter, setSelectedGymFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [trainerToEdit, setTrainerToEdit] = useState(null);

  const fetchTrainerData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/trainers/owner').then(r => r.json()),
      fetch('/api/gyms?owner_only=true').then(r => r.json()),
      fetch('/api/bookings/owner').then(r => r.json())
    ])
      .then(([tData, gData, bData]) => {
        setTrainers(tData.trainers || []);
        setOwnerGyms(gData.gyms || []);
        setBookings(bData.bookings || []);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load trainer records', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const handleToggleStatus = async (trainer) => {
    const newStatus = trainer.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/trainers/${trainer.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      showToast(`Coach ${trainer.name} is now ${newStatus.toUpperCase()}`, 'info');
      fetchTrainerData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTrainer = async (trainer) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete coach "${trainer.name}" from your gym roster?\n\nThis will remove their profile and synchronize with Supabase.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/trainers/${trainer.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete trainer');

      showToast(data.message || `Trainer ${trainer.name} deleted successfully!`, 'info');
      fetchTrainerData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking status');

      showToast(`Booking marked as ${newStatus}!`, 'success');
      fetchTrainerData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter Logic
  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      (t.specialization && t.specialization.toLowerCase().includes(search.toLowerCase()));

    const matchesGym = selectedGymFilter === 'All' || String(t.gym_id) === String(selectedGymFilter);
    const matchesStatus = selectedStatusFilter === 'All' || t.status === selectedStatusFilter;

    return matchesSearch && matchesGym && matchesStatus;
  });

  // Calculate Metrics
  const activeCount = trainers.filter(t => t.status === 'active').length;
  const inactiveCount = trainers.filter(t => t.status === 'inactive').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const totalPayroll = trainers.reduce((sum, t) => sum + (parseFloat(t.salary) || 0), 0);

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCurrentView('owner_dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.88rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#B8FF00'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <ArrowLeft size={16} />
            <span>Back to Owner Dashboard</span>
          </button>

          <button
            onClick={fetchTrainerData}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={13} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Page Top Title Banner */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge-lime">TRAINER MANAGEMENT MODULE</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Supabase Synchronized Staff Roster</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '0.35rem' }}>
              Certified Trainer Operations
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '750px' }}>
              Deploy coaches across your facilities, calibrate hourly rates, maintain confidential payroll records, and manage athlete 1-on-1 session requests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTrainerToEdit(null);
                setModalOpen(true);
              }}
              className="btn-lime"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}
            >
              <Plus size={18} />
              <span>Add New Trainer</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Total Trainers */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #B8FF00' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Total Trainer Staff
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FFFFFF' }}>
              {trainers.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Rostered across {ownerGyms.length} gym facilities
            </div>
          </div>

          {/* Active Status */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #00F0FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Coaches</span>
              <span className="badge-cyan">{activeCount} Online</span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#00F0FF' }}>
              {activeCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              {inactiveCount} currently deactivated / on leave
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #FF7A00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Session Bookings</span>
              {pendingBookingsCount > 0 && <span className="badge-orange">{pendingBookingsCount} Action Req</span>}
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FF7A00' }}>
              {bookings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              {pendingBookingsCount} awaiting confirmation
            </div>
          </div>

          {/* Total Payroll */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #A855F7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Monthly Payroll</span>
              <span style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={11} /> Private
              </span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FFFFFF' }}>
              ₹{totalPayroll.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              Gross monthly coaching salaries
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation (Roster vs Bookings) */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('roster')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'roster' ? '3px solid #B8FF00' : '3px solid transparent',
              color: activeTab === 'roster' ? '#B8FF00' : '#94A3B8',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            <span>Trainer Roster ({trainers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'bookings' ? '3px solid #00F0FF' : '3px solid transparent',
              color: activeTab === 'bookings' ? '#00F0FF' : '#94A3B8',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={18} />
            <span>Session Requests ({bookings.length})</span>
            {pendingBookingsCount > 0 && (
              <span style={{
                background: '#FF7A00',
                color: '#07090D',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900'
              }}>
                {pendingBookingsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: TRAINER ROSTER */}
        {activeTab === 'roster' && (
          <div>
            {/* Filter and Search Bar */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search coach by name, email, specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input-dark"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>

                {/* Gym Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={16} color="#B8FF00" />
                  <select
                    value={selectedGymFilter}
                    onChange={(e) => setSelectedGymFilter(e.target.value)}
                    className="form-input-dark"
                    style={{ minWidth: '180px', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <option value="All">All Assigned Gyms</option>
                    {ownerGyms.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={16} color="#00F0FF" />
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="form-input-dark"
                    style={{ minWidth: '140px', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Trainer Cards / Table */}
            {filteredTrainers.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <Users size={40} color="#B8FF00" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>No Trainers Found</h3>
                <p style={{ color: '#94A3B8', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                  {trainers.length === 0 
                    ? 'You have not added any certified personal trainers to your gym facilities yet.'
                    : 'No trainers match your selected filters. Try clearing the search query or status filter.'}
                </p>
                {trainers.length === 0 && (
                  <button
                    onClick={() => {
                      setTrainerToEdit(null);
                      setModalOpen(true);
                    }}
                    className="btn-lime"
                  >
                    + Add First Trainer
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredTrainers.map(t => {
                  const isActive = t.status === 'active';
                  const days = Array.isArray(t.available_days) ? t.available_days : [];
                  const timeSlots = Array.isArray(t.available_time_slots) ? t.available_time_slots : [];

                  return (
                    <div 
                      key={t.id} 
                      className="glass-panel hover-card" 
                      style={{ 
                        padding: '1.75rem',
                        borderLeft: isActive ? '4px solid #B8FF00' : '4px solid #64748B'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem'
                      }}>
                        {/* Coach Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px' }}>
                          <img 
                            src={t.profile_image || t.avatar_url} 
                            alt={t.name}
                            style={{
                              width: '72px',
                              height: '72px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: isActive ? '2px solid #B8FF00' : '2px solid #64748B',
                              boxShadow: isActive ? '0 0 15px rgba(184,255,0,0.2)' : 'none'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                              <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: 0 }}>
                                {t.name}
                              </h3>
                              <span className={isActive ? 'badge-lime' : 'badge-secondary'}>
                                {isActive ? '● Active' : '○ Inactive'}
                              </span>
                              {t.user_id && (
                                <span className="badge-cyan" style={{ fontSize: '0.7rem' }}>
                                  ✓ Linked Account
                                </span>
                              )}
                            </div>

                            <div style={{ color: '#B8FF00', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                              {t.specialization} • {t.experience_years} Years Experience
                            </div>

                            <div style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <span>✉ {t.email}</span>
                              {t.phone && <span>☎ {t.phone}</span>}
                              {t.gym_name && <span>📍 {t.gym_name}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Salary & Rates Matrix (Private to Owner) */}
                        <div style={{
                          background: '#0D121A',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px',
                          padding: '0.85rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              <Lock size={10} color="#FF7A00" />
                              <span>Monthly Salary</span>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF' }}>
                              ₹{t.salary ? Number(t.salary).toLocaleString('en-IN') : '45,000'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Owner Private</div>
                          </div>

                          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                            <div style={{ color: '#94A3B8', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              Hourly Session Rate
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#00F0FF' }}>
                              ₹{Number(t.hourly_rate || 1200).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Public trainee fee</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(t)}
                            title={isActive ? 'Deactivate Coach' : 'Activate Coach'}
                            style={{
                              background: isActive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(184, 255, 0, 0.12)',
                              border: isActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(184, 255, 0, 0.3)',
                              color: isActive ? '#F87171' : '#B8FF00',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Power size={14} />
                            <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {/* Edit Trainer */}
                          <button
                            onClick={() => {
                              setTrainerToEdit(t);
                              setModalOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '0.55rem 0.95rem', fontSize: '0.8rem' }}
                          >
                            <Edit3 size={14} />
                            <span>Edit Info</span>
                          </button>

                          {/* Delete Trainer */}
                          <button
                            onClick={() => handleDeleteTrainer(t)}
                            title="Delete Trainer Profile"
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#F87171',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              e.currentTarget.style.borderColor = '#F87171';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Schedule Badges Row */}
                      <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#94A3B8' }}>Working Days:</span>
                          {days.length > 0 ? (
                            days.map(d => (
                              <span key={d} style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                {d}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#64748B', fontStyle: 'italic' }}>Mon-Fri flexible</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#94A3B8' }}>Time Slots:</span>
                          {timeSlots.length > 0 ? (
                            timeSlots.map(s => (
                              <span key={s} style={{ background: 'rgba(0, 240, 255, 0.08)', color: '#00F0FF', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                {s}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#64748B', fontStyle: 'italic' }}>07:00 AM - 08:00 PM</span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedTrainerId(t.id);
                            setCurrentView('trainer_profile');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#B8FF00',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Eye size={13} />
                          <span>View Public Profile →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.2rem' }}>
                  Client Coaching Bookings
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                  Manage session appointments requested by trainees for coaches rostered at your gyms.
                </p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <Calendar size={40} color="#00F0FF" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>No Booking Requests Yet</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                  When trainees submit 1-on-1 session requests for your coaches, they will appear here with acceptance controls.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(b => {
                  const isPending = b.status === 'pending';
                  const isAccepted = b.status === 'accepted';
                  const isRejected = b.status === 'rejected';

                  return (
                    <div key={b.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.25rem'
                      }}>
                        {/* Athlete and Coach Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(0, 240, 255, 0.1)',
                            border: '2px solid #00F0FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            color: '#00F0FF'
                          }}>
                            {b.trainee_name ? b.trainee_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>
                              {b.trainee_name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              Trainee • ✉ {b.trainee_email} {b.trainee_phone && `• ☎ ${b.trainee_phone}`}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#B8FF00', marginTop: '0.2rem' }}>
                              Assigned Coach: <strong>{b.trainer_name}</strong> ({b.specialization})
                            </div>
                          </div>
                        </div>

                        {/* Date and Time Slot */}
                        <div style={{
                          background: '#0D121A',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '10px',
                          padding: '0.75rem 1.25rem',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <Calendar size={14} color="#B8FF00" />
                            <span style={{ color: '#CBD5E1' }}>Date: <strong>{b.booking_date}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} color="#00F0FF" />
                            <span style={{ color: '#00F0FF' }}>Slot: <strong>{b.time_slot}</strong></span>
                          </div>
                        </div>

                        {/* Status & Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={
                            isAccepted ? 'badge-lime' : isPending ? 'badge-orange' : 'badge-secondary'
                          }>
                            {isAccepted ? '✓ Confirmed' : isPending ? '⏳ Pending Review' : b.status}
                          </span>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleBookingStatus(b.id, 'accepted')}
                                className="btn-lime"
                                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                              >
                                <Check size={14} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleBookingStatus(b.id, 'rejected')}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#F87171',
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={14} />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => handleBookingStatus(b.id, 'completed')}
                              className="btn-secondary"
                              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>

                      {b.notes && (
                        <div style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.65rem',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                          color: '#94A3B8',
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          Athlete Goal / Notes: "{b.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Add / Edit Trainer Modal */}
      <AddTrainerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchTrainerData()}
        trainerToEdit={trainerToEdit}
        ownerGyms={ownerGyms}
      />
    </div>
  );
};
