import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, registerAlumni, registerStudent } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register-alumni' | 'register-student'
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else if (mode === 'register-alumni') {
        user = await registerAlumni(form);
      } else {
        user = await registerStudent(form);
      }
      if (user.role === 'ALUMNI') navigate('/alumni/dashboard');
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <div style={{
              width:44, height:44, borderRadius:'50%',
              background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center'
            }}>
              <GraduationCap size={24} color="var(--amber)" />
            </div>
            <h1>AlumniConnect</h1>
          </div>
          <p>Your college alumni & career network</p>
        </div>

        {/* Mode tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode==='login'?'active':''}`} onClick={() => setMode('login')}>Login</button>
          <button className={`auth-tab ${mode==='register-alumni'?'active':''}`} onClick={() => setMode('register-alumni')}>Alumni</button>
          <button className={`auth-tab ${mode==='register-student'?'active':''}`} onClick={() => setMode('register-student')}>Student</button>
        </div>

        {error && (
          <div style={{ background:'var(--red-soft)', color:'var(--red)', padding:'10px 14px',
            borderRadius:'var(--radius)', fontSize:13, marginBottom:16 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {mode !== 'login' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" required placeholder="First name"
                  onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" required placeholder="Last name"
                  onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="you@college.edu"
              onChange={e => set('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'}
                required placeholder="Minimum 8 characters"
                style={{ paddingRight: 40 }}
                onChange={e => set('password', e.target.value)} />
              <button type="button"
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'var(--muted)' }}
                onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {mode === 'register-alumni' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input className="form-input" type="number" placeholder="e.g. 2020"
                    onChange={e => set('graduationYear', parseInt(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input className="form-input" placeholder="e.g. Computer Science"
                    onChange={e => set('branch', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <select className="form-select" onChange={e => set('degree', e.target.value)}>
                  <option value="">Select degree</option>
                  <option>B.Tech</option><option>M.Tech</option>
                  <option>MBA</option><option>MCA</option><option>BCA</option>
                </select>
              </div>
            </>
          )}

          {mode === 'register-student' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" placeholder="e.g. CS2021001"
                    onChange={e => set('rollNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input className="form-input" placeholder="e.g. Computer Science"
                    onChange={e => set('branch', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Enrollment Year</label>
                  <input className="form-input" type="number" placeholder="2022"
                    onChange={e => set('enrollmentYear', parseInt(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Graduation</label>
                  <input className="form-input" type="number" placeholder="2026"
                    onChange={e => set('expectedGraduationYear', parseInt(e.target.value))} />
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-lg" type="submit"
            style={{ width:'100%', marginTop:8 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop:24, padding:14, background:'var(--bg)', borderRadius:'var(--radius)',
          fontSize:12, color:'var(--muted)' }}>
          <strong style={{ color:'var(--navy)' }}>Demo Credentials:</strong><br/>
          Alumni: rahul.sharma@alumni.edu / Alumni@123<br/>
          Student: aman.kumar@student.edu / Student@123<br/>
          Admin: admin@alumni.edu / Admin@123
        </div>
      </div>
    </div>
  );
}
