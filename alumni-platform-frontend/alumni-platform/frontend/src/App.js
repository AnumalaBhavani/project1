import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/shared/UIComponents';
import './index.css';

// Pages
import LoginPage from './pages/LoginPage';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobsPage from './pages/JobsPage';
import MentorshipPage from './pages/MentorshipPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ALUMNI') return <Navigate to="/alumni/dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Alumni Routes */}
            <Route path="/alumni/dashboard" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniDashboard /></ProtectedRoute>
            } />
            <Route path="/alumni/profile" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniProfile /></ProtectedRoute>
            } />
            <Route path="/alumni/directory" element={
              <ProtectedRoute roles={['ALUMNI']}><AlumniDirectory /></ProtectedRoute>
            } />
            <Route path="/alumni/jobs" element={
              <ProtectedRoute roles={['ALUMNI']}><JobsPage /></ProtectedRoute>
            } />
            <Route path="/alumni/mentorship" element={
              <ProtectedRoute roles={['ALUMNI']}><MentorshipPage /></ProtectedRoute>
            } />
            <Route path="/alumni/contributions" element={
              <ProtectedRoute roles={['ALUMNI']}>
                <ContributionsPage />
              </ProtectedRoute>
            } />
            <Route path="/alumni/notifications" element={
              <ProtectedRoute roles={['ALUMNI']}><NotificationsPage /></ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/directory" element={
              <ProtectedRoute roles={['STUDENT']}><AlumniDirectory /></ProtectedRoute>
            } />
            <Route path="/student/jobs" element={
              <ProtectedRoute roles={['STUDENT']}><JobsPage /></ProtectedRoute>
            } />
            <Route path="/student/mentorship" element={
              <ProtectedRoute roles={['STUDENT']}><MentorshipPage /></ProtectedRoute>
            } />
            <Route path="/student/applications" element={
              <ProtectedRoute roles={['STUDENT']}><ApplicationsPage /></ProtectedRoute>
            } />
            <Route path="/student/notifications" element={
              <ProtectedRoute roles={['STUDENT']}><NotificationsPage /></ProtectedRoute>
            } />
            <Route path="/student/events" element={
              <ProtectedRoute roles={['STUDENT']}><EventsPage /></ProtectedRoute>
            } />
            <Route path="/student/materials" element={
              <ProtectedRoute roles={['STUDENT']}><MaterialsPage /></ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/alumni" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// ---- Inline simple pages ----
import Layout from './components/shared/Layout';
import { alumniAPI, jobAPI } from './services/api';
import { StatusBadge, MatchBadge, EmptyState, Spinner } from './components/shared/UIComponents';
import { useState, useEffect } from 'react';

function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    alumniAPI.notifications().then(r => { setNotifs(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const markRead = () => alumniAPI.markAllRead().then(() => setNotifs(n => n.map(x => ({...x, read:true}))));
  return (
    <Layout title="Notifications">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:18 }}>Notifications</h2>
        <button className="btn btn-outline btn-sm" onClick={markRead}>Mark all read</button>
      </div>
      {loading ? <Spinner /> : notifs.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${n.read?'':'unread'}`}>
              <div className="notif-title">{n.title}</div>
              <div className="notif-msg">{n.message}</div>
              <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function ContributionsPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    alumniAPI.contributions().then(r => { setContributions(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const ICONS = { JOB_POSTED:'💼', MENTORSHIP_COMPLETED:'🤝', EVENT_ATTENDED:'🎉', MATERIAL_UPLOADED:'📚', EVENT_ORGANIZED:'🎪' };
  return (
    <Layout title="Contribution History">
      {loading ? <Spinner /> : contributions.length === 0 ? (
        <EmptyState icon="🏆" title="No contributions yet" message="Start contributing to earn points!" />
      ) : (
        <div className="card">
          {contributions.map(c => (
            <div key={c.id} style={{ display:'flex', gap:14, padding:'14px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
              <div style={{ width:44,height:44,borderRadius:'50%',background:'var(--amber-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                {ICONS[c.contributionType] || '⭐'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{c.description}</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
                  {c.contributionType.replace(/_/g,' ')} · {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontWeight:700, color:'var(--amber-dark)', fontSize:15 }}>+{c.points} pts</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { jobAPI.myApplications().then(r => { setApps(r.data); setLoading(false); }); }, []);
  return (
    <Layout title="My Applications">
      {loading ? <Spinner /> : apps.length === 0 ? (
        <EmptyState icon="📋" title="No applications" message="Apply to jobs in the Job Portal." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {apps.map(a => (
            <div key={a.id} className="card" style={{ padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>{a.job?.jobTitle}</div>
                  <div style={{ color:'var(--teal)', fontWeight:600, marginBottom:6 }}>{a.job?.companyName}</div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>Applied {new Date(a.appliedAt).toLocaleDateString()}</div>
                  {a.matchedSkills && (
                    <div style={{ fontSize:12, marginTop:6, color:'var(--muted)' }}>Matched skills: {a.matchedSkills}</div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <StatusBadge status={a.status} />
                  <div style={{ marginTop:6 }}>
                    <MatchBadge score={a.matchScore} category={a.matchCategory} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function EventsPage() {
  return (
    <Layout title="Events">
      <EmptyState icon="🎉" title="Events Coming Soon" message="Alumni-organized events will appear here." />
    </Layout>
  );
}

function MaterialsPage() {
  return (
    <Layout title="Study Materials">
      <EmptyState icon="📚" title="Materials Coming Soon" message="Study materials uploaded by alumni will appear here." />
    </Layout>
  );
}
