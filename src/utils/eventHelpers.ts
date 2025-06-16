// Utilidades para manejo de eventos del Centro Cultural Banreservas

import type { Evento, EstadoDisponibilidad, FiltroEvento } from '../types/eventos';

/**
 * Filtra eventos según el criterio especificado
 * @param eventos - Array de eventos
 * @param filtro - Tipo de filtro a aplicar
 * @param searchTerm - Término de búsqueda opcional
 * @returns Array de eventos filtrados
 */
export const filtrarEventos = (
  eventos: Evento[], 
  filtro: FiltroEvento, 
  searchTerm: string = ''
): Evento[] => {
  let eventosBase = [...eventos];

  // Aplicar filtro principal
  if (filtro === 'proximos') {
    eventosBase = eventosBase.filter(evento => {
      const now = new Date();
      const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
      const thirtyMinBefore = new Date(eventDateTime.getTime() - (30 * 60 * 1000));
      return now < thirtyMinBefore;
    });
  } else if (filtro === 'en_curso') {
    eventosBase = eventosBase.filter(evento => isEventoActivo(evento));
  } else if (filtro === 'finalizados') {
    eventosBase = eventosBase.filter(evento => {
      const now = new Date();
      const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
      const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
      const thirtyMinAfterEnd = new Date(eventEndTime.getTime() + (30 * 60 * 1000));
      return now > thirtyMinAfterEnd;
    });
  }

  // Aplicar búsqueda por texto
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    eventosBase = eventosBase.filter(evento => 
      evento.titulo.toLowerCase().includes(term) ||
      evento.descripcion.toLowerCase().includes(term) ||
      evento.categoria.toLowerCase().includes(term)
    );
  }

  return eventosBase;
};

/**
 * Determina si un evento está activo (en curso o próximo a iniciar)
 * @param evento - Evento a evaluar
 * @returns boolean - true si el evento está activo
 */
export const isEventoActivo = (evento: Evento): boolean => {
  const now = new Date();
  const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
  const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
  const thirtyMinBefore = new Date(eventDateTime.getTime() - (30 * 60 * 1000));

  return now >= thirtyMinBefore && now <= eventEndTime;
};
/**
 * Obtiene el estado de disponibilidad de un evento
 * @param evento - Evento a evaluar
 * @returns EstadoDisponibilidad - Estado del evento
 */
export const obtenerEstadoDisponibilidad = (evento: Evento): EstadoDisponibilidad & {
  disponible: boolean;
  estado: string;
  mensaje: string;
  color: string;
  bgColor: string;
  icono: string;
} => {
  // PRIMERA VERIFICACIÓN: Si el evento ya finalizó, no permitir registros
  const now = new Date();
  const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
  const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
  
  // Si el evento ya terminó (más de 30 minutos después del fin)
  const thirtyMinAfterEnd = new Date(eventEndTime.getTime() + (30 * 60 * 1000));
  if (now > thirtyMinAfterEnd) {
    return {
      disponible: false,
      estado: 'finalizado',
      cuposDisponibles: 0,
      puedeRegistrarse: false,
      mensaje: 'Evento Finalizado',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      icono: '🏁'
    };
  }
  
  const cuposDisponibles = evento.capacidad - evento.registrados;
  const capacidad = evento.capacidad ?? 200;
  const registrados = evento.registrados ?? 0;
  const porcentajeOcupacion = (registrados / capacidad) * 100;
  
  if (cuposDisponibles <= 0) {
    return {
      disponible: false,
      estado: 'agotado',
      cuposDisponibles: 0,
      puedeRegistrarse: false,
      mensaje: 'Evento Agotado',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      icono: '🚫'
    };
  } else if (cuposDisponibles <= 5 || porcentajeOcupacion >= 90) {
    return {
      disponible: true,
      estado: 'ultimos_cupos',
      cuposDisponibles,
      puedeRegistrarse: true,
      mensaje: `¡Últimos ${cuposDisponibles} cupos!`,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      icono: '⚡'
    };
  } else {
    return {
      disponible: true,
      estado: 'disponible',
      cuposDisponibles,
      puedeRegistrarse: true,
      mensaje: `${cuposDisponibles} cupos disponibles`,
      color: '#059669',
      bgColor: '#D1FAE5',
      icono: '✅'
    };
  }
};

/**
 * Formatea una fecha para mostrar
 * @param fecha - Fecha en formato string
 * @returns Objeto con fecha formateada
 */
export const formatDate = (fecha: string) => {
  const eventDate = new Date(fecha);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = eventDate.toDateString() === today.toDateString();
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

  let fechaTexto = '';
  if (isToday) {
    fechaTexto = 'Hoy';
  } else if (isTomorrow) {
    fechaTexto = 'Mañana';
  } else {
    fechaTexto = eventDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  const fechaCompleta = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return { fechaTexto, fechaCompleta };
};

/**
 * Obtiene el tiempo actual formateado
 * @returns string - Tiempo actual en formato HH:MM
 */
export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene el estado visual de un evento
 * @param evento - Evento a evaluar
 * @returns Objeto con información del estado
 */
export const getEventStatus = (evento: Evento) => {
  if (isEventoActivo(evento)) {
    return {
      badge: 'En curso',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5'
    };
  }

  const now = new Date();
  const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
  const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
  const thirtyMinAfterEnd = new Date(eventEndTime.getTime() + (30 * 60 * 1000));

  if (now > thirtyMinAfterEnd) {
    return {
      badge: 'Finalizado',
      badgeColor: '#6B7280',
      badgeBg: '#F3F4F6'
    };
  }

  return {
    badge: 'Activo',
    badgeColor: '#0EA5E9',
    badgeBg: '#DBEAFE'
  };
};
