import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Package, CreditCard, LogOut, Database, Table2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    async function fetchTables() {
      const { data, error } = await supabase.rpc('get_tables');
      if (error) {
        console.error('Error fetching tables via RPC:', error);
        // Fallback to known tables if RPC is not created yet
        setTables(['profiles', 'journeys', 'parcels']);
      } else if (data) {
        setTables(data.map(t => t.table_name));
      }
    }
    fetchTables();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    // { name: 'Profiles', path: '/profiles', icon: <Users size={20} /> },
    // { name: 'Journeys', path: '/journeys', icon: <Map size={20} /> },
    // { name: 'Parcels', path: '/parcels', icon: <Package size={20} /> },
    // { name: 'Transactions', path: '/transactions', icon: <CreditCard size={20} /> },
  ];

  return (
    <div style={{
      width: '250px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} /> Needin Admin
        </h2>
      </div>
      
      <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => {
              // Custom check for dashboard so it doesn't stay highlighted if we have ?table= query
              const isStrictlyActive = isActive && (item.path !== '/dashboard' || !location.search.includes('table='));
              return {
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isStrictlyActive ? 'white' : 'var(--text-secondary)',
                background: isStrictlyActive ? 'var(--accent-primary)' : 'transparent',
                fontWeight: isStrictlyActive ? '600' : '500',
                transition: 'all var(--transition-fast)'
              };
            }}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {tables.length > 0 && (
        <div style={{ flex: 1, padding: '0 1rem 1.5rem 1rem' }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={14} /> Explorer
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {tables.map((table) => {
              const isActive = location.pathname === '/dashboard' && location.search === `?table=${table}`;
              return (
                <NavLink
                  key={table}
                  to={`/dashboard?table=${table}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(59, 130, 246, 0.9)' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all var(--transition-fast)',
                    textTransform: 'capitalize'
                  }}
                >
                  <Table2 size={16} />
                  {table.replace(/_/g, ' ')}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <button 
          onClick={handleLogout}
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
