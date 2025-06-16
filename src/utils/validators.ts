// Utilidades de validación para formularios del CCB

import type { FormularioRegistro } from '../types/eventos';

/**
 * Valida los datos del formulario de registro
 * @param data - Datos del formulario
 * @returns boolean - true si el formulario es válido
 */
export const validarFormulario = (data: FormularioRegistro): boolean => {
  return data.nombre.trim() !== '' && 
         data.email.trim() !== '' && 
         data.email.includes('@') &&
         data.telefono.trim() !== '';
};

/**
 * Valida el formato de email
 * @param email - Email a validar
 * @returns boolean - true si el email es válido
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida el formato de teléfono (República Dominicana)
 * @param telefono - Teléfono a validar
 * @returns boolean - true si el teléfono es válido
 */
export const validarTelefono = (telefono: string): boolean => {
  // Remover espacios, guiones y paréntesis
  const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  
  // Validar que tenga al menos 10 dígitos (formato dominicano)
  return telefonoLimpio.length >= 10 && /^\d+$/.test(telefonoLimpio);
};

/**
 * Valida un código CCB
 * @param codigo - Código a validar
 * @returns boolean - true si el código tiene formato válido
 */
export const validarCodigoCCB = (codigo: string): boolean => {
  return codigo.trim() !== '' && codigo.includes('CCB-') && codigo.length >= 8;
};

/**
 * Normaliza un teléfono removiendo caracteres no numéricos
 * @param telefono - Teléfono a normalizar
 * @returns string - Teléfono normalizado
 */
export const normalizarTelefono = (telefono: string): string => {
  return telefono.replace(/[\s\-\(\)]/g, '');
};

/**
 * Normaliza un email convirtiéndolo a minúsculas y removiendo espacios
 * @param email - Email a normalizar
 * @returns string - Email normalizado
 */
export const normalizarEmail = (email: string): string => {
  return email.toLowerCase().trim();
};
