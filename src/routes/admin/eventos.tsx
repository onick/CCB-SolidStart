import { Component, createSignal, onMount, Show, For } from 'solid-js';
import AdminLayout from '../../components/AdminLayout';
import { eventosService } from '../../lib/supabase/services';
import '../../styles/admin.css';
const EventosAdmin: Component = () => {
  // Estados del componente
  const [eventos, setEventos] = createSignal([]);
  const [cargando, setCargando] = createSignal(true);
  const [mensaje, setMensaje] = createSignal("Cargando eventos...");
  
  // Estados para eliminación
  const [eliminandoEvento, setEliminandoEvento] = createSignal(null);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = createSignal(false);
  const [eventoParaEliminar, setEventoParaEliminar] = createSignal(null);

  // Función para cargar eventos
  const cargarEventos = async () => {
    try {
      setCargando(true);
      setMensaje("Cargando eventos desde la base de datos...");
      
      const eventosData = await eventosService.obtenerTodos();
      setEventos(eventosData);
      setMensaje(`${eventosData.length} eventos cargados exitosamente`);
      
      console.log('✅ Eventos cargados:', eventosData.length);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      setMensaje("Error al cargar eventos");
    } finally {
      setCargando(false);
    }
  };

  // Funciones para eliminar eventos
  const iniciarEliminacion = (evento) => {
    console.log('🗑️ Iniciando eliminación del evento:', evento.titulo);
    setEventoParaEliminar(evento);
    setMostrarConfirmacionEliminar(true);
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setEventoParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
  };

  const confirmarEliminacion = async () => {
    const evento = eventoParaEliminar();
    if (!evento) return;

    console.log('🗑️ Eliminando evento:', evento.titulo);
    setEliminandoEvento(evento.id);
    
    try {
      // Eliminar del servidor
      const eliminado = await eventosService.eliminar(evento.id);
      
      if (eliminado) {
        console.log('✅ Evento eliminado exitosamente');
        
        // Recargar la lista de eventos
        await cargarEventos();
        
        // Limpiar estados
        setEventoParaEliminar(null);
        setMostrarConfirmacionEliminar(false);
        setEliminandoEvento(null);
        
        console.log(`✅ "${evento.titulo}" eliminado correctamente`);
      } else {
        throw new Error('No se pudo eliminar el evento');
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar evento:', error);
      setEliminandoEvento(null);
      alert(`Error al eliminar el evento: ${error.message}`);
    }
  };

  // Cargar eventos al montar el componente
  onMount(() => {
    console.log('🎭 Panel de Eventos montado');
    cargarEventos();
  });

  return (
    <AdminLayout currentPage="eventos">
      <div>
        {/* Breadcrumb */}
        <div class="breadcrumb">
          <span>Centro Cultural Banreservas</span>
          <span>/</span>
          <span>Gestión</span>
          <span>/</span>
          <span>Eventos</span>
        </div>

        {/* Header */}
        <div class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">🎭 Gestión de Eventos</h1>
            <p class="welcome-subtitle">Administra todos los eventos del Centro Cultural</p>
          </div>
          <div class="welcome-actions">
            <button class="header-btn secondary" onClick={cargarEventos}>
              🔄 Actualizar
            </button>
            <button class="header-btn create">
              ➕ Nuevo Evento
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        <Show when={cargando()}>
          <div style="text-align: center; padding: 2rem; color: #666;">
            🔄 {mensaje()}
          </div>
        </Show>

        {/* Lista de eventos */}
        <Show when={!cargando()}>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #059669; margin: 0;">📊 Lista de Eventos</h2>
              <span style="color: #6b7280; font-size: 14px;">{mensaje()}</span>
            </div>
            
            <Show when={eventos().length === 0}>
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                📭 No hay eventos disponibles
                <br />
                <button class="header-btn create" style="margin-top: 16px;">
                  ➕ Crear tu primer evento
                </button>
              </div>
            </Show>

            <Show when={eventos().length > 0}>
              <div style="display: grid; gap: 16px;">
                <For each={eventos()}>
                  {(evento) => (
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #fafafa;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                          <h3 style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">
                            {evento.titulo}
                          </h3>
                          <p style="margin: 0 0 12px 0; color: #6b7280; line-height: 1.4;">
                            {evento.descripcion}
                          </p>
                          <div style="display: flex; gap: 16px; font-size: 14px; color: #374151;">
                            <span>📅 {evento.fecha}</span>
                            <span>🕐 {evento.hora}</span>
                            <span>📍 {evento.ubicacion}</span>
                            <span>👥 {evento.registrados || 0}/{evento.capacidad}</span>
                            <span>💰 RD${evento.precio}</span>
                          </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 16px;">
                          <button 
                            class="action-btn edit"
                            title="Editar evento"
                            style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                            onMouseOver={(e) => e.target.style.background = '#059669'}
                            onMouseOut={(e) => e.target.style.background = '#10b981'}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            class="action-btn delete"
                            title="Eliminar evento"
                            style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
                            onMouseOver={(e) => e.target.style.background = '#dc2626'}
                            onMouseOut={(e) => e.target.style.background = '#ef4444'}
                            onClick={() => iniciarEliminacion(evento)}
                            disabled={eliminandoEvento() === evento.id}
                          >
                            {eliminandoEvento() === evento.id ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>

        {/* Modal de confirmación de eliminación */}
        <Show when={mostrarConfirmacionEliminar()}>
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
              <h3 style="margin: 0 0 16px 0; color: #dc2626;">🗑️ Confirmar Eliminación</h3>
              <p style="margin: 0 0 20px 0; color: #374151;">
                ¿Estás seguro de que quieres eliminar el evento <strong>"{eventoParaEliminar()?.titulo}"</strong>?
              </p>
              <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 14px;">
                ⚠️ Esta acción no se puede deshacer.
              </p>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button 
                  class="btn-secondary"
                  style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  onClick={cancelarEliminacion}
                >
                  Cancelar
                </button>
                <button 
                  class="btn-danger"
                  style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  onClick={confirmarEliminacion}
                  disabled={eliminandoEvento() === eventoParaEliminar()?.id}
                >
                  {eliminandoEvento() === eventoParaEliminar()?.id ? '⏳ Eliminando...' : '🗑️ Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
};

export default EventosAdmin;
