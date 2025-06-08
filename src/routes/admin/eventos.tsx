import { Component, createSignal, For, Show, onMount } from "solid-js";
import { eventosService, registroEventosService } from '../../lib/supabase/services';

interface Evento {
  id: string;
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
  estado: 'activo' | 'proximo' | 'completado';
}

const eventosEjemplo: Evento[] = [
  {
    id: "1",
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
    estado: 'proximo'
  },
  {
    id: "2",
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
    estado: 'activo'
  },
  {
    id: "3",
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
    estado: 'proximo'
  },
  {
    id: "4",
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
    estado: 'activo'
  },
  {
    id: "5",
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
    estado: 'proximo'
  }
];

export const EventosAdmin: Component = () => {
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [cargando, setCargando] = createSignal(true);
  const [busqueda, setBusqueda] = createSignal("");
  const [filtroCategoria, setFiltroCategoria] = createSignal("");
  const [filtroEstado, setFiltroEstado] = createSignal("");
  const [eventoSeleccionado, setEventoSeleccionado] = createSignal<Evento | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = createSignal(false);
  const [modalAbierto, setModalAbierto] = createSignal(false);

  // 🔥 CARGAR EVENTOS REALES DE SUPABASE
  const cargarEventos = async () => {
    try {
      setCargando(true);
      console.log('🔄 Cargando eventos desde Supabase...');
      const eventosReales = await eventosService.obtenerTodos();
      console.log('✅ Eventos cargados:', eventosReales.length);
      setEventos(eventosReales as Evento[]);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      // Si falla, usar datos de ejemplo como fallback
      setEventos(eventosEjemplo);
    } finally {
      setCargando(false);
    }
  };

  // Cargar eventos al montar el componente
  onMount(() => {
    cargarEventos();
  });

  // Funciones auxiliares
  const determinarEstadoEvento = (fecha: string, hora: string, duracion: number): 'activo' | 'proximo' | 'completado' => {
    const fechaEvento = new Date(`${fecha} ${hora}`);
    const ahora = new Date();
    const fechaFin = new Date(fechaEvento.getTime() + duracion * 60 * 60 * 1000);
    
    if (ahora < fechaEvento) return 'proximo';
    if (ahora > fechaFin) return 'completado';
    return 'activo';
  };

  const obtenerColorCategoria = (categoria: string): string => {
    const colores = {
      'Música': '#1E40AF',
      'Arte': '#F59E0B',
      'Teatro': '#EF4444',
      'Danza': '#8B5CF6',
      'Talleres': '#EC4899',
      'Literatura': '#059669'
    };
    return colores[categoria as keyof typeof colores] || '#6B7280';
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularPorcentajeOcupacion = (registrados: number, capacidad: number): number => {
    return Math.round((registrados / capacidad) * 100);
  };

  // Eventos filtrados
  const eventosFiltrados = () => {
    return eventos().filter(evento => {
      const coincideBusqueda = evento.titulo.toLowerCase().includes(busqueda().toLowerCase()) ||
                              evento.descripcion.toLowerCase().includes(busqueda().toLowerCase());
      const coincideCategoria = !filtroCategoria() || evento.categoria === filtroCategoria();
      const coincideEstado = !filtroEstado() || evento.estado === filtroEstado();
      
      return coincideBusqueda && coincideCategoria && coincideEstado;
    });
  };

  // Estadísticas
  const estadisticas = () => {
    const eventosTotal = eventos().length;
    const eventosActivos = eventos().filter(e => e.estado === 'activo').length;
    const totalRegistrados = eventos().reduce((total, evento) => total + evento.registrados, 0);
    const ingresosTotales = eventos().reduce((total, evento) => 
      total + (evento.registrados * evento.precio), 0
    );

    return {
      total: eventosTotal,
      activos: eventosActivos,
      registrados: totalRegistrados,
      ingresos: ingresosTotales
    };
  };

  const abrirModalDetalles = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoSeleccionado(null);
  };

  return (
    <div class="admin-content">
      {/* Header con la estructura correcta del diseño aprobado */}
      <div class="breadcrumb">
        <span>Eventos</span>
        <span>/</span>
        <span>Dashboard</span>
        <span>/</span>
        <span>Centro Cultural Banreservas</span>
      </div>

      <Show when={cargando()}>
        <div style="text-align: center; padding: 2rem; color: #666;">
          🔄 Cargando eventos desde Supabase...
        </div>
      </Show>

      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">¡Bienvenido de vuelta, Admin! 👋</h1>
          <p class="welcome-subtitle">Gestiona todos los eventos del Centro Cultural Banreservas</p>
        </div>
        <div class="welcome-actions">
          <button class="header-btn share">
            📊 Compartir
          </button>
          <button 
            class="header-btn create"
            onClick={() => setMostrarFormulario(true)}
          >
            ➕ Nuevo Evento
          </button>
          <button class="header-btn logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Stats Grid igual al diseño aprobado */}
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ff9500 0%, #ff7b00 100%);">
            📅
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticas().total}</h3>
            <p class="stat-label">EVENTOS TOTALES</p>
            <p class="stat-sublabel">Eventos programados</p>
            <span class="stat-change positive">
              📈 +12% vs mes anterior
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
            👥
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticas().registrados}</h3>
            <p class="stat-label">VISITANTES</p>
            <p class="stat-sublabel">Personas registradas</p>
            <span class="stat-change positive">
              📈 +8% vs mes anterior
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            ✅
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{Math.round((estadisticas().registrados / (estadisticas().total || 1)) * 10)}</h3>
            <p class="stat-label">CHECK-INS HOY</p>
            <p class="stat-sublabel">Asistencias confirmadas</p>
            <span class="stat-change positive">
              📈 +15% vs ayer
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            🎭
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticas().activos}</h3>
            <p class="stat-label">EVENTOS ACTIVOS</p>
            <p class="stat-sublabel">Eventos completados</p>
            <span class="stat-change positive">
              📈 +23% vs mes anterior
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
            📊
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{Math.round((estadisticas().registrados / 100) * 100)}</h3>
            <p class="stat-label">PÁGINAS VISTAS</p>
            <p class="stat-sublabel">Visitas totales</p>
            <span class="stat-change positive">
              📈 +31% vs mes anterior
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            🔥
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{eventos().filter(e => e.registrados > e.capacidad * 0.8).length}</h3>
            <p class="stat-label">EVENTOS POPULARES</p>
            <p class="stat-sublabel">Con alta demanda</p>
            <span class="stat-change positive">
              📈 +5% vs mes anterior
            </span>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas igual al diseño aprobado */}
      <div class="content-grid">
        <div class="content-section">
          <div class="section-header">
            <h2 class="section-title">Registros de Eventos</h2>
            <p class="section-subtitle">
              {new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })} - 
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* Filtros discretos */}
          <div class="search-container-simple">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={busqueda()}
              onInput={(e) => setBusqueda(e.currentTarget.value)}
              class="search-input-simple"
            />
            <div class="filters-inline">
              <select
                value={filtroCategoria()}
                onChange={(e) => setFiltroCategoria(e.currentTarget.value)}
                class="filter-select-simple"
              >
                <option value="">Todas las categorías</option>
                <option value="Música">Música</option>
                <option value="Arte">Arte</option>
                <option value="Teatro">Teatro</option>
                <option value="Danza">Danza</option>
                <option value="Talleres">Talleres</option>
              </select>
              <select
                value={filtroEstado()}
                onChange={(e) => setFiltroEstado(e.currentTarget.value)}
                class="filter-select-simple"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="proximo">Próximos</option>
                <option value="completado">Completados</option>
              </select>
            </div>
          </div>

          {/* Lista de eventos como en el diseño aprobado */}
          <div class="eventos-list">
            <For each={eventosFiltrados()}>
              {(evento) => (
                <div class="evento-item" onClick={() => abrirModalDetalles(evento)}>
                  <div class="evento-imagen-small">
                    <img src={evento.imagen} alt={evento.titulo} />
                    <div class="evento-estado-badge" style={`background-color: ${
                      evento.estado === 'activo' ? '#F59E0B' :
                      evento.estado === 'proximo' ? '#10B981' : '#6B7280'
                    }`}>
                      {evento.estado === 'activo' ? 'EN CURSO' :
                       evento.estado === 'proximo' ? 'PRÓXIMO' : 'FINALIZADO'}
                    </div>
                  </div>
                  
                  <div class="evento-info-compact">
                    <h4 class="evento-titulo-small">{evento.titulo}</h4>
                    <p class="evento-descripcion-small">{evento.descripcion}</p>
                    
                    <div class="evento-meta-small">
                      <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span>{formatearFecha(evento.fecha)}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-icon">🕐</span>
                        <span>{evento.hora}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-icon">📍</span>
                        <span>{evento.ubicacion}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-icon">💰</span>
                        <span>RD${evento.precio.toLocaleString()}</span>
                      </div>
                    </div>

                    <div class="evento-categoria-small" style={`background-color: ${obtenerColorCategoria(evento.categoria)}`}>
                      {evento.categoria}
                    </div>
                  </div>

                  <div class="evento-stats-small">
                    <div class="stat-small">
                      <span class="stat-number-small">{evento.registrados}</span>
                      <span class="stat-label-small">registrados</span>
                    </div>
                    <div class="progress-small">
                      <div 
                        class="progress-fill-small"
                        style={`width: ${calcularPorcentajeOcupacion(evento.registrados, evento.capacidad)}%`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </For>

            <Show when={eventosFiltrados().length === 0}>
              <div class="empty-state">
                <p>📊 Aquí irá un gráfico de registros de eventos</p>
                <p class="empty-subtitle">Similar al gráfico "Product Sales" de hi.events</p>
              </div>
            </Show>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="activity-section">
            <h3 class="activity-title">Actividad Reciente</h3>
            
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-avatar">MG</div>
                <div class="activity-content">
                  <p class="activity-text"><strong>María González</strong> se registró para "Concierto de Jazz"</p>
                  <span class="activity-time">Hace 2 horas</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-avatar">EC</div>
                <div class="activity-content">
                  <p class="activity-text"><strong>Evento creado:</strong> "Exposición de Arte Contemporáneo"</p>
                  <span class="activity-time">Hace 5 horas</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-avatar">15</div>
                <div class="activity-content">
                  <p class="activity-text"><strong>15 personas</strong> se registraron para "Taller de Fotografía"</p>
                  <span class="activity-time">Ayer</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-avatar">ED</div>
                <div class="activity-content">
                  <p class="activity-text"><strong>Evento destacado:</strong> "Noche de Poesía" alcanzó 100 registros</p>
                  <span class="activity-time">Hace 3 días</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay eventos */}
      <Show when={eventosFiltrados().length === 0}>
        <div class="no-eventos">
          <h3>No se encontraron eventos</h3>
          <p>Intenta ajustar los filtros o crear un nuevo evento.</p>
          <button
            onClick={() => setMostrarFormulario(true)}
            class="btn-primary"
          >
            Crear Primer Evento
          </button>
        </div>
      </Show>

      {/* Modal de Detalles */}
      <Show when={modalAbierto() && eventoSeleccionado()}>
        <div class="modal-overlay" onClick={cerrarModal}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{eventoSeleccionado()?.titulo}</h2>
              <button onClick={cerrarModal} class="modal-close">×</button>
            </div>
            
            <div class="modal-body">
              <div class="evento-detalle-imagen">
                <img src={eventoSeleccionado()?.imagen} alt={eventoSeleccionado()?.titulo} />
              </div>
              
              <div class="evento-detalle-info">
                <p><strong>Descripción:</strong> {eventoSeleccionado()?.descripcion}</p>
                <p><strong>Categoría:</strong> {eventoSeleccionado()?.categoria}</p>
                <p><strong>Fecha:</strong> {formatearFecha(eventoSeleccionado()?.fecha || '')}</p>
                <p><strong>Hora:</strong> {eventoSeleccionado()?.hora}</p>
                <p><strong>Duración:</strong> {eventoSeleccionado()?.duracion} horas</p>
                <p><strong>Ubicación:</strong> {eventoSeleccionado()?.ubicacion}</p>
                <p><strong>Capacidad:</strong> {eventoSeleccionado()?.capacidad} personas</p>
                <p><strong>Registrados:</strong> {eventoSeleccionado()?.registrados}</p>
                <p><strong>Precio:</strong> RD${eventoSeleccionado()?.precio}</p>
                <p><strong>Estado:</strong> {eventoSeleccionado()?.estado}</p>
              </div>
            </div>
            
            <div class="modal-footer">
              <button onClick={cerrarModal} class="btn-secondary">Cerrar</button>
              <button class="btn-primary">Editar Evento</button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default EventosAdmin;