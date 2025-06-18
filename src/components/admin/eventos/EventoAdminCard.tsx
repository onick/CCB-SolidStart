import { Component } from 'solid-js';
import type { EventoAdminCardProps } from './types';

const EventoAdminCard: Component<EventoAdminCardProps> = (props) => {
  // 🎯 Estilos dinámicos para estado de eliminación
  const cardStyle = () => props.eliminando 
    ? "border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; background: #fef2f2; opacity: 0.7; transition: all 0.3s ease;"
    : "border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #fafafa; transition: all 0.3s ease;";

  return (
    <div style={cardStyle()}>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">
            {props.eliminando ? '🗑️ ' : ''}{props.evento.titulo}
          </h3>
          <p style="margin: 0 0 12px 0; color: #6b7280; line-height: 1.4;">
            {props.evento.descripcion}
          </p>
          <div style="display: flex; gap: 16px; font-size: 14px; color: #374151;">
            <span>📅 {props.evento.fecha}</span>
            <span>🕐 {props.evento.hora}</span>
            <span>📍 {props.evento.ubicacion}</span>
            <span>👥 {props.evento.registrados || 0}/{props.evento.capacidad}</span>
            <span>💰 RD${props.evento.precio}</span>
          </div>
          
          {/* 🚀 Indicador de estado optimista */}
          {props.eliminando && (
            <div style="margin-top: 8px; padding: 4px 8px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-size: 12px; display: inline-block;">
              ⏳ Sincronizando eliminación...
            </div>
          )}
        </div>
        <div style="display: flex; gap: 8px; margin-left: 16px;">
          <button 
            class="action-btn edit"
            title="Editar evento"
            style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;"
            onMouseOver={(e) => !props.eliminando && (e.target.style.background = '#059669')}
            onMouseOut={(e) => !props.eliminando && (e.target.style.background = '#10b981')}
            onClick={() => props.onEditar(props.evento)}
            disabled={props.eliminando}
          >
            ✏️ Editar
          </button>
          <button 
            class="action-btn delete"
            title="Eliminar evento"
            style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;"
            onMouseOver={(e) => !props.eliminando && (e.target.style.background = '#dc2626')}
            onMouseOut={(e) => !props.eliminando && (e.target.style.background = '#ef4444')}
            onClick={() => props.onEliminar(props.evento)}
            disabled={props.eliminando}
          >
            {props.eliminando ? '⏳ Eliminando...' : '🗑️ Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventoAdminCard;
