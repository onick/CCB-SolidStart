// ======================================
// COMPONENTE: TABLA DE VISITANTES
// ======================================
//
// 🎯 FUNCIONALIDAD:
// Tabla principal de visitantes con selección múltiple y acciones masivas
// Extraído de admin/visitantes.tsx para mayor modularidad
// 
// 🎨 ESTILOS REQUERIDOS:
// - visitantes-admin.css → .visitors-table-section, .professional-table
// - admin.css → estilos base de tabla
//
// 📊 CARACTERÍSTICAS:
// - Header con título y contador
// - Acciones masivas (invitar/eliminar seleccionados)
// - Tabla profesional con 8 columnas
// - Selección múltiple con checkbox maestro
// - Estado vacío con botón de importar
// - Integración con VisitanteRow modular
//
// ======================================

import {
    FaSolidCalendarCheck,
    FaSolidEnvelope,
    FaSolidFileImport,
    FaSolidHeart,
    FaSolidPen,
    FaSolidPhone,
    FaSolidUserCheck,
    FaSolidUsers
} from 'solid-icons/fa';
import { Component, For, Show } from 'solid-js';
import { VisitantesTableProps } from './types/visitantes';
import VisitanteRow from './VisitanteRow';

/**
 * Componente de tabla de visitantes
 * Extraído del archivo original visitantes.tsx (líneas ~806-1125)
 * Mantiene toda la funcionalidad de gestión masiva y visualización
 */
const VisitantesTable: Component<VisitantesTableProps> = (props) => {

  const seleccionarTodos = (checked: boolean) => {
    if (checked) {
      props.setVisitantesSeleccionados(props.visitantesFiltrados.map(v => v.id));
    } else {
      props.setVisitantesSeleccionados([]);
    }
  };

  const haySeleccionados = () => props.visitantesSeleccionados.length > 0;
  const todosMarcados = () => props.visitantesSeleccionados.length === props.visitantesFiltrados.length;

  // Opciones de elementos por página
  const opcionesElementosPorPagina = [10, 25, 50, 100];

  return (
    <div class="visitors-table-section">
      {/* Header de la Tabla */}
      <div class="table-header">
        <div class="table-title">
          <h3>👥 Lista de Visitantes ({props.visitantesFiltrados.length})</h3>
          <p>Administra y supervisa todos los visitantes registrados</p>
        </div>
        <div class="table-actions">
          <Show when={haySeleccionados()}>
            <span class="selection-counter">
              {props.visitantesSeleccionados.length} seleccionados
            </span>
            <button 
              class="btn-bulk-action"
              onClick={props.onInvitarSeleccionados}
            >
              <FaSolidEnvelope size={14} />
              Invitar seleccionados
            </button>
            <button 
              class="btn-bulk-action danger"
              onClick={props.onEliminarSeleccionados}
              disabled={props.eliminandoSeleccionados}
            >
              <FaSolidPen size={14} />
              {props.eliminandoSeleccionados 
                ? 'Eliminando...' 
                : `Eliminar ${props.visitantesSeleccionados.length}`}
            </button>
          </Show>
        </div>
      </div>

      {/* Container de la Tabla */}
      <div class="professional-table-container">
        <table class="professional-table">
          {/* Header de la Tabla */}
          <thead>
            <tr>
              <th class="checkbox-col">
                <div class="th-content">
                  <input 
                    type="checkbox" 
                    class="professional-checkbox"
                    checked={todosMarcados()}
                    onChange={(e) => seleccionarTodos(e.target.checked)}
                  />
                </div>
              </th>
              <th class="visitor-col">
                <div class="th-content">
                  <FaSolidUsers size={14} />
                  <span>Visitante</span>
                </div>
              </th>
              <th class="contact-col">
                <div class="th-content">
                  <FaSolidPhone size={14} />
                  <span>Contacto</span>
                </div>
              </th>
              <th class="interests-col">
                <div class="th-content">
                  <FaSolidHeart size={14} />
                  <span>Intereses</span>
                </div>
              </th>
              <th class="status-col">
                <div class="th-content">
                  <FaSolidUserCheck size={14} />
                  <span>Estado</span>
                </div>
              </th>
              <th class="date-col">
                <div class="th-content">
                  <FaSolidCalendarCheck size={14} />
                  <span>Registro</span>
                </div>
              </th>
              <th class="invitations-col">
                <div class="th-content">
                  <FaSolidEnvelope size={14} />
                  <span>Actividad</span>
                </div>
              </th>
              <th class="actions-col">
                <div class="th-content">
                  <span>Acciones</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Cuerpo de la Tabla */}
          <tbody>
            <For each={props.visitantesFiltrados}>
              {(visitante) => (
                <VisitanteRow
                  visitante={visitante}
                  invitaciones={props.invitaciones}
                  isSelected={props.visitantesSeleccionados.includes(visitante.id)}
                  eliminandoVisitante={props.eliminandoVisitante}
                  eliminandoSeleccionados={props.eliminandoSeleccionados}
                  onToggleSelection={props.toggleSeleccionVisitante}
                  onVerDetalles={props.onVerDetalles}
                  onEnviarInvitacion={props.onEnviarInvitacion}
                  onEliminarVisitante={props.onEliminarVisitante}
                />
              )}
            </For>
          </tbody>
        </table>
        
        {/* Paginación */}
        <div class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {props.visitantesFiltrados.length} de {props.visitantesFiltrados.length} visitantes</span>
            <select 
              value={props.paginacion.elementosPorPagina}
              onChange={(e) => props.onCambioElementosPorPagina(Number(e.target.value))}
              class="items-per-page"
            >
              <For each={opcionesElementosPorPagina}>
                {(opcion) => (
                  <option value={opcion}>{opcion} por página</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="pagination-controls">
            <button 
              class="pagination-btn"
              onClick={() => props.onCambioPagina(1)}
              disabled={props.paginacion.paginaActual === 1}
            >
              ⟨⟨
            </button>
            <button 
              class="pagination-btn"
              onClick={() => props.onCambioPagina(props.paginacion.paginaActual - 1)}
              disabled={props.paginacion.paginaActual === 1}
            >
              ⟨
            </button>
            
            <span class="pagination-info">
              Página {props.paginacion.paginaActual} de {props.paginacion.totalPaginas}
            </span>
            
            <button 
              class="pagination-btn"
              onClick={() => props.onCambioPagina(props.paginacion.paginaActual + 1)}
              disabled={props.paginacion.paginaActual === props.paginacion.totalPaginas}
            >
              ⟩
            </button>
            <button 
              class="pagination-btn"
              onClick={() => props.onCambioPagina(props.paginacion.totalPaginas)}
              disabled={props.paginacion.paginaActual === props.paginacion.totalPaginas}
            >
              ⟩⟩
            </button>
          </div>
        </div>
        
        {/* Estado Vacío */}
        <Show when={props.visitantesFiltrados.length === 0}>
          <div class="empty-state">
            <FaSolidUsers size={48} color="#cbd5e1" />
            <h3>No se encontraron visitantes</h3>
            <p>Intenta ajustar los filtros o importa nuevos visitantes</p>
            <button 
              class="btn-primary"
              onClick={props.onImportarVisitantes}
            >
              <FaSolidFileImport size={16} />
              Importar Visitantes
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default VisitantesTable;
