import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService } from '../lib/supabase/services';
import '../styles/admin.css';

// solid-icons for better performance and native Solid.js integration
import {
    FaRegularCalendar,
    FaSolidCalendarXmark,
    FaSolidChartBar,
    FaSolidCode,
    FaSolidDownload,
    FaSolidGear,
    FaSolidHouse,
    FaSolidPenToSquare,
    FaSolidSpinner,
    FaSolidTags,
    FaSolidTicket,
    FaSolidTrash,
    FaSolidUsers,
    FaSolidWandMagicSparkles
} from 'solid-icons/fa';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon-key');
};

// Función global para crear eventos de prueba
(window as any).crearEventosDePrueba = async () => {
  console.log('🎭 Creando eventos de prueba...');
  
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
    }
  ];

  try {
    for (const evento of eventosEjemplo) {
      const resultado = await eventosService.crear(evento);
      if (resultado) {
        console.log(`✅ Evento creado: ${evento.titulo}`);
      } else {
        console.log(`❌ Error creando: ${evento.titulo}`);
      }
    }
    console.log('🎉 ¡Todos los eventos de prueba han sido creados!');
    console.log('📍 Ve a http://localhost:3001/eventos para verlos en el admin');
    console.log('📍 Ve a http://localhost:3001/eventos-publicos para verlos en la página pública');
    
    // Recargar la página para mostrar los nuevos eventos
    window.location.reload();
  } catch (error) {
    console.error('❌ Error creando eventos de prueba:', error);
  }
};

