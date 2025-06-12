import { Component, createSignal, onMount, Show } from 'solid-js';
import { eventosService } from '../../lib/supabase/services';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin.css';

const EventosAdmin: Component = () => {
  const [mensaje, setMensaje] = createSignal("Iniciando panel de eventos...");
  const [cargando, setCargando] = createSignal(true);
  
  onMount(() => {
    console.log('🎭 Panel de Eventos montado exitosamente');
    setMensaje("¡Panel de Eventos funcionando correctamente!");
    setCargando(false);
  });

  return (
    <AdminLayout currentPage="eventos">
      <div>
        {/* Breadcrumb */}
        <div class="breadcrumb">
          <span>Eventos</span>
          <span>/</span>
          <span>Gestión</span>
          <span>/</span>
          <span>Centro Cultural Banreservas</span>
        </div>

        {/* Header */}
        <div class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">🎭 Gestión de Eventos</h1>
            <p class="welcome-subtitle">Administra todos los eventos del Centro Cultural</p>
          </div>
          <div class="welcome-actions">
            <button class="header-btn create">
              ➕ Nuevo Evento
            </button>
          </div>
        </div>

        {/* Contenido */}
        <Show when={cargando()}>
          <div style="text-align: center; padding: 2rem; color: #666;">
            🔄 Cargando eventos...
          </div>
        </Show>

        <Show when={!cargando()}>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #059669; margin: 0 0 16px 0;">✅ Panel de Eventos Funcionando</h2>
            <p style="color: #374151; margin-bottom: 16px;">{mensaje()}</p>
            
            <div style="background: #f0f9ff; padding: 16px; border-radius: 6px; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0369a1; margin: 0 0 8px 0;">Estado Actual:</h3>
              <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
                <li>✅ Ruta /admin/eventos funcionando</li>
                <li>✅ AdminLayout cargado correctamente</li>
                <li>✅ Componente EventosAdmin renderizado</li>
                <li>✅ Estados reactivos funcionando</li>
              </ul>
            </div>
          </div>
        </Show>
      </div>
    </AdminLayout>
  );
};

export default EventosAdmin;
