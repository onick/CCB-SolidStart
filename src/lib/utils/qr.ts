import { QR_CODE_CONFIG } from '../constants';

// Tipo para opciones de QR
export interface QROptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Genera un código QR como Data URL
 */
export const generateQRDataURL = async (
  text: string, 
  options: QROptions = {}
): Promise<string> => {
  const {
    size = QR_CODE_CONFIG.SIZE,
    margin = 4,
    color = {
      dark: QR_CODE_CONFIG.FOREGROUND_COLOR,
      light: QR_CODE_CONFIG.BACKGROUND_COLOR,
    },
    errorCorrectionLevel = QR_CODE_CONFIG.ERROR_CORRECTION_LEVEL,
  } = options;

  try {
    // Importación dinámica de qrcode
    const QRCode = await import('qrcode');
    
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      color,
      errorCorrectionLevel,
    });
  } catch (error) {
    console.error('Error generando código QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
};

/**
 * Genera un código QR como SVG string
 */
export const generateQRSVG = async (
  text: string,
  options: QROptions = {}
): Promise<string> => {
  const {
    size = QR_CODE_CONFIG.SIZE,
    margin = 4,
    color = {
      dark: QR_CODE_CONFIG.FOREGROUND_COLOR,
      light: QR_CODE_CONFIG.BACKGROUND_COLOR,
    },
    errorCorrectionLevel = QR_CODE_CONFIG.ERROR_CORRECTION_LEVEL,
  } = options;

  try {
    const QRCode = await import('qrcode');
    
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin,
      color,
      errorCorrectionLevel,
    });
  } catch (error) {
    console.error('Error generando código QR SVG:', error);
    throw new Error('No se pudo generar el código QR SVG');
  }
};

/**
 * Genera un código QR y lo renderiza en un canvas
 */
export const generateQRCanvas = async (
  canvas: HTMLCanvasElement,
  text: string,
  options: QROptions = {}
): Promise<void> => {
  const {
    size = QR_CODE_CONFIG.SIZE,
    margin = 4,
    color = {
      dark: QR_CODE_CONFIG.FOREGROUND_COLOR,
      light: QR_CODE_CONFIG.BACKGROUND_COLOR,
    },
    errorCorrectionLevel = QR_CODE_CONFIG.ERROR_CORRECTION_LEVEL,
  } = options;

  try {
    const QRCode = await import('qrcode');
    
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin,
      color,
      errorCorrectionLevel,
    });
  } catch (error) {
    console.error('Error generando código QR en canvas:', error);
    throw new Error('No se pudo generar el código QR en canvas');
  }
};

/**
 * Descarga un código QR como imagen
 */
export const downloadQR = async (
  text: string,
  filename: string = 'qr-code.png',
  options: QROptions = {}
): Promise<void> => {
  try {
    const dataURL = await generateQRDataURL(text, options);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error descargando código QR:', error);
    throw new Error('No se pudo descargar el código QR');
  }
};

/**
 * Valida si un texto es válido para código QR
 */
export const isValidQRText = (text: string): boolean => {
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  // Límite aproximado de caracteres para QR
  const maxLength = 2953; // Para nivel de corrección L
  
  return text.length <= maxLength;
};

/**
 * Genera texto para QR de información de visitante
 */
export const generateVisitorQRText = (visitor: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  event?: string;
  date: string;
}): string => {
  const qrData = {
    type: 'visitor',
    id: visitor.id,
    name: visitor.name,
    email: visitor.email,
    phone: visitor.phone,
    event: visitor.event,
    date: visitor.date,
    generated: new Date().toISOString(),
  };
  
  return JSON.stringify(qrData);
};

/**
 * Genera texto para QR de evento
 */
export const generateEventQRText = (event: {
  id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
}): string => {
  const qrData = {
    type: 'event',
    id: event.id,
    name: event.name,
    date: event.date,
    location: event.location,
    description: event.description,
    generated: new Date().toISOString(),
  };
  
  return JSON.stringify(qrData);
};

/**
 * Genera texto para QR de URL de check-in
 */
export const generateCheckInQRText = (
  baseURL: string,
  eventId: string,
  additionalParams?: Record<string, string>
): string => {
  const url = new URL(`${baseURL}/check-in/${eventId}`);
  
  if (additionalParams) {
    for (const [key, value] of Object.entries(additionalParams)) {
      url.searchParams.set(key, value);
    }
  }
  
  return url.toString();
};

/**
 * Parsea el contenido de un código QR
 */
export const parseQRContent = (content: string): any => {
  try {
    // Intenta parsear como JSON
    return JSON.parse(content);
  } catch {
    // Si no es JSON, devuelve el texto plano
    return { type: 'text', content };
  }
};

/**
 * Verifica si el contenido QR es de un tipo específico
 */
export const isQRContentType = (content: string, type: string): boolean => {
  try {
    const parsed = parseQRContent(content);
    return parsed.type === type;
  } catch {
    return false;
  }
};

/**
 * Extrae información de visitante de un código QR
 */
export const extractVisitorFromQR = (content: string): any | null => {
  if (!isQRContentType(content, 'visitor')) {
    return null;
  }
  
  try {
    return parseQRContent(content);
  } catch {
    return null;
  }
};

/**
 * Extrae información de evento de un código QR
 */
export const extractEventFromQR = (content: string): any | null => {
  if (!isQRContentType(content, 'event')) {
    return null;
  }
  
  try {
    return parseQRContent(content);
  } catch {
    return null;
  }
}; 