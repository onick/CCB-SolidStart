import { API_CONFIG } from '../constants';

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Configuración por defecto para fetch
const defaultFetchConfig: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Wrapper para fetch con configuración por defecto
 */
const apiFetch = async (
  url: string,
  config: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...defaultFetchConfig,
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Realiza una petición GET
 */
export const get = async <T = any>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<ApiResponse<T>> => {
  try {
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await apiFetch(url, { method: 'GET' });
    const data = await response.json();

    return {
      data: data.data || data,
      success: response.ok,
      status: response.status,
      message: data.message,
      error: response.ok ? undefined : data.error || 'Error en la petición',
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
};

/**
 * Realiza una petición POST
 */
export const post = async <T = any>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
      data: data.data || data,
      success: response.ok,
      status: response.status,
      message: data.message,
      error: response.ok ? undefined : data.error || 'Error en la petición',
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
};

/**
 * Realiza una petición PUT
 */
export const put = async <T = any>(
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
      data: data.data || data,
      success: response.ok,
      status: response.status,
      message: data.message,
      error: response.ok ? undefined : data.error || 'Error en la petición',
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
};

/**
 * Realiza una petición DELETE
 */
export const del = async <T = any>(
  endpoint: string
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    return {
      data: data.data || data,
      success: response.ok,
      status: response.status,
      message: data.message,
      error: response.ok ? undefined : data.error || 'Error en la petición',
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
};

/**
 * Sube un archivo
 */
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalFields?: Record<string, string>
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await apiFetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Permitir que el navegador establezca el Content-Type para FormData
    });

    const data = await response.json();

    return {
      data: data.data || data,
      success: response.ok,
      status: response.status,
      message: data.message,
      error: response.ok ? undefined : data.error || 'Error al subir archivo',
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
};

/**
 * Maneja errores de API de forma centralizada
 */
export const handleApiError = (error: ApiResponse): string => {
  if (error.status === 0) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  if (error.status === 401) {
    return 'No autorizado. Por favor, inicia sesión nuevamente.';
  }
  
  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  if (error.status === 404) {
    return 'Recurso no encontrado.';
  }
  
  if (error.status === 422) {
    return 'Datos inválidos. Verifica la información enviada.';
  }
  
  if (error.status >= 500) {
    return 'Error del servidor. Intenta nuevamente más tarde.';
  }
  
  return error.error || 'Error desconocido';
};

/**
 * Añade el token de autenticación a las cabeceras
 */
export const setAuthToken = (token: string): void => {
  defaultFetchConfig.headers = {
    ...defaultFetchConfig.headers,
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Remueve el token de autenticación
 */
export const clearAuthToken = (): void => {
  const { Authorization, ...headers } = defaultFetchConfig.headers as any;
  defaultFetchConfig.headers = headers;
};

/**
 * Verifica si hay conexión a internet
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
}; 