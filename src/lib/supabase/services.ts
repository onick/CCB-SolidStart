import { Evento, RegistroEvento, supabase, Visitante } from './client';
import { mockEstadisticas } from './mock-data';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Verificar si las credenciales están configuradas correctamente
  const configured = url && key && 
    !url.includes('tu-proyecto') && 
    !key.includes('tu-anon-key');
  
  if (configured) {
    console.log('🚀 CONECTANDO A SUPABASE - Base de datos en producción');
    return true;
  } else {
    console.log('🏠 TRABAJANDO CON DATOS LOCALES - Desarrollo y pruebas');
    return false;
  }
};

// Datos mock para eventos cuando Supabase no está configurado
const mockEventos: Evento[] = [
  {
    id: '1',
    titulo: "Concierto de Jazz Contemporáneo",
    descripcion: "Una noche única con los mejores exponentes del jazz contemporáneo dominicano",
    categoria: "concierto",
    fecha: "2024-12-20",
    hora: "20:00",
    duracion: 3,
    ubicacion: "Auditorio Principal",
    capacidad: 300,
    registrados: 245,
    precio: 1500,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    titulo: "Exposición: Arte Digital Dominicano",
    descripcion: "Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías",
    categoria: "exposicion",
    fecha: "2024-12-15",
    hora: "18:00",
    duracion: 4,
    ubicacion: "Galería Norte",
    capacidad: 150,
    registrados: 89,
    precio: 800,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    titulo: "Obra de Teatro: El Quijote Caribeño",
    descripcion: "Adaptación moderna del clásico de Cervantes ambientada en el Caribe dominicano",
    categoria: "teatro",
    fecha: "2024-12-22",
    hora: "19:30",
    duracion: 2.5,
    ubicacion: "Teatro Principal",
    capacidad: 200,
    registrados: 156,
    precio: 1200,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    titulo: "Taller de Cerámica Taína",
    descripcion: "Aprende las técnicas ancestrales de cerámica de nuestros pueblos originarios",
    categoria: "taller",
    fecha: "2024-12-18",
    hora: "14:00",
    duracion: 3,
    ubicacion: "Aula de Arte",
    capacidad: 25,
    registrados: 25, // Evento AGOTADO para demostrar funcionalidad
    precio: 500,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    titulo: "Festival de Danza Folklórica",
    descripcion: "Celebración de las tradiciones dancísticas dominicanas con grupos de todo el país",
    categoria: "concierto",
    fecha: "2024-12-28",
    hora: "17:00",
    duracion: 4,
    ubicacion: "Plaza Central",
    capacidad: 500,
    registrados: 234,
    precio: 0,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    titulo: "Conferencia: Tecnología y Arte",
    descripcion: "Mesa redonda sobre el impacto de la tecnología en las expresiones artísticas contemporáneas",
    categoria: "conferencia",
    fecha: "2024-12-25",
    hora: "16:00",
    duracion: 2,
    ubicacion: "Sala de Conferencias",
    capacidad: 50,
    registrados: 47, // Últimos 3 cupos para demostrar funcionalidad
    precio: 300,
    imagen: "",
    estado: 'activo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-7',
    titulo: "🎸 Evento de Prueba LOCAL",
    descripcion: "Evento creado para probar que los eventos del panel admin aparecen en eventos públicos",
    categoria: "concierto",
    fecha: "2025-06-15",
    hora: "19:00",
    duracion: 3,
    ubicacion: "Auditorio Test",
    capacidad: 100,
    registrados: 0,
    precio: 750,
    imagen: "",
    estado: 'proximo' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Variable para almacenar eventos mock dinámicos
let eventosMockDinamicos: Evento[] = [...mockEventos];

// Función para cargar eventos desde localStorage
const cargarEventosDelStorage = (): Evento[] => {
  try {
    const eventosGuardados = localStorage.getItem('ccb_eventos_mock');
    if (eventosGuardados) {
      const eventosParsed = JSON.parse(eventosGuardados);
      console.log('📦 Eventos cargados desde localStorage:', eventosParsed.length);
      return eventosParsed;
    }
  } catch (error) {
    console.error('❌ Error cargando eventos del storage:', error);
  }
  console.log('🔄 Usando eventos mock por defecto');
  return [...mockEventos];
};

// Función para guardar eventos en localStorage
const guardarEventosEnStorage = (eventos: Evento[]) => {
  try {
    localStorage.setItem('ccb_eventos_mock', JSON.stringify(eventos));
    console.log('💾 Eventos guardados en localStorage:', eventos.length);
  } catch (error) {
    console.error('❌ Error guardando eventos en storage:', error);
  }
};

// Inicializar eventos desde localStorage
eventosMockDinamicos = cargarEventosDelStorage();

// =============================================
// FUNCIONES AUXILIARES PARA MANEJO DE CUPOS
// =============================================

// Verificar si un evento tiene cupos disponibles
const verificarDisponibilidad = (eventoId: string): { disponible: boolean; cuposLibres: number; capacidad: number; registrados: number } => {
  const evento = eventosMockDinamicos.find(e => e.id === eventoId);
  if (!evento) {
    return { disponible: false, cuposLibres: 0, capacidad: 0, registrados: 0 };
  }
  
  const cuposLibres = evento.capacidad - evento.registrados;
  return {
    disponible: cuposLibres > 0,
    cuposLibres: Math.max(0, cuposLibres),
    capacidad: evento.capacidad,
    registrados: evento.registrados
  };
};

// Actualizar contador de registrados para un evento
const actualizarContadorRegistrados = (eventoId: string, incremento: number = 1): boolean => {
  const eventoIndex = eventosMockDinamicos.findIndex(e => e.id === eventoId);
  if (eventoIndex === -1) return false;
  
  const evento = eventosMockDinamicos[eventoIndex];
  const nuevosRegistrados = evento.registrados + incremento;
  
  // Validar que no exceda la capacidad (a menos que sea un decremento)
  if (incremento > 0 && nuevosRegistrados > evento.capacidad) {
    console.warn(`⚠️ No se puede registrar: evento ${eventoId} alcanzó su capacidad máxima`);
    return false;
  }
  
  // Validar que no sea negativo
  if (nuevosRegistrados < 0) {
    console.warn(`⚠️ No se puede decrementar: registrados no puede ser negativo`);
    return false;
  }
  
  // Actualizar el contador
  eventosMockDinamicos[eventoIndex] = {
    ...evento,
    registrados: nuevosRegistrados,
    updated_at: new Date().toISOString()
  };
  
  // Guardar en localStorage
  guardarEventosEnStorage(eventosMockDinamicos);
  
  console.log(`✅ Contador actualizado para evento ${eventoId}: ${evento.registrados} -> ${nuevosRegistrados}`);
  return true;
};

// Determinar estado dinámico del evento (incluyendo "agotado")
const determinarEstadoEvento = (evento: Evento): 'activo' | 'proximo' | 'completado' | 'agotado' => {
  // Primero verificar si está agotado
  if (evento.registrados >= evento.capacidad) {
    return 'agotado';
  }
  
  // Luego verificar estados temporales
  const fechaEvento = new Date(`${evento.fecha} ${evento.hora}`);
  const ahora = new Date();
  const fechaFin = new Date(fechaEvento.getTime() + evento.duracion * 60 * 60 * 1000);
  
  if (ahora < fechaEvento) return 'proximo';
  if (ahora > fechaFin) return 'completado';
  return 'activo';
};

// =============================================
// SERVICIOS DE VISITANTES
// =============================================

export const visitantesService = {
  async obtenerTodos(): Promise<Visitante[]> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo visitantes:', error);
      return [];
    }
    
    return data || [];
  },

  async crear(visitante: Omit<Visitante, 'id' | 'created_at' | 'updated_at'>): Promise<Visitante | null> {
    const { data, error } = await supabase
      .from('visitantes')
      .insert([{
        ...visitante,
        fecha_registro: new Date().toISOString(),
        estado: 'activo'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creando visitante:', error);
      return null;
    }
    
    return data;
  },

  async buscarPorEmail(email: string): Promise<Visitante | null> {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error buscando visitante:', error);
      return null;
    }
    
    return data;
  },

  async obtenerEstadisticas() {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Usando datos mock para estadísticas de visitantes');
      return mockEstadisticas.visitantes;
    }

    const { data, error } = await supabase
      .from('visitantes')
      .select('id, fecha_registro, estado');
    
    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      console.log('🧪 Fallback a datos mock debido a error');
      return mockEstadisticas.visitantes;
    }

    const hoy = new Date().toDateString();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - 7);

    return {
      total: data.length,
      activos: data.filter(v => v.estado === 'activo').length,
      hoy: data.filter(v => new Date(v.fecha_registro).toDateString() === hoy).length,
      estaSemana: data.filter(v => new Date(v.fecha_registro) >= inicioSemana).length
    };
  }
};

