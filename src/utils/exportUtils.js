import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToPDF = (title, columns, data) => {
  const doc = new jsPDF('landscape'); // Landscape for better fit with many columns
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 30);

  doc.autoTable({
    startY: 36,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(c => {
      const val = row[c.key];
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return format(new Date(val), 'PP');
      }
      return val ?? '';
    })),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_export.pdf`);
};

export const exportToExcel = (title, data) => {
  // Format data before sending to Excel to ensure complex types don't break it
  const formattedData = data.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      let val = row[key];
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
      if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
        val = format(new Date(val), 'PPpp');
      }
      newRow[key.replace(/_/g, ' ').toUpperCase()] = val;
    });
    return newRow;
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}_export.xlsx`);
};
