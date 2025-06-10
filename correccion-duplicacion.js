// CORRECCIÓN DEFINITIVA PARA DUPLICACIÓN DE EVENTOS
// Ejecuta este archivo en la consola del navegador para aplicar las correcciones

console.log('🔧 APLICANDO CORRECCIÓN PARA DUPLICACIÓN DE EVENTOS...');

// FUNCIÓN CORREGIDA: Registro sin duplicación
const registroSeguro = {
  
  // Verificar si ya está registrado
  yaEstaRegistrado: (eventoId, email) => {
    try {
      const registros = JSON.parse(localStorage.getItem('ccb_registros_usuario') || '[]');
      return registros.some(r => 
        r.eventoId === eventoId && 
        r.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error verificando registro:', error);
      return false;
    }
  },
  
  // Generar código único
  generarCodigo: (eventoId, email) => {
    const timestamp = Date.now();
    const hash = btoa(`${eventoId}-${email}-${timestamp}`).slice(0, 8);
    return `CCB-${hash.toUpperCase()}`;
  },
  
  // Actualizar contador de evento
  actualizarContador: (eventoId, incremento = 1) => {
    try {
      const eventos = JSON.parse(localStorage.getItem('ccb_eventos_mock') || '[]');
      const eventoIndex = eventos.findIndex(e => e.id === eventoId);
      
      if (eventoIndex === -1) return false;
      
      const evento = eventos[eventoIndex];
      const nuevosRegistrados = evento.registrados + incremento;
      
      // Validación de capacidad
      if (nuevosRegistrados > evento.capacidad) {
        console.warn(`⚠️ Evento ${eventoId} alcanzaría capacidad máxima`);
        return false;
      }
      
      // Actualizar
      eventos[eventoIndex] = {
        ...evento,
        registrados: nuevosRegistrados,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('ccb_eventos_mock', JSON.stringify(eventos));
      console.log(`✅ Contador actualizado: ${evento.registrados} → ${nuevosRegistrados}`);
      return true;
      
    } catch (error) {
      console.error('Error actualizando contador:', error);
      return false;
    }
  },
  
  // Registro principal (SIN DUPLICACIÓN)
  registrarEnEvento: (eventoId, email, nombre, telefono, eventoTitulo) => {
    try {
      console.log(`📝 Iniciando registro seguro para evento ${eventoId}`);
      
      // 1. VERIFICAR SI YA ESTÁ REGISTRADO
      if (registroSeguro.yaEstaRegistrado(eventoId, email)) {
        const registros = JSON.parse(localStorage.getItem('ccb_registros_usuario') || '[]');
        const registroExistente = registros.find(r => 
          r.eventoId === eventoId && 
          r.email.toLowerCase() === email.toLowerCase()
        );
        
        console.log('⚠️ Usuario ya registrado');
        return {
          exito: false,
          esRegistroExistente: true,
          codigo: registroExistente.codigo,
          mensaje: `Ya estás registrado. Tu código es: ${registroExistente.codigo}`
        };
      }
      
      // 2. VERIFICAR DISPONIBILIDAD
      const eventos = JSON.parse(localStorage.getItem('ccb_eventos_mock') || '[]');
      const evento = eventos.find(e => e.id === eventoId);
      
      if (!evento) {
        return { exito: false, mensaje: 'Evento no encontrado' };
      }
      
      const cuposDisponibles = evento.capacidad - evento.registrados;
      if (cuposDisponibles <= 0) {
        return { exito: false, mensaje: 'Evento agotado' };
      }
      
      // 3. GENERAR CÓDIGO Y CREAR REGISTRO
      const codigo = registroSeguro.generarCodigo(eventoId, email);
      
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
      
      // 4. GUARDAR REGISTRO
      const registros = JSON.parse(localStorage.getItem('ccb_registros_usuario') || '[]');
      registros.push(nuevoRegistro);
      localStorage.setItem('ccb_registros_usuario', JSON.stringify(registros));
      
      // 5. ACTUALIZAR CONTADOR (CRÍTICO: SOLO UNA VEZ)
      if (!registroSeguro.actualizarContador(eventoId, 1)) {
        // REVERTIR si falla
        registros.pop();
        localStorage.setItem('ccb_registros_usuario', JSON.stringify(registros));
        return { exito: false, mensaje: 'Error actualizando disponibilidad' };
      }
      
      console.log('✅ Registro seguro completado:', codigo);
      
      // 6. SINCRONIZACIÓN OPCIONAL (SIN DUPLICAR)
      setTimeout(() => {
        registroSeguro.sincronizarConSupabase(nuevoRegistro, eventoId);
      }, 1000);
      
      return {
        exito: true,
        codigo,
        mensaje: `¡Registro exitoso! Tu código es: ${codigo}`
      };
      
    } catch (error) {
      console.error('❌ Error en registro seguro:', error);
      return { 
        exito: false, 
        mensaje: 'Error interno. Intenta nuevamente.' 
      };
    }
  },
  
  // Sincronización controlada con Supabase
  sincronizarConSupabase: async (registro, eventoId) => {
    try {
      console.log('🔄 Sincronización controlada con Supabase...');
      
      // Solo sincronizar si hay servicios disponibles
      if (typeof visitantesService === 'undefined') {
        console.log('⚠️ Servicios no disponibles, saltando sincronización');
        return;
      }
      
      // Verificar si el visitante ya existe
      const visitanteExistente = await visitantesService.buscarPorEmail(registro.email);
      
      let visitanteId;
      
      if (visitanteExistente) {
        visitanteId = visitanteExistente.id;
        console.log('✅ Visitante existente encontrado:', visitanteId);
      } else {
        // Crear nuevo visitante
        const nuevoVisitante = await visitantesService.crear({
          nombre: registro.nombre,
          apellido: '',
          email: registro.email,
          telefono: registro.telefono,
          fecha_registro: new Date().toISOString(),
          estado: 'activo'
        });
        
        if (nuevoVisitante) {
          visitanteId = nuevoVisitante.id;
          console.log('✅ Nuevo visitante creado:', visitanteId);
        } else {
          console.log('❌ Error creando visitante');
          return;
        }
      }
      
      // Registrar en evento (sin duplicar)
      await registroEventosService.registrarVisitanteEnEvento(
        visitanteId,
        eventoId,
        registro.codigo
      );
      
      console.log('✅ Sincronización completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    }
  },
  
  // Diagnóstico del sistema
  diagnosticar: () => {
    console.log('📊 DIAGNÓSTICO DEL SISTEMA:');
    
    const eventos = JSON.parse(localStorage.getItem('ccb_eventos_mock') || '[]');
    const registros = JSON.parse(localStorage.getItem('ccb_registros_usuario') || '[]');
    
    console.log(`📅 Eventos en localStorage: ${eventos.length}`);
    console.log(`📝 Registros de usuario: ${registros.length}`);
    
    // Verificar consistencia
    const registrosPorEvento = {};
    registros.forEach(r => {
      registrosPorEvento[r.eventoId] = (registrosPorEvento[r.eventoId] || 0) + 1;
    });
    
    console.log('📊 Registros por evento:');
    Object.entries(registrosPorEvento).forEach(([eventoId, count]) => {
      const evento = eventos.find(e => e.id === eventoId);
      const titulo = evento ? evento.titulo : 'Evento no encontrado';
      console.log(`  ${eventoId}: ${count} registros - "${titulo}"`);
      
      if (evento && evento.registrados !== count) {
        console.warn(`  ⚠️ INCONSISTENCIA: Evento marca ${evento.registrados} pero hay ${count} registros`);
      }
    });
  }
};

// APLICAR CORRECCIÓN GLOBAL
window.registroSeguro = registroSeguro;

// SOBRESCRIBIR FUNCIÓN PROBLEMÁTICA SI EXISTE
if (window.guardarRegistroLocal) {
  console.log('🔧 Sobrescribiendo función problemática...');
  
  window.guardarRegistroLocal = (eventoId, email, nombre, codigo, eventoTitulo) => {
    console.log('⚠️ Función original interceptada, usando registro seguro...');
    return registroSeguro.registrarEnEvento(eventoId, email, nombre, '', eventoTitulo);
  };
}

// DIAGNÓSTICO INICIAL
registroSeguro.diagnosticar();

console.log('✅ CORRECCIÓN APLICADA EXITOSAMENTE');
console.log('');
console.log('📋 FUNCIONES DISPONIBLES:');
console.log('  • window.registroSeguro.registrarEnEvento(eventoId, email, nombre, telefono, titulo)');
console.log('  • window.registroSeguro.yaEstaRegistrado(eventoId, email)');
console.log('  • window.registroSeguro.diagnosticar()');
console.log('');
console.log('💡 PARA USAR EN EL FORMULARIO:');
console.log('  Reemplaza la llamada a guardarRegistroLocal() por:');
console.log('  window.registroSeguro.registrarEnEvento(eventoId, email, nombre, telefono, titulo)');
