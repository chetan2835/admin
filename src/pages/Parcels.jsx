import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Download, FileText, Trash2 } from 'lucide-react';

export default function Parcels() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParcels = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('parcels').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parcel?')) {
      await supabase.from('parcels').delete().eq('id', id);
      fetchParcels();
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'weight_kg', header: 'Weight (kg)' },
    { key: 'origin', header: 'Origin' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
    { key: 'price', header: 'Price' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Parcels Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => exportToPDF('Parcels', columns, data)}>
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => exportToExcel('Parcels', data)}>
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
                <th>Item</th>
                <th>Weight</th>
                <th>Route</th>
                <th>Status</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.weight_kg} kg</td>
                  <td>{item.origin} &rarr; {item.destination}</td>
                  <td>
                    <span className="badge badge-info">{item.status}</span>
                  </td>
                  <td>&#8377;{item.price}</td>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No parcels found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
