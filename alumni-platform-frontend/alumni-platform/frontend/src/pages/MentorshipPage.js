import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { StatusBadge, Avatar, Modal, Spinner, EmptyState, showToast } from '../../components/shared/UIComponents';
import { mentorshipAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

export default function MentorshipPage() {
  const { user } = useAuth();
  return user?.role === 'ALUMNI' ? <AlumniMentorship /> : <StudentMentorship />;
}

function AlumniMentorship() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [responseForm, setResponseForm] = useState({ action:'', notes:'', scheduledAt:'', meetingLink:'' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');

  const load = () => {
    mentorshipAPI.alumniRequests().then(r => {
      setRequests(r.data);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const filtered = requests.filter(r => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const respond = async () => {
    if (!responseForm.action) { showToast('Select an action', 'error'); return; }
    setSaving(true);
    try {
      await mentorshipAPI.respond(selected.id, responseForm);
      setSelected(null);
      setResponseForm({ action:'', notes:'', scheduledAt:'', meetingLink:'' });
      showToast('Response sent!', 'success');
      load();
    } catch (e) { showToast('Failed to respond', 'error'); }
    finally { setSaving(false); }
  };

  const tabs = ['PENDING','ACCEPTED','SCHEDULED','COMPLETED','ALL'];
  const counts = {};
  tabs.forEach(t => counts[t] = t === 'ALL' ? requests.length : requests.filter(r => r.status === t).length);

  return (
    <Layout title="Mentorship Requests">
      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t]})
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="🤝" title="No requests" message={`No ${activeTab.toLowerCase()} mentorship requests.`} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding:18 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <Avatar name={`${r.student?.firstName} ${r.student?.lastName}`} size={48} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--navy)' }}>
                        {r.student?.firstName} {r.student?.lastName}
                      </div>
                      {r.goal && <div style={{ fontSize:13, color:'var(--teal)', fontWeight:600, marginTop:2 }}>Goal: {r.goal}</div>}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p style={{ fontSize:14, color:'var(--muted)', marginTop:8, lineHeight:1.6 }}>{r.message}</p>
                  {r.scheduledAt && (
                    <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:8, fontSize:13, color:'var(--teal)' }}>
                      <Calendar size={13}/> Scheduled: {new Date(r.scheduledAt).toLocaleString()}
                      {r.meetingLink && <a href={r.meetingLink} target="_blank" rel="noreferrer" style={{ color:'var(--amber-dark)', marginLeft:8 }}>Join Meeting</a>}
                    </div>
                  )}
                  {r.status === 'PENDING' && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop:10 }}
                      onClick={() => { setSelected(r); setResponseForm({ action:'', notes:'', scheduledAt:'', meetingLink:'' }); }}>
                      <MessageSquare size={13}/> Respond
                    </button>
                  )}
                  {r.status === 'ACCEPTED' && (
                    <div style={{ display:'flex', gap:8, marginTop:10 }}>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setSelected(r); setResponseForm({ action:'SCHEDULE', notes:'', scheduledAt:'', meetingLink:'' }); }}>
                        <Calendar size={13}/> Schedule
                      </button>
                      <button className="btn btn-success btn-sm"
                        onClick={() => { setSelected(r); setResponseForm({ action:'COMPLETE', notes:'', scheduledAt:'', meetingLink:'' }); }}>
                        <CheckCircle size={13}/> Mark Complete
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize:11, color:'var(--text-light)', marginTop:6 }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)}
        title="Respond to Mentorship Request"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={respond} disabled={saving}>
              {saving ? 'Sending…' : 'Send Response'}
            </button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Action *</label>
          <select className="form-select" value={responseForm.action}
            onChange={e => setResponseForm(f=>({...f,action:e.target.value}))}>
            <option value="">Select action</option>
            <option value="ACCEPT">Accept</option>
            <option value="REJECT">Reject</option>
            <option value="SCHEDULE">Schedule Session</option>
            <option value="COMPLETE">Mark as Completed</option>
          </select>
        </div>
        {responseForm.action === 'SCHEDULE' && (
          <>
            <div className="form-group">
              <label className="form-label">Schedule Date & Time</label>
              <input type="datetime-local" className="form-input"
                onChange={e => setResponseForm(f=>({...f,scheduledAt:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Link</label>
              <input className="form-input" placeholder="https://meet.google.com/..."
                onChange={e => setResponseForm(f=>({...f,meetingLink:e.target.value}))} />
            </div>
          </>
        )}
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" rows={3} placeholder="Add any notes for the student..."
            onChange={e => setResponseForm(f=>({...f,notes:e.target.value}))} />
        </div>
      </Modal>
    </Layout>
  );
}

function StudentMentorship() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorshipAPI.studentRequests().then(r => {
      setRequests(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout title="My Mentorship Requests">
      <div style={{ marginBottom: 16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ color:'var(--muted)', fontSize:14 }}>
          Track the status of your mentorship requests.
        </p>
      </div>

      {loading ? <Spinner /> : requests.length === 0 ? (
        <EmptyState icon="🤝" title="No mentorship requests"
          message="Browse the alumni directory and request mentorship from alumni in your field of interest." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {requests.map(r => (
            <div key={r.id} className="card" style={{ padding:18 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <Avatar name={`${r.alumni?.firstName} ${r.alumni?.lastName}`} size={48} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--navy)' }}>
                        {r.alumni?.firstName} {r.alumni?.lastName}
                      </div>
                      <div style={{ fontSize:13, color:'var(--teal)', marginTop:2 }}>
                        {r.alumni?.currentRole} @ {r.alumni?.currentCompany}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.goal && <div style={{ fontSize:13, fontWeight:600, marginTop:6, color:'var(--navy)' }}>Goal: {r.goal}</div>}
                  <p style={{ fontSize:13, color:'var(--muted)', marginTop:6, lineHeight:1.6 }}>{r.message}</p>
                  {r.alumniNotes && (
                    <div style={{ marginTop:8, padding:'10px 12px', background:'var(--teal-soft)',
                      borderRadius:'var(--radius)', borderLeft:'3px solid var(--teal)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--teal)', marginBottom:4 }}>ALUMNI NOTES</div>
                      <div style={{ fontSize:13, color:'var(--text)' }}>{r.alumniNotes}</div>
                    </div>
                  )}
                  {r.scheduledAt && (
                    <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:8, fontSize:13, color:'var(--green)', fontWeight:600 }}>
                      <Calendar size={13}/> {new Date(r.scheduledAt).toLocaleString()}
                      {r.meetingLink && (
                        <a href={r.meetingLink} target="_blank" rel="noreferrer"
                          className="btn btn-success btn-sm" style={{ marginLeft:8 }}>
                          Join Meeting
                        </a>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize:11, color:'var(--text-light)', marginTop:6 }}>
                    Sent {new Date(r.createdAt).toLocaleDateString()}
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
