import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { StatusBadge, MatchBadge, SkillTags, Modal, Spinner, EmptyState, showToast } from '../../components/shared/UIComponents';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, MapPin, Clock, DollarSign, Plus, Users } from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const isAlumni = user?.role === 'ALUMNI';

  return isAlumni ? <AlumniJobsView /> : <StudentJobsView />;
}

// ---- Alumni: Post & Manage Jobs ----
function AlumniJobsView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postModal, setPostModal] = useState(false);
  const [appsModal, setAppsModal] = useState(null);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ requiredSkills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => jobAPI.myJobs().then(r => { setJobs(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePost = async () => {
    if (!form.companyName || !form.jobTitle || !form.description) {
      showToast('Please fill required fields', 'error'); return;
    }
    setSaving(true);
    try {
      await jobAPI.postJob(form);
      setPostModal(false);
      setForm({ requiredSkills: [] });
      showToast('Job posted! Awaiting admin approval.', 'success');
      load();
    } catch (e) { showToast('Failed to post job', 'error'); }
    finally { setSaving(false); }
  };

  const viewApplications = async (jobId) => {
    const res = await jobAPI.getApplications(jobId);
    setApplications(res.data);
    setAppsModal(jobId);
  };

  return (
    <Layout title="Job Postings">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, marginBottom:2 }}>My Job Postings</h2>
          <p style={{ color:'var(--muted)', fontSize:14 }}>{jobs.length} jobs posted</p>
        </div>
        <button className="btn btn-amber" onClick={() => setPostModal(true)}>
          <Plus size={16}/> Post New Job
        </button>
      </div>

      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState icon="💼" title="No jobs posted" message="Post your first job opportunity for students."
          action={<button className="btn btn-primary" onClick={() => setPostModal(true)}>Post a Job</button>} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {jobs.map(j => (
            <div key={j.id} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:2 }}>{j.jobTitle}</div>
                  <div style={{ color:'var(--teal)', fontWeight:600, marginBottom:8 }}>{j.companyName}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:13, color:'var(--muted)' }}>
                    {j.location && <span style={{display:'flex',gap:4,alignItems:'center'}}><MapPin size={13}/>{j.location}</span>}
                    <span style={{display:'flex',gap:4,alignItems:'center'}}><Clock size={13}/>{j.jobType}</span>
                    {j.salaryRange && <span style={{display:'flex',gap:4,alignItems:'center'}}><DollarSign size={13}/>{j.salaryRange}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <StatusBadge status={j.status} />
                  <button className="btn btn-outline btn-sm" onClick={() => viewApplications(j.id)}>
                    <Users size={13}/> Applications
                  </button>
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <SkillTags skills={(j.requiredSkills || []).map(s => s.skill || s)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      <Modal open={postModal} onClose={() => setPostModal(false)} title="Post a Job Opportunity"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setPostModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePost} disabled={saving}>
              {saving ? 'Posting…' : 'Post Job'}
            </button>
          </>
        }>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="form-input" placeholder="e.g. Google" onChange={e => set('companyName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" placeholder="e.g. Software Engineer" onChange={e => set('jobTitle', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea className="form-textarea" rows={4} placeholder="Describe the role, responsibilities, and requirements..."
            onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="City / Remote" onChange={e => set('location', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select className="form-select" onChange={e => set('jobType', e.target.value)}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Min Experience (yrs)</label>
            <input className="form-input" type="number" defaultValue={0} onChange={e => set('experienceMin', parseInt(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Experience (yrs)</label>
            <input className="form-input" type="number" defaultValue={5} onChange={e => set('experienceMax', parseInt(e.target.value))} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input className="form-input" placeholder="e.g. 10-15 LPA" onChange={e => set('salaryRange', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Domain</label>
            <select className="form-select" onChange={e => set('domain', e.target.value)}>
              <option value="">Select domain</option>
              {['Software Engineering','Data Science','Product Management','DevOps','Web Development','AI/ML'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Application Deadline</label>
          <input className="form-input" type="date" onChange={e => set('applicationDeadline', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <SkillTags skills={form.requiredSkills} removable
            onRemove={s => set('requiredSkills', form.requiredSkills.filter(x => x !== s))} />
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input className="form-input" value={skillInput} placeholder="Add required skill..."
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { set('requiredSkills', [...form.requiredSkills, skillInput.trim()]); setSkillInput(''); }}}} />
            <button className="btn btn-outline btn-sm" onClick={() => { if (skillInput.trim()) { set('requiredSkills', [...form.requiredSkills, skillInput.trim()]); setSkillInput(''); }}}>Add</button>
          </div>
        </div>
      </Modal>

      {/* Applications Modal */}
      <Modal open={!!appsModal} onClose={() => setAppsModal(null)} title="Job Applications (Ranked by Match Score)">
        {applications.length === 0 ? (
          <EmptyState icon="📋" title="No applications yet" message="Students haven't applied to this job yet." />
        ) : (
          <div>
            {applications.map((a, i) => (
              <div key={a.id} style={{
                display:'flex', gap:12, alignItems:'center',
                padding:'12px 0', borderBottom:'1px solid var(--border)'
              }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: a.matchCategory === 'HIGH' ? 'var(--green-soft)' : a.matchCategory === 'MODERATE' ? 'var(--amber-soft)' : 'var(--red-soft)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700, color:'var(--navy)', flexShrink:0
                }}>#{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>
                    {a.student?.firstName} {a.student?.lastName}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>
                    Matched: {a.matchedSkills}
                  </div>
                </div>
                <MatchBadge score={a.matchScore} category={a.matchCategory} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

// ---- Student: Browse & Apply Jobs ----
function StudentJobsView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ domain:'', location:'', jobType:'' });
  const [applyModal, setApplyModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  const load = async (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.domain) params.domain = f.domain;
    if (f.location) params.location = f.location;
    if (f.jobType) params.jobType = f.jobType;
    const res = await jobAPI.list(params);
    setJobs(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobAPI.apply(applyModal.id, resumeFile, coverLetter);
      setApplyModal(null);
      setCoverLetter(''); setResumeFile(null);
      showToast('Application submitted!', 'success');
    } catch (e) { showToast(e.response?.data?.message || 'Failed to apply', 'error'); }
    finally { setApplying(false); }
  };

  return (
    <Layout title="Job Portal">
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'flex-end' }}>
          <div>
            <label className="form-label">Domain</label>
            <select className="form-select" value={filters.domain} onChange={e => setFilters(f=>({...f,domain:e.target.value}))}>
              <option value="">All Domains</option>
              {['Software Engineering','Data Science','Product Management','DevOps','Web Development','AI/ML'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="City..." value={filters.location}
              onChange={e => setFilters(f=>({...f,location:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Type</label>
            <select className="form-select" value={filters.jobType} onChange={e => setFilters(f=>({...f,jobType:e.target.value}))}>
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => load()}>Search</button>
        </div>
      </div>

      <div style={{ marginBottom:12, fontSize:14, color:'var(--muted)', fontWeight:500 }}>
        {loading ? 'Loading…' : `${jobs.length} jobs available`}
      </div>

      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState icon="💼" title="No jobs found" message="Try adjusting your filters." />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {jobs.map(j => (
            <div key={j.id} className="job-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div className="job-title">{j.jobTitle}</div>
                  <div className="job-company">{j.companyName}</div>
                  <div className="job-meta">
                    {j.location && <span className="job-meta-item"><MapPin size={13}/>{j.location}</span>}
                    <span className="job-meta-item"><Clock size={13}/>{j.jobType?.replace('_',' ')}</span>
                    {j.salaryRange && <span className="job-meta-item"><DollarSign size={13}/>{j.salaryRange}</span>}
                    <span className="job-meta-item">{j.experienceMin}-{j.experienceMax} yrs exp</span>
                  </div>
                  <SkillTags skills={(j.requiredSkills || []).map(s => s.skill || s)} />
                </div>
                <button className="btn btn-primary btn-sm" style={{ flexShrink:0 }}
                  onClick={() => setApplyModal(j)}>
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!applyModal} onClose={() => setApplyModal(null)}
        title={`Apply: ${applyModal?.jobTitle} @ ${applyModal?.companyName}`}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setApplyModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
              {applying ? 'Submitting…' : 'Submit Application'}
            </button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Upload Resume (PDF)</label>
          <input type="file" accept=".pdf,.doc,.docx" className="form-input"
            onChange={e => setResumeFile(e.target.files[0])} />
          <p className="form-hint">Your resume will be automatically scored against job requirements.</p>
        </div>
        <div className="form-group">
          <label className="form-label">Cover Letter (optional)</label>
          <textarea className="form-textarea" rows={4} placeholder="Tell the employer why you're a great fit..."
            value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
        </div>
      </Modal>
    </Layout>
  );
}
