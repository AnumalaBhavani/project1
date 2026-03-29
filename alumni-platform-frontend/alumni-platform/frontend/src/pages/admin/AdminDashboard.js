import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { StatusBadge, Avatar, Spinner, EmptyState, showToast } from '../../components/shared/UIComponents';
import { adminAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Briefcase, MessageSquare, GraduationCap, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const COLORS = ['#0f1e3c', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [incompleteProfiles, setIncompleteProfiles] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, pa, pj, ip] = await Promise.all([
        adminAPI.dashboard(),
        adminAPI.pendingAlumni(),
        adminAPI.pendingJobs(),
        adminAPI.incompleteProfiles(70),
      ]);
      setStats(s.data);
      setPendingAlumni(pa.data);
      setPendingJobs(pj.data);
      setIncompleteProfiles(ip.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approveAlumni = async (userId) => {
    try {
      await adminAPI.approveAlumni(userId);
      showToast('Alumni approved!', 'success');
      load();
    } catch (e) { showToast('Failed to approve', 'error'); }
  };

  const moderateJob = async (jobId, action) => {
    try {
      await adminAPI.moderateJob(jobId, action);
      showToast(`Job ${action.toLowerCase()}d!`, 'success');
      load();
    } catch (e) { showToast('Failed to update job', 'error'); }
  };

  if (loading) return <Layout title="Admin Dashboard"><Spinner /></Layout>;

  const pieData = [
    { name: 'Active Alumni', value: stats?.activeAlumni || 0 },
    { name: 'Students', value: stats?.totalStudents || 0 },
    { name: 'Pending Alumni', value: stats?.pendingApprovals || 0 },
  ];

  const barData = [
    { name: 'Total Alumni', value: stats?.totalAlumni || 0 },
    { name: 'Active Alumni', value: stats?.activeAlumni || 0 },
    { name: 'Total Jobs', value: stats?.totalJobs || 0 },
    { name: 'Approved Jobs', value: stats?.approvedJobs || 0 },
    { name: 'Mentorship', value: stats?.mentorshipSessions || 0 },
  ];

  return (
    <Layout title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard icon={<Users size={22} color="#0ea5e9" />} label="Total Alumni"
          value={stats?.totalAlumni} bg="var(--teal-soft)" />
        <StatCard icon={<CheckCircle size={22} color="#10b981" />} label="Active Alumni"
          value={stats?.activeAlumni} bg="var(--green-soft)" />
        <StatCard icon={<Briefcase size={22} color="#f59e0b" />} label="Jobs Posted"
          value={stats?.totalJobs} bg="var(--amber-soft)" />
        <StatCard icon={<MessageSquare size={22} color="#8b5cf6" />} label="Mentorship Sessions"
          value={stats?.mentorshipSessions} bg="var(--purple-soft)" />
        <StatCard icon={<AlertCircle size={22} color="#ef4444" />} label="Pending Approvals"
          value={stats?.pendingApprovals} bg="var(--red-soft)" />
        <StatCard icon={<TrendingUp size={22} color="#0f1e3c" />} label="Avg. Completeness"
          value={`${Math.round(stats?.averageCompleteness || 0)}%`} bg="var(--bg)" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview','pending-alumni','pending-jobs','profiles'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : t === 'pending-alumni' ? `Pending Alumni (${pendingAlumni.length})`
              : t === 'pending-jobs' ? `Pending Jobs (${pendingJobs.length})`
              : `Incomplete Profiles (${incompleteProfiles.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          {/* Bar Chart */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 20 }}>Platform Overview</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--navy)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 20 }}>User Distribution</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--muted)' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Profile Completeness Info */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Profile Completeness Monitor</div>
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, color:'var(--navy)' }}>
                  {Math.round(stats?.averageCompleteness || 0)}%
                </div>
                <div style={{ fontSize:13, color:'var(--muted)' }}>Average Completeness</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, color:'var(--red)' }}>
                  {incompleteProfiles.length}
                </div>
                <div style={{ fontSize:13, color:'var(--muted)' }}>Profiles Below 70%</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, fontWeight:700, color:'var(--amber-dark)' }}>
                  {pendingAlumni.length}
                </div>
                <div style={{ fontSize:13, color:'var(--muted)' }}>Awaiting Approval</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pending-alumni' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alumni Pending Approval</span>
          </div>
          {pendingAlumni.length === 0 ? (
            <EmptyState icon="✅" title="All caught up!" message="No pending alumni approvals." />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Alumni</th><th>Email</th><th>Branch</th><th>Graduation</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {pendingAlumni.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <Avatar name={`${a.firstName} ${a.lastName}`} size={34} />
                          <span style={{ fontWeight:600 }}>{a.firstName} {a.lastName}</span>
                        </div>
                      </td>
                      <td style={{ color:'var(--muted)' }}>{a.user?.email}</td>
                      <td>{a.branch || '—'}</td>
                      <td>{a.graduationYear || '—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <button className="btn btn-success btn-sm" onClick={() => approveAlumni(a.user?.id)}>
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'pending-jobs' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Jobs Pending Moderation</span>
          </div>
          {pendingJobs.length === 0 ? (
            <EmptyState icon="✅" title="No pending jobs" message="All jobs have been moderated." />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pendingJobs.map(j => (
                <div key={j.id} style={{
                  border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
                  padding:18, display:'flex', justifyContent:'space-between', alignItems:'flex-start'
                }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--navy)', marginBottom:2 }}>{j.jobTitle}</div>
                    <div style={{ color:'var(--teal)', fontWeight:600, marginBottom:6 }}>{j.companyName}</div>
                    <div style={{ fontSize:13, color:'var(--muted)' }}>
                      Posted by: {j.postedBy?.firstName} {j.postedBy?.lastName} · {j.location} · {j.jobType}
                    </div>
                    <p style={{ fontSize:13, color:'var(--muted)', marginTop:8, maxWidth:480, lineHeight:1.5 }}>
                      {j.description?.slice(0,200)}{j.description?.length > 200 ? '…' : ''}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:16 }}>
                    <button className="btn btn-success btn-sm" onClick={() => moderateJob(j.id, 'APPROVE')}>
                      Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => moderateJob(j.id, 'REJECT')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profiles' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Incomplete Profiles (&lt;70%)</span>
          </div>
          {incompleteProfiles.length === 0 ? (
            <EmptyState icon="🎉" title="All profiles are complete!" message="No alumni have incomplete profiles." />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Alumni</th><th>Company</th><th>Domain</th><th>Completeness</th><th>Last Verified</th></tr></thead>
                <tbody>
                  {incompleteProfiles.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <Avatar name={`${a.firstName} ${a.lastName}`} size={32} />
                          <div>
                            <div style={{ fontWeight:600, fontSize:13 }}>{a.firstName} {a.lastName}</div>
                            <div style={{ fontSize:11, color:'var(--muted)' }}>{a.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.currentCompany || <span style={{color:'var(--muted)'}}>—</span>}</td>
                      <td>{a.domain || <span style={{color:'var(--muted)'}}>—</span>}</td>
                      <td>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <div style={{
                            width:60, height:6, background:'var(--bg)', borderRadius:4, overflow:'hidden'
                          }}>
                            <div style={{
                              width:`${a.profileCompleteness}%`, height:'100%',
                              background: a.profileCompleteness < 40 ? 'var(--red)' : 'var(--amber)',
                              borderRadius:4
                            }} />
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color: a.profileCompleteness < 40 ? 'var(--red)' : 'var(--amber-dark)' }}>
                            {a.profileCompleteness}%
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize:12, color:'var(--muted)' }}>
                        {a.lastVerifiedAt ? new Date(a.lastVerifiedAt).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
