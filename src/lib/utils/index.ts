// Exportar utilidades básicas que funcionan sin dependencias externas
export * from './dates';
export * from './formatters';
export * from './storage';
export * from './validators';

// Exportar funciones básicas de API y analytics
export * from './analytics';
export * from './api';

// Utilidades de exportación básicas (sin dependencias externas)
export {
    exportEventsReport,
    exportStatsReport, exportToCSV,
    exportToJSON,
    exportVisitorsReport, getMimeType, validateExportData
} from './exports';

// Utilidades básicas de QR (las funciones que usan import dinámico)
export {
    extractEventFromQR, extractVisitorFromQR, generateCheckInQRText, generateEventQRText, generateVisitorQRText, isQRContentType, isValidQRText, parseQRContent
} from './qr';

