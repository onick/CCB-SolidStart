// Tipos para el sistema de eventos del Centro Cultural Banreservas

export interface Evento {
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
  duracion: number; // en minutos
  estado: 'activo' | 'inactivo' | 'finalizado';
  created_at?: string;
  updated_at?: string;
}

export interface Visitante {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  codigo_unico?: string;
  fecha_registro?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegistroEvento {
  id?: string;
  evento_id: string;
  visitante_id?: string;
  codigo_acceso: string;
  fecha_registro: string;
  check_in_realizado?: boolean;
  fecha_check_in?: string;
  created_at?: string;
}

export interface RegistroLocal {
  eventoId: string;
  email: string;
  nombre: string;
  codigo: string;
  fechaRegistro: string;
  eventoTitulo: string;
}

export interface FormularioRegistro {
  nombre: string;
  email: string;
  telefono: string;
}

export interface EstadoDisponibilidad {
  cuposDisponibles: number;
  estado: 'activo' | 'finalizado' | 'proximo';
  puedeRegistrarse: boolean;
}

export type FiltroEvento = 'todos' | 'en_curso' | 'proximos' | 'finalizados';
