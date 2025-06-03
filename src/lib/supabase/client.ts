import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - cambiar por tus credenciales reales
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = 'tu-anon-key-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos para mantener consistencia
export interface Visitante {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cedula?: string;
  fecha_registro: string;
  evento_id?: string;
  estado: 'activo' | 'inactivo';
  codigo_qr?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Evento {
  id?: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  hora: string;
  duracion: number;
  ubicacion: string;
  capacidad: number;
  registrados: number;
  precio: number;
  imagen: string;
  estado: 'proximo' | 'activo' | 'completado';
  created_at?: string;
  updated_at?: string;
}

export interface RegistroEvento {
  id?: string;
  visitante_id: string;
  evento_id: string;
  fecha_registro: string;
  codigo_confirmacion: string;
  estado: 'pendiente' | 'confirmado' | 'checkin' | 'cancelado';
  created_at?: string;
} 