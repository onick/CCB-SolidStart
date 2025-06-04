import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService, registroEventosService } from '../lib/supabase/services';
// 🎨 Importando solid-icons para mejor rendimiento y integración nativa
import {
    FaRegularCalendar,
    FaRegularClock,
    FaSolidArrowsRotate,
    FaSolidCalendarDay,
    FaSolidChartBar,
    FaSolidChartLine,
    FaSolidCheck,
    FaSolidCircleCheck,
    FaSolidCode,
    FaSolidDownload,
    FaSolidGear,
    FaSolidHouse,
    FaSolidInbox,
    FaSolidPercent,
    FaSolidQrcode,
    FaSolidSpinner,
    FaSolidTags,
    FaSolidTicket,
    FaSolidUserCheck,
    FaSolidUsers
} from 'solid-icons/fa';
import '../styles/admin.css';

const Registros: Component = () => {
  const [registros, setRegistros] = createSignal([]);
  const [eventos, setEventos] = createSignal([]);
  const [estadisticas, setEstadisticas] = createSignal({
    total: 0,
    confirmados: 0,
    checkins: 0,
    pendientes: 0,
    hoy: 0,
    tasaAsistencia: 0
  });
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterEstado, setFilterEstado] = createSignal('todos');
  const [filterEvento, setFilterEvento] = createSignal('todos');
  const [showCheckinModal, setShowCheckinModal] = createSignal(false);
  const [codigoCheckin, setCodigoCheckin] = createSignal('');
  const [checkinResult, setCheckinResult] = createSignal(null);

  onMount(() => {
    cargarDatos();
    // Auto-recarga cada 30 segundos
    setInterval(cargarDatos, 30000);
  });

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      console.log('📋 Cargando registros y estadísticas...');
      
      const [registrosData, eventosData, estadisticasData] = await Promise.all([
        registroEventosService.obtenerTodosLosRegistros(),
        eventosService.obtenerTodos(),
        registroEventosService.obtenerEstadisticasRegistros()
      ]);
      
      setRegistros(registrosData);
      setEventos(eventosData);
      setEstadisticas(estadisticasData);
      
      console.log('✅ Datos cargados:', {
        registros: registrosData.length,
        eventos: eventosData.length,
        estadisticas: estadisticasData
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const realizarCheckin = async (e: Event) => {
    e.preventDefault();
    if (!codigoCheckin().trim()) return;

    try {
      console.log('🔍 Buscando registro por código:', codigoCheckin());
      const registro = await registroEventosService.buscarRegistroPorCodigo(codigoCheckin());
      
      if (!registro) {
        setCheckinResult({ 
          success: false, 
          message: '❌ Código no encontrado. Verifica que sea correcto.' 
        });
        return;
      }

      if (registro.estado === 'checkin') {
        setCheckinResult({ 
          success: false, 
          message: '⚠️ Este registro ya tiene check-in confirmado.' 
        });
        return;
      }

      console.log('✅ Registro encontrado, confirmando check-in...');
      const success = await registroEventosService.confirmarCheckin(codigoCheckin());
      
      if (success) {
        setCheckinResult({ 
          success: true, 
          message: `✅ Check-in confirmado exitosamente para ${registro.visitante?.nombre} ${registro.visitante?.apellido}` 
        });
        // Recargar datos
        await cargarDatos();
        setCodigoCheckin('');
      } else {
        setCheckinResult({ 
          success: false, 
          message: '❌ Error al confirmar check-in. Intenta de nuevo.' 
        });
      }
    } catch (error) {
      console.error('❌ Error en check-in:', error);
      setCheckinResult({ 
        success: false, 
        message: '❌ Error del sistema. Intenta de nuevo.' 
      });
    }
  };

  const filteredRegistros = () => {
    return registros().filter(registro => {
      const matchesSearch = registro.codigo_confirmacion.toLowerCase().includes(searchTerm().toLowerCase()) ||
                           (registro.visitante?.nombre?.toLowerCase().includes(searchTerm().toLowerCase())) ||
                           (registro.visitante?.apellido?.toLowerCase().includes(searchTerm().toLowerCase())) ||
                           (registro.visitante?.email?.toLowerCase().includes(searchTerm().toLowerCase()));
      
      const matchesEstado = filterEstado() === 'todos' || registro.estado === filterEstado();
      const matchesEvento = filterEvento() === 'todos' || registro.evento_id === filterEvento();
      
      return matchesSearch && matchesEstado && matchesEvento;
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado': return '#10B981';
      case 'checkin': return '#3B82F6';
      case 'pendiente': return '#F59E0B';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmado': return '✅';
      case 'checkin': return '🎫';
      case 'pendiente': return '⏳';
      case 'cancelado': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventoTitulo = (eventoId: string) => {
    const evento = eventos().find(e => e.id === eventoId);
    return evento?.titulo || 'Evento no encontrado';
  };

  return (
    <div class="admin-panel">
      {/* Sidebar */}
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
              <FaSolidHouse size={18} color="#FFFFFF" />
              <span>Dashboard</span>
            </div>
            <div class="nav-item">
              <FaSolidChartBar size={18} color="#FFFFFF" />
              <span>Reportes</span>
            </div>
            <div class="nav-item">
              <FaSolidGear size={18} color="#FFFFFF" />
              <span>Configuración</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Gestionar</div>
            <div class="nav-item" onclick={() => window.location.href='/eventos'} style="cursor: pointer;">
              <FaRegularCalendar size={18} color="#FFFFFF" />
              <span>Eventos</span>
            </div>
            <div class="nav-item">
              <FaSolidUsers size={18} color="#FFFFFF" />
              <span>Visitantes</span>
            </div>
            <div class="nav-item active">
              <FaSolidTicket size={18} color="#F39D1E" />
              <span>Registros</span>
            </div>
            <div class="nav-item">
              <FaSolidTags size={18} color="#FFFFFF" />
              <span>Promociones</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Herramientas</div>
            <div class="nav-item">
              <FaSolidCode size={18} color="#FFFFFF" />
              <span>Integraciones</span>
            </div>
            <div class="nav-item">
              <FaSolidDownload size={18} color="#FFFFFF" />
              <span>Exportar</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main class="admin-main">
        <header class="main-header">
          <div class="header-content">
            <div class="header-left">
              <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                🎫 Control de Registros y Check-ins
              </h1>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">
                Monitorea y gestiona todos los registros de eventos en tiempo real
              </p>
            </div>
            <div class="header-actions">
              <button 
                onclick={() => setShowCheckinModal(true)}
                style="
                  background: linear-gradient(135deg, #10B981, #059669);
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
                  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
                  transition: all 0.3s ease;
                "
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                }}
              >
                <FaSolidQrcode size={16} color="white" />
                <span>🎯 Check-in Directo</span>
              </button>
            </div>
          </div>
        </header>

        <div class="main-content">
          {/* Check-in Manual */}
          <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #F39D1E, #E08A0F); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <FaSolidQrcode size={32} color="white" />
            </div>
            <h2 style="color: #1f2937; margin-bottom: 8px; font-size: 24px; font-weight: 700;">Check-in Manual</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">Confirma la asistencia escaneando o ingresando códigos</p>
            <button 
              class="btn-primary"
              onclick={() => setShowCheckinModal(true)}
            >
              Realizar Check-in
            </button>
          </div>

          {/* Estadísticas */}
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon green">
                  <FaSolidChartLine size={24} color="white" />
                </div>
                <div class="stat-title">Total Registros</div>
              </div>
              <div class="stat-number">{estadisticas().total}</div>
              <div class="stat-label">Registros totales</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon blue">
                  <FaSolidCircleCheck size={24} color="white" />
                </div>
                <div class="stat-title">Confirmados</div>
              </div>
              <div class="stat-number">{estadisticas().confirmados}</div>
              <div class="stat-label">Asistencias confirmadas</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon purple">
                  <FaSolidUserCheck size={24} color="white" />
                </div>
                <div class="stat-title">Check-ins</div>
              </div>
              <div class="stat-number">{estadisticas().checkins}</div>
              <div class="stat-label">Personas presentes</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon orange">
                  <FaRegularClock size={24} color="white" />
                </div>
                <div class="stat-title">Pendientes</div>
              </div>
              <div class="stat-number">{estadisticas().pendientes}</div>
              <div class="stat-label">Por confirmar</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon red">
                  <FaSolidCalendarDay size={24} color="white" />
                </div>
                <div class="stat-title">Hoy</div>
              </div>
              <div class="stat-number">{estadisticas().hoy}</div>
              <div class="stat-label">Registros de hoy</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon teal">
                  <FaSolidPercent size={24} color="white" />
                </div>
                <div class="stat-title">Tasa Asistencia</div>
              </div>
              <div class="stat-number">{estadisticas().tasaAsistencia}%</div>
              <div class="stat-label">Porcentaje de asistencia</div>
            </div>
          </div>

          {/* Filtros */}
          <div class="content-card" style="margin-bottom: 20px;">
            <div class="card-header">
              <h2 class="card-title">Filtros de Búsqueda</h2>
            </div>
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 15px; align-items: end;">
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Buscar:</label>
                  <input
                    type="text"
                    placeholder="Código, nombre, apellido o email..."
                    value={searchTerm()}
                    onInput={(e) => setSearchTerm(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Estado:</label>
                  <select
                    value={filterEstado()}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todos">Todos</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="checkin">Check-ins</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Evento:</label>
                  <select
                    value={filterEvento()}
                    onChange={(e) => setFilterEvento(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todos">Todos los eventos</option>
                    <For each={eventos()}>
                      {(evento) => (
                        <option value={evento.id}>{evento.titulo}</option>
                      )}
                    </For>
                  </select>
                </div>
                <button
                  onclick={cargarDatos}
                  style="background: #3B82F6; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                >
                  <FaSolidArrowsRotate size={16} color="white" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Registros */}
          <div class="content-card">
            <div class="card-header">
              <h2 class="card-title">Registros ({filteredRegistros().length})</h2>
            </div>
            
            <Show when={isLoading()}>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #666;">
                <FaSolidSpinner size={24} style={{"animation": "spin 1s linear infinite", "margin-bottom": "10px"}} />
                <p style="font-size: 16px; margin: 0;">Cargando registros...</p>
              </div>
            </Show>
            
            <Show when={!isLoading() && filteredRegistros().length === 0}>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #999;">
                <FaSolidInbox size={48} style={{"margin-bottom": "15px", "opacity": "0.5"}} />
                <p style="font-size: 18px; margin: 0; font-weight: 500;">No hay registros que mostrar</p>
                <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.7;">Los registros aparecerán aquí cuando se creen</p>
              </div>
            </Show>

            <Show when={!isLoading() && filteredRegistros().length > 0}>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Código</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Visitante</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Evento</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Fecha Registro</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Estado</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredRegistros()}>
                      {(registro) => (
                        <tr style="border-bottom: 1px solid #E5E7EB; hover:background-color: #F9FAFB;">
                          <td style="padding: 12px;">
                            <div style="font-family: monospace; font-weight: 600; color: #1f2937; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                              {registro.codigo_confirmacion}
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <div>
                              <div style="font-weight: 500; color: #111827;">
                                {registro.visitante?.nombre} {registro.visitante?.apellido}
                              </div>
                              <div style="font-size: 12px; color: #6B7280;">
                                {registro.visitante?.email}
                              </div>
                              <Show when={registro.visitante?.telefono}>
                                <div style="font-size: 12px; color: #6B7280;">
                                  📞 {registro.visitante?.telefono}
                                </div>
                              </Show>
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #374151;">
                              {getEventoTitulo(registro.evento_id)}
                            </div>
                          </td>
                          <td style="padding: 12px; color: #374151; font-size: 13px;">
                            {formatDate(registro.fecha_registro)}
                          </td>
                          <td style="padding: 12px;">
                            <span style={`background: ${getEstadoColor(registro.estado)}20; color: ${getEstadoColor(registro.estado)}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; width: fit-content;`}>
                              <span>{getEstadoIcon(registro.estado)}</span>
                              {registro.estado}
                            </span>
                          </td>
                          <td style="padding: 12px;">
                            <Show when={registro.estado === 'confirmado'}>
                              <button 
                                onclick={async () => {
                                  const success = await registroEventosService.confirmarCheckin(registro.codigo_confirmacion);
                                  if (success) {
                                    alert('✅ Check-in confirmado exitosamente');
                                    cargarDatos();
                                  } else {
                                    alert('❌ Error al confirmar check-in');
                                  }
                                }}
                                style="background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 4px;"
                              >
                                <FaSolidCheck size={14} />
                                Check-in
                              </button>
                            </Show>
                            <Show when={registro.estado === 'checkin'}>
                              <span style="color: #10B981; font-size: 12px; font-weight: 600;">
                                ✅ Asistió
                              </span>
                            </Show>
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

      {/* Modal Check-in Directo */}
      <Show when={showCheckinModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
          <div style="background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
              <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">🎯 Check-in Directo</h2>
              <button
                onClick={() => {
                  setShowCheckinModal(false);
                  setCodigoCheckin('');
                  setCheckinResult(null);
                }}
                style="background: none; border: none; font-size: 28px; color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px;"
              >
                ×
              </button>
            </div>

            <form onSubmit={realizarCheckin} style="display: flex; flex-direction: column; gap: 20px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">
                  🎫 Código de Confirmación
                </label>
                <input
                  type="text"
                  value={codigoCheckin()}
                  onInput={(e) => setCodigoCheckin(e.currentTarget.value)}
                  placeholder="Ej: CCB-001-234"
                  required
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: monospace; box-sizing: border-box;"
                />
                <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                  Ingresa el código que recibió el visitante por email
                </p>
              </div>

              <Show when={checkinResult()}>
                <div style={`padding: 12px; border-radius: 8px; font-size: 14px; ${checkinResult().success ? 'background: #DEF7EC; border: 1px solid #10B981; color: #065F46;' : 'background: #FEF2F2; border: 1px solid #EF4444; color: #991B1B;'}`}>
                  {checkinResult().message}
                </div>
              </Show>

              <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckinModal(false);
                    setCodigoCheckin('');
                    setCheckinResult(null);
                  }}
                  style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style="padding: 12px 24px; background: #10B981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                >
                  <FaSolidCheck size={16} />
                  Confirmar Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Registros; 