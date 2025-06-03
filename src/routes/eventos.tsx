import { createSignal, For, Show } from 'solid-js';
import '../styles/eventos.css';

// Datos de ejemplo para eventos
const eventosData = [
  {
    id: 1,
    titulo: 'Concierto de Música Clásica - EVENTO ACTIVO AHORA',
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy
    hora: `${(new Date().getHours() < 10 ? '0' : '') + new Date().getHours()}:${(new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes()}`, // Hora actual
    categoria: 'Música',
    descripcion: 'Una noche mágica con la Orquesta Sinfónica Nacional interpretando las mejores piezas de la música clásica mundial.',
    imagen: '/images/concierto1.jpg',
    ubicacion: 'Teatro Principal',
    precio: 'Entrada gratuita'
  },
  {
    id: 2,
    titulo: 'Exposición de Arte Contemporáneo',
    fecha: '2025-01-25',
    hora: '18:00',
    categoria: 'Arte Visual',
    descripcion: 'Una muestra de los artistas contemporáneos más destacados del Caribe, con obras que reflejan la diversidad cultural de nuestra región.',
    imagen: '/images/arte1.jpg',
    ubicacion: 'Galería Principal',
    precio: 'Entrada gratuita'
  },
  {
    id: 3,
    titulo: 'Teatro: "Voces del Caribe"',
    fecha: '2025-06-25',
    hora: '20:00',
    ubicacion: 'Teatro Negro',
    descripcion: 'Puesta en escena original que explora la identidad caribeña a través de monólogos y música.',
    imagen: 'teatro',
    categoria: 'Teatro',
    cuposDisponibles: 45,
    cuposTotal: 60,
    precio: 'RD$ 500'
  },
  {
    id: 4,
    titulo: 'Taller: Fotografía Digital',
    fecha: '2025-07-01',
    hora: '15:00',
    ubicacion: 'Aula Multimedia',
    descripcion: 'Taller práctico sobre técnicas básicas de fotografía digital para principiantes.',
    imagen: 'taller',
    categoria: 'Taller',
    cuposDisponibles: 12,
    cuposTotal: 15,
    precio: 'RD$ 800'
  },
  {
    id: 5,
    titulo: 'Conferencia: Historia del Merengue',
    fecha: '2025-07-05',
    hora: '17:00',
    ubicacion: 'Auditorio Principal',
    descripcion: 'Conferencia magistral sobre los orígenes y evolución del merengue dominicano.',
    imagen: 'conferencia',
    categoria: 'Conferencia',
    cuposDisponibles: 180,
    cuposTotal: 200,
    precio: 'Entrada Libre'
  },
  {
    id: 6,
    titulo: 'Festival de Poesía Joven',
    fecha: '2025-07-10',
    hora: '19:00',
    ubicacion: 'Patio Central',
    descripcion: 'Encuentro de jóvenes poetas dominicanos presentando sus obras más recientes.',
    imagen: 'literatura',
    categoria: 'Literatura',
    cuposDisponibles: 100,
    cuposTotal: 120,
    precio: 'Entrada Libre'
  }
];

// Función helper para generar código único
const generarCodigoUnico = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return `CCB-${new Date().getFullYear()}-${codigo}`;
};

// Función para detectar si un evento está activo (en curso o a punto de empezar)
const esEventoActivo = (fecha: string, hora: string) => {
  const ahora = new Date();
  const [year, month, day] = fecha.split('-');
  const [hours, minutes] = hora.split(':');
  
  const eventoDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  const diferenciaHoras = (eventoDateTime.getTime() - ahora.getTime()) / (1000 * 60 * 60);
  
  // Evento activo si es dentro de 2 horas o hasta 1 hora después de empezar
  return diferenciaHoras <= 2 && diferenciaHoras >= -1;
};

// Función helper para obtener íconos basados en categoría
const obtenerIconoEvento = (tipoImagen: string) => {
  const iconos = {
    'música': 'fas fa-music',
    'arte': 'fas fa-palette',
    'teatro': 'fas fa-theater-masks',
    'taller': 'fas fa-tools',
    'conferencia': 'fas fa-microphone',
    'literatura': 'fas fa-book'
  };
  return iconos[tipoImagen] || 'fas fa-calendar-alt';
};

// Función helper para obtener colores basados en categoría
const obtenerColorEvento = (tipoImagen: string) => {
  const colores = {
    'música': '#00BDF2',
    'arte': '#FFD700',
    'teatro': '#8E44AD',
    'taller': '#E74C3C',
    'conferencia': '#27AE60',
    'literatura': '#9B59B6'
  };
  return colores[tipoImagen] || '#F99D2A';
};

