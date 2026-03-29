import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { CompletenessIndicator, StatusBadge, Avatar, Spinner, EmptyState } from '../../components/shared/UIComponents';
import { alumniAPI, jobAPI, mentorshipAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MessageSquare, Award, Bell, TrendingUp, Clock } from 'lucide-react';

export default function AlumniDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, j, m, c] = await Promise.all([
          alumniAPI.myProfile(),
          jobAPI.myJobs(),
          mentorshipAPI.alumniRequests(),
          alumniAPI.contributions(),
        ]);
        setProfile(p.data);
        setRecentJobs(j.data.slice(0, 3));
        setMentorshipRequests(m.data.filter(r => r.status === 'PENDING').slice(0, 4));
        setContributions(c.data.slice(0, 5));

        // Show verification banner if > 6 months
        if (p.data.lastVerifiedAt) {
          const last = new Date(p.data.lastVerifiedAt);
          const diff = (Date.now() - last) / (1000 * 60 * 60 * 24 * 30);
          if (diff > 6) setShowVerifyBanner(true);
        } else {
          setShowVerifyBanner(true);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleVerify = async () => {
    await alumniAPI.verifyProfile();
    setShowVerifyBanner(false);
  };

  if (loading) return <Layout title="Dashboard"><Spinner /></Layout>;

  const pending = mentorshipRequests.length;
  const totalPoints = profile?.totalPoints || 0;

  return (
    <Layout title="Dashboard">
      {/* Verification Banner */}
      {showVerifyBanner && (
        <div style={{
          background: 'var(--amber-soft)', border: '1px solid var(--amber)',
          borderRadius: 'var(--radius-lg)', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} color="var(--amber-dark)" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              It's been a while! Please verify your profile details are still up to date.
            </span>
          </div>
          <button className="btn btn-amber btn-sm" onClick={handleVerify}>
            Verify Now
          </button>
        </div>
      )}

      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 4 }}>
          Good to see you, {profile?.firstName}! 👋
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Here's what's happening with your alumni network.
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon="💼" label="Jobs Posted" value={recentJobs.length}
          color="var(--teal-soft)" iconColor="var(--teal)" />
        <StatCard icon="🤝" label="Pending Requests" value={pending}
          color="var(--amber-soft)" iconColor="var(--amber-dark)" />
        <StatCard icon="⭐" label="Total Points" value={totalPoints}
          color="var(--purple-soft)" iconColor="var(--purple)" />
        <StatCard icon="📊" label="Profile Complete" value={`${profile?.profileCompleteness || 0}%`}
          color="var(--green-soft)" iconColor="var(--green)" />
      </div>

      {/* Profile Completeness */}
      {profile?.profileCompleteness < 100 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Profile Completeness</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/alumni/profile')}>
              Update Profile
            </button>
          </div>
          <CompletenessIndicator
            value={profile?.profileCompleteness || 0}
            suggestions={profile?.suggestions}
          />
        </div>
      )}

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Mentorship Requests */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mentorship Requests</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alumni/mentorship')}>
              View All
            </button>
          </div>
          {mentorshipRequests.length === 0 ? (
            <EmptyState icon="🤝" title="No pending requests" message="Students will reach out when they need guidance." />
          ) : (
            mentorshipRequests.map(r => (
              <MentorshipRequestItem key={r.id} request={r}
                onNavigate={() => navigate('/alumni/mentorship')} />
            ))
          )}
        </div>

        {/* Recent Contributions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Contributions</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alumni/contributions')}>
              View All
            </button>
          </div>
          {contributions.length === 0 ? (
            <EmptyState icon="🏆" title="No contributions yet" message="Start posting jobs or completing mentorship sessions." />
          ) : (
            contributions.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--amber-soft)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>
                  {c.contributionType === 'JOB_POSTED' ? '💼'
                    : c.contributionType === 'MENTORSHIP_COMPLETED' ? '🤝' : '🎉'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>
                    {c.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-dark)' }}>
                  +{c.points}pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Jobs */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">My Job Postings</span>
          <button className="btn btn-amber btn-sm" onClick={() => navigate('/alumni/jobs')}>
            + Post Job
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <EmptyState icon="💼" title="No jobs posted yet"
            message="Post job opportunities for students."
            action={<button className="btn btn-primary" onClick={() => navigate('/alumni/jobs')}>Post a Job</button>} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th><th>Company</th><th>Type</th><th>Status</th><th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(j => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.jobTitle}</td>
                    <td>{j.companyName}</td>
                    <td><span className="badge badge-blue">{j.jobType}</span></td>
                    <td><StatusBadge status={j.status} /></td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, color, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function MentorshipRequestItem({ request, onNavigate }) {
  const name = `${request.student?.firstName || ''} ${request.student?.lastName || ''}`;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer'
    }} onClick={onNavigate}>
      <Avatar name={name} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {request.goal || request.message}
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>
  );
}
