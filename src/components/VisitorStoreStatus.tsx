import { Component } from 'solid-js';
import visitorStore from '../stores/visitorStore';

/**
 * Componente de estado del VisitorStore híbrido
 * Muestra información sobre el cache, sincronización y conectividad
 */
const VisitorStoreStatus: Component = () => {
  const stats = () => visitorStore.getStats();
  
  return (
    <div class="visitor-store-status">
      <div class="status-header">
        <h3>Estado del Sistema</h3>
        <button 
          class="refresh-btn"
          onClick={() => visitorStore.refresh()}
          disabled={visitorStore.syncing}
        >
          {visitorStore.syncing ? '🔄 Sincronizando...' : '🔄 Actualizar'}
        </button>
      </div>
      
      <div class="status-grid">
        {/* Conectividad */}
        <div class="status-card">
          <div class="status-icon">
            {visitorStore.isOnline ? '🌐' : '📡'}
          </div>
          <div class="status-info">
            <span class="status-label">Conectividad</span>
            <span class={`status-value ${visitorStore.isOnline ? 'online' : 'offline'}`}>
              {visitorStore.isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
        </div>

        {/* Última sincronización */}
        <div class="status-card">
          <div class="status-icon">⏰</div>
          <div class="status-info">
            <span class="status-label">Última sync</span>
            <span class="status-value">
              {visitorStore.lastSync 
                ? new Date(visitorStore.lastSync).toLocaleTimeString()
                : 'Nunca'
              }
            </span>
          </div>
        </div>

        {/* Total de visitantes */}
        <div class="status-card">
          <div class="status-icon">👥</div>
          <div class="status-info">
            <span class="status-label">Total visitantes</span>
            <span class="status-value">{stats().total}</span>
          </div>
        </div>

        {/* Visitantes activos */}
        <div class="status-card">
          <div class="status-icon">✅</div>
          <div class="status-info">
            <span class="status-label">Activos</span>
            <span class="status-value">{stats().activos}</span>
          </div>
        </div>

        {/* Nuevos hoy */}
        <div class="status-card">
          <div class="status-icon">🆕</div>
          <div class="status-info">
            <span class="status-label">Nuevos hoy</span>
            <span class="status-value">{stats().nuevosHoy}</span>
          </div>
        </div>

        {/* Con teléfono */}
        <div class="status-card">
          <div class="status-icon">📱</div>
          <div class="status-info">
            <span class="status-label">Con teléfono</span>
            <span class="status-value">{stats().conTelefono}</span>
          </div>
        </div>
      </div>

      {/* Error display */}
      {visitorStore.error && (
        <div class="status-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">{visitorStore.error}</div>
          <button 
            class="error-dismiss"
            onClick={() => visitorStore.refresh()}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {visitorStore.loading && (
        <div class="status-loading">
          <div class="loading-spinner">⏳</div>
          <span>Cargando datos...</span>
        </div>
      )}
    </div>
  );
};

export default VisitorStoreStatus;