import { Evento, RegistroEvento, supabase, Visitante } from './client';
import { mockEstadisticas } from './mock-data';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon-key');
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
    registrados: 23,
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
  }
];

// Variable para almacenar eventos mock dinámicos
let eventosMockDinamicos: Evento[] = [...mockEventos];

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
      return eventosMockDinamicos;
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo eventos:', error);
      console.log('🧪 Fallback a datos mock debido a error');
      return eventosMockDinamicos;
    }
    
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
      console.log('✅ Evento mock creado:', nuevoEvento.titulo);
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

export const registroEventosService = {
  async registrarVisitanteEnEvento(
    visitanteId: string, 
    eventoId: string, 
    codigoConfirmacion: string
  ): Promise<RegistroEvento | null> {
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