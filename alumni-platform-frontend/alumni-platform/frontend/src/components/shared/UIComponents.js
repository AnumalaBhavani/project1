import React, { useState, useEffect } from 'react';

// ---- Toast ----
let _setToast;
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  _setToast = setToast;
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  return (
    <>
      {children}
      {toast && (
        <div className={`toast ${toast.type || ''}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
export const showToast = (message, type = '') => _setToast?.({ message, type });

// ---- Loading Spinner ----
export function Spinner({ size = 32 }) {
  return (
    <div className="loading-center">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}

// ---- Modal ----
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        {title && <h3 className="modal-title">{title}</h3>}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Progress Bar ----
export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar-wrap">
      <div
        className="progress-bar-fill"
        style={{
          width: `${pct}%`,
          background: color || undefined
        }}
      />
    </div>
  );
}

// ---- Profile Completeness ----
export function CompletenessIndicator({ value, suggestions }) {
  const color = value >= 80 ? 'var(--green)' : value >= 50 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Profile Completeness</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <ProgressBar value={value} />
      {suggestions && value < 100 && (
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          💡 {suggestions}
        </p>
      )}
    </div>
  );
}

// ---- Skill Tags ----
export function SkillTags({ skills = [], removable, onRemove }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {skills.map((s, i) => (
        <span key={i} className="skill-tag">
          {s}
          {removable && (
            <button
              onClick={() => onRemove?.(s)}
              style={{ marginLeft: 6, background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}
            >×</button>
          )}
        </span>
      ))}
    </div>
  );
}

// ---- Badge ----
export function Badge({ children, type = 'navy' }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

// ---- Status Badge ----
export function StatusBadge({ status }) {
  const map = {
    PENDING: ['amber', 'Pending'],
    APPROVED: ['green', 'Approved'],
    REJECTED: ['red', 'Rejected'],
    CLOSED: ['navy', 'Closed'],
    ACCEPTED: ['green', 'Accepted'],
    SCHEDULED: ['blue', 'Scheduled'],
    COMPLETED: ['purple', 'Completed'],
    APPLIED: ['blue', 'Applied'],
    SHORTLISTED: ['green', 'Shortlisted'],
    INTERVIEWED: ['purple', 'Interviewed'],
    SELECTED: ['green', 'Selected'],
  };
  const [type, label] = map[status] || ['navy', status];
  return <Badge type={type}>{label}</Badge>;
}

// ---- Match Score Badge ----
export function MatchBadge({ score, category }) {
  const cls = category === 'HIGH' ? 'match-high'
    : category === 'MODERATE' ? 'match-moderate' : 'match-low';
  return (
    <span className={cls} style={{ fontSize: 14 }}>
      {Math.round(score)}% match
    </span>
  );
}

// ---- Empty State ----
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <p className="empty-msg">{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ---- Avatar ----
export function Avatar({ name = '', size = 40, src }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (src) return (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--navy-light), var(--teal))',
      color: 'white', fontWeight: 700, fontSize: size * 0.35,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>{initials}</div>
  );
}

// ---- Confirm Dialog ----
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </>
      }
    >
      <p style={{ color: 'var(--muted)' }}>{message}</p>
    </Modal>
  );
}
