import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Download, FileText, Trash2 } from 'lucide-react';

export default function Transactions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await supabase.from('transactions').delete().eq('id', id);
      fetchTransactions();
    }
  };

  const columns = [
    { key: 'id', header: 'Tx ID' },
    { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status' },
    { key: 'payment_method', header: 'Method' },
    { key: 'created_at', header: 'Date' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Transactions Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => exportToPDF('Transactions', columns, data)}>
            <FileText size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => exportToExcel('Transactions', data)}>
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
                <th>Tx ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td><span title={item.id}>{item.id.substring(0, 8)}...</span></td>
                  <td>&#8377;{item.amount}</td>
                  <td>
                    <span className={`badge ${item.status === 'completed' ? 'badge-success' : item.status === 'failed' ? 'badge-danger' : 'badge-info'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{item.payment_method || 'N/A'}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
