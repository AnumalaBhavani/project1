import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { StatusBadge, Avatar, Spinner, EmptyState } from '../../components/shared/UIComponents';
import { jobAPI, mentorshipAPI, alumniAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [apps, mentor, jobs] = await Promise.all([
          jobAPI.myApplications(),
          mentorshipAPI.studentRequests(),
          jobAPI.list({}),
        ]);
        setApplications(apps.data.slice(0, 5));
        setMentorRequests(mentor.data.slice(0, 3));
        setRecentJobs(jobs.data.slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Layout title="Dashboard"><Spinner /></Layout>;

  return (
    <Layout title="Student Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back! 🎓</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Explore opportunities and connect with alumni.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card" style={{ cursor:'pointer' }} onClick={() => navigate('/student/applications')}>
          <div className="stat-icon" style={{ background:'var(--teal-soft)' }}><Briefcase size={22} color="var(--teal)" /></div>
          <div className="stat-value">{applications.length}</div>
          <div className="stat-label">Applications</div>
        </div>
        <div className="stat-card" style={{ cursor:'pointer' }} onClick={() => navigate('/student/mentorship')}>
          <div className="stat-icon" style={{ background:'var(--amber-soft)' }}><MessageSquare size={22} color="var(--amber-dark)" /></div>
          <div className="stat-value">{mentorRequests.length}</div>
          <div className="stat-label">Mentor Requests</div>
        </div>
        <div className="stat-card" style={{ cursor:'pointer' }} onClick={() => navigate('/student/jobs')}>
          <div className="stat-icon" style={{ background:'var(--green-soft)' }}><TrendingUp size={22} color="var(--green)" /></div>
          <div className="stat-value">{recentJobs.length}</div>
          <div className="stat-label">Jobs Available</div>
        </div>
        <div className="stat-card" style={{ cursor:'pointer' }} onClick={() => navigate('/student/directory')}>
          <div className="stat-icon" style={{ background:'var(--purple-soft)' }}><Users size={22} color="var(--purple)" /></div>
          <div className="stat-value">Connect</div>
          <div className="stat-label">Alumni Network</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* My Applications */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Applications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/applications')}>View All</button>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon="📋" title="No applications" message="Apply to jobs to track your progress here." />
          ) : applications.map(a => (
            <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{a.job?.jobTitle}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{a.job?.companyName}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                <StatusBadge status={a.status} />
                <span style={{ fontSize:11, color: a.matchCategory==='HIGH'?'var(--green)':a.matchCategory==='MODERATE'?'var(--amber-dark)':'var(--red)', fontWeight:600 }}>
                  {Math.round(a.matchScore)}% match
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mentorship Requests */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mentorship Requests</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/mentorship')}>View All</button>
          </div>
          {mentorRequests.length === 0 ? (
            <EmptyState icon="🤝" title="No requests sent" message="Find alumni and request mentorship." />
          ) : mentorRequests.map(r => (
            <div key={r.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <Avatar name={`${r.alumni?.firstName} ${r.alumni?.lastName}`} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{r.alumni?.firstName} {r.alumni?.lastName}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{r.goal}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">Latest Job Opportunities</span>
          <button className="btn btn-amber btn-sm" onClick={() => navigate('/student/jobs')}>Browse All Jobs</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
          {recentJobs.map(j => (
            <div key={j.id} style={{
              border:'1px solid var(--border)', borderRadius:'var(--radius)',
              padding:14, cursor:'pointer', transition:'box-shadow 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
            onClick={() => navigate('/student/jobs')}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--navy)', marginBottom:2 }}>{j.jobTitle}</div>
              <div style={{ fontSize:13, color:'var(--teal)', fontWeight:600, marginBottom:6 }}>{j.companyName}</div>
              <div style={{ fontSize:12, color:'var(--muted)' }}>{j.location} · {j.jobType?.replace('_',' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
