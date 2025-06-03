import { Evento, RegistroEvento, supabase, Visitante } from './client';
import { mockEstadisticas } from './mock-data';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon-key');
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
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo eventos:', error);
      return [];
    }
    
    return data || [];
  },

  async obtenerPorId(id: string): Promise<Evento | null> {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error obteniendo evento:', error);
      return null;
    }
    
    return data;
  },

  async crear(evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>): Promise<Evento | null> {
    const { data, error } = await supabase
      .from('eventos')
      .insert([evento])
      .select()
      .single();
    
    if (error) {
      console.error('Error creando evento:', error);
      return null;
    }
    
    return data;
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
    
    return data;
  },

  async obtenerEstadisticas() {
    // Si Supabase no está configurado, usar datos mock
    if (!isSupabaseConfigured()) {
      console.log('🧪 Usando datos mock para estadísticas de eventos');
      return mockEstadisticas.eventos;
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
        categoria: "Música",
        fecha: "2024-12-20",
        hora: "20:00",
        duracion: 3,
        ubicacion: "Auditorio Principal",
        capacidad: 300,
        registrados: 245,
        precio: 1500,
        imagen: "https://via.placeholder.com/400x200/1E40AF/FFFFFF?text=Jazz+Concert",
        estado: 'proximo' as const
      },
      {
        titulo: "Exposición: Arte Digital Dominicano",
        descripcion: "Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías",
        categoria: "Arte",
        fecha: "2024-12-15",
        hora: "18:00",
        duracion: 4,
        ubicacion: "Galería Norte",
        capacidad: 150,
        registrados: 89,
        precio: 800,
        imagen: "https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Arte+Digital",
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