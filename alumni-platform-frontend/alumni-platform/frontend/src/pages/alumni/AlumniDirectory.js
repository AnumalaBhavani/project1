import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { SkillTags, Avatar, Modal, Spinner, EmptyState, showToast } from '../../components/shared/UIComponents';
import { alumniAPI, mentorshipAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Briefcase, GraduationCap, MessageSquare, ExternalLink } from 'lucide-react';

export default function AlumniDirectory() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company:'', domain:'', location:'', skill:'', graduationYear:'', mentorship:'' });
  const [selected, setSelected] = useState(null);
  const [mentorModal, setMentorModal] = useState(false);
  const [mentorData, setMentorData] = useState({ message:'', goal:'' });
  const [sending, setSending] = useState(false);

  const fetchAlumni = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.company) params.company = f.company;
      if (f.domain) params.domain = f.domain;
      if (f.location) params.location = f.location;
      if (f.skill) params.skill = f.skill;
      if (f.graduationYear) params.graduationYear = parseInt(f.graduationYear);
      if (f.mentorship === 'true') params.mentorship = true;
      const res = await alumniAPI.directory(params);
      setAlumni(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlumni(); }, []);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const handleMentorRequest = async () => {
    if (!mentorData.message.trim()) { showToast('Please add a message', 'error'); return; }
    setSending(true);
    try {
      await mentorshipAPI.sendRequest(selected.id, mentorData);
      setMentorModal(false);
      setMentorData({ message:'', goal:'' });
      showToast('Mentorship request sent!', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to send request', 'error');
    } finally { setSending(false); }
  };

  return (
    <Layout title="Alumni Directory">
      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }} />
            <input className="form-input" placeholder="Company..." style={{ paddingLeft:32 }}
              value={filters.company} onChange={e => setF('company', e.target.value)} />
          </div>
          <select className="form-select" value={filters.domain} onChange={e => setF('domain', e.target.value)}>
            <option value="">All Domains</option>
            {['Software Engineering','Data Science','Product Management','DevOps','Web Development',
              'Cybersecurity','AI/ML','Finance','Consulting'].map(d => <option key={d}>{d}</option>)}
          </select>
          <input className="form-input" placeholder="Location..." value={filters.location}
            onChange={e => setF('location', e.target.value)} />
          <input className="form-input" placeholder="Skill..." value={filters.skill}
            onChange={e => setF('skill', e.target.value)} />
          <input className="form-input" type="number" placeholder="Grad Year" value={filters.graduationYear}
            onChange={e => setF('graduationYear', e.target.value)} />
          <select className="form-select" value={filters.mentorship} onChange={e => setF('mentorship', e.target.value)}>
            <option value="">All Alumni</option>
            <option value="true">Open to Mentorship</option>
          </select>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => fetchAlumni()}>Search</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setFilters({ company:'',domain:'',location:'',skill:'',graduationYear:'',mentorship:'' }); fetchAlumni({}); }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>
        {loading ? 'Loading...' : `${alumni.length} alumni found`}
      </div>

      {loading ? <Spinner /> : alumni.length === 0 ? (
        <EmptyState icon="🔍" title="No alumni found" message="Try adjusting your search filters." />
      ) : (
        <div className="grid-auto">
          {alumni.map(a => (
            <AlumniCard key={a.id} alumni={a} userRole={user?.role}
              onView={() => setSelected(a)}
              onMentor={() => { setSelected(a); setMentorModal(true); }} />
          ))}
        </div>
      )}

      {/* Alumni Detail Modal */}
      <Modal open={!!selected && !mentorModal} onClose={() => setSelected(null)}
        title={`${selected?.firstName} ${selected?.lastName}`}>
        {selected && (
          <div>
            <div style={{ display:'flex', gap:14, marginBottom:16 }}>
              <Avatar name={`${selected.firstName} ${selected.lastName}`} size={56} />
              <div>
                <div style={{ fontWeight:600, color:'var(--teal)', marginBottom:4 }}>
                  {selected.currentRole} {selected.currentCompany ? `@ ${selected.currentCompany}` : ''}
                </div>
                <div style={{ fontSize:13, color:'var(--muted)', display:'flex', flexWrap:'wrap', gap:10 }}>
                  {selected.location && <span style={{display:'flex',gap:4,alignItems:'center'}}><MapPin size={12}/>{selected.location}</span>}
                  {selected.graduationYear && <span style={{display:'flex',gap:4,alignItems:'center'}}><GraduationCap size={12}/>{selected.graduationYear}</span>}
                </div>
                {selected.availableForMentorship && <span className="badge badge-green" style={{marginTop:6}}>✓ Open to Mentorship</span>}
              </div>
            </div>
            {selected.bio && <p style={{fontSize:14,color:'var(--muted)',marginBottom:14,lineHeight:1.7}}>{selected.bio}</p>}
            <div style={{ marginBottom:16 }}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--navy)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>Skills</div>
              <SkillTags skills={selected.skills || []} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {selected.linkedinUrl && (
                <a href={selected.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <ExternalLink size={13}/> LinkedIn
                </a>
              )}
              {user?.role === 'STUDENT' && selected.availableForMentorship && (
                <button className="btn btn-primary btn-sm" onClick={() => { setMentorModal(true); }}>
                  <MessageSquare size={13}/> Request Mentorship
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Mentorship Request Modal */}
      {user?.role === 'STUDENT' && (
        <Modal open={mentorModal} onClose={() => { setMentorModal(false); }}
          title={`Request Mentorship — ${selected?.firstName} ${selected?.lastName}`}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setMentorModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleMentorRequest} disabled={sending}>
                {sending ? 'Sending…' : 'Send Request'}
              </button>
            </>
          }>
          <div className="form-group">
            <label className="form-label">Your Goal</label>
            <input className="form-input" placeholder="e.g. Get into product management"
              value={mentorData.goal} onChange={e => setMentorData(d => ({...d, goal: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Message <span style={{color:'var(--red)'}}>*</span></label>
            <textarea className="form-textarea" rows={4}
              placeholder="Introduce yourself and explain why you'd like mentorship from this alumni..."
              value={mentorData.message} onChange={e => setMentorData(d => ({...d, message: e.target.value}))} />
          </div>
        </Modal>
      )}
    </Layout>
  );
}

function AlumniCard({ alumni, userRole, onView, onMentor }) {
  const name = `${alumni.firstName} ${alumni.lastName}`;
  return (
    <div className="alumni-card" onClick={onView}>
      <div className="alumni-card-header">
        <Avatar name={name} size={52} />
        <div style={{ flex:1, minWidth:0 }}>
          <div className="alumni-name">{name}</div>
          {alumni.currentRole && <div className="alumni-role">{alumni.currentRole}</div>}
          {alumni.currentCompany && <div className="alumni-company">{alumni.currentCompany}</div>}
        </div>
        {alumni.availableForMentorship && (
          <span style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',flexShrink:0,marginTop:4}} title="Open to mentorship" />
        )}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:12, color:'var(--muted)', marginBottom:10 }}>
        {alumni.location && <span style={{display:'flex',gap:3,alignItems:'center'}}><MapPin size={11}/>{alumni.location}</span>}
        {alumni.graduationYear && <span style={{display:'flex',gap:3,alignItems:'center'}}><GraduationCap size={11}/>Batch {alumni.graduationYear}</span>}
        {alumni.domain && <span style={{display:'flex',gap:3,alignItems:'center'}}><Briefcase size={11}/>{alumni.domain}</span>}
      </div>

      <div className="alumni-tags">
        {(alumni.skills || []).slice(0,3).map((s,i) => <span key={i} className="skill-tag">{s}</span>)}
        {alumni.skills?.length > 3 && <span className="skill-tag">+{alumni.skills.length-3}</span>}
      </div>

      {userRole === 'STUDENT' && alumni.availableForMentorship && (
        <div className="alumni-actions" onClick={e => e.stopPropagation()}>
          <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={onMentor}>
            <MessageSquare size={13}/> Request Mentorship
          </button>
        </div>
      )}
    </div>
  );
}