export default function Eventos() {
  const [filtroCategoria, setFiltroCategoria] = createSignal('Todos');
  const [busqueda, setBusqueda] = createSignal('');
  const [modalAbierto, setModalAbierto] = createSignal(false);
  const [eventoSeleccionado, setEventoSeleccionado] = createSignal(null);
  const [modalRegistroAbierto, setModalRegistroAbierto] = createSignal(false);
  const [eventoParaRegistro, setEventoParaRegistro] = createSignal(null);
  const [codigoGenerado, setCodigoGenerado] = createSignal('');
  const [esRegistroDirecto, setEsRegistroDirecto] = createSignal(false);
  const [modalCodigoAbierto, setModalCodigoAbierto] = createSignal(false);
  const [formData, setFormData] = createSignal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  const categorias = ['Todos', 'Música', 'Arte Visual', 'Teatro', 'Taller', 'Conferencia', 'Literatura'];

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const eventosFiltrados = () => {
    return eventosData.filter(evento => {
      const coincideCategoria = filtroCategoria() === 'Todos' || evento.categoria === filtroCategoria();
      const coincideBusqueda = evento.titulo.toLowerCase().includes(busqueda().toLowerCase()) ||
                              evento.descripcion.toLowerCase().includes(busqueda().toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularPorcentajeOcupacion = (disponibles: number, total: number) => {
    return Math.round(((total - disponibles) / total) * 100);
  };

  const abrirModal = (evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoSeleccionado(null);
    document.body.style.overflow = 'auto'; // Restaurar scroll
  };

  const abrirModalRegistro = (evento) => {
    setEventoParaRegistro(evento);
    
    // Detectar si es un evento activo para registro directo
    const eventoEsActivo = esEventoActivo(evento.fecha, evento.hora);
    setEsRegistroDirecto(eventoEsActivo);
    
    // Generar código único
    const codigo = generarCodigoUnico();
    setCodigoGenerado(codigo);
    
    setModalRegistroAbierto(true);
    document.body.style.overflow = 'hidden';
  };

  const cerrarModalRegistro = () => {
    setModalRegistroAbierto(false);
    setEventoParaRegistro(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: ''
    });
    document.body.style.overflow = 'auto';
  };

  const confirmarCheckinDirecto = () => {
    console.log('Check-in confirmado para:', formData().nombre);
    console.log('Código usado:', codigoGenerado());
    
    // Simular cambio de estado del código a USADO
    alert(`¡Check-in exitoso! Bienvenido/a ${formData().nombre} al evento "${eventoParaRegistro().titulo}". ¡Disfruta la actividad!`);
    
    // Cerrar todo y limpiar
    setModalCodigoAbierto(false);
    setCodigoGenerado('');
    setEsRegistroDirecto(false);
    cerrarModalRegistro();
  };

  const cerrarModalCodigo = () => {
    setModalCodigoAbierto(false);
    setCodigoGenerado('');
    setEsRegistroDirecto(false);
    cerrarModalRegistro();
  };

  const handleSubmitRegistro = (e) => {
    e.preventDefault();
    console.log('Registro para evento:', eventoParaRegistro().titulo);
    console.log('Datos del visitante:', formData());
    console.log('Código generado:', codigoGenerado());
    console.log('Es registro directo:', esRegistroDirecto());
    
    // Simular guardado en base de datos con estado del código
    const registro = {
      ...formData(),
      evento: eventoParaRegistro(),
      codigo: codigoGenerado(),
      estado: esRegistroDirecto() ? 'CHECKIN_DIRECTO' : 'ENVIADO',
      fechaRegistro: new Date().toISOString()
    };
    
    if (esRegistroDirecto()) {
      // Para eventos activos: mostrar modal de check-in directo
      setModalRegistroAbierto(false);
      setModalCodigoAbierto(true);
      // No reiniciar el form aún, lo haremos después del check-in
    } else {
      // Para eventos futuros: mostrar confirmación y simular envío por email
      alert(`¡Registro exitoso! Se ha enviado el código ${codigoGenerado()} a ${formData().email} con los detalles del evento.`);
      cerrarModalRegistro();
    }
  };

  return (
    <div class="eventos-page">
      {/* Header */}
      <div class="eventos-hero">
        <div class="eventos-hero-container">
          <div class="logo-eventos">
            {/* Logo del Centro Cultural Banreservas - Sin contorno blanco */}
            <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="logo-image" />
          </div>
          <div class="eventos-hero-content">
            <h1>Eventos del Centro Cultural</h1>
            <p>Descubre nuestras próximas actividades culturales</p>
            <div class="hero-actions">
              <a href="/" class="btn-volver">
                <i class="fas fa-arrow-left"></i>
                Volver al Inicio
              </a>
              <a href="/admin" class="btn-admin">
                <i class="fas fa-cog"></i>
                Administración
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        {/* Filtros y Búsqueda */}
        <div class="filtros-section">
          <div class="busqueda-container">
            <i class="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={busqueda()}
              onInput={(e) => setBusqueda(e.target.value)}
              class="busqueda-input"
            />
          </div>

          <div class="categorias-filter">
            <For each={categorias}>
              {(categoria) => (
                <button
                  class={`categoria-btn ${filtroCategoria() === categoria ? 'active' : ''}`}
                  onClick={() => setFiltroCategoria(categoria)}
                >
                  {categoria}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Grid de Eventos Profesional */}
        <div class="event-grid">
          <For each={eventosFiltrados()}>
            {(evento) => (
              <div class="event-card" onClick={() => abrirModalRegistro(evento)}>
                <div class="event-image">
                  <div class="event-icon" style={`background-color: ${obtenerColorEvento(evento.imagen)}`}>
                    <i class={obtenerIconoEvento(evento.imagen)}></i>
                  </div>
                  <div class="event-badge">{evento.categoria}</div>
                </div>
                
                <div class="event-content">
                  <h3 class="event-title">{evento.titulo}</h3>
                  
                  <div class="event-details">
                    <div class="event-detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>{formatearFecha(evento.fecha)}</span>
                    </div>
                    <div class="event-detail-item">
                      <i class="fas fa-clock"></i>
                      <span>{evento.hora}</span>
                    </div>
                    <div class="event-detail-item">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>{evento.ubicacion}</span>
                    </div>
                  </div>

                  <div class="event-price">
                    <i class="fas fa-ticket-alt"></i> {evento.precio}
                  </div>

                  <div class="event-availability">
                    <div class="availability-text">
                      <span class="cupos-disponibles">{evento.cuposDisponibles}</span> cupos disponibles
                      de <span class="cupos-total">{evento.cuposTotal}</span>
                    </div>
                    <div class="availability-bar">
                      <div 
                        class="availability-progress"
                        style={`width: ${calcularPorcentajeOcupacion(evento.cuposDisponibles, evento.cuposTotal)}%`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Mensaje si no hay eventos */}
        {eventosFiltrados().length === 0 && (
          <div class="no-eventos">
            <i class="fas fa-calendar-times"></i>
            <h3>No se encontraron eventos</h3>
            <p>Intenta cambiar los filtros o la búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal Moderno */}
      {modalAbierto() && (
        <div class={`modal-overlay ${modalAbierto() ? 'modal-open' : ''}`} onClick={cerrarModal}>
          <div class={`modal-container ${modalAbierto() ? 'modal-slide-up' : ''}`} onClick={(e) => e.stopPropagation()}>
            {eventoSeleccionado() && (
              <div class="modal-content">
                {/* Header del Modal */}
                <div class="modal-header">
                  <button class="modal-close" onClick={cerrarModal}>
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                {/* Imagen del Evento */}
                <div class="modal-image">
                  <div class="modal-icon" style={`background-color: ${obtenerColorEvento(eventoSeleccionado().imagen)}`}>
                    <i class={obtenerIconoEvento(eventoSeleccionado().imagen)}></i>
                  </div>
                  <div class="modal-categoria">{eventoSeleccionado().categoria}</div>
                </div>

                {/* Contenido del Modal */}
                <div class="modal-body">
                  <h2 class="modal-title">{eventoSeleccionado().titulo}</h2>
                  
                  <div class="modal-detalles">
                    <div class="detalle-item">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{formatearFecha(eventoSeleccionado().fecha)}</span>
                    </div>
                    <div class="detalle-item">
                      <i class="fas fa-clock"></i>
                      <span>{eventoSeleccionado().hora}</span>
                    </div>
                    <div class="detalle-item">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>{eventoSeleccionado().ubicacion}</span>
                    </div>
                    <div class="detalle-item">
                      <i class="fas fa-ticket-alt"></i>
                      <span>{eventoSeleccionado().precio}</span>
                    </div>
                  </div>

                  <p class="modal-descripcion">{eventoSeleccionado().descripcion}</p>

                  <div class="modal-cupos">
                    <div class="cupos-info">
                      <div class="cupos-text">
                        <span class="cupos-disponibles">{eventoSeleccionado().cuposDisponibles}</span> cupos disponibles
                        de <span class="cupos-total">{eventoSeleccionado().cuposTotal}</span>
                      </div>
                      <div class="cupos-barra">
                        <div 
                          class="cupos-progreso"
                          style={`width: ${calcularPorcentajeOcupacion(eventoSeleccionado().cuposDisponibles, eventoSeleccionado().cuposTotal)}%`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="modal-acciones">
                    <button class="btn-modal-registrarse" onClick={() => { cerrarModal(); abrirModalRegistro(eventoSeleccionado()); }}>
                      <i class="fas fa-user-plus"></i>
                      Registrarse al Evento
                    </button>
                    <button class="btn-modal-cerrar" onClick={cerrarModal}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {modalRegistroAbierto() && (
        <div class={`modal-overlay ${modalRegistroAbierto() ? 'modal-open' : ''}`} onClick={cerrarModalRegistro}>
          <div class={`modal-container ${modalRegistroAbierto() ? 'modal-slide-up' : ''}`} onClick={(e) => e.stopPropagation()}>
            {eventoParaRegistro() && (
              <div class="modal-content">
                {/* Header del Modal */}
                <div class="modal-header">
                  <h3 class="modal-header-title">Registro de Visitante</h3>
                  <button class="modal-close" onClick={cerrarModalRegistro}>
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                {/* Info del Evento */}
                <div class="modal-evento-info">
                  <div class="evento-info-icon" style={`background-color: ${obtenerColorEvento(eventoParaRegistro().imagen)}`}>
                    <i class={obtenerIconoEvento(eventoParaRegistro().imagen)}></i>
                  </div>
                  <div class="evento-info-content">
                    <h4>{eventoParaRegistro().titulo}</h4>
                    <div class="evento-info-detalles">
                      <span><i class="fas fa-calendar-alt"></i> {formatearFecha(eventoParaRegistro().fecha)}</span>
                      <span><i class="fas fa-clock"></i> {eventoParaRegistro().hora}</span>
                      <span><i class="fas fa-map-marker-alt"></i> {eventoParaRegistro().ubicacion}</span>
                    </div>
                  </div>
                </div>

                {/* Formulario de Registro */}
                <form onSubmit={handleSubmitRegistro} class="modal-form">
                  <div class="form-group">
                    <label for="modal-nombre">Nombre *</label>
                    <input
                      type="text"
                      id="modal-nombre"
                      value={formData().nombre}
                      onInput={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Ingresa tu nombre"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="modal-apellido">Apellido *</label>
                    <input
                      type="text"
                      id="modal-apellido"
                      value={formData().apellido}
                      onInput={(e) => handleInputChange('apellido', e.target.value)}
                      placeholder="Ingresa tu apellido"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="modal-email">Email *</label>
                    <input
                      type="email"
                      id="modal-email"
                      value={formData().email}
                      onInput={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="modal-telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="modal-telefono"
                      value={formData().telefono}
                      onInput={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="(809) 000-0000"
                      required
                    />
                  </div>

                  <div class="modal-acciones-registro">
                    <button type="button" class="btn-modal-cancelar" onClick={cerrarModalRegistro}>
                      Cancelar
                    </button>
                    <button type="submit" class="btn-modal-confirmar">
                      <i class="fas fa-check"></i>
                      Confirmar Registro
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Código de Check-in Directo */}
      <Show when={modalCodigoAbierto()}>
        <div class="modal-overlay" onClick={cerrarModalCodigo}>
          <div class="modal-content codigo-directo-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¡Check-in Directo!</h3>
            <div class="codigo-display">
              <p>Tu código de acceso es:</p>
              <div class="codigo-grande">
                {codigoGenerado()}
              </div>
            </div>
            <div class="evento-info">
              <Show when={eventoParaRegistro()}>
                <h4>{eventoParaRegistro().titulo}</h4>
                <p><strong>Fecha:</strong> {eventoParaRegistro().fecha}</p>
                <p><strong>Hora:</strong> {eventoParaRegistro().hora}</p>
                <p><strong>Lugar:</strong> {eventoParaRegistro().ubicacion}</p>
              </Show>
            </div>
            <p class="instrucciones">
              ¡Hola {formData().nombre}! Tu evento está <strong>activo ahora</strong>. 
              Presenta este código en la entrada para acceder directamente.
            </p>
            <div class="modal-buttons">
              <button type="button" class="btn-confirmar" onClick={confirmarCheckinDirecto}>
                ✓ Confirmar Check-in
              </button>
              <button type="button" class="btn-cancelar" onClick={cerrarModalCodigo}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}