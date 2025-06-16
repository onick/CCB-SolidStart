// Utilidades para generación de códigos únicos CCB

/**
 * Genera un código único para eventos con formato CCB-XXXXXX
 * @param eventId - ID del evento
 * @param userEmail - Email del usuario
 * @returns Código único con formato CCB-XXXXXX
 */
export const generateEventCode = (eventId: string, userEmail: string): string => {
  // Usar múltiples fuentes de aleatoriedad
  const ahora = new Date();
  const timestamp = ahora.getTime();
  const milisegundos = ahora.getMilliseconds();
  const random1 = Math.floor(Math.random() * 9999);
  const random2 = Math.floor(Math.random() * 999);
  
  // Crear string único combinando todo
  const cadenaUnica = `${timestamp}-${milisegundos}-${random1}-${random2}-${userEmail}`;
  
  // Generar hash corto
  let hash = '';
  for (let i = 0; i < cadenaUnica.length; i += 3) {
    hash += cadenaUnica.charCodeAt(i).toString(36);
  }
  
  // Tomar solo 6 caracteres y asegurar que sean únicos
  const codigoFinal = `CCB-${hash.slice(0, 6).toUpperCase()}`;
  
  console.log('🎫 DEBUG - timestamp:', timestamp);
  console.log('🎫 DEBUG - random1:', random1);  
  console.log('🎫 DEBUG - hash generado:', hash.slice(0, 6));
  console.log('🎫 CÓDIGO FINAL:', codigoFinal);
  
  return codigoFinal;
};

/**
 * Verifica si un código ya existe en los registros locales
 * @param codigo - Código a verificar
 * @returns boolean - true si el código ya existe
 */
export const verificarCodigoExistente = (codigo: string): boolean => {
  const registros = localStorage.getItem('ccb_registros_usuario');
  if (!registros) return false;
  
  try {
    const registrosArray = JSON.parse(registros);
    return registrosArray.some((registro: any) => registro.codigo === codigo);
  } catch (error) {
    console.error('Error verificando código existente:', error);
    return false;
  }
};
