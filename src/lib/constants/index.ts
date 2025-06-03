// =============================================================================
// CONSTANTES DE LA APLICACIÓN
// =============================================================================

export const APP_CONFIG = {
  NAME: 'CCB - Centro Cultural Banreservas',
  VERSION: '2.0.0',
  DESCRIPTION: 'Sistema de Registro de Visitantes',
  AUTHOR: 'Centro Cultural Banreservas',
} as const;

// =============================================================================
// RUTAS DE LA APLICACIÓN
// =============================================================================

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  EVENTS: '/eventos',
  VISITORS: '/visitantes',
  ANALYTICS: '/analytics',
  SETTINGS: '/configuracion',
  LOGIN: '/login',
  REGISTER: '/registro',
} as const;

// =============================================================================
// CONFIGURACIÓN DE API
// =============================================================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Visitantes
  VISITORS: {
    BASE: '/visitors',
    CHECK_IN: '/visitors/check-in',
    CHECK_OUT: '/visitors/check-out',
    SEARCH: '/visitors/search',
    EXPORT: '/visitors/export',
    STATISTICS: '/visitors/statistics',
  },
  
  // Eventos
  EVENTS: {
    BASE: '/events',
    PUBLISHED: '/events/published',
    CATEGORIES: '/events/categories',
    ATTENDEES: '/events/:id/attendees',
    REGISTER: '/events/:id/register',
    CANCEL: '/events/:id/cancel',
  },
  
  // Analíticas
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    VISITORS: '/analytics/visitors',
    EVENTS: '/analytics/events',
    REPORTS: '/analytics/reports',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE UI
// =============================================================================

export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#2563eb',
    SECONDARY_COLOR: '#7c3aed',
    SUCCESS_COLOR: '#16a34a',
    WARNING_COLOR: '#ea580c',
    ERROR_COLOR: '#dc2626',
    INFO_COLOR: '#0891b2',
  },
  
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  ANIMATION: {
    DURATION: {
      FAST: '150ms',
      NORMAL: '300ms',
      SLOW: '500ms',
    },
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE FORMULARIOS
// =============================================================================

export const FORM_CONFIG = {
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_TEXT_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 1000,
    ID_NUMBER_REGEX: /^[0-9]{11}$/, // Cédula dominicana
    PHONE_REGEX: /^[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  PLACEHOLDERS: {
    FIRST_NAME: 'Ingrese su nombre',
    LAST_NAME: 'Ingrese su apellido',
    EMAIL: 'ejemplo@email.com',
    PHONE: '809-000-0000',
    ID_NUMBER: '00000000000',
    NOTES: 'Comentarios adicionales (opcional)',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE FECHAS
// =============================================================================

export const DATE_CONFIG = {
  FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    TIME_ONLY: 'HH:mm',
    MONTH_YEAR: 'MM/yyyy',
  },
  
  LOCALE: 'es-DO', // Español Dominicano
  
  TIMEZONE: 'America/Santo_Domingo',
} as const;

// =============================================================================
// CONFIGURACIÓN DE PAGINACIÓN
// =============================================================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const;

// =============================================================================
// CONFIGURACIÓN DE ARCHIVOS
// =============================================================================

export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  UPLOAD_PATH: '/uploads',
} as const;

// =============================================================================
// MENSAJES DEL SISTEMA
// =============================================================================

export const MESSAGES = {
  SUCCESS: {
    VISITOR_CHECKED_IN: 'Visitante registrado exitosamente',
    VISITOR_CHECKED_OUT: 'Visitante dado de baja exitosamente',
    EVENT_CREATED: 'Evento creado exitosamente',
    EVENT_UPDATED: 'Evento actualizado exitosamente',
    EVENT_DELETED: 'Evento eliminado exitosamente',
    DATA_EXPORTED: 'Datos exportados exitosamente',
    SETTINGS_SAVED: 'Configuración guardada exitosamente',
  },
  
  ERROR: {
    GENERAL: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifique su conexión a internet',
    UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    VALIDATION: 'Los datos ingresados no son válidos',
    DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
    FILE_TOO_LARGE: 'El archivo es demasiado grande',
    INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  },
  
  WARNING: {
    UNSAVED_CHANGES: 'Tiene cambios sin guardar. ¿Está seguro que desea salir?',
    DELETE_CONFIRMATION: '¿Está seguro que desea eliminar este elemento?',
    DATA_LOSS: 'Esta acción no se puede deshacer',
  },
  
  INFO: {
    LOADING: 'Cargando...',
    NO_DATA: 'No hay datos disponibles',
    SEARCH_NO_RESULTS: 'No se encontraron resultados para su búsqueda',
    EMPTY_STATE: 'Aún no hay elementos aquí',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE QR CODES
// =============================================================================

export const QR_CONFIG = {
  SIZE: 200,
  ERROR_CORRECTION_LEVEL: 'M',
  MARGIN: 4,
  COLOR: {
    DARK: '#000000',
    LIGHT: '#FFFFFF',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// =============================================================================

export const NOTIFICATION_CONFIG = {
  TIMEOUT: {
    SUCCESS: 3000,
    INFO: 5000,
    WARNING: 7000,
    ERROR: 10000,
  },
  
  POSITION: 'top-right',
  MAX_NOTIFICATIONS: 5,
} as const;

// =============================================================================
// CONFIGURACIÓN DE ANALYTICS
// =============================================================================

export const ANALYTICS_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 segundos
  
  CHARTS: {
    COLORS: [
      '#2563eb', '#7c3aed', '#16a34a', '#ea580c',
      '#dc2626', '#0891b2', '#7c2d12', '#1e40af',
    ],
    ANIMATION_DURATION: 750,
  },
  
  DATE_RANGES: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    THIS_MONTH: 'this_month',
    LAST_MONTH: 'last_month',
    CUSTOM: 'custom',
  },
} as const;

// =============================================================================
// CONFIGURACIÓN DE LOCALIZACIÓN
// =============================================================================

export const LOCALIZATION = {
  CURRENCY: 'DOP', // Peso Dominicano
  COUNTRY: 'DO', // República Dominicana
  LANGUAGE: 'es', // Español
  
  DAYS_OF_WEEK: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 
    'Jueves', 'Viernes', 'Sábado'
  ],
  
  MONTHS: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
} as const;

// =============================================================================
// CONFIGURACIÓN DE ESTADO GLOBAL
// =============================================================================

export const STORE_KEYS = {
  AUTH: 'auth',
  VISITORS: 'visitors',
  EVENTS: 'events',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
} as const;

// =============================================================================
// CONFIGURACIÓN DE CACHÉ
// =============================================================================

export const CACHE_CONFIG = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutos
    MEDIUM: 30 * 60 * 1000, // 30 minutos
    LONG: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  KEYS: {
    USER_PREFERENCES: 'user_preferences',
    ANALYTICS_DATA: 'analytics_data',
    EVENT_CATEGORIES: 'event_categories',
  },
} as const; 