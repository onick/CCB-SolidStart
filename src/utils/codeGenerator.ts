// Utilidades para generación de códigos únicos CCB

/**
 * Genera un código único para eventos con formato CCB-XXXXXX
 * @param eventId - ID del evento
 * @param userEmail - Email del usuario
 * @returns Código único con formato CCB-XXXXXX
 */
export const generateEventCode = (eventId: string, userEmail: string): string => {
  // Usar múltiples fuentes de aleatoriedad + contador de intentos
  const ahora = new Date();
  const timestamp = ahora.getTime();
  const milisegundos = ahora.getMilliseconds();
  const random1 = Math.floor(Math.random() * 99999); // Aumentado el rango
  const random2 = Math.floor(Math.random() * 9999);  // Aumentado el rango
  const nanoTime = performance.now(); // Más precisión temporal
  
  // Crear string único combinando TODO
  const cadenaUnica = `${timestamp}-${milisegundos}-${nanoTime}-${random1}-${random2}-${userEmail}-${eventId}`;
  
  // Generar hash más robusto
  let hash = '';
  for (let i = 0; i < cadenaUnica.length; i += 2) {
    hash += cadenaUnica.charCodeAt(i).toString(36);
  }
  
  // Tomar 6 caracteres únicos y añadir timestamp para garantizar unicidad
  const hashCorto = hash.slice(0, 4).toUpperCase();
  const timestampCorto = (timestamp % 100).toString().padStart(2, '0');
  const codigoFinal = `CCB-${hashCorto}${timestampCorto}`;
  
  console.log('🎫 DEBUG - timestamp:', timestamp);
  console.log('🎫 DEBUG - random1:', random1);  
  console.log('🎫 DEBUG - hash generado:', hashCorto);
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

/**
 * Genera un código único garantizado verificando contra la base de datos
 * @param eventId - ID del evento
 * @param userEmail - Email del usuario
 * @param verificarUnicidad - Función para verificar si código existe en BD
 * @returns Promise<string> - Código único garantizado
 */
export const generateUniqueEventCode = async (
  eventId: string, 
  userEmail: string,
  verificarUnicidad: (codigo: string) => Promise<boolean>
): Promise<string> => {
  let intentos = 0;
  const maxIntentos = 10;
  
  while (intentos < maxIntentos) {
    const codigo = generateEventCode(eventId, userEmail);
    
    // Verificar en localStorage Y en base de datos
    const existeLocal = verificarCodigoExistente(codigo);
    const existeBD = await verificarUnicidad(codigo);
    
    if (!existeLocal && !existeBD) {
      console.log(`🎫 Código único generado en intento ${intentos + 1}: ${codigo}`);
      return codigo;
    }
    
    console.log(`⚠️ Código duplicado detectado (intento ${intentos + 1}): ${codigo}`);
    intentos++;
  }
  
  throw new Error(`❌ No se pudo generar código único después de ${maxIntentos} intentos`);
};