const Eventos: Component = () => {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [eventos, setEventos] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterCategory, setFilterCategory] = createSignal('todas');
  const [filterStatus, setFilterStatus] = createSignal('todos');
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [isCreating, setIsCreating] = createSignal(false);
  
  // Estado del formulario de nuevo evento
  const [newEvent, setNewEvent] = createSignal({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    duracion: 60,
    ubicacion: '',
    categoria: 'concierto',
    capacidad: 100,
    estado: 'activo' as 'activo' | 'proximo' | 'completado',
    cupos: 100,
    imagen: ''
  });

  // Verificar autenticación
  onMount(() => {
    console.log('Eventos: Verificando autenticación...');
    const authStatus = localStorage.getItem('admin_authenticated');
    console.log('Estado de autenticación:', authStatus);
    
    // Modo de test - bypass automático (SOLO para development)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      console.log('🧪 Modo de test activado - bypass de login');
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      cargarEventos();
      return;
    }
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      cargarEventos();
    }
  });

  const cargarEventos = async () => {
    console.log('📅 Cargando eventos...');
    setIsLoading(true);
    
    try {
      const eventosData = await eventosService.obtenerTodos();
      setEventos(eventosData);
      console.log('📅 Eventos cargados:', eventosData);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: Event) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const eventData = {
        ...newEvent(),
        registrados: 0,
        precio: 0
      };
      
      console.log('🎭 Creando nuevo evento:', eventData);
      await eventosService.crear(eventData);
      
      // Recargar eventos
      await cargarEventos();
      
      // Resetear formulario y cerrar modal
      setNewEvent({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        duracion: 60,
        ubicacion: '',
        categoria: 'concierto',
        capacidad: 100,
        estado: 'activo',
        cupos: 100,
        imagen: ''
      });
      setShowCreateModal(false);
      
      console.log('✅ Evento creado exitosamente');
      alert('✅ ¡Evento creado exitosamente!\n\n📋 El evento aparecerá automáticamente en la página pública:\n🔗 http://localhost:3002/eventos-publicos\n\n💡 Los eventos con estado "activo" son visibles al público.');
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      alert('Error al crear el evento. Por favor intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const crearEventosDePrueba = async () => {
    console.log('🎭 Creando eventos de prueba...');
    
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
      }
    ];

    try {
      for (const evento of eventosEjemplo) {
        const resultado = await eventosService.crear(evento);
        if (resultado) {
          console.log(`✅ Evento creado: ${evento.titulo}`);
        } else {
          console.log(`❌ Error creando: ${evento.titulo}`);
        }
      }
      console.log('🎉 ¡Todos los eventos de prueba han sido creados!');
      alert('✅ ¡Eventos de prueba creados exitosamente!\n\n📋 Los eventos aparecerán automáticamente en la página pública:\n🔗 http://localhost:3002/eventos-publicos\n\n💡 Revisa la consola para más detalles.\n🔄 La página pública se actualiza automáticamente cada 30 segundos.');
      
      // Recargar eventos
      await cargarEventos();
    } catch (error) {
      console.error('❌ Error creando eventos de prueba:', error);
      alert('❌ Error creando eventos de prueba. Revisa la consola para más detalles.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    window.location.href = '/admin';
  };

  const filteredEventos = () => {
    return eventos().filter(evento => {
      const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm().toLowerCase()) ||
                           evento.descripcion.toLowerCase().includes(searchTerm().toLowerCase());
      const matchesCategory = filterCategory() === 'todas' || evento.categoria === filterCategory();
      const matchesStatus = filterStatus() === 'todos' || evento.estado === filterStatus();
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return '#10B981';
      case 'borrador': return '#F59E0B';
      case 'cancelado': return '#EF4444';
      case 'finalizado': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Comentando la restricción de autenticación por ahora
  // if (!isAuthenticated()) {
  //   return (
  //     <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
  //       <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  //         <h2>Acceso Restringido</h2>
  //         <p>Debes iniciar sesión para acceder a esta página.</p>
  //         <a href="/admin" style="background: #3B82F6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 1rem;">
  //           Ir al Login
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div class="admin-panel">
      {/* MISMA Sidebar que admin.tsx */}
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <img src="/images/logo.png" alt="CCB" class="sidebar-logo-icon" />
            <div class="sidebar-brand">
              <h1>CCB Admin</h1>
              <p>Centro Cultural</p>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Principal</div>
            <div class="nav-item" onclick={() => window.location.href='/admin'} style="cursor: pointer;">
              <FaSolidHouse size={18} color="white" />
              <span>Dashboard</span>
            </div>
            <div class="nav-item">
              <FaSolidChartBar size={18} color="white" />
              <span>Reportes</span>
            </div>
            <div class="nav-item">
              <FaSolidGear size={18} color="white" />
              <span>Configuración</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Gestionar</div>
            <div class="nav-item active">
              <FaRegularCalendar size={18} color="#F39D1E" />
              <span>Eventos</span>
            </div>
            <div class="nav-item">
              <FaSolidUsers size={18} color="white" />
              <span>Visitantes</span>
            </div>
            <div class="nav-item" onclick={() => window.location.href='/registros'} style="cursor: pointer;">
              <FaSolidTicket size={18} color="white" />
              <span>Registros</span>
            </div>
            <div class="nav-item">
              <FaSolidTags size={18} color="white" />
              <span>Promociones</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Herramientas</div>
            <div class="nav-item">
              <FaSolidCode size={18} color="white" />
              <span>Integraciones</span>
            </div>
            <div class="nav-item">
              <FaSolidDownload size={18} color="white" />
              <span>Exportar</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* MISMO Main Content que admin.tsx */}
      <main class="admin-main">
        <header class="main-header">
          <div class="header-content">
            <div class="header-left">
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                📅 Gestión de Eventos
              </h1>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">
                Administra los eventos del Centro Cultural Banreservas
              </p>
            </div>
            <div class="header-actions" style="display: flex; gap: 12px; align-items: center;">
              <button 
                onclick={crearEventosDePrueba}
                style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5a67d8 100%);
                  color: white;
                  padding: 12px 24px;
                  border: none;
                  border-radius: 10px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
                  transition: all 0.3s ease;
                "
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                }}
              >
                <FaSolidWandMagicSparkles size={16} color="white" />
                <span>🎭 Crear Eventos de Prueba</span>
              </button>
              <button 
                onclick={() => setShowCreateModal(true)}
                class="create-event-btn"
                style="
                  background: linear-gradient(135deg, #e67e22 0%, #f39c12 50%, #d68910 100%);
                  color: white;
                  padding: 14px 28px;
                  border: none;
                  border-radius: 12px;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  box-shadow: 0 8px 25px rgba(230, 126, 34, 0.3);
                  transition: all 0.3s ease;
                  position: relative;
                  overflow: hidden;
                "
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(230, 126, 34, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(230, 126, 34, 0.3)';
                }}
              >
                <svg 
                  style="width: 20px; height: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">✨ Crear Evento</span>
              </button>
            </div>
          </div>
        </header>

        {/* Banner informativo para datos mock */}
        {!import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co') && (
          <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #92400e; padding: 16px; margin: 20px; border-radius: 12px; border: 1px solid #fcd34d; box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px;">🧪</div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">
                  Modo de Prueba Activado - Persistencia en localStorage
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                  Los eventos se guardan en el navegador para que no se pierdan al recargar.
                  Para persistencia real en base de datos, ve a{' '}
                  <a href="/setup-supabase" style="color: #92400e; text-decoration: underline; font-weight: 600;">
                    /setup-supabase
                  </a>
                </div>
              </div>
              <button 
                onclick={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar todos los eventos guardados?')) {
                    localStorage.removeItem('ccb_eventos_mock');
                    window.location.reload();
                  }
                }}
                style="background: rgba(146, 64, 14, 0.1); color: #92400e; border: 1px solid rgba(146, 64, 14, 0.3); padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;"
              >
                🗑️ Limpiar Eventos
              </button>
            </div>
          </div>
        )}

        <div class="main-content">
          {/* Alerta de datos mock */}
          {!isSupabaseConfigured() && (
            <div class="mock-data-alert" style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h4 style="margin: 0 0 10px 0; color: #92400E;">🧪 Usando Datos de Prueba</h4>
              <p style="margin: 0 0 15px 0; color: #92400E;">
                Supabase no está configurado. Actualmente se muestran eventos mock para demostración.
              </p>
              <a 
                href="/setup-supabase" 
                style="background: #1E40AF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;"
              >
                ⚙️ Configurar Supabase
              </a>
            </div>
          )}

          {/* Filtros y búsqueda */}
          <div class="content-card" style="margin-bottom: 20px;">
            <div class="card-header">
              <div>
                <h2 class="card-title">Filtros y Búsqueda</h2>
              </div>
            </div>
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; align-items: end;">
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Buscar eventos:</label>
                  <input
                    type="text"
                    placeholder="Buscar por título o descripción..."
                    value={searchTerm()}
                    onInput={(e) => setSearchTerm(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Categoría:</label>
                  <select
                    value={filterCategory()}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todas">Todas las categorías</option>
                    <option value="concierto">Conciertos</option>
                    <option value="teatro">Teatro</option>
                    <option value="exposicion">Exposiciones</option>
                    <option value="taller">Talleres</option>
                    <option value="conferencia">Conferencias</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Estado:</label>
                  <select
                    value={filterStatus()}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="borrador">Borradores</option>
                    <option value="cancelado">Cancelados</option>
                    <option value="finalizado">Finalizados</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de eventos */}
          <div class="content-card">
            <div class="card-header">
              <div>
                <h2 class="card-title">Lista de Eventos ({filteredEventos().length})</h2>
                <p class="card-subtitle">Gestiona todos los eventos del centro cultural</p>
              </div>
            </div>
            
            <Show when={isLoading()}>
              <div style="padding: 40px; text-align: center; color: #6B7280;">
                <FaSolidSpinner size={24} color="#6B7280" style={{ animation: 'spin 1s linear infinite', 'margin-bottom': '10px' }} />
                <p>Cargando eventos...</p>
              </div>
            </Show>

            <Show when={!isLoading() && filteredEventos().length === 0}>
              <div style="padding: 40px; text-align: center; color: #6B7280;">
                <FaSolidCalendarXmark size={48} color="#6B7280" style={{ 'margin-bottom': '15px', opacity: '0.5' }} />
                <h3 style="margin: 0 0 10px 0; color: #374151;">No hay eventos</h3>
                <p style="margin: 0;">No se encontraron eventos que coincidan con los filtros aplicados.</p>
              </div>
            </Show>

            <Show when={!isLoading() && filteredEventos().length > 0}>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Evento</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Categoría</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Fecha</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Capacidad</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Registrados</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Estado</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredEventos()}>
                      {(evento) => (
                        <tr style="border-bottom: 1px solid #E5E7EB; hover:background-color: #F9FAFB;">
                          <td style="padding: 12px;">
                            <div>
                              <div style="font-weight: 500; color: #111827; margin-bottom: 2px;">{evento.titulo}</div>
                              <div style="font-size: 12px; color: #6B7280; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                {evento.descripcion}
                              </div>
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <span style="background: #E0E7FF; color: #3730A3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                              {evento.categoria}
                            </span>
                          </td>
                          <td style="padding: 12px; color: #374151;">
                            {formatDate(evento.fecha)}
                          </td>
                          <td style="padding: 12px; color: #374151;">
                            {evento.capacidad}
                          </td>
                          <td style="padding: 12px; color: #374151;">
                            <div style="display: flex; align-items: center; gap: 5px;">
                              <span>{evento.registrados}</span>
                              <div style="width: 60px; height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                                <div 
                                  style={`width: ${Math.min((evento.registrados / evento.capacidad) * 100, 100)}%; height: 100%; background: ${(evento.registrados / evento.capacidad) > 0.8 ? '#EF4444' : (evento.registrados / evento.capacidad) > 0.6 ? '#F59E0B' : '#10B981'}; transition: width 0.3s ease;`}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <span style={`background: ${getStatusColor(evento.estado)}20; color: ${getStatusColor(evento.estado)}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;`}>
                              {evento.estado}
                            </span>
                          </td>
                          <td style="padding: 12px;">
                            <div style="display: flex; gap: 8px;">
                              <button style="background: #3B82F6; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <FaSolidPenToSquare size={12} color="white" />
                              </button>
                              <button style="background: #10B981; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <FaSolidUsers size={12} color="white" />
                              </button>
                              <button style="background: #EF4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <FaSolidTrash size={12} color="white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </div>
      </main>

      {/* Modal Crear Evento */}
      <Show when={showCreateModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
          <div style="background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalSlideIn 0.3s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
              <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">✨ Crear Nuevo Evento</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style="background: none; border: none; font-size: 28px; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s;"
                onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style="display: flex; flex-direction: column; gap: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    🎭 Título del Evento *
                  </label>
                  <input
                    type="text"
                    value={newEvent().titulo}
                    onInput={(e) => handleInputChange('titulo', e.currentTarget.value)}
                    required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box;"
                    placeholder="Ej: Concierto de Jazz"
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    🎪 Categoría *
                  </label>
                  <select
                    value={newEvent().categoria}
                    onChange={(e) => handleInputChange('categoria', e.currentTarget.value)}
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;"
                  >
                    <option value="concierto">🎵 Concierto</option>
                    <option value="teatro">🎭 Teatro</option>
                    <option value="danza">💃 Danza</option>
                    <option value="exposicion">🖼️ Exposición</option>
                    <option value="taller">🛠️ Taller</option>
                    <option value="conferencia">🎤 Conferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                  📝 Descripción *
                </label>
                <textarea
                  value={newEvent().descripcion}
                  onInput={(e) => handleInputChange('descripcion', e.currentTarget.value)}
                  required
                  rows="3"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; box-sizing: border-box;"
                  placeholder="Describe el evento de manera atractiva..."
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    📅 Fecha *
                  </label>
                  <input
                    type="date"
                    value={newEvent().fecha}
                    onInput={(e) => handleInputChange('fecha', e.currentTarget.value)}
                    required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    🕐 Hora *
                  </label>
                  <input
                    type="time"
                    value={newEvent().hora}
                    onInput={(e) => handleInputChange('hora', e.currentTarget.value)}
                    required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    ⏱️ Duración (min) *
                  </label>
                  <input
                    type="number"
                    value={newEvent().duracion}
                    onInput={(e) => handleInputChange('duracion', parseInt(e.currentTarget.value))}
                    required
                    min="15"
                    max="480"
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="120"
                  />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    📍 Ubicación *
                  </label>
                  <input
                    type="text"
                    value={newEvent().ubicacion}
                    onInput={(e) => handleInputChange('ubicacion', e.currentTarget.value)}
                    required
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="Ej: Auditorio Principal"
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    👥 Capacidad *
                  </label>
                  <input
                    type="number"
                    value={newEvent().capacidad}
                    onInput={(e) => handleInputChange('capacidad', parseInt(e.currentTarget.value))}
                    required
                    min="1"
                    max="10000"
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="100"
                  />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    🎫 Cantidad de Cupos
                  </label>
                  <input
                    type="number"
                    value={newEvent().cupos}
                    onInput={(e) => handleInputChange('cupos', parseInt(e.currentTarget.value) || 0)}
                    min="1"
                    max="10000"
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                    🔄 Estado
                  </label>
                  <select
                    value={newEvent().estado}
                    onChange={(e) => handleInputChange('estado', e.currentTarget.value)}
                    style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;"
                  >
                    <option value="activo">✅ Activo</option>
                    <option value="proximo">⏳ Próximo</option>
                    <option value="completado">✔️ Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                  🖼️ URL de Imagen
                </label>
                <input
                  type="url"
                  value={newEvent().imagen}
                  onInput={(e) => handleInputChange('imagen', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                  onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating()}
                  style={`padding: 12px 24px; background: ${isCreating() ? '#9ca3af' : '#3b82f6'}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: ${isCreating() ? 'not-allowed' : 'pointer'}; transition: all 0.2s; display: flex; align-items: center; gap: 8px;`}
                  onMouseOver={(e) => !isCreating() && (e.target.style.background = '#2563eb')}
                  onMouseOut={(e) => !isCreating() && (e.target.style.background = '#3b82f6')}
                >
                  {isCreating() ? (
                    <>
                      <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
                      Creando...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Crear Evento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .create-event-btn {
            position: relative;
            overflow: hidden;
          }

          .create-event-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 2.5s infinite;
          }

          .create-event-btn:hover::before {
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Eventos;