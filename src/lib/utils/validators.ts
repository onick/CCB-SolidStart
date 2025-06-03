import { FORM_CONFIG } from '../constants';

/**
 * Valida un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida una cédula dominicana
 */
export const validateCedula = (cedula: string): boolean => {
  const cleaned = cedula.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Algoritmo de validación de cédula dominicana
  const digits = cleaned.split('').map(Number);
  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let product = digits[i] * multipliers[i];
    if (product > 9) product = Math.floor(product / 10) + (product % 10);
    sum += product;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[10];
};

/**
 * Valida un teléfono dominicano
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Teléfono dominicano: 10 dígitos, empezando con 8 o 9
  if (cleaned.length !== 10) return false;
  
  const firstDigit = cleaned.charAt(0);
  return firstDigit === '8' || firstDigit === '9';
};

/**
 * Valida la fortaleza de una contraseña
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < FORM_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
    errors.push(`Debe tener al menos ${FORM_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un nombre (solo letras y espacios)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2;
};

/**
 * Valida una edad
 */
export const validateAge = (age: number): boolean => {
  return age >= 0 && age <= 120;
};

/**
 * Valida una fecha de nacimiento
 */
export const validateBirthDate = (birthDate: Date): boolean => {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  
  return birthDate >= minDate && birthDate <= today;
};

/**
 * Valida un número de identificación (cédula o pasaporte)
 */
export const validateIdentification = (id: string, type: 'cedula' | 'pasaporte'): boolean => {
  if (type === 'cedula') {
    return validateCedula(id);
  }
  
  // Validación básica para pasaporte (alfanumérico, 6-20 caracteres)
  const passportRegex = /^[A-Z0-9]{6,20}$/;
  return passportRegex.test(id.toUpperCase());
};

/**
 * Valida una URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida un código postal dominicano
 */
export const validatePostalCode = (code: string): boolean => {
  // Código postal dominicano: 5 dígitos
  const postalRegex = /^\d{5}$/;
  return postalRegex.test(code);
};

/**
 * Valida un RNC (Registro Nacional del Contribuyente)
 */
export const validateRNC = (rnc: string): boolean => {
  const cleaned = rnc.replace(/\D/g, '');
  
  if (cleaned.length !== 9) return false;
  
  // Algoritmo de validación de RNC
  const digits = cleaned.split('').map(Number);
  const multipliers = [7, 9, 8, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * multipliers[i];
  }
  
  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  
  if (checkDigit === 10) checkDigit = 1;
  if (checkDigit === 11) checkDigit = 0;
  
  return checkDigit === digits[8];
};

/**
 * Valida que un string no esté vacío después de trim
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida la longitud mínima de un string
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Valida la longitud máxima de un string
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Valida que un número esté dentro de un rango
 */
export const validateNumberRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida que una fecha esté dentro de un rango
 */
export const validateDateRange = (date: Date, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

/**
 * Valida el formato de un archivo
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  for (let i = 0; i < allowedTypes.length; i++) {
    if (allowedTypes[i] === file.type) {
      return true;
    }
  }
  return false;
};

/**
 * Valida el tamaño de un archivo
 */
export const validateFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
}; 