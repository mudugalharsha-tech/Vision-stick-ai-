import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const S = {
  nav: {
    position: 'sticky', top: 0, zIndex: 300,
    background: 'rgba(17,19,24,0.97)',
    borderBottom: '1px solid #2a2d3a',
    backdropFilter: 'blur(14px)',
    padding: '0 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 56,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: '#3b5bdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
  },
  logoText: { fontSize: 16, fontWeight: 700, color: '#748ffc' },
  rightRow: { display: 'flex', alignItems: 'center', gap: 8 },
  menuBtn: {
    background: 'transparent', border: '1px solid transparent',
    borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
    color: '#8b8fa8', fontSize: 18,
    transition: 'background 0.15s, border-color 0.15s',
  },
  drawer: {
    position: 'absolute', top: 56, left: 0, right: 0,
    background: '#111318',
    borderBottom: '1px solid #2a2d3a',
    zIndex: 400,
  },
  navItem: {
    display: 'block', padding: '14px 20px', cursor: 'pointer',
    textDecoration: 'none', color: '#8b8fa8',
    borderBottom: '1px solid #2a2d3a',
    fontSize: 15, fontWeight: 400,
    transition: 'color 0.12s',
  },
  navItemActive: { color: '#e8eaf0', fontWeight: 600 },
  navItemCta: {
    display: 'block', margin: '12px 16px 16px',
    padding: '13px 16px', borderRadius: 11,
    background: '#3b5bdb', color: '#fff',
    textDecoration: 'none', textAlign: 'center',
    fontSize: 15, fontWeight: 600,
  },
};

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const close = () => setOpen(false);
  const isActive = path => location.pathname === path;

  return (
    <nav style={S.nav}>
      {/* Logo */}
      <Link to="/" style={S.logo} onClick={close}>
        <div style={S.logoIcon}>👁</div>
        <span style={S.logoText}>VisionStick AI</span>
      </Link>

      {/* Right */}
      <div style={S.rightRow}>
        <button
          style={{ ...S.menuBtn, ...(open ? { background: '#22242f', borderColor: '#2a2d3a' } : {}) }}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '≡'}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div style={S.drawer}>
          {[
            { to: '/',             label: 'Home' },
            { to: '/features',     label: 'Features' },
            { to: '/how-it-works', label: 'How It Works' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              ...S.navItem,
              ...(isActive(to) ? S.navItemActive : {}),
            }} onClick={close}>
              {label}
            </Link>
          ))}

          <Link to="/detect" style={S.navItemCta} onClick={close}>Live Detection →</Link>
        </div>
      )}
    </nav>
  );
}
