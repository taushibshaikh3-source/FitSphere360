import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Target, 
  Layers, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Search,
  BookOpen
} from 'lucide-react';

export const WorkoutsGuidePage = () => {
  const [activeTab, setActiveTab] = useState('workouts'); // 'workouts' or 'equipment'
  const [workouts, setWorkouts] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [workoutCategory, setWorkoutCategory] = useState('All');
  const [equipmentCategory, setEquipmentCategory] = useState('All');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/workouts').then(r => r.json()),
      fetch('/api/equipment').then(r => r.json())
    ])
      .then(([wData, eqData]) => {
        setWorkouts(wData.workouts || []);
        setEquipmentList(eqData.equipment || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkouts = workouts.filter(w => {
    if (workoutCategory === 'All') return true;
    return w.category.toLowerCase().includes(workoutCategory.toLowerCase());
  });

  const filteredEquipment = equipmentList.filter(eq => {
    if (equipmentCategory === 'All') return true;
    return eq.category.toLowerCase().includes(equipmentCategory.toLowerCase());
  });

  const toggleExpand = (id) => {
    setExpandedWorkoutId(expandedWorkoutId === id ? null : id);
  };

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>TRAINING INTELLIGENCE</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>
            Interactive Exercise & Equipment Guide
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Master biomechanics, explore hypertrophy routines, and understand commercial gym apparatus to maximize physical performance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.35rem',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => setActiveTab('workouts')}
              style={{
                background: activeTab === 'workouts' ? '#B8FF00' : 'transparent',
                color: activeTab === 'workouts' ? '#07090D' : '#CBD5E1',
                border: 'none',
                borderRadius: '30px',
                padding: '0.5rem 1.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Flame size={16} />
              <span>Workout Routines</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              style={{
                background: activeTab === 'equipment' ? '#B8FF00' : 'transparent',
                color: activeTab === 'equipment' ? '#07090D' : '#CBD5E1',
                border: 'none',
                borderRadius: '30px',
                padding: '0.5rem 1.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Dumbbell size={16} />
              <span>Equipment Directory</span>
            </button>
          </div>
        </div>

        {/* TAB 1: WORKOUT ROUTINES */}
        {activeTab === 'workouts' && (
          <div>
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
              {['All', 'Strength Training', 'Boxing', 'Yoga', 'Calisthenics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWorkoutCategory(cat)}
                  style={{
                    background: workoutCategory === cat ? '#B8FF00' : 'rgba(255, 255, 255, 0.05)',
                    color: workoutCategory === cat ? '#07090D' : '#CBD5E1',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.4rem 1.1rem',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Workouts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {filteredWorkouts.map((w) => {
                const isExpanded = expandedWorkoutId === w.id;
                const steps = Array.isArray(w.steps) ? w.steps : [];

                return (
                  <div 
                    key={w.id} 
                    className="glass-panel" 
                    style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge-lime">{w.category}</span>
                      <span className="badge-cyan">{w.difficulty}</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{w.title}</h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                      {w.description}
                    </p>

                    {/* Meta stats */}
                    <div style={{
                      display: 'flex',
                      gap: '1.5rem',
                      padding: '0.75rem 0',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      marginBottom: '1rem',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF' }}>
                        <Clock size={15} color="#B8FF00" />
                        <span>{w.duration_mins} mins</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF' }}>
                        <Flame size={15} color="#FF6B35" />
                        <span>~{w.calories_burn} kcal</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94A3B8' }}>
                        <Target size={15} color="#00F0FF" />
                        <span>{w.target_muscles}</span>
                      </div>
                    </div>

                    {/* Step-by-Step Dropdown */}
                    <button
                      onClick={() => toggleExpand(w.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#B8FF00',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0'
                      }}
                    >
                      <span>{isExpanded ? 'Hide Steps & Protocol' : 'View Protocol Steps'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isExpanded && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        background: '#0D121A',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          Structured Execution Protocol:
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {steps.map((step, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                              <span style={{ color: '#B8FF00', fontWeight: '800' }}>0{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: EQUIPMENT DIRECTORY */}
        {activeTab === 'equipment' && (
          <div>
            {/* Category Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
              {['All', 'Free Weights', 'Machines', 'Cardio', 'Pilates', 'Combat'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEquipmentCategory(cat)}
                  style={{
                    background: equipmentCategory === cat ? '#B8FF00' : 'rgba(255, 255, 255, 0.05)',
                    color: equipmentCategory === cat ? '#07090D' : '#CBD5E1',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.4rem 1.1rem',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Equipment Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
              {filteredEquipment.map((eq) => (
                <div key={eq.id} className="glass-panel hover-card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={eq.image_url} 
                      alt={eq.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(7, 9, 13, 0.85)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '14px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#10B981'
                    }}>
                      Condition: {eq.condition}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge-cyan">{eq.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{eq.quantity} Units Onsite</span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>{eq.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#B8FF00', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Primary Muscle: {eq.target_muscle}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.5' }}>
                      Calibrated equipment standard conforming to international biomechanical safety guidelines.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
