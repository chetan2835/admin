import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Download, FileText, Trash2, Edit, ShieldAlert } from 'lucide-react';

export default function Profiles() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchProfiles();
    }
  };

  const handleBan = async (id) => {
    // In a real scenario, you might update an `is_banned` field. The schema doesn't have one, 
    // so we'll mock it or alert that schema needs update. Let's just show an alert for now.
    alert(`Ban feature requested for User ID: ${id}. Ensure 'is_banned' column exists in Supabase to save this state.`);
  };

  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    { key: 'is_identity_verified', header: 'Verified' },
    { key: 'created_at', header: 'Joined Date' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Profiles Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => exportToPDF('Profiles', columns, data)}>
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => exportToExcel('Profiles', data)}>
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(profile => (
                <tr key={profile.id}>
                  <td>{profile.full_name || 'N/A'}</td>
                  <td>{profile.email || 'N/A'}</td>
                  <td>{profile.phone || 'N/A'}</td>
                  <td>{profile.city || 'N/A'}</td>
                  <td>
                    {profile.is_identity_verified 
                      ? <span className="badge badge-success">Yes</span>
                      : <span className="badge badge-danger">No</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem' }} title="Ban User" onClick={() => handleBan(profile.id)}>
                        <ShieldAlert size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--accent-danger)' }} title="Delete" onClick={() => handleDelete(profile.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No profiles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