// =============================================
// SERVICIOS DE EVENTOS
// =============================================

export const eventosService = {
  async obtenerTodos(): Promise<Evento[]> {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Usando datos mock para eventos (Supabase no configurado)');
      
      // Enriquecer eventos con información de disponibilidad
      const eventosEnriquecidos = eventosMockDinamicos.map(evento => {
        const disponibilidad = verificarDisponibilidad(evento.id);
        const estadoDinamico = determinarEstadoEvento(evento);
        
        return {
          ...evento,
          // Agregar campos de disponibilidad
          cupos_disponibles: disponibilidad.cuposLibres,
          capacidad_maxima: disponibilidad.capacidad,
          esta_lleno: !disponibilidad.disponible,
          estado_dinamico: estadoDinamico,
          // Mantener el estado original también
          estado_original: evento.estado
        };
      });
      
      return eventosEnriquecidos;
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo eventos:', error);
      console.log('🧪 Fallback a datos mock debido a error');
      
      // En caso de error, también devolver datos enriquecidos
      const eventosEnriquecidos = eventosMockDinamicos.map(evento => {
        const disponibilidad = verificarDisponibilidad(evento.id);
        const estadoDinamico = determinarEstadoEvento(evento);
        
        return {
          ...evento,
          cupos_disponibles: disponibilidad.cuposLibres,
          capacidad_maxima: disponibilidad.capacidad,
          esta_lleno: !disponibilidad.disponible,
          estado_dinamico: estadoDinamico,
          estado_original: evento.estado
        };
      });
      
      return eventosEnriquecidos;
    }
    
    // Para datos reales de Supabase, también enriquecer si es necesario
    return data || [];
  },

  async obtenerPorId(id: string): Promise<Evento | null> {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Usando datos mock para evento por ID');
      return eventosMockDinamicos.find(evento => evento.id === id) || null;
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error obteniendo evento:', error);
      return eventosMockDinamicos.find(evento => evento.id === id) || null;
    }
    
    return data;
  },

  async crear(evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>): Promise<Evento | null> {
    // Si Supabase no está configurado, simular creación en mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Simulando creación de evento en datos mock');
      const nuevoEvento: Evento = {
        ...evento,
        id: (eventosMockDinamicos.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      eventosMockDinamicos.push(nuevoEvento);
      guardarEventosEnStorage(eventosMockDinamicos); // 💾 Guardar en localStorage
      console.log('✅ Evento mock creado y guardado:', nuevoEvento.titulo);
      return nuevoEvento;
    }

    const { data, error } = await supabase
      .from('eventos')
      .insert([evento])
      .select()
      .single();
    
    if (error) {
      console.error('Error creando evento:', error);
      // Fallback a mock en caso de error
      const nuevoEvento: Evento = {
        ...evento,
        id: (eventosMockDinamicos.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      eventosMockDinamicos.push(nuevoEvento);
      return nuevoEvento;
    }
    
    return data;
  },

  async actualizar(id: string, evento: Partial<Evento>): Promise<Evento | null> {
    // Si Supabase no está configurado, simular actualización en mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Simulando actualización de evento en datos mock');
      const index = eventosMockDinamicos.findIndex(e => e.id === id);
      if (index !== -1) {
        eventosMockDinamicos[index] = {
          ...eventosMockDinamicos[index],
          ...evento,
          updated_at: new Date().toISOString()
        };
        guardarEventosEnStorage(eventosMockDinamicos); // 💾 Guardar en localStorage
        console.log('✅ Evento mock actualizado y guardado:', eventosMockDinamicos[index].titulo);
        return eventosMockDinamicos[index];
      }
      return null;
    }

    const { data, error } = await supabase
      .from('eventos')
      .update({
        ...evento,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error actualizando evento:', error);
      return null;
    }
    
    return data;
  },

  // Actualizar la capacidad de un evento y validar registros existentes
  async actualizarCapacidad(eventoId: string, nuevaCapacidad: number): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log(`🧪 Actualizando capacidad mock para evento ${eventoId}: ${nuevaCapacidad}`);
      
      const eventoIndex = eventosMockDinamicos.findIndex(e => e.id === eventoId);
      if (eventoIndex === -1) {
        console.warn(`⚠️ Evento ${eventoId} no encontrado para actualizar capacidad`);
        return false;
      }
      
      const evento = eventosMockDinamicos[eventoIndex];
      
      // Validar que la nueva capacidad sea mayor o igual a los registrados actuales
      if (nuevaCapacidad < evento.registrados) {
        console.warn(`⚠️ No se puede reducir la capacidad a ${nuevaCapacidad}: ya hay ${evento.registrados} personas registradas`);
        return false;
      }
      
      // Actualizar capacidad
      eventosMockDinamicos[eventoIndex] = {
        ...evento,
        capacidad: nuevaCapacidad,
        updated_at: new Date().toISOString()
      };
      
      guardarEventosEnStorage(eventosMockDinamicos);
      console.log(`✅ Capacidad actualizada para evento ${eventoId}: ${evento.capacidad} -> ${nuevaCapacidad}`);
      return true;
    }

    const { error } = await supabase
      .from('eventos')
      .update({ capacidad: nuevaCapacidad })
      .eq('id', eventoId);
    
    return !error;
  },

  // Eliminar un evento
  async eliminar(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log(`🗑️ Eliminando evento mock: ${id}`);
      
      const eventoIndex = eventosMockDinamicos.findIndex(e => e.id === id);
      if (eventoIndex === -1) {
        console.warn(`⚠️ Evento ${id} no encontrado para eliminar`);
        return false;
      }
      
      // Eliminar el evento del array
      eventosMockDinamicos.splice(eventoIndex, 1);
      
      // Guardar cambios en localStorage
      guardarEventosEnStorage(eventosMockDinamicos);
      console.log(`✅ Evento ${id} eliminado exitosamente`);
      return true;
    }

    // Implementación para Supabase
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando evento:', error);
      return false;
    }
    
    console.log(`✅ Evento ${id} eliminado de Supabase`);
    return true;
  },

  // Obtener información detallada de disponibilidad para un evento
  async obtenerDisponibilidad(eventoId: string): Promise<{
    disponible: boolean;
    cuposLibres: number;
    capacidad: number;
    registrados: number;
    estadoDinamico: string;
  } | null> {
    if (!isSupabaseConfigured()) {
      const evento = eventosMockDinamicos.find(e => e.id === eventoId);
      if (!evento) return null;
      
      const disponibilidad = verificarDisponibilidad(eventoId);
      const estadoDinamico = determinarEstadoEvento(evento);
      
      return {
        ...disponibilidad,
        estadoDinamico
      };
    }
    
    // Implementación para Supabase (cuando esté configurado)
    return null;
  },

  async obtenerEstadisticas() {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Usando datos mock para estadísticas de eventos');
      const totalRegistrados = eventosMockDinamicos.reduce((sum, evento) => sum + evento.registrados, 0);
      const ingresosTotales = eventosMockDinamicos.reduce((sum, evento) => sum + (evento.registrados * evento.precio), 0);

      return {
        total: eventosMockDinamicos.length,
        activos: eventosMockDinamicos.filter(e => e.estado === 'activo').length,
        visitantes: totalRegistrados,
        checkins: Math.round(totalRegistrados * 0.8),
        ingresos: ingresosTotales
      };
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('id, estado, registrados, capacidad, precio');
    
    if (error) {
      console.error('Error obteniendo estadísticas de eventos:', error);
      console.log('🧪 Fallback a datos mock debido a error');
      return mockEstadisticas.eventos;
    }

    const totalRegistrados = data.reduce((sum, evento) => sum + evento.registrados, 0);
    const ingresosTotales = data.reduce((sum, evento) => sum + (evento.registrados * evento.precio), 0);

    return {
      total: data.length,
      activos: data.filter(e => e.estado === 'activo').length,
      visitantes: totalRegistrados,
      checkins: Math.round(totalRegistrados * 0.8), // Estimación de check-ins
      ingresos: ingresosTotales
    };
  }
};

