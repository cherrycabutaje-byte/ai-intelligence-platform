// src/lib/exportCSV.ts

/**
 * Convert an array of objects to CSV and trigger download
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string
  ): void {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }
  
    // Get headers from first object keys
    const headers = Object.keys(data[0]);
  
    // Build CSV rows
    const csvRows = [
      // Header row
      headers.join(','),
      // Data rows
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const str = String(value);
          // Escape quotes and wrap in quotes if contains comma, quote or newline
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ),
    ];
  
    // Create blob and trigger download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }