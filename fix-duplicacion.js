// PARCHE PARA CORREGIR DUPLICACIÓN DE EVENTOS
// Este archivo contiene las correcciones necesarias

console.log('🔧 Aplicando correcciones para prevenir duplicación de eventos...');

// PROBLEMA 1: Función faltante actualizarContadorRegistrados
// SOLUCIÓN: Crear la función que falta

const actualizarContadorEventoLocal = (eventoId, incremento = 1) => {
  try {
    // Obtener eventos desde localStorage
    const eventosGuardados = localStorage.getItem('ccb_eventos_mock');
    if (!eventosGuardados) {
      console.warn(`⚠️ No hay eventos en localStorage`);
      return false;
    }
    
    const eventos = JSON.parse(eventosGuardados);
    const eventoIndex = eventos.findIndex(e => e.id === eventoId);
    
    if (eventoIndex === -1) {
      console.warn(`⚠️ Evento ${eventoId} no encontrado para actualizar contador`);
      return false;
    }
    
    const evento = eventos[eventoIndex];
    const nuevosRegistrados = evento.registrados + incremento;
    
    // Validaciones de seguridad
    if (incremento > 0 && nuevosRegistrados > evento.capacidad) {
      console.warn(`❌ No se puede registrar: evento ${eventoId} alcanzaría capacidad máxima (${evento.capacidad})`);
      return false;
    }
    
    if (nuevosRegistrados < 0) {
      console.warn(`❌ Registrados no puede ser negativo`);
      return false;
    }
    
    // Actualizar contador
    eventos[eventoIndex] = {
      ...evento,
      registrados: nuevosRegistrados,
      updated_at: new Date().toISOString()
    };
    
    // Guardar cambios en localStorage
    localStorage.setItem('ccb_eventos_mock', JSON.stringify(eventos));
    
    console.log(`✅ Contador actualizado: ${evento.registrados} → ${nuevosRegistrados} para evento ${eventoId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error actualizando contador para evento ${eventoId}:`, error);
    return false;
  }
};