// =============================================
// SERVICIOS DE REGISTRO DE EVENTOS
// =============================================

// Datos mock para registros de eventos
let registrosMockDinamicos: any[] = [
  {
    id: '1',
    visitante_id: 'mock-v1',
    evento_id: '1',
    fecha_registro: new Date().toISOString(),
    codigo_confirmacion: 'CCB-001-234',
    estado: 'confirmado',
    created_at: new Date().toISOString(),
    visitante: {
      nombre: 'María',
      apellido: 'González',
      email: 'maria@example.com',
      telefono: '809-555-0123'
    }
  },
  {
    id: '2',
    visitante_id: 'mock-v2',
    evento_id: '1',
    fecha_registro: new Date(Date.now() - 86400000).toISOString(),
    codigo_confirmacion: 'CCB-001-567',
    estado: 'checkin',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    visitante: {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos@example.com',
      telefono: '809-555-0456'
    }
  },
  {
    id: '3',
    visitante_id: 'mock-v3',
    evento_id: '2',
    fecha_registro: new Date(Date.now() - 172800000).toISOString(),
    codigo_confirmacion: 'CCB-002-789',
    estado: 'pendiente',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    visitante: {
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana@example.com',
      telefono: '809-555-0789'
    }
  }
];

// Función para cargar registros desde localStorage
const cargarRegistrosDelStorage = (): any[] => {
  try {
    const registrosGuardados = localStorage.getItem('ccb_registros_mock');
    if (registrosGuardados) {
      const registrosParsed = JSON.parse(registrosGuardados);
      console.log('📋 Registros cargados desde localStorage:', registrosParsed.length);
      return registrosParsed;
    }
  } catch (error) {
    console.error('❌ Error cargando registros del storage:', error);
  }
  console.log('🔄 Usando registros mock por defecto');
  return [...registrosMockDinamicos];
};

