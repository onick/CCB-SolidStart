import { Component, createEffect, createSignal, onMount, Show, For } from 'solid-js';
import { eventosService } from '../lib/supabase/services';
import '../styles/admin.css';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon-key');
};

const Eventos: Component = () => {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [eventos, setEventos] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterCategory, setFilterCategory] = createSignal('todas');
  const [filterStatus, setFilterStatus] = createSignal('todos');

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
      console.log('📅 Eventos cargados:', eventosData);
      setEventos(eventosData);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
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
            <div class="nav-item" onclick="window.location.href='/admin'" style="cursor: pointer;">
              <i class="fas fa-home"></i>
              <span>Dashboard</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-chart-bar"></i>
              <span>Reportes</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-cog"></i>
              <span>Configuración</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Gestionar</div>
            <div class="nav-item active">
              <i class="fas fa-calendar-alt"></i>
              <span>Eventos</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-users"></i>
              <span>Visitantes</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-ticket-alt"></i>
              <span>Registros</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-tags"></i>
              <span>Promociones</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Herramientas</div>
            <div class="nav-item">
              <i class="fas fa-code"></i>
              <span>Integraciones</span>
            </div>
            <div class="nav-item">
              <i class="fas fa-download"></i>
              <span>Exportar</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* MISMO Main Content que admin.tsx */}
      <main class="admin-main">
        <header class="main-header">
          <div class="header-left">
            <div class="breadcrumb">
              <span>Eventos</span> / <span>Gestión</span> / Centro Cultural Banreservas
            </div>
            <h1 class="main-title">Gestión de Eventos 🎭</h1>
            <p class="main-subtitle">Administra todos los eventos del Centro Cultural</p>
          </div>
          <div class="header-right">
            <button class="btn-header btn-secondary">
              <i class="fas fa-download"></i>
              Exportar
            </button>
            <button class="btn-header btn-primary">
              <i class="fas fa-plus"></i>
              Nuevo Evento
            </button>
            <button class="btn-header btn-logout" onclick={handleLogout}>
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </header>

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
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>Cargando eventos...</p>
              </div>
            </Show>

            <Show when={!isLoading() && filteredEventos().length === 0}>
              <div style="padding: 40px; text-align: center; color: #6B7280;">
                <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
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
                                <i class="fas fa-edit"></i>
                              </button>
                              <button style="background: #10B981; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <i class="fas fa-users"></i>
                              </button>
                              <button style="background: #EF4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
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
    </div>
  );
};

export default Eventos;