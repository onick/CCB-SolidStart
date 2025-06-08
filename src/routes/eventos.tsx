import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { type Evento } from "../lib/supabase/client";
import { eventosService } from '../lib/supabase/services';
import '../styles/admin.css';
import AdminLayout from '../components/AdminLayout';

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
  const [isEditing, setIsEditing] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal<string | null>(null);

  // Nuevo evento para el formulario
  const [newEvent, setNewEvent] = createSignal<Partial<Evento>>({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    duracion: 60,
    ubicacion: "",
    categoria: "concierto",
    capacidad: 50,
    estado: "activo"
  });

  // Signal para controlar visibilidad del modal
  const [showModal, setShowModal] = createSignal(false);

  // Signals para modales de edición y participantes
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showParticipantsModal, setShowParticipantsModal] = createSignal(false);
  const [currentEvent, setCurrentEvent] = createSignal<Evento | null>(null);

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

  // Función para resetear el formulario
  const resetForm = () => {
    setNewEvent({
      titulo: "",
      descripcion: "",
      fecha: "",
      hora: "",
      duracion: 60,
      ubicacion: "",
      categoria: "concierto",
      capacidad: 50,
      estado: "activo"
    });
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
        imagen: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
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
        imagen: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=300&fit=crop",
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
        imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
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
        imagen: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
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

  // Función para editar un evento
  const handleEditEvent = (evento: Evento) => {
    console.log('Editando evento:', evento);
    setCurrentEvent(evento);
    setNewEvent({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha: evento.fecha,
      hora: evento.hora,
      duracion: evento.duracion,
      ubicacion: evento.ubicacion,
      categoria: evento.categoria,
      capacidad: evento.capacidad,
      estado: evento.estado
    });
    setShowEditModal(true);
  };

  // Función para ver participantes
  const handleViewParticipants = (evento: Evento) => {
    console.log('Viendo participantes del evento:', evento);
    setCurrentEvent(evento);
    setShowParticipantsModal(true);
  };

  // Función para eliminar un evento
  const handleDeleteEvent = async (evento: Evento) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${evento.titulo}"?`)) {
      return;
    }

    try {
      setIsDeleting(evento.id || null);
      await eventosService.eliminar(evento.id!);
      await cargarEventos(); // Recargar la lista
      console.log('Evento eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('Error al eliminar el evento. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Función para actualizar un evento
  const handleUpdateEvent = async (e: Event) => {
    e.preventDefault();
    
    if (!currentEvent()?.id) {
      console.error('No hay evento actual para actualizar');
      return;
    }

    try {
      setIsEditing(true);
      
      const eventoActualizado = {
        id: currentEvent()!.id!,
        titulo: newEvent().titulo!,
        descripcion: newEvent().descripcion!,
        categoria: newEvent().categoria!,
        fecha: newEvent().fecha!,
        hora: newEvent().hora!,
        duracion: newEvent().duracion!,
        ubicacion: newEvent().ubicacion!,
        capacidad: newEvent().capacidad!,
        estado: newEvent().estado!,
        registrados: currentEvent()!.registrados || 0,
        precio: currentEvent()!.precio || 0,
        imagen: currentEvent()!.imagen || ""
      } as Evento;

      console.log('Actualizando evento:', eventoActualizado);
      await eventosService.actualizar(currentEvent()!.id!, eventoActualizado);
      
      // Recargar la lista de eventos
      await cargarEventos();
      
      // Cerrar modal y limpiar estado
      setShowEditModal(false);
      setCurrentEvent(null);
      resetForm();
      
      console.log('Evento actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      alert('Error al actualizar el evento. Por favor, verifica los datos e inténtalo de nuevo.');
    } finally {
      setIsEditing(false);
    }
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
    <AdminLayout currentPage="eventos" onLogout={handleLogout}>
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
                              <button 
                                style="background: #3B82F6; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                                onclick={() => handleEditEvent(evento)}
                                title="Editar evento"
                              >
                                <FaSolidPenToSquare size={12} color="white" />
                              </button>
                              <button 
                                style="background: #10B981; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                                onclick={() => handleViewParticipants(evento)}
                                title="Ver participantes"
                              >
                                <FaSolidUsers size={12} color="white" />
                              </button>
                              <button 
                                style="background: #EF4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                                onclick={() => handleDeleteEvent(evento)}
                                title="Eliminar evento"
                              >
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

      {/* Modal Crear Evento - Diseño Profesional y Minimalista */}
      <Show when={showCreateModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div style="background: white; border-radius: 16px; width: 95%; max-width: 680px; max-height: 95vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05); animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
            
            {/* Header Minimalista */}
            <div style="padding: 2rem 2rem 1.5rem 2rem; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h2 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.025em;">Crear Nuevo Evento</h2>
                  <p style="color: #64748b; font-size: 0.875rem; margin: 0;">Complete los campos para crear un evento profesional</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style="background: #f8fafc; border: none; width: 40px; height: 40px; border-radius: 10px; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 18px;"
                  onMouseOver={(e) => {
                    e.target.style.background = '#e2e8f0';
                    e.target.style.color = '#475569';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.color = '#64748b';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Formulario con Diseño Moderno */}
            <form onSubmit={handleCreateEvent} style="padding: 2rem; padding-top: 1.5rem;">
              
              {/* Sección Principal */}
              <div style="margin-bottom: 2rem;">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Título del Evento
                    </label>
                    <input
                      type="text"
                      value={newEvent().titulo}
                      onInput={(e) => handleInputChange('titulo', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; transition: all 0.2s; box-sizing: border-box; background: #fafafa;"
                      placeholder="Ingrese el título del evento"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Categoría
                    </label>
                    <select
                      value={newEvent().categoria}
                      onChange={(e) => handleInputChange('categoria', e.currentTarget.value)}
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="concierto">Concierto</option>
                      <option value="teatro">Teatro</option>
                      <option value="danza">Danza</option>
                      <option value="exposicion">Exposición</option>
                      <option value="taller">Taller</option>
                      <option value="conferencia">Conferencia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                    Descripción
                  </label>
                  <textarea
                    value={newEvent().descripcion}
                    onInput={(e) => handleInputChange('descripcion', e.currentTarget.value)}
                    required
                    rows="3"
                    style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; resize: vertical; font-family: inherit; box-sizing: border-box; background: #fafafa; transition: all 0.2s; line-height: 1.5;"
                    placeholder="Describa el evento de manera clara y atractiva..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Campo de Imagen */}
                <div>
                  <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                    Imagen del Evento
                  </label>
                  <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <input
                      type="file"
                      accept="image/*"
                      onInput={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            handleInputChange('imagen', result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style="width: 100%; padding: 0.875rem 1rem; border: 2px dashed #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s; cursor: pointer;"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                      }}
                    />
                    <p style="font-size: 0.75rem; color: #6b7280; margin: 0;">
                      📸 Sube una imagen representativa del evento (JPG, PNG, WebP)
                    </p>
                    
                    {/* Vista previa de la imagen */}
                    {newEvent().imagen && (
                      <div class="image-preview-container" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; max-width: 200px;">
                        <img 
                          src={newEvent().imagen} 
                          alt="Vista previa del evento"
                          style="width: 100%; height: 120px; object-fit: cover; display: block;"
                        />
                        <div style="padding: 0.5rem; background: #f9fafb; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 0.75rem; color: #374151;">Vista previa</span>
                          <button
                            type="button"
                            onclick={() => handleInputChange('imagen', '')}
                            style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;"
                            onMouseEnter={(e) => {
                              e.target.style.background = '#dc2626';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#ef4444';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección Programación */}
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">Programación</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={newEvent().fecha}
                      onInput={(e) => handleInputChange('fecha', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={newEvent().hora}
                      onInput={(e) => handleInputChange('hora', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      value={newEvent().duracion}
                      onInput={(e) => handleInputChange('duracion', parseInt(e.currentTarget.value))}
                      required
                      min="15"
                      max="480"
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="120"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección Detalles del Venue */}
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">Detalles del Venue</h3>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={newEvent().ubicacion}
                      onInput={(e) => handleInputChange('ubicacion', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="Ej: Auditorio Principal, Sala de Conferencias"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Capacidad
                    </label>
                    <input
                      type="number"
                      value={newEvent().capacidad}
                      onInput={(e) => handleInputChange('capacidad', parseInt(e.currentTarget.value) || 0)}
                      min="1"
                      max="10000"
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="100"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección Configuración */}
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">Configuración</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Cantidad de Cupos
                    </label>
                    <input
                      type="number"
                      value={newEvent().cupos}
                      onInput={(e) => handleInputChange('cupos', parseInt(e.currentTarget.value) || 0)}
                      min="1"
                      max="10000"
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="100"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Estado
                    </label>
                    <select
                      value={newEvent().estado}
                      onChange={(e) => handleInputChange('estado', e.currentTarget.value)}
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="activo">Activo</option>
                      <option value="proximo">Próximo</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                    URL de Imagen (Opcional)
                  </label>
                  <input
                    type="url"
                    value={newEvent().imagen}
                    onInput={(e) => handleInputChange('imagen', e.currentTarget.value)}
                    style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style="padding: 0.75rem 1.5rem; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; min-width: 100px;"
                  onMouseOver={(e) => {
                    e.target.style.background = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating()}
                  style={`padding: 0.75rem 1.5rem; background: ${isCreating() ? '#94a3b8' : '#0ea5e9'}; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: ${isCreating() ? 'not-allowed' : 'pointer'}; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; min-width: 140px; justify-content: center;`}
                  onMouseOver={(e) => !isCreating() && (e.target.style.background = '#0284c7')}
                  onMouseOut={(e) => !isCreating() && (e.target.style.background = '#0ea5e9')}
                >
                  {isCreating() ? (
                    <>
                      <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      Crear Evento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Modal Editar Evento */}
      <Show when={showEditModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div style="background: white; border-radius: 16px; width: 95%; max-width: 680px; max-height: 95vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05); animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
            
            {/* Header */}
            <div style="padding: 2rem 2rem 1.5rem 2rem; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h2 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.025em;">Editar Evento</h2>
                  <p style="color: #64748b; font-size: 0.875rem; margin: 0;">Modifica los detalles del evento seleccionado</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  style="background: #f8fafc; border: none; width: 40px; height: 40px; border-radius: 10px; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 18px;"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Formulario de edición - usa el mismo formulario que crear pero con handleUpdateEvent */}
            <form onSubmit={handleUpdateEvent} style="padding: 2rem; padding-top: 1.5rem;">
              
              {/* Título y Categoría */}
              <div style="margin-bottom: 2rem;">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Título del Evento
                    </label>
                    <input
                      type="text"
                      value={newEvent().titulo}
                      onInput={(e) => handleInputChange('titulo', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; transition: all 0.2s; box-sizing: border-box; background: #fafafa;"
                      placeholder="Ingrese el título del evento"
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Categoría
                    </label>
                    <select
                      value={newEvent().categoria}
                      onChange={(e) => handleInputChange('categoria', e.currentTarget.value)}
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                    >
                      <option value="concierto">Concierto</option>
                      <option value="teatro">Teatro</option>
                      <option value="danza">Danza</option>
                      <option value="exposicion">Exposición</option>
                      <option value="taller">Taller</option>
                      <option value="conferencia">Conferencia</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                    Descripción
                  </label>
                  <textarea
                    value={newEvent().descripcion}
                    onInput={(e) => handleInputChange('descripcion', e.currentTarget.value)}
                    required
                    rows="3"
                    style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; resize: vertical; font-family: inherit; box-sizing: border-box; background: #fafafa; transition: all 0.2s; line-height: 1.5;"
                    placeholder="Describa el evento de manera clara y atractiva..."
                  />
                </div>
              </div>

              {/* Fecha, Hora, Duración */}
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">Programación</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={newEvent().fecha}
                      onInput={(e) => handleInputChange('fecha', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={newEvent().hora}
                      onInput={(e) => handleInputChange('hora', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      value={newEvent().duracion}
                      onInput={(e) => handleInputChange('duracion', parseInt(e.currentTarget.value))}
                      required
                      min="15"
                      max="480"
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación y Capacidad */}
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">Detalles del Venue</h3>
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem;">
                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={newEvent().ubicacion}
                      onInput={(e) => handleInputChange('ubicacion', e.currentTarget.value)}
                      required
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="Ej: Auditorio Principal"
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Capacidad
                    </label>
                    <input
                      type="number"
                      value={newEvent().capacidad}
                      onInput={(e) => handleInputChange('capacidad', parseInt(e.currentTarget.value))}
                      required
                      min="1"
                      max="1000"
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
                      Estado
                    </label>
                    <select
                      value={newEvent().estado}
                      onChange={(e) => handleInputChange('estado', e.currentTarget.value)}
                      style="width: 100%; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; background: #fafafa; box-sizing: border-box; transition: all 0.2s;"
                    >
                      <option value="activo">Activo</option>
                      <option value="proximo">Próximo</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style="padding: 0.75rem 1.5rem; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; min-width: 100px;"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditing()}
                  style={`padding: 0.75rem 1.5rem; background: ${isEditing() ? '#94a3b8' : '#0ea5e9'}; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: ${isEditing() ? 'not-allowed' : 'pointer'}; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; min-width: 140px; justify-content: center;`}
                >
                  {isEditing() ? (
                    <>
                      <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <FaSolidPenToSquare size={14} color="white" />
                      Actualizar Evento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Modal Ver Participantes */}
      <Show when={showParticipantsModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
          <div style="background: white; border-radius: 16px; width: 95%; max-width: 800px; max-height: 95vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05); animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
            
            {/* Header */}
            <div style="padding: 2rem 2rem 1.5rem 2rem; border-bottom: 1px solid #f1f5f9;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h2 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.025em;">
                    Participantes: {currentEvent()?.titulo}
                  </h2>
                  <p style="color: #64748b; font-size: 0.875rem; margin: 0;">
                    {currentEvent()?.registrados || 0} de {currentEvent()?.capacidad || 0} personas registradas
                  </p>
                </div>
                <button
                  onClick={() => setShowParticipantsModal(false)}
                  style="background: #f8fafc; border: none; width: 40px; height: 40px; border-radius: 10px; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 18px;"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div style="padding: 2rem;">
              <div style="text-align: center; padding: 3rem; color: #64748b;">
                <FaSolidUsers size={48} color="#cbd5e1" />
                <h3 style="margin: 1rem 0 0.5rem 0; color: #374151;">Funcionalidad en Desarrollo</h3>
                <p style="margin: 0;">
                  La visualización detallada de participantes estará disponible próximamente.<br/>
                  Por ahora puedes ver el total de registrados en la tabla principal.
                </p>
                <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <strong>Información del Evento:</strong><br/>
                  Capacidad: {currentEvent()?.capacidad || 0} personas<br/>
                  Registrados: {currentEvent()?.registrados || 0} personas<br/>
                  Disponibles: {(currentEvent()?.capacidad || 0) - (currentEvent()?.registrados || 0)} cupos
                </div>
              </div>
            </div>
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

          /* Estilos para el campo de imagen */
          input[type="file"] {
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          input[type="file"]:hover {
            border-color: #0ea5e9 !important;
            background: #f0f9ff !important;
          }
          
          input[type="file"]:focus {
            outline: none;
            border-color: #0ea5e9 !important;
            background: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
          }
          
          /* Mejora visual para la vista previa */
          .image-preview-container {
            transition: all 0.3s ease;
          }
          
          .image-preview-container:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

          /* Animaciones para el modal mejorado */
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          /* Scrollbar personalizado para el modal */
          div[style*="overflow-y: auto"]::-webkit-scrollbar {
            width: 6px;
          }

          div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 3px;
          }

          div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }

          div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </AdminLayout>
  );
};

export default Eventos;