// Función para guardar registros en localStorage
const guardarRegistrosEnStorage = (registros: any[]) => {
  try {
    localStorage.setItem('ccb_registros_mock', JSON.stringify(registros));
    console.log('💾 Registros guardados en localStorage:', registros.length);
  } catch (error) {
    console.error('❌ Error guardando registros en storage:', error);
  }
};

// Inicializar registros desde localStorage al cargar el módulo
registrosMockDinamicos = cargarRegistrosDelStorage();

export const registroEventosService = {
  async registrarVisitanteEnEvento(
    visitanteId: string, 
    eventoId: string, 
    codigoConfirmacion: string
  ): Promise<RegistroEvento | null> {
    // Si Supabase no está configurado, simular registro en mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Simulando registro de visitante en evento (mock)');
      
      // 🔒 VALIDAR DISPONIBILIDAD ANTES DEL REGISTRO
      const disponibilidad = verificarDisponibilidad(eventoId);
      if (!disponibilidad.disponible) {
        console.warn(`❌ Registro rechazado: evento ${eventoId} no tiene cupos disponibles`);
        console.warn(`📊 Estado: ${disponibilidad.registrados}/${disponibilidad.capacidad} registrados`);
        throw new Error(`Lo sentimos, este evento ha alcanzado su capacidad máxima (${disponibilidad.capacidad} personas). No hay cupos disponibles.`);
      }
      
      // ✅ HAY CUPOS DISPONIBLES - PROCEDER CON EL REGISTRO
      console.log(`✅ Registro permitido: ${disponibilidad.cuposLibres} cupos disponibles para evento ${eventoId}`);
      
      const nuevoRegistro: RegistroEvento = {
        id: `mock-${Date.now()}`,
        visitante_id: visitanteId,
        evento_id: eventoId,
        fecha_registro: new Date().toISOString(),
        codigo_confirmacion: codigoConfirmacion,
        estado: 'confirmado' as const,
        created_at: new Date().toISOString()
      };
      
      // 📈 ACTUALIZAR CONTADOR DE REGISTRADOS
      const actualizacionExitosa = actualizarContadorRegistrados(eventoId, 1);
      if (!actualizacionExitosa) {
        console.error(`❌ Error actualizando contador para evento ${eventoId}`);
        throw new Error('Error interno al procesar el registro. Intenta nuevamente.');
      }
      
      registrosMockDinamicos.push(nuevoRegistro);
      guardarRegistrosEnStorage(registrosMockDinamicos);
      console.log('✅ Registro mock creado:', codigoConfirmacion);
      
      // Mostrar estado actualizado
      const nuevaDisponibilidad = verificarDisponibilidad(eventoId);
      console.log(`📊 Estado actualizado: ${nuevaDisponibilidad.registrados}/${nuevaDisponibilidad.capacidad} registrados, ${nuevaDisponibilidad.cuposLibres} cupos restantes`);
      
      return nuevoRegistro;
    }

    const { data, error } = await supabase
      .from('registro_eventos')
      .insert([{
        visitante_id: visitanteId,
        evento_id: eventoId,
        fecha_registro: new Date().toISOString(),
        codigo_confirmacion: codigoConfirmacion,
        estado: 'pendiente'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error registrando visitante en evento:', error);
      return null;
    }
    
    return data;
  },

  async confirmarCheckin(codigo: string): Promise<boolean> {
    // Si Supabase no está configurado, simular check-in en mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Simulando check-in en datos mock');
      const index = registrosMockDinamicos.findIndex(r => r.codigo_confirmacion === codigo);
      if (index !== -1) {
        registrosMockDinamicos[index] = {
          ...registrosMockDinamicos[index],
          estado: 'checkin',
          updated_at: new Date().toISOString()
        };
        guardarRegistrosEnStorage(registrosMockDinamicos);
        console.log('✅ Check-in mock confirmado:', codigo);
        return true;
      }
      console.log('❌ Código no encontrado:', codigo);
      return false;
    }

    const { error } = await supabase
      .from('registro_eventos')
      .update({ 
        estado: 'checkin',
        updated_at: new Date().toISOString()
      })
      .eq('codigo_confirmacion', codigo);
    
    if (error) {
      console.error('Error confirmando check-in:', error);
      return false;
    }
    
    return true;
  },

  async obtenerRegistrosPorEvento(eventoId: string): Promise<RegistroEvento[]> {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Obteniendo registros mock para evento:', eventoId);
      return registrosMockDinamicos.filter(r => r.evento_id === eventoId);
    }

    const { data, error } = await supabase
      .from('registro_eventos')
      .select(`
        *,
        visitantes (
          nombre,
          apellido,
          email,
          telefono
        )
      `)
      .eq('evento_id', eventoId);
    
    if (error) {
      console.error('Error obteniendo registros del evento:', error);
      return [];
    }
    
    return data || [];
  },

  async obtenerTodosLosRegistros(): Promise<any[]> {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Obteniendo todos los registros mock');
      return registrosMockDinamicos;
    }

    const { data, error } = await supabase
      .from('registro_eventos')
      .select(`
        *,
        visitantes (
          nombre,
          apellido,
          email,
          telefono
        ),
        eventos (
          titulo,
          fecha,
          hora,
          ubicacion
        )
      `)
      .order('fecha_registro', { ascending: false });
    
    if (error) {
      console.error('Error obteniendo todos los registros:', error);
      return registrosMockDinamicos;
    }
    
    return data || [];
  },

  async obtenerEstadisticasRegistros() {
    if (!isSupabaseConfigured()) {
      // Simular estadísticas con datos mock
      const registros = registrosMockDinamicos;
      const total = registros.length;
      const confirmados = registros.filter(r => r.estado === 'confirmado').length;
      const checkins = registros.filter(r => r.estado === 'checkin').length;
      const pendientes = registros.filter(r => r.estado === 'pendiente').length;
      
      // Simular registros de hoy (últimas 24 horas)
      const ahora = new Date();
      const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      const hoy = registros.filter(r => new Date(r.fecha_registro) > hace24h).length;
      
      // Calcular tasa de asistencia
      const totalConfirmados = confirmados + checkins;
      const tasaAsistencia = totalConfirmados > 0 ? Math.round((checkins / totalConfirmados) * 100) : 0;
      
      console.log('📊 Estadísticas calculadas (mock):', {
        total, confirmados, checkins, pendientes, hoy, tasaAsistencia
      });
      
      return {
        total,
        confirmados,
        checkins,
        pendientes,
        hoy,
        tasaAsistencia
      };
    }

    try {
      const { data, error } = await supabase
        .from('registro_eventos')
        .select('estado, fecha_registro');

      if (error) throw error;

      const total = data.length;
      const confirmados = data.filter(r => r.estado === 'confirmado').length;
      const checkins = data.filter(r => r.estado === 'checkin').length;
      const pendientes = data.filter(r => r.estado === 'pendiente').length;
      
      // Registros de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const registrosHoy = data.filter(r => r.fecha_registro.startsWith(hoy)).length;
      
      // Tasa de asistencia
      const totalConfirmados = confirmados + checkins;
      const tasaAsistencia = totalConfirmados > 0 ? Math.round((checkins / totalConfirmados) * 100) : 0;

      return {
        total,
        confirmados,
        checkins,
        pendientes,
        hoy: registrosHoy,
        tasaAsistencia
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total: 0,
        confirmados: 0,
        checkins: 0,
        pendientes: 0,
        hoy: 0,
        tasaAsistencia: 0
      };
    }
  },

  async buscarRegistroPorCodigo(codigo: string) {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Buscando registro mock por código:', codigo);
      return registrosMockDinamicos.find(r => r.codigo_confirmacion === codigo) || null;
    }

    const { data, error } = await supabase
      .from('registro_eventos')
      .select(`
        *,
        visitantes (
          nombre,
          apellido,
          email,
          telefono
        ),
        eventos (
          titulo,
          fecha,
          hora,
          ubicacion
        )
      `)
      .eq('codigo_confirmacion', codigo)
      .single();
    
    if (error) {
      console.error('Error buscando registro por código:', error);
      return null;
    }
    
    return data;
  }
};

