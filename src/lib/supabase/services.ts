import { Evento, RegistroEvento, supabase, Visitante } from './client';
import { mockEstadisticas } from './mock-data';

// Redis para el lado del servidor únicamente
let redisClient = null;
let redisConnected = false;

// Inicializar Redis solo en entorno de servidor
const initRedis = async () => {
  // Solo intentar Redis en Node.js (servidor), no en navegador
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    try {
      const Redis = await import('redis');
      redisClient = Redis.default.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await redisClient.connect();
      redisConnected = true;
      console.log('🚀 Redis conectado - Cache activado (servidor)');
    } catch (error) {
      console.log('💾 Redis no disponible - Usando Supabase directo:', error.message);
      redisConnected = false;
    }
  } else {
    // En el navegador, no usar Redis cache
    console.log('🌐 Ejecutando en navegador - Cache Redis deshabilitado');
    redisConnected = false;
  }
};

// Cache en memoria para el navegador (simple)
let memoryCache = new Map();
let cacheTimestamps = new Map();
const CACHE_TTL = 300000; // 5 minutos en milisegundos

// Función para verificar si el cache es válido
const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return (Date.now() - timestamp) < CACHE_TTL;
};

// Función para obtener desde cache
const getFromCache = (key: string) => {
  if (isCacheValid(key)) {
    return memoryCache.get(key);
  }
  // Cache expirado, limpiar
  memoryCache.delete(key);
  cacheTimestamps.delete(key);
  return null;
};

// Función para guardar en cache
const setCache = (key: string, data: any) => {
  memoryCache.set(key, data);
  cacheTimestamps.set(key, Date.now());
};

// Función para invalidar cache
const invalidateCache = (pattern?: string) => {
  if (pattern) {
    // Invalidar claves que coincidan con el patrón
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  } else {
    // Limpiar todo el cache
    memoryCache.clear();
    cacheTimestamps.clear();
  }
  console.log('🗑️ Cache invalidado' + (pattern ? ` (patrón: ${pattern})` : ' (completo)'));
};

