import { addDays, addMonths, differenceInDays, differenceInYears, endOfDay, format, isToday, isTomorrow, isValid, isYesterday, parse, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_CONFIG } from '../constants';

/**
 * Formatea una fecha usando el formato por defecto
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_CONFIG.FORMATS.DISPLAY, { locale: es });
};

/**
 * Formatea una fecha y hora
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_CONFIG.FORMATS.DISPLAY_WITH_TIME, { locale: es });
};

/**
 * Formatea solo la hora
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, DATE_CONFIG.FORMATS.TIME_ONLY, { locale: es });
};

/**
 * Parsea una fecha desde string
 */
export const parseDate = (dateString: string, formatString?: string): Date | null => {
  try {
    if (formatString) {
      return parse(dateString, formatString, new Date());
    }
    const date = new Date(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export const calculateAge = (birthDate: Date | string): number => {
  const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (!isValid(dateObj)) return 0;
  
  return differenceInYears(new Date(), dateObj);
};

/**
 * Obtiene el inicio del día
 */
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return startOfDay(dateObj);
};

/**
 * Obtiene el final del día
 */
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return endOfDay(dateObj);
};

/**
 * Verifica si una fecha es hoy
 */
export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday(dateObj);
};

/**
 * Verifica si una fecha fue ayer
 */
export const isDateYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isYesterday(dateObj);
};

/**
 * Verifica si una fecha es mañana
 */
export const isDateTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isTomorrow(dateObj);
};

/**
 * Agrega días a una fecha
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
};

/**
 * Agrega meses a una fecha
 */
export const addMonthsToDate = (date: Date | string, months: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addMonths(dateObj, months);
};

/**
 * Calcula los días entre dos fechas
 */
export const daysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return differenceInDays(end, start);
};

/**
 * Obtiene el nombre del día de la semana
 */
export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE', { locale: es });
};

/**
 * Obtiene el nombre del mes
 */
export const getMonthName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM', { locale: es });
};

/**
 * Verifica si una fecha está en el futuro
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Verifica si una fecha está en el pasado
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Obtiene el rango de fechas de la semana actual
 */
export const getCurrentWeekRange = (): { start: Date; end: Date } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start: startOfDay(start), end: endOfDay(end) };
};

/**
 * Obtiene el rango de fechas del mes actual
 */
export const getCurrentMonthRange = (): { start: Date; end: Date } => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return { start: startOfDay(start), end: endOfDay(end) };
};

/**
 * Convierte una fecha a formato ISO string
 */
export const toISOString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Convierte una fecha a timestamp
 */
export const toTimestamp = (date: Date | string): number => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime();
};

/**
 * Crea una fecha desde timestamp
 */
export const fromTimestamp = (timestamp: number): Date => {
  return new Date(timestamp);
};

/**
 * Obtiene la fecha y hora actual en formato ISO
 */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

/**
 * Verifica si dos fechas son el mismo día
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}; 