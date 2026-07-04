import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Download, FileText, Trash2 } from 'lucide-react';

export default function Journeys() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneys = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('journeys').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      await supabase.from('journeys').delete().eq('id', id);
      fetchJourneys();
    }
  };

  const columns = [
    { key: 'origin', header: 'Origin' },
    { key: 'destination', header: 'Destination' },
    { key: 'travel_mode', header: 'Mode' },
    { key: 'status', header: 'Status' },
    { key: 'price_small', header: 'Base Price' },
    { key: 'created_at', header: 'Posted Date' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Journeys Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => exportToPDF('Journeys', columns, data)}>
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => exportToExcel('Journeys', data)}>
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
                <th>Origin</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Capacity (kg)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.origin}</td>
                  <td>{item.destination}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.travel_mode || 'N/A'}</td>
                  <td>
                    <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.capacity_kg} kg</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem', color: 'var(--accent-danger)' }} title="Delete" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No journeys found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
