import React, { useState } from 'react';
import { 
  Calculator, 
  Activity, 
  Sparkles, 
  Flame, 
  Heart, 
  ArrowRight,
  Info
} from 'lucide-react';

export const BMICalculatorPage = ({ setCurrentView }) => {
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  
  // Metric
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);

  // Imperial
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(9);
  const [weightLbs, setWeightLbs] = useState(160);

  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateBMI = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalHeightCm = heightCm;
    let finalWeightKg = weightKg;

    if (unitSystem === 'imperial') {
      const totalInches = (heightFeet * 12) + Number(heightInches);
      finalHeightCm = Math.round(totalInches * 2.54);
      finalWeightKg = Math.round(weightLbs * 0.453592);
    }

    try {
      const res = await fetch('/api/bmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: finalHeightCm,
          weight: finalWeightKg,
          gender: gender
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div className="container-custom" style={{ maxWidth: '940px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge-lime" style={{ marginBottom: '0.5rem' }}>HEALTH & BODY COMPOSITION</span>
          <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>
            Interactive BMI & Fitness Calculator
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Calculate your Body Mass Index (BMI), understand your metabolic profile, and receive personalized training & gym suggestions.
          </p>
        </div>

        {/* Core Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Unit Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.35rem',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '0.25rem'
            }}>
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                style={{
                  background: unitSystem === 'metric' ? '#B8FF00' : 'transparent',
                  color: unitSystem === 'metric' ? '#07090D' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.45rem 1.25rem',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Metric (cm / kg)
              </button>
              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                style={{
                  background: unitSystem === 'imperial' ? '#B8FF00' : 'transparent',
                  color: unitSystem === 'imperial' ? '#07090D' : '#CBD5E1',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.45rem 1.25rem',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Imperial (ft-in / lbs)
              </button>
            </div>
          </div>

          <form onSubmit={calculateBMI}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-input-dark"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Non-binary / Other</option>
                </select>
              </div>

              {/* Height */}
              {unitSystem === 'metric' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Height: <span style={{ color: '#B8FF00' }}>{heightCm} cm</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="form-input-dark"
                    required
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Feet
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="form-input-dark"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                      Inches
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="form-input-dark"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Weight */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Weight: <span style={{ color: '#B8FF00' }}>{unitSystem === 'metric' ? `${weightKg} kg` : `${weightLbs} lbs`}</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={unitSystem === 'metric' ? weightKg : weightLbs}
                  onChange={(e) => unitSystem === 'metric' ? setWeightKg(Number(e.target.value)) : setWeightLbs(Number(e.target.value))}
                  className="form-input-dark"
                  required
                />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-lime"
                style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}
              >
                <Calculator size={18} />
                <span>{loading ? 'Analyzing Body Composition...' : 'Calculate My BMI'}</span>
              </button>
            </div>
          </form>

          {/* BMI Result Showcase */}
          {result && (
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              animation: 'fadeIn 0.3s ease'
            }}>
              {/* Score Display */}
              <div style={{
                background: '#0D121A',
                border: `2px solid ${result.color}`,
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
                  Calculated Body Mass Index
                </div>
                <div style={{ fontSize: '3.6rem', fontWeight: '900', color: result.color, margin: '0.3rem 0' }}>
                  {result.bmi}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  padding: '0.35rem 1.25rem',
                  borderRadius: '30px',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}>
                  Category: {result.category}
                </div>
                <div style={{ marginTop: '1rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                  Healthy Weight Range for your height: <strong style={{ color: '#B8FF00' }}>{result.ideal_range}</strong>
                </div>
              </div>

              {/* Insights Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Advice Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B8FF00', fontWeight: '700', marginBottom: '0.75rem' }}>
                    <Info size={18} />
                    <span>Clinical Guidance</span>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {result.advice}
                  </p>
                </div>

                {/* Target Training Style */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00F0FF', fontWeight: '700', marginBottom: '0.75rem' }}>
                    <Activity size={18} />
                    <span>Recommended Training Discipline</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
                    {result.workout_type}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    Estimated Daily Maintenance Intake: <strong style={{ color: '#00F0FF' }}>{result.target_calories} kcal</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons to find matching gyms */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCurrentView('recommendations')}
                  className="btn-lime"
                  style={{ padding: '0.75rem 1.8rem' }}
                >
                  <Sparkles size={16} />
                  <span>Get AI Gym Match for {result.category}</span>
                </button>
                <button
                  onClick={() => setCurrentView('workouts')}
                  className="btn-secondary"
                  style={{ padding: '0.75rem 1.8rem' }}
                >
                  <span>Explore Recommended Workouts</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Educational reference table */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Standard BMI Classifications (WHO Guidelines)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ background: '#0D121A', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #00F0FF' }}>
              <strong style={{ color: '#00F0FF' }}>&lt; 18.5</strong>
              <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Underweight</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Focus on surplus nutrition & strength.</div>
            </div>
            <div style={{ background: '#0D121A', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #B8FF00' }}>
              <strong style={{ color: '#B8FF00' }}>18.5 – 24.9</strong>
              <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Normal Healthy Weight</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Optimal metabolic & muscular profile.</div>
            </div>
            <div style={{ background: '#0D121A', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #FFAA00' }}>
              <strong style={{ color: '#FFAA00' }}>25.0 – 29.9</strong>
              <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Overweight</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Moderate deficit & circuit cardio.</div>
            </div>
            <div style={{ background: '#0D121A', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #FF4560' }}>
              <strong style={{ color: '#FF4560' }}>30.0+</strong>
              <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Obese Class</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem' }}>Joint-friendly cardio & guided training.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