// PROBLEMA 2: Validación de duplicados mejorada
const validarRegistroUnico = (eventoId, email) => {
  try {
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    if (!registrosGuardados) return true; // No hay registros previos
    
    const registros = JSON.parse(registrosGuardados);
    const registroExistente = registros.find(r => 
      r.eventoId === eventoId && 
      r.email.toLowerCase() === email.toLowerCase()
    );
    
    if (registroExistente) {
      console.log(`⚠️ Usuario ${email} ya está registrado en evento ${eventoId}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error validando registro único:', error);
    return true; // En caso de error, permitir el registro
  }
};

// PROBLEMA 3: Función de sincronización mejorada (evita crear duplicados)
const sincronizarConSupabaseSinDuplicar = async (registro, eventoId) => {
  try {
    console.log('🔄 Sincronizando registro con Supabase (sin duplicar)...', registro);
    
    // Verificar si el visitante ya existe en Supabase por email
    const visitanteExistente = await visitantesService.buscarPorEmail(registro.email);
    
    let visitanteId;
    
    if (visitanteExistente) {
      console.log('✅ Visitante ya existe en Supabase:', visitanteExistente.id);
      visitanteId = visitanteExistente.id;
    } else {
      // Crear nuevo visitante solo si no existe
      const visitanteData = {
        nombre: registro.nombre,
        apellido: '', 
        email: registro.email,
        telefono: registro.telefono || '',
        fecha_registro: new Date().toISOString(),
        estado: 'activo'
      };
      
      const visitanteCreado = await visitantesService.crear(visitanteData);
      if (!visitanteCreado) {
        console.error('❌ No se pudo crear visitante en Supabase');
        return false;
      }
      
      console.log('✅ Nuevo visitante creado en Supabase:', visitanteCreado.id);
      visitanteId = visitanteCreado.id;
    }
    
    // Verificar si ya existe un registro para este evento y visitante
    const registrosExistentes = await registroEventosService.obtenerRegistrosPorEvento(eventoId);
    const registroEventoExistente = registrosExistentes.find(r => 
      r.visitante_id === visitanteId || 
      (r.visitantes && r.visitantes.email.toLowerCase() === registro.email.toLowerCase())
    );
    
    if (registroEventoExistente) {
      console.log('⚠️ Ya existe un registro para este visitante en este evento');
      return true; // No es error, simplemente ya existe
    }
    
    // Crear registro en evento si no existe
    await registroEventosService.registrarVisitanteEnEvento(
      visitanteId,
      eventoId,
      registro.codigo
    );
    
    console.log('✅ Registro sincronizado exitosamente con Supabase');
    return true;
    
  } catch (error) {
    console.error('❌ Error sincronizando con Supabase:', error);
    return false;
  }
};

// PROBLEMA 4: Función de registro mejorada sin duplicación
const registrarEnEventoSinDuplicar = (eventoId, email, nombre, telefono, eventoTitulo) => {
  try {
    // 1. Validar que no esté duplicado
    if (!validarRegistroUnico(eventoId, email)) {
      throw new Error('Ya estás registrado en este evento');
    }
    
    // 2. Verificar disponibilidad de cupos
    const eventosGuardados = localStorage.getItem('ccb_eventos_mock');
    if (!eventosGuardados) {
      throw new Error('No se pudo verificar disponibilidad del evento');
    }
    
    const eventos = JSON.parse(eventosGuardados);
    const evento = eventos.find(e => e.id === eventoId);
    
    if (!evento) {
      throw new Error('Evento no encontrado');
    }
    
    const cuposDisponibles = evento.capacidad - evento.registrados;
    if (cuposDisponibles <= 0) {
      throw new Error('Este evento ya no tiene cupos disponibles');
    }
    
    // 3. Generar código único
    const codigo = `CCB-${btoa(`${eventoId}-${email}-${Date.now()}`).slice(0, 8).toUpperCase()}`;
    
    // 4. Crear registro local
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    let registros = registrosGuardados ? JSON.parse(registrosGuardados) : [];
    
    const nuevoRegistro = {
      eventoId,
      email: email.toLowerCase(),
      nombre,
      telefono: telefono || '',
      codigo,
      eventoTitulo,
      fechaRegistro: new Date().toISOString(),
      estado: 'confirmado'
    };
    
    registros.push(nuevoRegistro);
    localStorage.setItem('ccb_registros_usuario', JSON.stringify(registros));
    
    // 5. Actualizar contador del evento
    if (!actualizarContadorEventoLocal(eventoId, 1)) {
      // Revertir el registro si falla la actualización del contador
      registros.pop();
      localStorage.setItem('ccb_registros_usuario', JSON.stringify(registros));
      throw new Error('Error actualizando la disponibilidad del evento');
    }
    
    console.log('✅ Registro local exitoso:', codigo);
    
    // 6. Sincronizar con Supabase en background (sin bloquear UI)
    setTimeout(() => {
      sincronizarConSupabaseSinDuplicar(nuevoRegistro, eventoId);
    }, 100);
    
    return {
      exito: true,
      codigo,
      mensaje: `Registro exitoso. Tu código es: ${codigo}`
    };
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return {
      exito: false,
      mensaje: error.message
    };
  }
};

// Exportar funciones para uso global
window.registrarEnEventoSinDuplicar = registrarEnEventoSinDuplicar;
window.actualizarContadorEventoLocal = actualizarContadorEventoLocal;
window.validarRegistroUnico = validarRegistroUnico;

console.log('✅ Correcciones aplicadas exitosamente');
console.log('🔧 Funciones disponibles:');
console.log('  - window.registrarEnEventoSinDuplicar()');
console.log('  - window.actualizarContadorEventoLocal()');
console.log('  - window.validarRegistroUnico()');
