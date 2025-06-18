// ======================================
// COMPONENTE: FILA INDIVIDUAL DE VISITANTE
// ======================================
//
// 🎯 FUNCIONALIDAD:
// Componente que representa una fila individual en la tabla de visitantes
// Extraído de admin/visitantes.tsx para mayor modularidad
// 
// 🎨 ESTILOS REQUERIDOS:
// - visitantes-admin.css → .visitor-col, .contact-col, .interests-col
// - admin.css → estilos base de tabla
//
// 📊 INFORMACIÓN MOSTRADA:
// - Checkbox de selección
// - Datos del visitante (nombre, ID)
// - Información de contacto (email, teléfono)
// - Intereses con tags visuales
// - Estado (activo/inactivo)
// - Fecha de registro
// - Actividad de invitaciones
// - Botones de acción (ver, invitar, eliminar)
//
// ======================================

import { Component, Show, For } from 'solid-js';
import {
  FaSolidEnvelope,
  FaSolidPhone,
  FaSolidHeart,
  FaSolidEye,
  FaSolidPen
} from 'solid-icons/fa';
import { VisitanteRowProps } from './types/visitantes';

/**
 * Componente de fila individual de visitante
 * Extraído del archivo original visitantes.tsx (líneas ~880-1110)
 * Mantiene toda la lógica de visualización y acciones por visitante
 */
