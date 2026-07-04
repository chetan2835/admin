import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Map, Package, Activity, Database, ArrowLeft } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableQuery = searchParams.get('table');

  const [stats, setStats] = useState({
    profiles: 0,
    journeys: 0,
    parcels: 0,
    activeJourneys: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: profilesCount },
          { count: journeysCount },
          { count: parcelsCount },
          { count: activeJourneysCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('journeys').select('*', { count: 'exact', head: true }),
          supabase.from('parcels').select('*', { count: 'exact', head: true }),
          supabase.from('journeys').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        setStats({
          profiles: profilesCount || 0,
          journeys: journeysCount || 0,
          parcels: parcelsCount || 0,
          activeJourneys: activeJourneysCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ background: `rgba(${color}, 0.1)`, padding: '1rem', borderRadius: '12px', color: `rgb(${color})` }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{loading ? <div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : value}</h3>
      </div>
    </div>
  );

  if (tableQuery) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
            <Database size={24} color="var(--accent-primary)" />
            {tableQuery.replace(/_/g, ' ')} Explorer
          </h1>
        </div>
        
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DataTable tableName={tableQuery} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Users" value={stats.profiles} icon={<Users size={28} />} color="59, 130, 246" />
        <StatCard title="Total Journeys" value={stats.journeys} icon={<Map size={28} />} color="16, 185, 129" />
        <StatCard title="Total Parcels" value={stats.parcels} icon={<Package size={28} />} color="245, 158, 11" />
        <StatCard title="Active Journeys" value={stats.activeJourneys} icon={<Activity size={28} />} color="239, 68, 68" />
      </div>
    </div>
  );
}
