import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Briefcase, BookOpen, Bell, UserCircle,
  LogOut, GraduationCap, Search, Settings, Award, Calendar,
  MessageSquare, FileText, ChevronRight, Menu, X
} from 'lucide-react';

const ALUMNI_NAV = [
  { section: 'Main', items: [
    { to: '/alumni/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/alumni/profile', label: 'My Profile', icon: UserCircle },
    { to: '/alumni/directory', label: 'Alumni Directory', icon: Users },
  ]},
  { section: 'Engage', items: [
    { to: '/alumni/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/alumni/mentorship', label: 'Mentorship', icon: MessageSquare },
    { to: '/alumni/events', label: 'Events', icon: Calendar },
  ]},
  { section: 'Track', items: [
    { to: '/alumni/contributions', label: 'Contributions', icon: Award },
    { to: '/alumni/notifications', label: 'Notifications', icon: Bell },
  ]},
];

const STUDENT_NAV = [
  { section: 'Main', items: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/directory', label: 'Alumni Directory', icon: Search },
  ]},
  { section: 'Opportunities', items: [
    { to: '/student/jobs', label: 'Job Portal', icon: Briefcase },
    { to: '/student/mentorship', label: 'Mentorship', icon: MessageSquare },
    { to: '/student/events', label: 'Events', icon: Calendar },
    { to: '/student/materials', label: 'Study Materials', icon: BookOpen },
  ]},
  { section: 'My Activity', items: [
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
  ]},
];

const ADMIN_NAV = [
  { section: 'Admin', items: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/alumni', label: 'Alumni Management', icon: GraduationCap },
    { to: '/admin/jobs', label: 'Job Moderation', icon: Briefcase },
    { to: '/admin/analytics', label: 'Analytics', icon: Award },
  ]},
];

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navConfig = user?.role === 'ALUMNI' ? ALUMNI_NAV
    : user?.role === 'STUDENT' ? STUDENT_NAV : ADMIN_NAV;

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>AlumniConnect</h2>
          <span>{user?.role}</span>
        </div>

        <nav className="sidebar-nav">
          {navConfig.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="icon" size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-sidebar">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role?.toLowerCase()}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'rgba(255,255,255,0.5)', padding: '6px' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ display:'none' }}
              onClick={() => setSidebarOpen(true)}
              id="menu-btn"
            >
              <Menu size={20} />
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-actions">
            <NotifBell />
            <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {initials}
            </div>
          </div>
        </header>

        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}

function NotifBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // In production, fetch unread count via API
  const unread = 2;
  const path = user?.role === 'ALUMNI' ? '/alumni/notifications'
    : user?.role === 'STUDENT' ? '/student/notifications' : '/admin/dashboard';
  return (
    <button
      className="btn btn-ghost btn-sm"
      style={{ position: 'relative', padding: '8px' }}
      onClick={() => navigate(path)}
    >
      <Bell size={18} />
      {unread > 0 && (
        <span style={{
          position:'absolute', top:4, right:4,
          width:8, height:8, borderRadius:'50%',
          background:'var(--red)', border:'2px solid var(--surface)'
        }} />
      )}
    </button>
  );
}