const VisitanteRow: Component<VisitanteRowProps> = (props) => {
  
  const invitacionesVisitante = () => 
    props.invitaciones.filter(i => i.visitanteId === props.visitante.id);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short'
    });
  };

  const obtenerAno = (fecha: string) => {
    return new Date(fecha).getFullYear();
  };

  // 🎯 Estados visuales dinámicos para eliminación optimista
  const estaEliminando = () => props.eliminandoVisitante === props.visitante.id;
  const estaEnEliminacionMasiva = () => props.eliminandoSeleccionados && props.isSelected;
  const estaEliminandose = () => estaEliminando() || estaEnEliminacionMasiva();
  
  // 🎨 Estilos dinámicos para estados de eliminación
  const rowClassName = () => {
    let classes = [];
    if (props.isSelected) classes.push('selected');
    if (estaEliminandose()) classes.push('deleting');
    return classes.join(' ');
  };

  const rowStyle = () => estaEliminandose() 
    ? "opacity: 0.6; background: #fef2f2; transition: all 0.3s ease; border-left: 4px solid #ef4444;"
    : "transition: all 0.3s ease;";

  return (
    <tr class={rowClassName()} style={rowStyle()}>
      {/* Checkbox de Selección */}
      <td class="checkbox-col">
        <input 
          type="checkbox" 
          class="professional-checkbox"
          checked={props.isSelected}
          onChange={() => props.onToggleSelection(props.visitante.id)}
          disabled={estaEliminandose()}
        />
      </td>

      {/* Información del Visitante */}
      <td class="visitor-col">
        <div class="visitor-profile">
          <div class="visitor-details">
            <div class="visitor-name" style="color: #4b5563; font-weight: 500; font-size: 13px;">
              {estaEliminandose() ? '🗑️ ' : ''}{props.visitante.nombre} {props.visitante.apellido || ''}
            </div>
            <div class="visitor-id">ID: {props.visitante.id.substring(0, 8)}...</div>
            
            {/* 🚀 Indicador de estado optimista */}
            <Show when={estaEliminandose()}>
              <div style="margin-top: 4px; padding: 2px 6px; background: #fee2e2; color: #dc2626; border-radius: 3px; font-size: 10px; display: inline-block;">
                ⏳ {estaEliminando() ? 'Eliminando...' : 'En proceso...'}
              </div>
            </Show>
          </div>
        </div>
      </td>

      {/* Información de Contacto */}
      <td class="contact-col">
        <div class="contact-info">
          <div class="contact-item">
            <FaSolidEnvelope size={12} color={estaEliminandose() ? "#dc2626" : "#6b7280"} />
            <span class="contact-text">{props.visitante.email}</span>
          </div>
          <div class="contact-item">
            <FaSolidPhone size={12} color={estaEliminandose() ? "#dc2626" : "#6b7280"} />
            <span class="contact-text">
              {props.visitante.telefono && props.visitante.telefono.trim() !== '' 
                ? props.visitante.telefono 
                : 'No registrado'}
            </span>
          </div>
        </div>
      </td>

      {/* Intereses */}
      <td class="interests-col">
        <div class="interests-container">
          <Show when={props.visitante.intereses && props.visitante.intereses.length > 0}>
            <For each={props.visitante.intereses!.slice(0, 2)}>
              {(interes) => (
                <span class="interest-tag" style={estaEliminandose() ? "opacity: 0.5;" : ""}>
                  <FaSolidHeart size={8} />
                  {interes}
                </span>
              )}
            </For>
            <Show when={props.visitante.intereses!.length > 2}>
              <span class="interest-more" style={estaEliminandose() ? "opacity: 0.5;" : ""}>
                +{props.visitante.intereses!.length - 2}
              </span>
            </Show>
          </Show>
          <Show when={!props.visitante.intereses || props.visitante.intereses.length === 0}>
            <span class="no-interests" style={estaEliminandose() ? "opacity: 0.5;" : ""}>Sin intereses</span>
          </Show>
        </div>
      </td>

      {/* Estado */}
      <td class="status-col">
        <span class={`status-badge ${estaEliminandose() ? 'deleting' : (props.visitante.estado || 'activo')}`}>
          <span class="status-dot"></span>
          {estaEliminandose() ? 'eliminando' : (props.visitante.estado || 'activo')}
        </span>
      </td>

      {/* Fecha de Registro */}
      <td class="date-col">
        <div class="date-info" style={estaEliminandose() ? "opacity: 0.5;" : ""}>
          <div class="date-primary">
            {formatearFecha(props.visitante.fecha_registro)}
          </div>
          <div class="date-secondary">
            {obtenerAno(props.visitante.fecha_registro)}
          </div>
        </div>
      </td>

      {/* Actividad de Invitaciones */}
      <td class="invitations-col">
        <div class="activity-summary" style={estaEliminandose() ? "opacity: 0.5;" : ""}>
          <div class="activity-item">
            <span class="activity-number">{invitacionesVisitante().length}</span>
            <span class="activity-label">Invitaciones</span>
          </div>
          <div class="activity-badges">
            <Show when={invitacionesVisitante().filter(i => i.estado === 'enviada').length > 0}>
              <span class="activity-badge sent">
                {invitacionesVisitante().filter(i => i.estado === 'enviada').length}
              </span>
            </Show>
            <Show when={invitacionesVisitante().filter(i => i.estado === 'confirmada').length > 0}>
              <span class="activity-badge confirmed">
                {invitacionesVisitante().filter(i => i.estado === 'confirmada').length}
              </span>
            </Show>
          </div>
        </div>
      </td>

      {/* Botones de Acción */}
      <td class="actions-col">
        <div class="action-buttons">
          <button 
            class="action-btn view"
            onClick={() => props.onVerDetalles(props.visitante)}
            title="Ver detalles completos"
            disabled={estaEliminandose()}
            style={estaEliminandose() ? "opacity: 0.3; cursor: not-allowed;" : ""}
          >
            <FaSolidEye size={14} />
          </button>
          <button 
            class="action-btn edit"
            onClick={() => props.onEnviarInvitacion(props.visitante.id)}
            title="Enviar invitación"
            disabled={estaEliminandose()}
            style={estaEliminandose() ? "opacity: 0.3; cursor: not-allowed;" : ""}
          >
            <FaSolidEnvelope size={14} />
          </button>
          <button 
            class="action-btn delete"
            onClick={() => props.onEliminarVisitante(props.visitante)}
            disabled={estaEliminandose()}
            title={estaEliminandose() ? 'Eliminando...' : 'Eliminar visitante'}
            style={estaEliminandose() ? "background: #dc2626; opacity: 0.7;" : ""}
          >
            {estaEliminandose() ? '⏳' : <FaSolidPen size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default VisitanteRow;
