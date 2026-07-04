import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Search, ChevronDown, ChevronUp, Download, FileText, Filter, X, Columns, RefreshCw } from 'lucide-react';
import RecordDetailsModal from './RecordDetailsModal';

const PRIORITY_COLS = ['id', 'name', 'title', 'phone', 'email', 'status', 'created_at', 'updated_at'];
const MAX_VISIBLE_COLS = 8;

export default function DataTable({ tableName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Column Visibility
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Record Modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tableName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: tableData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order(sortConfig.key || 'id', { ascending: sortConfig.direction === 'asc' });
      
      if (fetchError) throw fetchError;
      setData(tableData || []);
      
      // Auto-hide columns that aren't in the initial MAX_VISIBLE_COLS
      if (tableData && tableData.length > 0) {
        const allCols = Object.keys(tableData[0]);
        const sortedCols = [...allCols].sort((a, b) => {
          const aIndex = PRIORITY_COLS.indexOf(a.toLowerCase());
          const bIndex = PRIORITY_COLS.indexOf(b.toLowerCase());
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
        const initialHidden = new Set(sortedCols.slice(MAX_VISIBLE_COLS));
        setHiddenColumns(initialHidden);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract all columns
  const allColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const visibleColumns = useMemo(() => {
    return allColumns.filter(col => !hiddenColumns.has(col));
  }, [allColumns, hiddenColumns]);

  const toggleColumn = (colName) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(colName)) newSet.delete(colName);
      else newSet.add(colName);
      return newSet;
    });
  };

  // Extract unique statuses
  const uniqueStatuses = useMemo(() => {
    if (!allColumns.includes('status')) return [];
    return [...new Set(data.map(item => item.status).filter(Boolean))];
  }, [data, allColumns]);

  // Filter and Sort Data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Global Search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Status Filter
    if (statusFilter) {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle nulls
        if (valA === null) valA = '';
        if (valB === null) valB = '';

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, globalSearch, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportPDF = () => {
    if (allColumns.length === 0 || processedData.length === 0) return;
    const exportColumns = allColumns.map(col => ({ key: col, header: col.toUpperCase() }));
    exportToPDF(`${tableName}`, exportColumns, processedData);
  };

  const handleExportExcel = () => {
    if (processedData.length === 0) return;
    exportToExcel(`${tableName}`, processedData);
  };

  const resetFilters = () => {
    setGlobalSearch('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
        <h3>Error loading data</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: '1rem' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', overflow: 'hidden' }}>
      {/* Top Bar: Search, Filters, Export */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search all columns..." 
              value={globalSearch}
              onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.5rem', width: '250px' }}
            />
          </div>

          {uniqueStatuses.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--text-secondary)" />
              <select 
                className="input-field" 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ width: '150px' }}
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}

          {(globalSearch || statusFilter) && (
            <button className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.5rem' }} onClick={resetFilters} title="Reset Filters">
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button className="btn btn-outline" onClick={() => setShowColumnDropdown(!showColumnDropdown)}>
              <Columns size={16} /> Columns
            </button>
            {showColumnDropdown && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '0.5rem', 
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1rem', 
                zIndex: 50, 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>Toggle Columns</h4>
                {allColumns.map(col => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={!hiddenColumns.has(col)} 
                      onChange={() => toggleColumn(col)} 
                    />
                    {col.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-outline" onClick={handleExportPDF} disabled={processedData.length === 0}>
            <FileText size={16} /> PDF
          </button>
          <button className="btn btn-primary" onClick={handleExportExcel} disabled={processedData.length === 0}>
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ flex: 1, overflow: 'auto' }}>
        {processedData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No records found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.map(col => (
                  <th 
                    key={col} 
                    onClick={() => handleSort(col)}
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {col.replace(/_/g, ' ').toUpperCase()}
                      {sortConfig.key === col && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, idx) => (
                <tr 
                  key={row.id || idx} 
                  onClick={() => setSelectedRecord(row)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view details"
                >
                  {visibleColumns.map(col => {
                    let val = row[col];
                    if (typeof val === 'boolean') {
                      val = val ? 'Yes' : 'No';
                    } else if (typeof val === 'object' && val !== null) {
                      val = '{...}';
                    } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
                      val = new Date(val).toLocaleDateString();
                    }
                    return (
                      <td key={col} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col === 'status' ? (
                          <span className={`badge ${val === 'active' || val === 'completed' || val === 'success' ? 'badge-success' : 'badge-info'}`}>
                            {String(val)}
                          </span>
                        ) : (
                          String(val ?? '-')
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} records
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.5rem 0.75rem' }}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              )).filter((_, i) => i === 0 || i === totalPages - 1 || Math.abs(currentPage - 1 - i) <= 1)}
            </div>
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}