// =============================================
// SERVICIO DE DATOS SEMILLA (SEED DATA)
// =============================================

export const seedDataService = {
  async poblarDatosIniciales() {
    console.log('🌱 Poblando base de datos con datos iniciales...');
    
    // Datos de eventos ejemplo
    const eventosEjemplo = [
      {
        titulo: "Concierto de Jazz Contemporáneo",
        descripcion: "Una noche única con los mejores exponentes del jazz contemporáneo dominicano",
        categoria: "concierto",
        fecha: "2024-12-20",
        hora: "20:00",
        duracion: 3,
        ubicacion: "Auditorio Principal",
        capacidad: 300,
        registrados: 245,
        precio: 1500,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Exposición: Arte Digital Dominicano",
        descripcion: "Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías",
        categoria: "exposicion",
        fecha: "2024-12-15",
        hora: "18:00",
        duracion: 4,
        ubicacion: "Galería Norte",
        capacidad: 150,
        registrados: 89,
        precio: 800,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Obra de Teatro: El Quijote Caribeño",
        descripcion: "Adaptación moderna del clásico de Cervantes ambientada en el Caribe dominicano",
        categoria: "teatro",
        fecha: "2024-12-22",
        hora: "19:30",
        duracion: 2.5,
        ubicacion: "Teatro Principal",
        capacidad: 200,
        registrados: 156,
        precio: 1200,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Taller de Cerámica Taína",
        descripcion: "Aprende las técnicas ancestrales de cerámica de nuestros pueblos originarios",
        categoria: "taller",
        fecha: "2024-12-18",
        hora: "14:00",
        duracion: 3,
        ubicacion: "Aula de Arte",
        capacidad: 25,
        registrados: 23,
        precio: 500,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Conferencia: Historia del Merengue",
        descripcion: "Un recorrido por la evolución del merengue desde sus orígenes hasta la actualidad",
        categoria: "conferencia",
        fecha: "2024-12-25",
        hora: "16:00",
        duracion: 2,
        ubicacion: "Sala de Conferencias",
        capacidad: 100,
        registrados: 67,
        precio: 300,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Festival de Danza Folklórica",
        descripcion: "Celebración de las tradiciones dancísticas dominicanas con grupos de todo el país",
        categoria: "concierto",
        fecha: "2024-12-28",
        hora: "17:00",
        duracion: 4,
        ubicacion: "Plaza Central",
        capacidad: 500,
        registrados: 234,
        precio: 0,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Exposición de Fotografía: Paisajes Dominicanos",
        descripcion: "Muestra fotográfica que captura la belleza natural de República Dominicana",
        categoria: "exposicion",
        fecha: "2024-12-30",
        hora: "10:00",
        duracion: 6,
        ubicacion: "Galería Sur",
        capacidad: 80,
        registrados: 45,
        precio: 200,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Concierto de Año Nuevo",
        descripcion: "Gran concierto para recibir el 2025 con música en vivo y fuegos artificiales",
        categoria: "concierto",
        fecha: "2024-12-31",
        hora: "22:00",
        duracion: 3,
        ubicacion: "Auditorio Principal",
        capacidad: 400,
        registrados: 387,
        precio: 2000,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Taller de Escritura Creativa",
        descripcion: "Desarrolla tu creatividad literaria con técnicas de escritura contemporánea",
        categoria: "taller",
        fecha: "2025-01-05",
        hora: "09:00",
        duracion: 4,
        ubicacion: "Biblioteca",
        capacidad: 20,
        registrados: 8,
        precio: 800,
        imagen: "",
        estado: 'activo' as const
      },
      {
        titulo: "Conferencia: Tecnología y Arte",
        descripcion: "Explorando las intersecciones entre la innovación tecnológica y la expresión artística",
        categoria: "conferencia",
        fecha: "2025-01-08",
        hora: "15:00",
        duracion: 2.5,
        ubicacion: "Auditorio Digital",
        capacidad: 120,
        registrados: 0,
        precio: 600,
        imagen: "",
        estado: 'activo' as const
      }
    ];

    // Insertar eventos
    for (const evento of eventosEjemplo) {
      await eventosService.crear(evento);
    }
    
    console.log('✅ Datos iniciales poblados correctamente');
  }
}; 