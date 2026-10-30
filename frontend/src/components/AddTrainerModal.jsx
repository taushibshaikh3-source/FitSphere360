import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadTrainerImage } from '../lib/supabaseClient';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  User, 
  Mail, 
  Phone, 
  Award, 
  Briefcase, 
  DollarSign, 
  Building2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Save, 
  Sparkles 
} from 'lucide-react';

export const AddTrainerModal = ({ isOpen, onClose, onSuccess, trainerToEdit = null, ownerGyms = [] }) => {
  const { showToast } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [specialization, setSpecialization] = useState('Strength & Conditioning');
  const [qualifications, setQualifications] = useState('');
  const [bio, setBio] = useState('');
  const [salary, setSalary] = useState(45000);
  const [hourlyRate, setHourlyRate] = useState(1200);
  const [gymId, setGymId] = useState('');
  const [status, setStatus] = useState('active');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM']);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slotsList = [
    '06:00 AM - 10:00 AM',
    '07:00 AM - 11:00 AM',
    '10:00 AM - 02:00 PM',
    '02:00 PM - 06:00 PM',
    '04:00 PM - 08:00 PM',
    '06:00 PM - 10:00 PM'
  ];

  const specializationOptions = [
    'Strength & Conditioning',
    'CrossFit & High Intensity',
    'Pilates & Core Dynamics',
    'Olympic Weightlifting',
    'Boxing & Combat Fitness',
    'Endurance & Marathon Prep',
    'Functional Hypertrophy',
    'Post-Injury Rehab & Mobility',
    'Yoga & Mind-Body Flexibility'
  ];

  useEffect(() => {
    if (trainerToEdit) {
      setFullName(trainerToEdit.full_name || trainerToEdit.name || '');
      setEmail(trainerToEdit.email || '');
      setPhone(trainerToEdit.phone || '');
      setProfileImage(trainerToEdit.profile_image || trainerToEdit.avatar_url || '');
      setImagePreview(trainerToEdit.profile_image || trainerToEdit.avatar_url || '');
      setGender(trainerToEdit.gender || 'Male');
      setAge(trainerToEdit.age || '');
      setExperienceYears(trainerToEdit.experience_years || 5);
      setSpecialization(trainerToEdit.specialization || 'Strength & Conditioning');
      setQualifications(trainerToEdit.qualifications || '');
      setBio(trainerToEdit.bio || '');
      setSalary(trainerToEdit.salary || 45000);
      setHourlyRate(trainerToEdit.hourly_rate || 1200);
      setGymId(trainerToEdit.gym_id || (ownerGyms.length > 0 ? ownerGyms[0].id : ''));
      setStatus(trainerToEdit.status || 'active');

      const days = Array.isArray(trainerToEdit.available_days)
        ? trainerToEdit.available_days
        : typeof trainerToEdit.available_days === 'string'
        ? JSON.parse(trainerToEdit.available_days || '[]')
        : ['Monday', 'Wednesday', 'Friday'];
      setSelectedDays(days.length ? days : ['Monday', 'Wednesday', 'Friday']);

      const slots = Array.isArray(trainerToEdit.available_time_slots)
        ? trainerToEdit.available_time_slots
        : typeof trainerToEdit.available_time_slots === 'string'
        ? JSON.parse(trainerToEdit.available_time_slots || '[]')
        : ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM'];
      setSelectedTimeSlots(slots.length ? slots : ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM']);
    } else {
      // Reset defaults for new trainer
      setFullName('');
      setEmail('');
      setPhone('');
      const defaultImg = 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80';
      setProfileImage(defaultImg);
      setImagePreview(defaultImg);
      setGender('Male');
      setAge(28);
      setExperienceYears(5);
      setSpecialization('Strength & Conditioning');
      setQualifications('CSCS, NASM-CPT Certified Master Coach');
      setBio('Dedicated coach specializing in progressive overload, biomechanics, and sustainable athletic longevity.');
      setSalary(45000);
      setHourlyRate(1200);
      setGymId(ownerGyms.length > 0 ? ownerGyms[0].id : '');
      setStatus('active');
      setSelectedDays(['Monday', 'Wednesday', 'Friday']);
      setSelectedTimeSlots(['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM']);
    }
    setErrorMsg('');
  }, [trainerToEdit, isOpen, ownerGyms]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot) => {
    setSelectedTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const publicUrl = await uploadTrainerImage(file);
      if (publicUrl) {
        setProfileImage(publicUrl);
        setImagePreview(publicUrl);
        showToast('Profile picture uploaded successfully to Supabase Storage!', 'success');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Image upload failed. You can paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!fullName.trim()) {
      setErrorMsg('Trainer Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid Trainer Email Address is required.');
      return;
    }
    if (!specialization.trim()) {
      setErrorMsg('Specialization is required.');
      return;
    }
    if (!gymId) {
      setErrorMsg('Please assign this trainer to one of your gym facilities.');
      return;
    }
    if (selectedDays.length === 0) {
      setErrorMsg('Please select at least one available day.');
      return;
    }
    if (selectedTimeSlots.length === 0) {
      setErrorMsg('Please select at least one available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        profile_image: profileImage.trim(),
        avatar_url: profileImage.trim(),
        gender,
        age: age ? parseInt(age) : null,
        experience_years: parseInt(experienceYears) || 1,
        experience: `${experienceYears} years`,
        specialization: specialization.trim(),
        qualifications: qualifications.trim(),
        bio: bio.trim(),
        salary: parseFloat(salary) || 0,
        hourly_rate: parseFloat(hourlyRate) || 1200,
        gym_id: parseInt(gymId),
        status,
        available_days: selectedDays,
        available_time_slots: selectedTimeSlots
      };

      const url = trainerToEdit ? `/api/trainers/${trainerToEdit.id}` : '/api/trainers';
      const method = trainerToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save trainer record');
      }

      showToast(
        trainerToEdit 
          ? `Trainer ${fullName} updated successfully!` 
          : `Trainer ${fullName} successfully added and synced to Supabase!`,
        'success'
      );
      onSuccess && onSuccess(data.trainer);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.5rem',
          position: 'relative',
          borderRadius: '20px',
          border: '1px solid rgba(184, 255, 0, 0.25)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-lime">{trainerToEdit ? 'EDIT TRAINER PROFILE' : 'ADD NEW CERTIFIED TRAINER'}</span>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>• Owner Staff Roster</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', margin: 0 }}>
              {trainerToEdit ? `Edit Coach: ${trainerToEdit.name}` : 'Register Certified Fitness Coach'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Add trainer credentials, assign facility, configure coaching schedule, and manage private salary.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#F87171',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SECTION 1: Personal & Contact Information */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#B8FF00', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} />
              <span>1. Coach Identity & Contact</span>
            </h3>

            {/* Profile Picture Upload & Preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #B8FF00', background: '#07090D', flexShrink: 0 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                    <ImageIcon size={30} />
                  </div>
                )}
                {uploadingImage && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="pulse-dot" style={{ width: '12px', height: '12px' }}></div>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Profile Picture (Supabase Storage or Web URL)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Upload size={14} />
                    <span>Upload Image File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>or paste URL below:</span>
                </div>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or custom CDN image URL"
                  value={profileImage}
                  onChange={(e) => {
                    setProfileImage(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="form-input-dark"
                  style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Grid for Name, Email, Phone, Gender, Age */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Trainer Full Name <span style={{ color: '#B8FF00' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input-dark"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Email Address <span style={{ color: '#B8FF00' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="alex.coach@fitsphere360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-dark"
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  Used for account linking if trainer registers later.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input-dark"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Gender (Optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-input-dark"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  placeholder="e.g. 29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-input-dark"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Qualifications & Experience */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#00F0FF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} />
              <span>2. Expertise, Credentials & Biography</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Specialization Focus <span style={{ color: '#00F0FF' }}>*</span>
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="form-input-dark"
                >
                  {specializationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Experience (Years) <span style={{ color: '#00F0FF' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="form-input-dark"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Qualifications / Certifications
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSCS, NASM, USAW Level 2, CPR/AED"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="form-input-dark"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                Short Professional Biography
              </label>
              <textarea
                rows="3"
                placeholder="Highlight training philosophy, athletic background, client success stories..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-input-dark"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* SECTION 3: Facility Assignment & Owner Compensation (CONFIDENTIAL) */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#FF7A00', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} />
              <span>3. Gym Assignment & Compensation (Private to Owner)</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Assigned Gym Facility <span style={{ color: '#FF7A00' }}>*</span>
                </label>
                <select
                  value={gymId}
                  onChange={(e) => setGymId(e.target.value)}
                  className="form-input-dark"
                  required
                >
                  <option value="">-- Select Managed Gym --</option>
                  {ownerGyms.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  <span>Monthly Base Salary (₹)</span>
                  <span style={{ fontSize: '0.7rem', color: '#FF7A00', fontWeight: '700' }}>🔒 CONFIDENTIAL</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#B8FF00', fontWeight: '800' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="45000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="form-input-dark"
                    style={{ paddingLeft: '28px' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  Hidden from trainees & public views via Supabase RLS.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Session Hourly Rate (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00F0FF', fontWeight: '800' }}>₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    placeholder="1200"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="form-input-dark"
                    style={{ paddingLeft: '28px' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  Client 1-on-1 booking price displayed to athletes.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Trainer Roster Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-input-dark"
                >
                  <option value="active">Active (Discoverable & Bookable)</option>
                  <option value="inactive">Inactive (Suspended / On Leave)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Availability Schedule */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#A855F7', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} />
              <span>4. Weekly Availability & Working Time Slots</span>
            </h3>

            {/* Days Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.5rem', fontWeight: '600' }}>
                Available Days:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {daysList.map(day => {
                  const selected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      style={{
                        background: selected ? 'rgba(184, 255, 0, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: selected ? '1px solid #B8FF00' : '1px solid rgba(255,255,255,0.08)',
                        color: selected ? '#B8FF00' : '#94A3B8',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: selected ? '700' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {selected ? `✓ ${day}` : day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.5rem', fontWeight: '600' }}>
                Available Shift Slots:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                {slotsList.map(slot => {
                  const selected = selectedTimeSlots.includes(slot);
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      style={{
                        background: selected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: selected ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.06)',
                        color: selected ? '#00F0FF' : '#94A3B8',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: selected ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{slot}</span>
                      <span>{selected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn-lime"
              style={{ padding: '0.75rem 1.8rem', fontSize: '0.9rem', gap: '0.5rem' }}
            >
              {submitting ? (
                <>
                  <div className="pulse-dot" style={{ width: '10px', height: '10px' }}></div>
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{trainerToEdit ? 'Save Changes' : 'Save Trainer'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
