import { Component, createSignal, createEffect, onMount, Show, For } from 'solid-js';
import { visitantesService, eventosService } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import '../../styles/admin.css';

// Solid Icons
import {
  FaSolidUsers,
  FaSolidPlus,
  FaSolidMagnifyingGlass,
  FaSolidFilter,
  FaSolidEnvelope,
  FaSolidPhone,
  FaSolidHeart,
  FaSolidCalendarCheck,
  FaSolidUserCheck,
  FaSolidDownload,
  FaSolidCode,
  FaSolidChartLine,
  FaSolidTicket
} from 'solid-icons/fa';

// Tipos adicionales para invitaciones
interface Invitacion {
  id: string;
  visitanteId: string;
  eventoId: string;
  codigo: string;
  estado: 'enviada' | 'abierta' | 'confirmada' | 'expirada';
  fechaEnvio: string;
  fechaExpiracion: string;
  email: string;
}

const VisitantesAdmin: Component = () => {
  // Estados principales
  const [visitantes, setVisitantes] = createSignal<Visitante[]>([]);
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [cargando, setCargando] = createSignal(true);
  
  // Estados de filtros
  const [busqueda, setBusqueda] = createSignal('');
  const [filtroInteres, setFiltroInteres] = createSignal('');
  const [filtroEstado, setFiltroEstado] = createSignal('');
  
  // Estados de modales
  const [modalInvitacion, setModalInvitacion] = createSignal(false);
  const [modalDetalles, setModalDetalles] = createSignal(false);
  const [visitanteSeleccionado, setVisitanteSeleccionado] = createSignal<Visitante | null>(null);
  
  // Estados de invitaciones
  const [invitaciones, setInvitaciones] = createSignal<Invitacion[]>([]);
  const [eventoInvitacion, setEventoInvitacion] = createSignal('');
  const [visitantesSeleccionados, setVisitantesSeleccionados] = createSignal<string[]>([]);
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = createSignal({
    total: 0,
    activos: 0,
    hoy: 0,
    estaSemana: 0,
    invitacionesEnviadas: 0,
    tasaRespuesta: 0
  });

  onMount(() => {
    cargarDatos();
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      console.log('👥 Cargando visitantes y eventos...');
      
      const [visitantesData, eventosData, estadisticasData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      setEstadisticas(estadisticasData);
      
      // Cargar invitaciones mock (en producción vendría de Supabase)
      const invitacionesMock = generarInvitacionesMock(visitantesData);
      setInvitaciones(invitacionesMock);
      
      console.log('✅ Datos cargados:', {
        visitantes: visitantesData.length,
        eventos: eventosData.length,
        invitaciones: invitacionesMock.length
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Función para generar invitaciones mock
  const generarInvitacionesMock = (visitantes: Visitante[]): Invitacion[] => {
    return visitantes.slice(0, Math.min(5, visitantes.length)).map((visitante, index) => ({
      id: `inv-${Date.now()}-${index}`,
      visitanteId: visitante.id,
      eventoId: eventos()[0]?.id || 'evento-1',
      codigo: `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estado: ['enviada', 'abierta', 'confirmada'][Math.floor(Math.random() * 3)] as any,
      fechaEnvio: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      email: visitante.email
    }));
  };

  // Filtros aplicados
  const visitantesFiltrados = () => {
    let filtrados = visitantes();
    
    // Filtro por búsqueda
    if (busqueda()) {
      const termino = busqueda().toLowerCase();
      filtrados = filtrados.filter(v => 
        v.nombre.toLowerCase().includes(termino) ||
        v.email.toLowerCase().includes(termino) ||
        v.telefono?.includes(termino)
      );
    }
    
    // Filtro por interés
    if (filtroInteres()) {
      filtrados = filtrados.filter(v => 
        v.intereses?.includes(filtroInteres())
      );
    }
    
    // Filtro por estado
    if (filtroEstado()) {
      filtrados = filtrados.filter(v => v.estado === filtroEstado());
    }
    
    return filtrados;
  };

  // Intereses únicos para el filtro
  const interesesUnicos = () => {
    const intereses = new Set<string>();
    visitantes().forEach(v => {
      v.intereses?.forEach(interes => intereses.add(interes));
    });
    return Array.from(intereses);
  };

  // Funciones de invitaciones
  const enviarInvitacion = async (visitanteId: string, eventoId: string) => {
    try {
      const visitante = visitantes().find(v => v.id === visitanteId);
      const evento = eventos().find(e => e.id === eventoId);
      
      if (!visitante || !evento) return;
      
      const nuevaInvitacion: Invitacion = {
        id: `inv-${Date.now()}-${Math.random()}`,
        visitanteId,
        eventoId,
        codigo: `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        estado: 'enviada',
        fechaEnvio: new Date().toISOString(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        email: visitante.email
      };
      
      // En producción: enviar email y guardar en Supabase
      setInvitaciones(prev => [...prev, nuevaInvitacion]);
      
      console.log('📧 Invitación enviada:', {
        visitante: visitante.nombre,
        evento: evento.nombre,
        codigo: nuevaInvitacion.codigo
      });
      
      alert(`✅ Invitación enviada a ${visitante.nombre}\nCódigo: ${nuevaInvitacion.codigo}`);
      
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      alert('❌ Error enviando invitación');
    }
  };

  const enviarInvitacionesMasivas = async () => {
    if (!eventoInvitacion() || visitantesSeleccionados().length === 0) {
      alert('⚠️ Selecciona un evento y al menos un visitante');
      return;
    }
    
    try {
      const promesas = visitantesSeleccionados().map(visitanteId => 
        enviarInvitacion(visitanteId, eventoInvitacion())
      );
      
      await Promise.all(promesas);
      
      alert(`✅ ${visitantesSeleccionados().length} invitaciones enviadas exitosamente`);
      setModalInvitacion(false);
      setVisitantesSeleccionados([]);
      setEventoInvitacion('');
      
    } catch (error) {
      console.error('❌ Error en invitaciones masivas:', error);
      alert('❌ Error enviando invitaciones masivas');
    }
  };

  // Funciones de check-in
  const realizarCheckIn = async (codigo: string, telefono?: string) => {
    try {
      // Buscar por código
      if (codigo) {
        const invitacion = invitaciones().find(inv => inv.codigo === codigo);
        if (invitacion) {
          setInvitaciones(prev => 
            prev.map(inv => 
              inv.id === invitacion.id 
                ? { ...inv, estado: 'confirmada' }
                : inv
            )
          );
          return { success: true, visitante: visitantes().find(v => v.id === invitacion.visitanteId) };
        }
      }
      
      // Buscar por teléfono
      if (telefono) {
        const visitante = visitantes().find(v => v.telefono === telefono);
        if (visitante) {
          return { success: true, visitante };
        }
      }
      
      return { success: false, error: 'Código o teléfono no encontrado' };
      
    } catch (error) {
      console.error('❌ Error en check-in:', error);
      return { success: false, error: 'Error interno' };
    }
  };

  const toggleSeleccionVisitante = (visitanteId: string) => {
    setVisitantesSeleccionados(prev => 
      prev.includes(visitanteId)
        ? prev.filter(id => id !== visitanteId)
        : [...prev, visitanteId]
    );
  };

  return (
    <div class="admin-content">
      {/* Header */}
      <div class="breadcrumb">
        <span>Visitantes</span>
        <span>/</span>
        <span>Gestión</span>
        <span>/</span>
        <span>Centro Cultural Banreservas</span>
      </div>

      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <FaSolidUsers size={28} color="#3B82F6" style="margin-right: 12px;" />
            Gestión de Visitantes 👥
          </h1>
          <p class="welcome-subtitle">Administra visitantes, intereses e invitaciones</p>
        </div>
        <div class="welcome-actions">
          <button class="header-btn share" onClick={() => setModalInvitacion(true)}>
            <FaSolidEnvelope size={16} />
            Invitar
          </button>
          <button class="header-btn create">
            <FaSolidDownload size={16} />
            Exportar
          </button>
        </div>
      </div>

      <Show when={cargando()}>
        <div style="text-align: center; padding: 2rem; color: #666;">
          🔄 Cargando visitantes...
        </div>
      </Show>

      <Show when={!cargando()}>
        {/* Estadísticas */}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);">
              <FaSolidUsers size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().total}</h3>
              <p class="stat-label">TOTAL VISITANTES</p>
              <p class="stat-sublabel">Registrados en plataforma</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #10B981 0%, #047857 100%);">
              <FaSolidUserCheck size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().activos}</h3>
              <p class="stat-label">ACTIVOS</p>
              <p class="stat-sublabel">Visitantes activos</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
              <FaSolidCalendarCheck size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().hoy}</h3>
              <p class="stat-label">HOY</p>
              <p class="stat-sublabel">Registros de hoy</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);">
              <FaSolidEnvelope size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{invitaciones().length}</h3>
              <p class="stat-label">INVITACIONES</p>
              <p class="stat-sublabel">Enviadas totales</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);">
              <FaSolidChartLine size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{Math.round((invitaciones().filter(i => i.estado === 'confirmada').length / (invitaciones().length || 1)) * 100)}%</h3>
              <p class="stat-label">TASA RESPUESTA</p>
              <p class="stat-sublabel">Invitaciones confirmadas</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div class="filters-section">
          <div class="filter-group">
            <div class="search-box">
                              <FaSolidMagnifyingGlass size={16} color="#666" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={busqueda()}
                onInput={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <select value={filtroInteres()} onChange={(e) => setFiltroInteres(e.target.value)}>
              <option value="">Todos los intereses</option>
              <For each={interesesUnicos()}>
                {(interes) => <option value={interes}>{interes}</option>}
              </For>
            </select>
            
            <select value={filtroEstado()} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Lista de Visitantes */}
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisitantesSeleccionados(visitantesFiltrados().map(v => v.id));
                      } else {
                        setVisitantesSeleccionados([]);
                      }
                    }}
                  />
                </th>
                <th>Visitante</th>
                <th>Contacto</th>
                <th>Intereses</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Invitaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <For each={visitantesFiltrados()}>
                {(visitante) => {
                  const invitacionesVisitante = invitaciones().filter(i => i.visitanteId === visitante.id);
                  return (
                    <tr>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={visitantesSeleccionados().includes(visitante.id)}
                          onChange={() => toggleSeleccionVisitante(visitante.id)}
                        />
                      </td>
                      <td>
                        <div class="visitor-info">
                          <div class="visitor-avatar">
                            {visitante.nombre.charAt(0)}
                          </div>
                          <div>
                            <div class="visitor-name">{visitante.nombre}</div>
                            <div class="visitor-id">ID: {visitante.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="contact-info">
                          <div class="contact-email">
                            <FaSolidEnvelope size={12} />
                            {visitante.email}
                          </div>
                          <div class="contact-phone">
                            <FaSolidPhone size={12} />
                            {visitante.telefono || 'No registrado'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="interests">
                          <For each={visitante.intereses?.slice(0, 2)}>
                            {(interes) => (
                              <span class="interest-tag">
                                <FaSolidHeart size={10} />
                                {interes}
                              </span>
                            )}
                          </For>
                          {visitante.intereses && visitante.intereses.length > 2 && (
                            <span class="interest-more">+{visitante.intereses.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span class={`status-badge ${visitante.estado || 'activo'}`}>
                          {visitante.estado || 'activo'}
                        </span>
                      </td>
                      <td class="text-sm text-gray-600">
                        {new Date(visitante.fecha_registro).toLocaleDateString()}
                      </td>
                      <td>
                        <div class="invitations-summary">
                          <span class="inv-count">{invitacionesVisitante.length}</span>
                          <div class="inv-states">
                            <span class="inv-state sent">{invitacionesVisitante.filter(i => i.estado === 'enviada').length}</span>
                            <span class="inv-state confirmed">{invitacionesVisitante.filter(i => i.estado === 'confirmada').length}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="action-buttons">
                          <button 
                            class="btn-action view"
                            onClick={() => {
                              setVisitanteSeleccionado(visitante);
                              setModalDetalles(true);
                            }}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button 
                            class="btn-action invite"
                            onClick={() => {
                              if (eventos().length > 0) {
                                enviarInvitacion(visitante.id, eventos()[0].id);
                              } else {
                                alert('No hay eventos disponibles');
                              }
                            }}
                            title="Enviar invitación"
                          >
                            📧
                          </button>
                          <button 
                            class="btn-action checkin"
                            title="Ver códigos"
                          >
                            <FaSolidCode size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      {/* Modal de Invitaciones Masivas */}
      <Show when={modalInvitacion()}>
        <div class="modal-overlay" onClick={() => setModalInvitacion(false)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>📧 Invitaciones Masivas</h3>
              <button class="modal-close" onClick={() => setModalInvitacion(false)}>×</button>
            </div>
            
            <div class="modal-body">
              <div class="form-group">
                <label>Evento:</label>
                <select value={eventoInvitacion()} onChange={(e) => setEventoInvitacion(e.target.value)}>
                  <option value="">Seleccionar evento</option>
                  <For each={eventos().filter(e => e.estado === 'activo' || e.estado === 'proximo')}>
                    {(evento) => (
                      <option value={evento.id}>{evento.nombre} - {new Date(evento.fecha).toLocaleDateString()}</option>
                    )}
                  </For>
                </select>
              </div>
              
              <div class="selected-visitors">
                <h4>Visitantes seleccionados ({visitantesSeleccionados().length}):</h4>
                <div class="visitor-list">
                  <For each={visitantes().filter(v => visitantesSeleccionados().includes(v.id))}>
                    {(visitante) => (
                      <div class="visitor-item">
                        <span>{visitante.nombre}</span>
                        <span class="visitor-email">{visitante.email}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-secondary" onClick={() => setModalInvitacion(false)}>
                Cancelar
              </button>
              <button class="btn-primary" onClick={enviarInvitacionesMasivas}>
                Enviar {visitantesSeleccionados().length} Invitaciones
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Modal de Detalles */}
      <Show when={modalDetalles() && visitanteSeleccionado()}>
        <div class="modal-overlay" onClick={() => setModalDetalles(false)}>
          <div class="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>👤 Detalles del Visitante</h3>
              <button class="modal-close" onClick={() => setModalDetalles(false)}>×</button>
            </div>
            
            <div class="modal-body">
              <div class="visitor-details">
                <div class="visitor-profile">
                  <div class="visitor-avatar large">
                    {visitanteSeleccionado()?.nombre.charAt(0)}
                  </div>
                  <div class="visitor-info">
                    <h2>{visitanteSeleccionado()?.nombre}</h2>
                    <p>{visitanteSeleccionado()?.email}</p>
                    <p>{visitanteSeleccionado()?.telefono}</p>
                  </div>
                </div>
                
                <div class="visitor-stats">
                  <div class="stat-item">
                    <FaSolidTicket size={16} />
                    <span>Eventos registrados: {invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id).length}</span>
                  </div>
                  <div class="stat-item">
                    <FaSolidCalendarCheck size={16} />
                    <span>Check-ins realizados: {invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id && i.estado === 'confirmada').length}</span>
                  </div>
                </div>
                
                <div class="visitor-interests">
                  <h4>Intereses:</h4>
                  <div class="interests-list">
                    <For each={visitanteSeleccionado()?.intereses || []}>
                      {(interes) => (
                        <span class="interest-tag large">
                          <FaSolidHeart size={12} />
                          {interes}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
                
                <div class="visitor-invitations">
                  <h4>Historial de Invitaciones:</h4>
                  <div class="invitations-list">
                    <For each={invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id)}>
                      {(inv) => (
                        <div class="invitation-item">
                          <div class="inv-code">
                            <FaSolidCode size={14} />
                            {inv.codigo}
                          </div>
                          <div class="inv-event">
                            {eventos().find(e => e.id === inv.eventoId)?.nombre}
                          </div>
                          <div class="inv-date">
                            {new Date(inv.fechaEnvio).toLocaleDateString()}
                          </div>
                          <span class={`status-badge ${inv.estado}`}>
                            {inv.estado}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default VisitantesAdmin;