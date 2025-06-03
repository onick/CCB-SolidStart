/**
 * Convierte datos a formato CSV
 */
export const exportToCSV = (
  data: Record<string, any>[],
  filename: string = 'export.csv',
  headers?: string[]
): void => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Convierte datos a formato JSON
 */
export const exportToJSON = (
  data: any,
  filename: string = 'export.json'
): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

/**
 * Convierte datos a formato Excel (requiere librería externa)
 */
export const exportToExcel = async (
  data: Record<string, any>[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Datos'
): Promise<void> => {
  try {
    // Importación dinámica de xlsx
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw new Error('No se pudo exportar a Excel. Asegúrate de tener la librería xlsx instalada.');
  }
};

/**
 * Convierte datos a formato PDF (tabla simple)
 */
export const exportToPDF = async (
  data: Record<string, any>[],
  filename: string = 'export.pdf',
  title: string = 'Reporte'
): Promise<void> => {
  try {
    // Importación dinámica de jsPDF
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Tabla (implementación básica)
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const tableData = data.map(item => headers.map(header => String(item[header] || '')));
      
      // Usar autoTable si está disponible
      if ((doc as any).autoTable) {
        (doc as any).autoTable({
          head: [headers],
          body: tableData,
          startY: 30,
        });
      } else {
        // Tabla básica sin autoTable
        let yPosition = 40;
        
        // Headers
        doc.setFontSize(10);
        headers.forEach((header, index) => {
          doc.text(header, 20 + (index * 30), yPosition);
        });
        
        yPosition += 10;
        
        // Datos
        tableData.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            doc.text(cell, 20 + (cellIndex * 30), yPosition);
          });
          yPosition += 5;
          
          // Nueva página si es necesario
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
    }
    
    doc.save(filename);
  } catch (error) {
    console.error('Error exportando a PDF:', error);
    throw new Error('No se pudo exportar a PDF. Asegúrate de tener las librerías necesarias instaladas.');
  }
};

/**
 * Función auxiliar para descargar archivos
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

/**
 * Exporta tabla HTML a imagen
 */
export const exportTableToImage = async (
  tableElement: HTMLTableElement,
  filename: string = 'table.png',
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  try {
    // Importación dinámica de html2canvas
    const html2canvas = await import('html2canvas');
    
    const canvas = await html2canvas.default(tableElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Para mejor calidad
    });
    
    const dataURL = canvas.toDataURL(`image/${format}`);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exportando tabla a imagen:', error);
    throw new Error('No se pudo exportar la tabla a imagen.');
  }
};

/**
 * Crea un reporte de visitantes en CSV
 */
export const exportVisitorsReport = (
  visitors: any[],
  filename?: string
): void => {
  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Teléfono',
    'Cédula',
    'Fecha de Registro',
    'Evento',
    'Estado'
  ];
  
  const data = visitors.map(visitor => ({
    'ID': visitor.id,
    'Nombre': visitor.name,
    'Email': visitor.email || '',
    'Teléfono': visitor.phone || '',
    'Cédula': visitor.idNumber || '',
    'Fecha de Registro': visitor.registrationDate,
    'Evento': visitor.event || '',
    'Estado': visitor.status || ''
  }));
  
  const reportFilename = filename || `reporte-visitantes-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, reportFilename, headers);
};

/**
 * Crea un reporte de eventos en CSV
 */
export const exportEventsReport = (
  events: any[],
  filename?: string
): void => {
  const headers = [
    'ID',
    'Nombre',
    'Descripción',
    'Fecha',
    'Hora',
    'Ubicación',
    'Capacidad',
    'Registrados',
    'Estado'
  ];
  
  const data = events.map(event => ({
    'ID': event.id,
    'Nombre': event.name,
    'Descripción': event.description || '',
    'Fecha': event.date,
    'Hora': event.time || '',
    'Ubicación': event.location || '',
    'Capacidad': event.capacity || '',
    'Registrados': event.registeredCount || 0,
    'Estado': event.status || ''
  }));
  
  const reportFilename = filename || `reporte-eventos-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, reportFilename, headers);
};

/**
 * Crea un reporte de estadísticas en JSON
 */
export const exportStatsReport = (
  stats: any,
  filename?: string
): void => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    period: stats.period || 'general',
    summary: stats.summary || {},
    details: stats.details || {},
    charts: stats.charts || {}
  };
  
  const reportFilename = filename || `estadisticas-${new Date().toISOString().split('T')[0]}.json`;
  exportToJSON(reportData, reportFilename);
};

/**
 * Valida datos antes de exportar
 */
export const validateExportData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Los datos deben ser un array');
    return { isValid: false, errors };
  }
  
  if (data.length === 0) {
    errors.push('No hay datos para exportar');
    return { isValid: false, errors };
  }
  
  // Verificar que todos los elementos tengan la misma estructura
  const firstItemKeys = Object.keys(data[0]);
  const hasConsistentStructure = data.every(item => {
    const itemKeys = Object.keys(item);
    return firstItemKeys.length === itemKeys.length &&
           firstItemKeys.every(key => itemKeys.includes(key));
  });
  
  if (!hasConsistentStructure) {
    errors.push('Los datos no tienen una estructura consistente');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Obtiene el tipo MIME para un formato de archivo
 */
export const getMimeType = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    'csv': 'text/csv',
    'json': 'application/json',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
  };
  
  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
}; 