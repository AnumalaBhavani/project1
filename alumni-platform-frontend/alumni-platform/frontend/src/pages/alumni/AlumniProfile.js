import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { CompletenessIndicator, SkillTags, Modal, Spinner, showToast } from '../../components/shared/UIComponents';
import { alumniAPI } from '../../services/api';
import { Edit2, Upload, Plus, Linkedin, Github, MapPin, Briefcase, GraduationCap, Check } from 'lucide-react';

export default function AlumniProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [resumeModal, setResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    alumniAPI.myProfile().then(r => {
      setProfile(r.data);
      setForm({ ...r.data, skills: r.data.skills || [] });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await alumniAPI.updateProfile(form);
      setProfile(res.data);
      setForm({ ...res.data, skills: res.data.skills || [] });
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (e) {
      showToast('Failed to update profile', 'error');
    } finally { setSaving(false); }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s) => {
    setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));
  };

  const handleParseResume = async () => {
    if (!resumeFile) return;
    setParsing(true);
    try {
      const res = await alumniAPI.parseResume(resumeFile);
      const parsed = res.data;
      setForm(f => ({
        ...f,
        skills: [...new Set([...(f.skills || []), ...(parsed.skills || [])])],
        currentRole: f.currentRole || parsed.jobTitle || f.currentRole,
        currentCompany: f.currentCompany || parsed.company || f.currentCompany,
        resumeUrl: parsed.resumeUrl || f.resumeUrl,
      }));
      setResumeModal(false);
      setEditing(true);
      showToast('Resume parsed! Review and save your updated profile.', 'success');
    } catch (e) {
      showToast('Could not parse resume', 'error');
    } finally { setParsing(false); }
  };

  if (loading) return <Layout title="My Profile"><Spinner /></Layout>;

  return (
    <Layout title="My Profile">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--navy-light), var(--teal))',
              color: 'white', fontSize: 28, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{profile?.firstName} {profile?.lastName}</h2>
              <div style={{ color: 'var(--teal)', fontWeight: 600, marginBottom: 6 }}>
                {profile?.currentRole} {profile?.currentCompany ? `@ ${profile.currentCompany}` : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--muted)' }}>
                {profile?.location && <span style={{ display:'flex', gap:4, alignItems:'center' }}><MapPin size={13}/>{profile.location}</span>}
                {profile?.graduationYear && <span style={{ display:'flex', gap:4, alignItems:'center' }}><GraduationCap size={13}/>{profile.graduationYear}</span>}
                {profile?.domain && <span style={{ display:'flex', gap:4, alignItems:'center' }}><Briefcase size={13}/>{profile.domain}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {profile?.availableForMentorship && (
                  <span className="badge badge-green">✓ Open to Mentorship</span>
                )}
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                    className="badge badge-blue" style={{ cursor:'pointer' }}>
                    <Linkedin size={11} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setResumeModal(true)}>
                <Upload size={14} /> Resume
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}>
                {editing ? (saving ? 'Saving…' : <><Check size={14}/> Save</>) : <><Edit2 size={14}/> Edit</>}
              </button>
            </div>
          </div>

          {/* Completeness */}
          <div style={{ marginTop: 20 }}>
            <CompletenessIndicator value={profile?.profileCompleteness || 0} suggestions={profile?.suggestions} />
          </div>
        </div>

        {/* Edit Form / Display */}
        {editing ? (
          <EditForm form={form} setForm={setForm} skillInput={skillInput}
            setSkillInput={setSkillInput} onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill} onCancel={() => setEditing(false)} />
        ) : (
          <ProfileDisplay profile={profile} />
        )}
      </div>

      {/* Resume Modal */}
      <Modal open={resumeModal} onClose={() => setResumeModal(false)}
        title="Auto-fill from Resume"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setResumeModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleParseResume} disabled={!resumeFile || parsing}>
              {parsing ? 'Parsing…' : 'Extract & Fill'}
            </button>
          </>
        }>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
          Upload your resume (PDF or TXT) and we'll auto-fill your skills, job title, and company.
        </p>
        <div className="form-group">
          <label className="form-label">Resume File</label>
          <input type="file" accept=".pdf,.txt,.doc,.docx"
            className="form-input"
            onChange={e => setResumeFile(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label className="form-label">LinkedIn URL (optional)</label>
          <input className="form-input" placeholder="https://linkedin.com/in/yourname"
            onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} />
        </div>
      </Modal>
    </Layout>
  );
}

function EditForm({ form, setForm, skillInput, setSkillInput, onAddSkill, onRemoveSkill, onCancel }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h4 style={{ marginBottom: 16, fontSize: 15 }}>Basic Information</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" value={form.bio || ''} onChange={e => set('bio', e.target.value)}
            placeholder="Tell students about yourself, your experience, and what you love about your career..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Company</label>
            <input className="form-input" value={form.currentCompany || ''} onChange={e => set('currentCompany', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Current Role</label>
            <input className="form-input" value={form.currentRole || ''} onChange={e => set('currentRole', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Domain</label>
            <select className="form-select" value={form.domain || ''} onChange={e => set('domain', e.target.value)}>
              <option value="">Select domain</option>
              {['Software Engineering','Data Science','Product Management','DevOps','Web Development',
                'Mobile Development','Cybersecurity','Cloud Computing','AI/ML','Finance','Consulting'].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="City, Country" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input className="form-input" type="number" value={form.yearsOfExperience || 0} onChange={e => set('yearsOfExperience', parseInt(e.target.value))} />
          </div>
          <div className="form-group" style={{ display:'flex', alignItems:'flex-end', paddingBottom: 2 }}>
            <label style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:14 }}>
              <input type="checkbox" checked={form.availableForMentorship || false}
                onChange={e => set('availableForMentorship', e.target.checked)} />
              <span>Available for Mentorship</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h4 style={{ marginBottom: 16, fontSize: 15 }}>Skills</h4>
        <SkillTags skills={form.skills || []} removable onRemove={onRemoveSkill} />
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <input className="form-input" value={skillInput} placeholder="Add a skill..."
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAddSkill())} />
          <button className="btn btn-outline btn-sm" onClick={onAddSkill}><Plus size={14}/> Add</button>
        </div>
      </div>

      <div className="card">
        <h4 style={{ marginBottom: 16, fontSize: 15 }}>Social Links</h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input className="form-input" value={form.linkedinUrl || ''} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input className="form-input" value={form.githubUrl || ''} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ProfileDisplay({ profile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {profile?.bio && (
        <div className="card">
          <h4 style={{ marginBottom: 10, fontSize: 15 }}>About</h4>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{profile.bio}</p>
        </div>
      )}
      <div className="card">
        <h4 style={{ marginBottom: 14, fontSize: 15 }}>Skills</h4>
        {profile?.skills?.length > 0
          ? <SkillTags skills={profile.skills} />
          : <p style={{ color: 'var(--muted)', fontSize: 14 }}>No skills added yet.</p>}
      </div>
    </div>
  );
}
