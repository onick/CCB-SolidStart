import { Component, createSignal, onMount } from 'solid-js';
import AdminLayout from '../../components/AdminLayout';
import { 
  EventosHeaderConfig,
  EventosGrid,
  ConfirmDeleteModal,
  EventosStats,
  type EventoAdmin
} from '../../components/admin/eventos';
import { eventosService } from '../../lib/supabase/services';
import '../../styles/admin.css';

const EventosAdmin: Component = () => {
  // Estados del componente
  const [eventos, setEventos] = createSignal<EventoAdmin[]>([]);
  const [cargando, setCargando] = createSignal(true);
  const [mensaje, setMensaje] = createSignal("Cargando eventos...");
  
  // Estados para eliminación
  const [eliminandoEvento, setEliminandoEvento] = createSignal<string | null>(null);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = createSignal(false);
  const [eventoParaEliminar, setEventoParaEliminar] = createSignal<EventoAdmin | null>(null);

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

  // Funciones para manejar eventos
  const handleNuevoEvento = () => {
    console.log('➕ Crear nuevo evento');
    // TODO: Implementar modal de creación de eventos
  };

  const handleEditarEvento = (evento: EventoAdmin) => {
    console.log('✏️ Editar evento:', evento.titulo);
    // TODO: Implementar modal de edición de eventos
  };

  // Funciones para eliminar eventos
  const handleEliminarEvento = (evento: EventoAdmin) => {
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

    console.log('🗑️ [OPTIMISTIC] Eliminando evento de UI:', evento.titulo);
    setEliminandoEvento(evento.id);
    
    // 🚀 ACTUALIZACIÓN OPTIMISTA: Eliminar de la UI inmediatamente
    const eventosOriginales = eventos();
    setEventos(prev => prev.filter(e => e.id !== evento.id));
    setMensaje(`"${evento.titulo}" eliminado`);
    
    // Limpiar modal inmediatamente
    setEventoParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
    
    try {
      // Eliminar del servidor en segundo plano
      console.log('📡 Sincronizando eliminación con servidor...');
      const eliminado = await eventosService.eliminar(evento.id);
      
      if (eliminado) {
        console.log('✅ Evento eliminado del servidor exitosamente');
        setEliminandoEvento(null);
        setMensaje(`${eventos().length} eventos cargados exitosamente`);
      } else {
        throw new Error('No se pudo eliminar el evento del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar del servidor, revirtiendo...', error);
      
      // 🔄 REVERTIR: Restaurar el evento en la UI
      setEventos(eventosOriginales);
      setEliminandoEvento(null);
      setMensaje("Error al eliminar evento - acción revertida");
      
      // Mostrar error al usuario
      alert(`Error al eliminar "${evento.titulo}": ${error.message}\n\nLa acción ha sido revertida.`);
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
        <EventosHeaderConfig 
          onActualizar={cargarEventos}
          onNuevoEvento={handleNuevoEvento}
        />

        {/* Componente de estadísticas (opcional - se puede activar en el futuro) */}
        {/* <EventosStats
          totalEventos={eventos().length}
          eventosActivos={eventos().filter(e => e.estado === 'activo').length}
          totalRegistrados={eventos().reduce((acc, e) => acc + (e.registrados || 0), 0)}
          cargando={cargando()}
        /> */}

        <EventosGrid
          eventos={eventos()}
          cargando={cargando()}
          mensaje={mensaje()}
          onEditarEvento={handleEditarEvento}
          onEliminarEvento={handleEliminarEvento}
          eliminandoEvento={eliminandoEvento()}
        />

        <ConfirmDeleteModal
          mostrar={mostrarConfirmacionEliminar()}
          evento={eventoParaEliminar()}
          eliminando={eliminandoEvento() === eventoParaEliminar()?.id}
          onConfirmar={confirmarEliminacion}
          onCancelar={cancelarEliminacion}
        />
      </div>
    </AdminLayout>
  );
};

export default EventosAdmin;
