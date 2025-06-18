// Types para componentes administrativos de eventos
export interface EventoAdmin {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  capacidad: number;
  registrados: number;
  precio: number;
  categoria: string;
  ubicacion: string;
  duracion: number;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

// EventosHeaderProps removido - usando AdminHeader con configuración específica

export interface EventosGridProps {
  eventos: EventoAdmin[];
  cargando: boolean;
  mensaje: string;
  onEditarEvento: (evento: EventoAdmin) => void;
  onEliminarEvento: (evento: EventoAdmin) => void;
  eliminandoEvento: string | null;
}

export interface EventoAdminCardProps {
  evento: EventoAdmin;
  onEditar: (evento: EventoAdmin) => void;
  onEliminar: (evento: EventoAdmin) => void;
  eliminando: boolean;
}

export interface ConfirmDeleteModalProps {
  mostrar: boolean;
  evento: EventoAdmin | null;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export interface EventosStatsProps {
  totalEventos: number;
  eventosActivos: number;
  totalRegistrados: number;
  cargando: boolean;
}
