// ======================================
// COMPONENTE: FILTROS DE VISITANTES
// ======================================
//
// 🎯 FUNCIONALIDAD:
// Sistema completo de filtros extraído de admin/visitantes.tsx
// Incluye búsqueda, filtros por interés/estado y contador de resultados
// 
// 🎨 ESTILOS REQUERIDOS:
// - visitantes-admin.css → .visitantes-filters, .filters-container
// - admin.css → estilos base de formularios
//
// 🔍 FILTROS DISPONIBLES:
// 1. Búsqueda por texto (nombre, email, teléfono)
// 2. Filtro por intereses (dropdown dinámico)
// 3. Filtro por estado (activo/inactivo)
// 4. Botón limpiar filtros + contador de resultados
//
// ======================================

import { Component, Show, For } from 'solid-js';
import {
  FaSolidMagnifyingGlass,
  FaSolidFilter
} from 'solid-icons/fa';
import { VisitantesFiltersProps } from './types/visitantes';

/**
 * Componente de filtros de visitantes
 * Extraído del archivo original visitantes.tsx (líneas ~737-805)
 * Mantiene la funcionalidad exacta de filtrado y búsqueda
 */
const VisitantesFilters: Component<VisitantesFiltersProps> = (props) => {
  
  const limpiarFiltros = () => {
    props.setBusqueda('');
    props.setFiltroInteres('');
    props.setFiltroEstado('');
  };

  const hayFiltrosActivos = () => {
    return props.busqueda || props.filtroInteres || props.filtroEstado;
  };

  return (
    <div class="visitantes-filters">
      <div class="filters-container">
        {/* Filtro Principal: Búsqueda */}
        <div class="primary-filter">
          <div class="search-input-container">
            <FaSolidMagnifyingGlass size={16} color="#ffffff" />
            <input
              type="text"
              class="professional-search"
              placeholder="Buscar por nombre, email o teléfono..."
              value={props.busqueda}
              onInput={(e) => props.setBusqueda(e.target.value)}
            />
            <Show when={props.busqueda}>
              <button 
                class="clear-search"
                onClick={() => props.setBusqueda('')}
              >
                ×
              </button>
            </Show>
          </div>
        </div>
        
        {/* Filtros Secundarios */}
        <div class="secondary-filters">
          {/* Filtro por Intereses */}
          <select 
            class="filter-select"
            value={props.filtroInteres} 
            onChange={(e) => props.setFiltroInteres(e.target.value)}
          >
            <option value="">Todos los intereses</option>
            <For each={props.interesesUnicos}>
              {(interes) => <option value={interes}>{interes}</option>}
            </For>
          </select>
          
          {/* Filtro por Estado */}
          <select 
            class="filter-select"
            value={props.filtroEstado} 
            onChange={(e) => props.setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          
          {/* Botón Limpiar Filtros */}
          <Show when={hayFiltrosActivos()}>
            <button 
              class="header-btn"
              onClick={limpiarFiltros}
            >
              <FaSolidFilter size={12} />
              Limpiar
            </button>
          </Show>
        </div>
      </div>
      
      {/* Resumen de Resultados */}
      <div class="filters-summary">
        <span class="results-count">
          Mostrando {props.visitantesFiltrados.length} de {props.totalVisitantes} visitantes
        </span>
      </div>
    </div>
  );
};

export default VisitantesFilters;
