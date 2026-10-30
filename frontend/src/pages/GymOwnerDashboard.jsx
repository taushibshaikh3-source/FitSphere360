import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Award, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  Search,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { AddGymModal } from '../components/AddGymModal';
import { AddPlanModal } from '../components/AddPlanModal';
import { AddTrainerModal } from '../components/AddTrainerModal';

export const GymOwnerDashboard = ({ setCurrentView, setSelectedGymId }) => {
  const { user, showToast } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [enrollees, setEnrollees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [gymModalOpen, setGymModalOpen] = useState(false);
  const [gymToEdit, setGymToEdit] = useState(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [activeGymForPlan, setActiveGymForPlan] = useState(null);
  const [planToEdit, setPlanToEdit] = useState(null);

  const [trainerModalOpen, setTrainerModalOpen] = useState(false);

  // Search in enrollees
  const [memberSearch, setMemberSearch] = useState('');

  const fetchOwnerData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/gyms?owner_only=true').then(r => r.json()),
      fetch('/api/analytics/owner').then(r => r.json()),
      fetch('/api/memberships/owner').then(r => r.json())
    ])
      .then(([gData, aData, mData]) => {
        setGyms(gData.gyms || []);
        setAnalytics(aData);
        setEnrollees(mData.memberships || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleDeleteGym = async (gymId) => {
    if (!window.confirm('Are you sure you want to delete this gym and its membership plans?')) return;
    try {
      const res = await fetch(`/api/gyms/${gymId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete gym');
      showToast('Gym facility removed', 'info');
      fetchOwnerData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Delete this membership plan?')) return;
    try {
      const res = await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete plan');
      showToast('Membership plan removed', 'info');
      fetchOwnerData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredEnrollees = enrollees.filter(e => 
    e.member_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    e.plan_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    e.gym_name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        {/* Top Header matching Reference Image 2 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="badge-lime">GYM OWNER ADMIN PANEL</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Commercial Facility Management</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>
              Welcome back, {user ? user.name : 'Director'}!
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
              Here's what's happening at your gym facilities, revenue streams, and active member roster today.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('manage_trainers')}
              className="btn-secondary"
              style={{ padding: '0.7rem 1.4rem', fontSize: '0.92rem', color: '#B8FF00', borderColor: 'rgba(184, 255, 0, 0.4)' }}
            >
              <Users size={18} />
              <span>Manage Trainers</span>
            </button>
            <button
              onClick={() => {
                setGymToEdit(null);
                setGymModalOpen(true);
              }}
              className="btn-lime"
              style={{ padding: '0.7rem 1.5rem', fontSize: '0.92rem' }}
            >
              <Plus size={18} />
              <span>Add New Gym Facility</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: MANAGE TRAINERS DASHBOARD CARD (Feature Implementation) */}
        <div className="glass-panel" style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          borderLeft: '4px solid #B8FF00',
          background: 'linear-gradient(135deg, rgba(13, 18, 26, 0.95) 0%, rgba(7, 9, 13, 0.98) 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(184, 255, 0, 0.12)',
                border: '2px solid #B8FF00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(184, 255, 0, 0.25)'
              }}>
                <Award size={32} color="#B8FF00" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge-lime">STAFF OPERATIONS</span>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>• Supabase Synchronized Roster</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', margin: 0 }}>
                  Manage Trainers
                </h2>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                  Add certified trainers, review full coaching roster, edit credentials, adjust schedules, or manage terminations.
                </p>
              </div>
            </div>

            {/* 4 Required Card Actions: Add New Trainer, View All Trainers, Edit Trainer, Delete Trainer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setTrainerModalOpen(true)}
                className="btn-lime"
                style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Add New Trainer</span>
              </button>

              <button
                onClick={() => setCurrentView('manage_trainers')}
                className="btn-secondary"
                style={{ padding: '0.7rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={16} />
                <span>View All Trainers</span>
              </button>

              <button
                onClick={() => setCurrentView('manage_trainers')}
                className="btn-secondary"
                style={{ padding: '0.7rem 1.1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
              >
                <Edit3 size={16} />
                <span>Edit Trainer</span>
              </button>

              <button
                onClick={() => setCurrentView('manage_trainers')}
                className="btn-secondary"
                style={{ padding: '0.7rem 1.1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={16} />
                <span>Delete Trainer</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Metrics (Matching Image 2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Revenue */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #B8FF00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Monthly Revenue</span>
              <span className="badge-lime">+14.2%</span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FFFFFF' }}>
              ₹{analytics ? analytics.monthly_revenue.toLocaleString('en-IN') : '4,53,000'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Gross recurring pass subscriptions</div>
          </div>

          {/* Members */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #00F0FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Active Members</span>
              <span className="badge-cyan">+8.5%</span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#00F0FF' }}>
              {analytics ? analytics.total_members.toLocaleString() : '1,245'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Verified registered athletes</div>
          </div>

          {/* Trainers */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #FF7A00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Certified Trainers</span>
              <span className="badge-orange">100% Certified</span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#FF7A00' }}>
              {analytics ? analytics.total_trainers : 12}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Master coaching staff on duty</div>
          </div>

          {/* Capacity */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #A855F7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Live Floor Capacity</span>
              <span className="badge-lime">Optimal</span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#A855F7' }}>
              {analytics ? analytics.capacity_percent : 58}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>Safe crowd density distribution</div>
          </div>
        </div>

        {/* Charts & Target Analytics Row (Matching Reference Image 2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Revenue Trend Visual Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Revenue Trend (12-Month Analysis)</h3>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Annual gross recurring volume</span>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#B8FF00' }}>
                ₹15,50,250 <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 'normal' }}>This year</span>
              </div>
            </div>

            {/* Custom SVG Gradient Line Chart */}
            <div style={{ height: '180px', position: 'relative', marginTop: '1rem' }}>
              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#B8FF00" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#B8FF00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area */}
                <path
                  d="M 10 120 Q 50 100, 90 90 T 170 70 T 250 85 T 330 40 T 410 50 T 490 20 L 490 140 L 10 140 Z"
                  fill="url(#chartGrad)"
                />
                {/* Line */}
                <path
                  d="M 10 120 Q 50 100, 90 90 T 170 70 T 250 85 T 330 40 T 410 50 T 490 20"
                  fill="none"
                  stroke="#B8FF00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Data Points */}
                {[
                  { cx: 10, cy: 120 }, { cx: 90, cy: 90 }, { cx: 170, cy: 70 },
                  { cx: 250, cy: 85 }, { cx: 330, cy: 40 }, { cx: 410, cy: 50 }, { cx: 490, cy: 20 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="4.5" fill="#07090D" stroke="#B8FF00" strokeWidth="2.5" />
                ))}
              </svg>
              {/* Month labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>

          {/* Member Growth & Target Progress (Matching Image 2) */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Membership Target Progress</h3>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Q4 Acquisition objective</span>
              </div>
              <span className="badge-cyan">On Track</span>
            </div>

            {/* Circular / Semi-radial progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#B8FF00" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    strokeDashoffset="71.6" // ~71.5%
                    strokeLinecap="round" 
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFFFFF' }}>71.5%</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Target Met</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '1rem',
              marginTop: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Daily Target</div>
                <div style={{ fontWeight: '800', color: '#FFFFFF' }}>249 ↓</div>
              </div>
              <div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Actual Today</div>
                <div style={{ fontWeight: '800', color: '#B8FF00' }}>297 ↑ (+19%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: My Managed Gym Facilities */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>My Managed Facilities</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>Gyms registered under your commercial director account</p>
            </div>
          </div>

          {gyms.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Building2 size={36} color="#B8FF00" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No gyms added yet</h3>
              <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
                Click below to add your first commercial gym facility to FitSphere 360.
              </p>
              <button 
                onClick={() => {
                  setGymToEdit(null);
                  setGymModalOpen(true);
                }}
                className="btn-lime"
              >
                + Add First Gym
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {gyms.map((g) => (
                <div key={g.id} className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img 
                        src={g.image_url} 
                        alt={g.name} 
                        style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span className="badge-lime">★ {g.rating}</span>
                          <span className="badge-cyan">{g.city}</span>
                          <span className="badge-orange">{g.crowd_level} Crowd</span>
                        </div>
                        <h3 style={{ fontSize: '1.4rem' }}>{g.name}</h3>
                        <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{g.address} • {g.opening_hours} - {g.closing_hours}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button
                        onClick={() => {
                          setActiveGymForPlan(g);
                          setPlanToEdit(null);
                          setPlanModalOpen(true);
                        }}
                        className="btn-lime"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                      >
                        <Plus size={14} />
                        <span>Add Membership Plan</span>
                      </button>
                      <button
                        onClick={() => {
                          setGymToEdit(g);
                          setGymModalOpen(true);
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                      >
                        <Edit3 size={14} />
                        <span>Edit Info</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGym(g.id)}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 0.85rem', color: '#FF6B6B', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Plans for this gym */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#CBD5E1', marginBottom: '0.85rem' }}>Active Membership Passes:</h4>
                    {(!g.plans || g.plans.length === 0) ? (
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontStyle: 'italic' }}>
                        No customized plans added yet. Use "Add Membership Plan" above.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        {g.plans.map((p) => (
                          <div key={p.id} style={{
                            background: '#0D121A',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            padding: '1.25rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <h5 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{p.name}</h5>
                              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#B8FF00' }}>₹{p.price.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.8rem' }}>
                              Duration: {p.duration}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleDeletePlan(p.id)}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.78rem', cursor: 'pointer' }}
                              >
                                Delete Plan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Member Intelligence Panel (Table from Reference Image 2) */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Member Intelligence Panel</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Real-time enrollee records and subscription statuses</p>
            </div>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search member by name or plan..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="form-input-dark"
                style={{ paddingLeft: '38px', padding: '0.55rem 0.75rem 0.55rem 38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {filteredEnrollees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94A3B8', fontSize: '0.9rem' }}>
              No trainee enrollees found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>MEMBER</th>
                    <th style={{ padding: '0.75rem 1rem' }}>FACILITY</th>
                    <th style={{ padding: '0.75rem 1rem' }}>PLAN</th>
                    <th style={{ padding: '0.75rem 1rem' }}>START DATE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>EXPIRY DATE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollees.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#1E293B',
                          color: '#B8FF00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          {row.member_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#FFFFFF' }}>{row.member_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{row.member_email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#CBD5E1' }}>{row.gym_name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: '600', color: '#B8FF00' }}>{row.plan_name}</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>₹{row.plan_price.toLocaleString('en-IN')}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#94A3B8' }}>{row.start_date}</td>
                      <td style={{ padding: '1rem', color: '#FFFFFF', fontWeight: '600' }}>{row.expiry_date}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge-lime">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Gym Modal */}
        {gymModalOpen && (
          <AddGymModal
            gymToEdit={gymToEdit}
            onClose={() => {
              setGymModalOpen(false);
              setGymToEdit(null);
            }}
            onSuccess={() => fetchOwnerData()}
          />
        )}

        {/* Add Plan Modal */}
        {planModalOpen && activeGymForPlan && (
          <AddPlanModal
            gymId={activeGymForPlan.id}
            planToEdit={planToEdit}
            onClose={() => {
              setPlanModalOpen(false);
              setActiveGymForPlan(null);
              setPlanToEdit(null);
            }}
            onSuccess={() => fetchOwnerData()}
          />
        )}

        {/* Add / Edit Trainer Modal */}
        {trainerModalOpen && (
          <AddTrainerModal
            isOpen={trainerModalOpen}
            onClose={() => setTrainerModalOpen(false)}
            onSuccess={() => {
              fetchOwnerData();
              showToast('Trainer roster updated successfully!', 'success');
            }}
            ownerGyms={gyms}
          />
        )}
      </div>
    </div>
  );
};
