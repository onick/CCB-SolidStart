// ======================================
// TIPOS E INTERFACES PARA VISITANTES
// ======================================

// Estadísticas de visitantes
export interface EstadisticasVisitantes {
  total: number;
  activos: number;
  hoy: number;
  estaSemana: number;
}

// Estados de invitación
export type EstadoInvitacion = 'enviada' | 'abierta' | 'confirmada' | 'expirada';

// Estados de visitante
export type EstadoVisitante = 'activo' | 'inactivo';

// Interfaz para paginación
export interface PaginacionConfig {
  paginaActual: number;
  elementosPorPagina: number;
  totalPaginas: number;
}

// Interfaz para visitante (coincide con Supabase)
export interface Visitante {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cedula?: string;
  fecha_registro: string;
  evento_id?: string;
  estado: EstadoVisitante;
  codigo_qr?: string;
  created_at?: string;
  updated_at?: string;
  intereses?: string[];
}

// Interfaz para invitaciones
export interface Invitacion {
  id: string;
  visitanteId: string;
  eventoId: string;
  codigo: string;
  estado: EstadoInvitacion;
  fechaEnvio: string;
  fechaExpiracion: string;
  email: string;
}

// Props para componente de estadísticas
export interface VisitantesStatsProps {
  estadisticas: EstadisticasVisitantes;
  invitaciones: Invitacion[];
}

// Props para componente de filtros
export interface VisitantesFiltersProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroInteres: string;
  setFiltroInteres: (value: string) => void;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
  interesesUnicos: string[];
  visitantesFiltrados: Visitante[];
  totalVisitantes: number;
}

// Props para componente de tabla
export interface VisitantesTableProps {
  visitantesFiltrados: Visitante[];
  invitaciones: Invitacion[];
  visitantesSeleccionados: string[];
  setVisitantesSeleccionados: (ids: string[]) => void;
  toggleSeleccionVisitante: (id: string) => void;
  eliminandoVisitante: string | null;
  eliminandoSeleccionados: boolean;
  onVerDetalles: (visitante: Visitante) => void;
  onEnviarInvitacion: (visitanteId: string) => void;
  onEliminarVisitante: (visitante: Visitante) => void;
  onInvitarSeleccionados: () => void;
  onEliminarSeleccionados: () => void;
  onImportarVisitantes: () => void;
  paginacion: PaginacionConfig;
  onCambioPagina: (pagina: number) => void;
  onCambioElementosPorPagina: (elementos: number) => void;
}

// Props para fila individual de visitante
export interface VisitanteRowProps {
  visitante: Visitante;
  invitaciones: Invitacion[];
  isSelected: boolean;
  eliminandoVisitante: string | null;
  eliminandoSeleccionados: boolean;
  onToggleSelection: (id: string) => void;
  onVerDetalles: (visitante: Visitante) => void;
  onEnviarInvitacion: (visitanteId: string) => void;
  onEliminarVisitante: (visitante: Visitante) => void;
}
