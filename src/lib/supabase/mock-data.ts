// =============================================================================
// DATOS MOCK PARA DESARROLLO Y PRUEBAS
// =============================================================================

export const mockEventos = [
  {
    id: '1',
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
    estado: 'proximo' as const,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: '2',
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
    estado: 'activo' as const,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z"
  },
  {
    id: '3',
    titulo: "Obra Teatral: Memorias del Caribe",
    descripcion: "Drama contemporáneo que narra la historia de tres generaciones",
    categoria: "Teatro",
    fecha: "2024-12-21",
    hora: "19:30",
    duracion: 2,
    ubicacion: "Teatro Principal",
    capacidad: 120,
    registrados: 98,
    precio: 1200,
    imagen: "https://via.placeholder.com/400x200/EF4444/FFFFFF?text=Teatro+Caribe",
    estado: 'proximo' as const,
    created_at: "2024-01-12T14:00:00Z",
    updated_at: "2024-01-12T14:00:00Z"
  },
  {
    id: '4',
    titulo: "Taller de Escritura Creativa",
    descripcion: "Aprende técnicas narrativas con escritores experimentados",
    categoria: "Talleres",
    fecha: "2024-12-17",
    hora: "10:00",
    duracion: 4,
    ubicacion: "Aula 3",
    capacidad: 25,
    registrados: 22,
    precio: 500,
    imagen: "https://via.placeholder.com/400x200/EC4899/FFFFFF?text=Escritura+Creativa",
    estado: 'activo' as const,
    created_at: "2024-01-08T11:00:00Z",
    updated_at: "2024-01-08T11:00:00Z"
  },
  {
    id: '5',
    titulo: "Festival de Danza Folclórica",
    descripcion: "Celebración de las tradiciones dancísticas dominicanas",
    categoria: "Danza",
    fecha: "2024-12-25",
    hora: "16:00",
    duracion: 5,
    ubicacion: "Plaza Central",
    capacidad: 500,
    registrados: 387,
    precio: 0,
    imagen: "https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Danza+Folklorica",
    estado: 'proximo' as const,
    created_at: "2024-01-05T16:00:00Z",
    updated_at: "2024-01-05T16:00:00Z"
  }
];

export const mockVisitantes = [
  {
    id: '1',
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@email.com",
    telefono: "809-555-0101",
    cedula: "001-1234567-8",
    fecha_registro: "2024-01-15T10:30:00Z",
    estado: 'activo' as const,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: '2',
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@email.com",
    telefono: "809-555-0102",
    cedula: "001-2345678-9",
    fecha_registro: "2024-01-14T15:45:00Z",
    estado: 'activo' as const,
    created_at: "2024-01-14T15:45:00Z",
    updated_at: "2024-01-14T15:45:00Z"
  },
  {
    id: '3',
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@email.com",
    telefono: "809-555-0103",
    cedula: "001-3456789-0",
    fecha_registro: "2024-01-16T09:20:00Z",
    estado: 'activo' as const,
    created_at: "2024-01-16T09:20:00Z",
    updated_at: "2024-01-16T09:20:00Z"
  }
];

// Estadísticas calculadas a partir de los datos mock
export const mockEstadisticas = {
  eventos: {
    total: mockEventos.length,
    activos: mockEventos.filter(e => e.estado === 'activo').length,
    visitantes: mockEventos.reduce((sum, evento) => sum + evento.registrados, 0),
    checkins: Math.round(mockEventos.reduce((sum, evento) => sum + evento.registrados, 0) * 0.8),
    ingresos: mockEventos.reduce((sum, evento) => sum + (evento.registrados * evento.precio), 0)
  },
  visitantes: {
    total: mockVisitantes.length,
    activos: mockVisitantes.filter(v => v.estado === 'activo').length,
    hoy: 1, // Simulamos que 1 se registró hoy
    estaSemana: 2 // Simulamos que 2 se registraron esta semana
  }
}; 