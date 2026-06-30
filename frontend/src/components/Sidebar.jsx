import { NavLink } from 'react-router-dom';
 
// Single source of truth for nav items — add/remove a page here only.
const NAV_ITEMS = [
  { to: '/', icon: '⌂', label: 'Home', end: true },
  { to: '/macro', icon: '▤', label: 'Macro' },
  { to: '/markets', icon: '◔', label: 'Markets' },
  { to: '/adani-intel', icon: '⬡', label: 'Adani Intel' },
];
 
const NAV_ITEMS_BOTTOM = [
  { to: '/geo-map', icon: '⚏', label: 'Geo Map' },
  { to: '/commodities', icon: '▥', label: 'Commodities' },
  { to: '/risk-radar', icon: '⟐', label: 'Risk Radar' },
  { to: '/alerts', icon: '✶', label: 'Alerts' },
];
 
export default function Sidebar() {
  return (
    <div className="sidebar">
      <NavLink to="/" className="side-logo">I</NavLink>
 
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => 'side-icon' + (isActive ? ' active' : '')}
        >
          {item.icon}
          <span className="side-tooltip">{item.label}</span>
        </NavLink>
      ))}
 
      <div className="side-spacer" />
      <div className="side-divider" />
 
      {NAV_ITEMS_BOTTOM.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 'side-icon' + (isActive ? ' active' : '')}
        >
          {item.icon}
          <span className="side-tooltip">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