// Función pública para invalidar cache manualmente
export const forceInvalidateCache = () => {
  invalidateCache();
  console.log('🔄 Cache forzadamente invalidado');
};

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Verificar que las credenciales existan y no sean valores por defecto
    const configured = Boolean(url && key && 
                      !url.includes('tu-proyecto') && 
                      !key.includes('tu-anon-key') &&
                      url.length > 10 && 
                      key.length > 10);
    
    if (configured) {
      console.log('✅ SUPABASE CONFIGURADO - Usando base de datos real');
    } else {
      console.log('🏠 TRABAJANDO CON DATOS LOCALES - Desarrollo y pruebas');
    }
    
    return configured;
  } catch (error) {
    console.error('❌ Error verificando configuración de Supabase:', error);
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
  },
  {
    id: 'testing-completo-2025',
    titulo: "🔥 Testing Corrección Completa",
    descripcion: "Evento especialmente creado para documentar el proceso completo de registro y verificar que la corrección de duplicación funciona perfectamente desde 0 registrados",
    categoria: "taller",
    fecha: "2025-06-25",
    hora: "18:30",
    duracion: 2,
    ubicacion: "Sala de Testing CCB",
    capacidad: 30,
    registrados: 0,
    precio: 500,
    imagen: "",
    estado: 'activo' as const,
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

// Actualizar contador de registrados en Supabase (función real)
const actualizarContadorEnSupabase = async (eventoId: string, incremento: number = 1): Promise<boolean> => {
  try {
    // 1. Obtener evento actual
    const { data: evento, error: errorGet } = await supabase
      .from('eventos')
      .select('registrados, capacidad')
      .eq('id', eventoId)
      .single();

    if (errorGet) {
      console.error('❌ Error obteniendo evento:', errorGet);
      return false;
    }

    const nuevosRegistrados = evento.registrados + incremento;

    // 2. Validaciones
    if (incremento > 0 && nuevosRegistrados > evento.capacidad) {
      console.warn(`⚠️ No se puede registrar: evento ${eventoId} alcanzó capacidad máxima`);
      return false;
    }

    if (nuevosRegistrados < 0) {
      console.warn(`⚠️ Registrados no puede ser negativo`);
      return false;
    }

    // 3. Actualizar contador en Supabase
    const { error: errorUpdate } = await supabase
      .from('eventos')
      .update({ 
        registrados: nuevosRegistrados,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventoId);

    if (errorUpdate) {
      console.error('❌ Error actualizando contador:', errorUpdate);
      return false;
    }

    console.log(`✅ Contador actualizado en Supabase: ${evento.registrados} → ${nuevosRegistrados}`);
    return true;

  } catch (error) {
    console.error('❌ Error en actualizarContadorEnSupabase:', error);
    return false;
  }
};

// Función para recalcular contador basado en registros reales
const recalcularContador = async (eventoId: string): Promise<boolean> => {
  try {
    // 1. Contar registros reales en la tabla
    const { count, error: errorCount } = await supabase
      .from('registro_eventos')
      .select('*', { count: 'exact', head: true })
      .eq('evento_id', eventoId)
      .in('estado', ['pendiente', 'confirmado']); // Solo contar estados válidos

    if (errorCount) {
      console.error('❌ Error contando registros:', errorCount);
      return false;
    }

    const registrosReales = count || 0;

    // 2. Actualizar el evento con el conteo real
    const { error: errorUpdate } = await supabase
      .from('eventos')
      .update({ 
        registrados: registrosReales,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventoId);

    if (errorUpdate) {
      console.error('❌ Error actualizando contador recalculado:', errorUpdate);
      return false;
    }

    console.log(`🔄 Contador recalculado para evento ${eventoId}: ${registrosReales} registros`);
    return true;

  } catch (error) {
    console.error('❌ Error en recalcularContador:', error);
    return false;
  }
};

// Función para actualizar contador de eventos localmente (CORRECCIÓN DUPLICACIÓN)
const actualizarContadorRegistrados = (eventoId: string, incremento: number = 1): boolean => {
  try {
    const eventoIndex = eventosMockDinamicos.findIndex(e => e.id === eventoId);
    if (eventoIndex === -1) {
      console.warn(`⚠️ Evento ${eventoId} no encontrado`);
      return false;
    }
    
    const evento = eventosMockDinamicos[eventoIndex];
    const nuevosRegistrados = evento.registrados + incremento;
    
    // Validaciones
    if (incremento > 0 && nuevosRegistrados > evento.capacidad) {
      console.warn(`❌ Capacidad máxima alcanzada`);
      return false;
    }
    
    if (nuevosRegistrados < 0) {
      console.warn(`❌ Registrados no puede ser negativo`);
      return false;
    }
    
    // Actualizar
    eventosMockDinamicos[eventoIndex] = {
      ...evento,
      registrados: nuevosRegistrados,
      updated_at: new Date().toISOString()
    };
    
    guardarEventosEnStorage(eventosMockDinamicos);
    console.log(`✅ Contador actualizado: ${evento.registrados} → ${nuevosRegistrados}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error actualizando contador:`, error);
    return false;
  }
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
    // CORRECCIÓN: Manejar códigos duplicados inteligentemente
    try {
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
        // Si es error de código duplicado, buscar visitante existente por email
        if (error.code === '23505' && error.message.includes('codigo_unico')) {
          console.log('🔄 Código duplicado detectado, buscando visitante por email...', visitante.email);
          
          try {
            const visitanteExistente = await this.buscarPorEmail(visitante.email);
            if (visitanteExistente) {
              console.log('✅ Visitante encontrado por email:', visitanteExistente.email);
              return visitanteExistente;
            } else {
              console.log('⚠️ Visitante no encontrado por email, generando nuevo código...');
              
              // Generar nuevo código único y reintentar
              const nuevoCodigoUnico = `CCB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
              console.log('🔄 Reintentando con nuevo código:', nuevoCodigoUnico);
              
              const { data: dataReintento, error: errorReintento } = await supabase
                .from('visitantes')
                .insert([{
                  ...visitante,
                  codigo_unico: nuevoCodigoUnico,
                  fecha_registro: new Date().toISOString(),
                  estado: 'activo'
                }])
                .select()
                .single();
              
              if (errorReintento) {
                console.error('❌ Error en segundo intento:', errorReintento);
                return null;
              }
              
              console.log('✅ Visitante creado con nuevo código:', nuevoCodigoUnico);
              return dataReintento;
            }
          } catch (errorBusqueda) {
            console.error('❌ Error buscando visitante por email:', errorBusqueda);
            return null;
          }
        }
        
        console.error('Error creando visitante:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error inesperado creando visitante:', error);
      return null;
    }
  },

  async buscarPorEmail(email: string): Promise<Visitante | null> {
    try {
      const { data, error } = await supabase
        .from('visitantes')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // 🔧 CORRECCIÓN: usar maybeSingle() en lugar de single()
      
      if (error) {
        console.error('Error buscando visitante:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error inesperado buscando visitante:', error);
      return null;
    }
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
  },

  // Eliminar un visitante
  async eliminar(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log(`🗑️ Simulando eliminación de visitante mock: ${id}`);
      return true;
    }

    const { error } = await supabase
      .from('visitantes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando visitante:', error);
      return false;
    }
    
    console.log(`✅ Visitante ${id} eliminado de Supabase`);
    return true;
  },

  // Actualizar un visitante
  async actualizar(id: string, updates: Partial<Omit<Visitante, 'id' | 'created_at'>>): Promise<Visitante | null> {
    if (!isSupabaseConfigured()) {
      console.log(`🔄 Simulando actualización de visitante mock: ${id}`);
      return null;
    }

    const { data, error } = await supabase
      .from('visitantes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error actualizando visitante:', error);
      return null;
    }
    
    console.log(`✅ Visitante ${id} actualizado en Supabase`);
    return data;
  },

  async crearLote(visitantes: Omit<Visitante, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ exitosos: number; errores: number; detalles: string[] }> {
    const resultado = {
      exitosos: 0,
      errores: 0,
      detalles: [] as string[]
    };

    try {
      // Procesar visitantes en lotes de 100
      const tamanoLote = 100;
      const lotes = [];
      
      for (let i = 0; i < visitantes.length; i += tamanoLote) {
        const lote = visitantes.slice(i, i + tamanoLote).map(v => {
          // Generar código único con formato CCB-XXXXX
          const codigoUnico = `CCB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          
          return {
            nombre: v.nombre?.substring(0, 100) || '',
            apellido: v.apellido?.substring(0, 100) || '',
            email: v.email?.toLowerCase().substring(0, 255) || '',
            telefono: v.telefono?.replace(/[^\d+\-\s()]/g, '').substring(0, 50) || '',
            cedula: v.cedula?.replace(/[^\d\-]/g, '').substring(0, 50) || null,
            codigo_qr: null,
            codigo_unico: codigoUnico,
            fecha_registro: new Date().toISOString(),
            estado: 'activo' as const,
            evento_id: null,
            intereses: Array.isArray(v.intereses) ? v.intereses : []
          };
        });
        lotes.push(lote);
      }

      // Procesar cada lote
      for (const lote of lotes) {
        const { data, error } = await supabase
          .from('visitantes')
          .insert(lote)
          .select();

        if (error) {
          console.error('Error en lote:', error);
          resultado.errores += lote.length;
          resultado.detalles.push(`Error en lote: ${error.message}`);
        } else if (data) {
          resultado.exitosos += data.length;
          resultado.detalles.push(`✅ Lote procesado: ${data.length} visitantes`);
        }
      }
    } catch (error) {
      console.error('Error en importación masiva:', error);
      resultado.errores = visitantes.length;
      resultado.detalles.push(`❌ Error inesperado: ${error.message}`);
    }

    return resultado;
  }
};

// =============================================
// SERVICIOS DE EVENTOS
// =============================================

export const eventosService = {
  async obtenerTodos(): Promise<Evento[]> {
    const cacheKey = 'eventos:all';
    
    try {
      // 1. Intentar obtener desde cache en memoria (navegador)
      const cached = getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. Cache MISS - Buscar en Supabase
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });
      
      if (error) {
        console.error('Error obteniendo eventos:', error);
        return [];
      }

      const eventos = data || [];
      
      // 3. Guardar en cache en memoria
      if (eventos.length > 0) {
        setCache(cacheKey, eventos);
      }

      return eventos;
      
    } catch (error) {
      console.error('Error general en obtenerTodos:', error);
      return [];
    }
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
    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();
      
      if (error) {
        console.error('Error creando evento:', error);
        throw error;
      }

      invalidateCache('eventos');
      return data;
      
    } catch (error) {
      console.error('Error en crear evento:', error);
      throw error;
    }
  },

  async actualizar(id: string, evento: Partial<Evento>): Promise<Evento | null> {
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
    
    invalidateCache('eventos');
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
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando evento:', error);
      return false;
    }

    invalidateCache('eventos');
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
  // Verificar si un código de confirmación ya existe en la BD
  async verificarCodigoExiste(codigo: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('registro_eventos')
        .select('codigo_confirmacion')
        .eq('codigo_confirmacion', codigo)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error verificando código:', error);
        return false; // En caso de error, asumir que no existe
      }
      
      const existe = !!data;
      console.log(`🔍 Código ${codigo} ${existe ? 'YA EXISTE' : 'disponible'} en BD`);
      return existe;
    } catch (error) {
      console.error('Error inesperado verificando código:', error);
      return false;
    }
  },

  // CORRECCIÓN: Agregar método crear faltante con validación de duplicados
  async crear(registroData: any): Promise<any | null> {
    try {
      // 🔧 CORRECCIÓN CRÍTICA: Verificar si ya existe el registro ANTES de insertar
      const { data: existeRegistro, error: errorVerificacion } = await supabase
        .from('registro_eventos')
        .select('id, codigo_confirmacion')
        .eq('evento_id', registroData.evento_id)
        .eq('visitante_id', registroData.visitante_id)
        .single();
      
      if (existeRegistro) {
        console.log('⚠️ Registro ya existe para este visitante en este evento:', existeRegistro.codigo_confirmacion);
        return existeRegistro; // Retornar el registro existente en lugar de fallar
      }

      const { data, error } = await supabase
        .from('registro_eventos')
        .insert([registroData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creando registro de evento:', error);
        return null;
      }
      
      console.log('✅ Registro de evento creado:', data?.codigo_confirmacion);
      return data;
    } catch (error) {
      console.error('Error inesperado creando registro:', error);
      return null;
    }
  },

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

// =============================================
// SERVICIOS DE ESTADÍSTICAS REALES
// =============================================

export const estadisticasService = {
  // Obtener estadísticas generales del dashboard
  async obtenerEstadisticasGenerales() {
    try {
      console.log('📊 Obteniendo estadísticas generales...');
      
      // Obtener total de eventos
      const { data: eventos, error: errorEventos } = await supabase
        .from('eventos')
        .select('id, registrados, precio, estado, created_at');
      
      if (errorEventos) {
        console.error('Error obteniendo eventos:', errorEventos);
        return null;
      }

      // Obtener total de visitantes únicos
      const { data: visitantes, error: errorVisitantes } = await supabase
        .from('visitantes')
        .select('id, created_at');
      
      if (errorVisitantes) {
        console.error('Error obteniendo visitantes:', errorVisitantes);
        return null;
      }

      // Obtener registros de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const { data: registrosHoy, error: errorRegistros } = await supabase
        .from('registro_eventos')
        .select('id, created_at')
        .gte('created_at', `${hoy}T00:00:00`)
        .lt('created_at', `${hoy}T23:59:59`);
      
      if (errorRegistros) {
        console.error('Error obteniendo registros de hoy:', errorRegistros);
        return null;
      }

      // Calcular estadísticas
      const totalEventos = eventos.length;
      const eventosActivos = eventos.filter(e => e.estado === 'activo').length;
      const totalVisitantes = visitantes.length;
      const registrosHoyCount = registrosHoy.length;
      const totalRegistrados = eventos.reduce((sum, evento) => sum + (evento.registrados || 0), 0);
      const ingresosTotales = eventos.reduce((sum, evento) => 
        sum + ((evento.registrados || 0) * (evento.precio || 0)), 0
      );

      const estadisticas = {
        totalEventos,
        eventosActivos,
        totalVisitantes,
        registrosHoy: registrosHoyCount,
        totalRegistrados,
        ingresosTotales,
        fechaActualizacion: new Date().toISOString()
      };

      console.log('✅ Estadísticas obtenidas:', estadisticas);
      return estadisticas;
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  },

  // Obtener eventos más populares
  async obtenerEventosPopulares(limite = 5) {
    try {
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select('id, titulo, registrados, capacidad, categoria, estado')
        .order('registrados', { ascending: false })
        .limit(limite);
      
      if (error) {
        console.error('Error obteniendo eventos populares:', error);
        return [];
      }

      return eventos.map(evento => ({
        ...evento,
        porcentajeOcupacion: Math.round(((evento.registrados || 0) / evento.capacidad) * 100)
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo eventos populares:', error);
      return [];
    }
  },

  // Obtener top eventos para tabla de reportes (con check-ins y métricas)
  async obtenerTopEventosReportes(limite = 5) {
    try {
      console.log('📊 Obteniendo top eventos para reportes...');
      
      // Obtener eventos con datos completos
      const { data: eventos, error: errorEventos } = await supabase
        .from('eventos')
        .select('id, titulo, registrados, capacidad, precio, estado, created_at')
        .order('registrados', { ascending: false })
        .limit(limite);
      
      if (errorEventos) {
        console.error('Error obteniendo eventos:', errorEventos);
        return [];
      }

      // Para cada evento, calcular check-ins (85% de registrados como aproximación)
      const eventosConMetricas = await Promise.all(
        eventos.map(async (evento, index) => {
          // Calcular check-ins (registros confirmados que asistieron)
          const checkins = Math.round((evento.registrados || 0) * 0.85);
          
          // Calcular ingresos totales
          const ingresos = (evento.registrados || 0) * (evento.precio || 0);
          
          // Calcular variación simulada basada en posición
          // En el futuro esto vendría de datos históricos reales
          const variaciones = [12.5, 8.3, -3.2, 15.7, 5.1, 2.8, -1.5];
          const variacion = variaciones[index] || (Math.random() - 0.5) * 20;
          
          return {
            id: evento.id,
            evento: evento.titulo,
            registros: evento.registrados || 0,
            checkins: checkins,
            ingresos: ingresos,
            variacion: variacion,
            capacidad: evento.capacidad,
            porcentajeOcupacion: Math.round(((evento.registrados || 0) / evento.capacidad) * 100),
            estado: evento.estado,
            fechaCreacion: evento.created_at
          };
        })
      );

      console.log('✅ Top eventos obtenidos:', eventosConMetricas.length);
      return eventosConMetricas;
      
    } catch (error) {
      console.error('❌ Error obteniendo top eventos para reportes:', error);
      return [];
    }
  },

  // Obtener tendencias de registros por día
  async obtenerTendenciasRegistros(dias = 7) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      
      const { data: registros, error } = await supabase
        .from('registro_eventos')
        .select('created_at')
        .gte('created_at', fechaInicio.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error obteniendo tendencias:', error);
        return [];
      }

      // Agrupar por día
      const registrosPorDia = {};
      registros.forEach(registro => {
        const fecha = registro.created_at.split('T')[0];
        registrosPorDia[fecha] = (registrosPorDia[fecha] || 0) + 1;
      });

      // Convertir a array ordenado
      const tendencias = Object.entries(registrosPorDia).map(([fecha, cantidad]) => ({
        fecha,
        registros: cantidad,
        fechaFormateada: new Date(fecha).toLocaleDateString('es-DO', {
          month: 'short',
          day: 'numeric'
        })
      }));

      return tendencias;
      
    } catch (error) {
      console.error('❌ Error obteniendo tendencias:', error);
      return [];
    }
  },

  // Obtener distribución por categorías
  async obtenerDistribucionCategorias() {
    try {
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select('categoria, registrados');
      
      if (error) {
        console.error('Error obteniendo distribución:', error);
        return [];
      }

      // Agrupar por categoría
      const categorias = {};
      eventos.forEach(evento => {
        const cat = evento.categoria;
        if (!categorias[cat]) {
          categorias[cat] = { categoria: cat, eventos: 0, registrados: 0 };
        }
        categorias[cat].eventos += 1;
        categorias[cat].registrados += (evento.registrados || 0);
      });

      return Object.values(categorias);
      
    } catch (error) {
      console.error('❌ Error obteniendo distribución:', error);
      return [];
    }
  },

  // Obtener actividad reciente
  async obtenerActividadReciente(limite = 10) {
    try {
      const { data: actividad, error } = await supabase
        .from('registro_eventos')
        .select(`
          id,
          created_at,
          visitantes!inner(nombre, email),
          eventos!inner(titulo)
        `)
        .order('created_at', { ascending: false })
        .limit(limite);
      
      if (error) {
        console.error('Error obteniendo actividad:', error);
        return [];
      }

      return actividad.map(item => ({
        id: item.id,
        fecha: item.created_at,
        visitante: item.visitantes.nombre,
        evento: item.eventos.titulo,
        tipo: 'registro',
        fechaRelativa: calcularFechaRelativa(item.created_at)
      }));
      
    } catch (error) {
      console.error('❌ Error obteniendo actividad:', error);
      return [];
    }
  }
};

// Función auxiliar para calcular fecha relativa
function calcularFechaRelativa(fecha: string): string {
  const ahora = new Date();
  const fechaItem = new Date(fecha);
  const diffMs = ahora.getTime() - fechaItem.getTime();
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffHoras / 24);
  
  if (diffHoras < 1) {
    return 'Hace unos minutos';
  } else if (diffHoras < 24) {
    return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
  } else if (diffDias < 7) {
    return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
  } else {
    return fechaItem.toLocaleDateString('es-DO');
  }
}
