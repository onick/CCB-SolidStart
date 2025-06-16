import { Component } from 'solid-js';
import type { FiltroEvento } from '../../types/eventos';

interface EventFiltersProps {
  activeFilter: FiltroEvento;
  onFilterChange: (filter: FiltroEvento) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const EventFilters: Component<EventFiltersProps> = (props) => {
  return (
    <div style="background: #f8fafc; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; margin-left: -2rem; margin-right: -2rem; position: relative;">
      <div style="max-width: 1400px; margin: 0 auto;">
        
        {/* Tabs de filtros con diseño como la imagen */}
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          
          {/* Filtros de estado */}
          <div style="display: flex; background: white; border-radius: 8px; padding: 0.25rem; gap: 0.25rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <button
              onclick={() => props.onFilterChange('todos')}
              style={`padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; ${
                props.activeFilter === 'todos' 
                  ? 'background: #4F7FFF; color: white; box-shadow: 0 2px 4px rgba(79, 127, 255, 0.3);' 
                  : 'background: transparent; color: #64748b;'
              }`}
              onmouseover={(e) => {
                if (props.activeFilter !== 'todos') {
                  (e.target as HTMLElement).style.background = '#f1f5f9';
                  (e.target as HTMLElement).style.color = '#475569';
                }
              }}
              onmouseout={(e) => {
                if (props.activeFilter !== 'todos') {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = '#64748b';
                }
              }}
            >
              Todos
            </button>
            
            <button
              onclick={() => props.onFilterChange('en_curso')}
              style={`padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; ${
                props.activeFilter === 'en_curso' 
                  ? 'background: #4F7FFF; color: white; box-shadow: 0 2px 4px rgba(79, 127, 255, 0.3);' 
                  : 'background: transparent; color: #64748b;'
              }`}
              onmouseover={(e) => {
                if (props.activeFilter !== 'en_curso') {
                  (e.target as HTMLElement).style.background = '#f1f5f9';
                  (e.target as HTMLElement).style.color = '#475569';
                }
              }}
              onmouseout={(e) => {
                if (props.activeFilter !== 'en_curso') {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = '#64748b';
                }
              }}
            >
              En curso
            </button>
            
            <button
              onclick={() => props.onFilterChange('proximos')}
              style={`padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; ${
                props.activeFilter === 'proximos' 
                  ? 'background: #4F7FFF; color: white; box-shadow: 0 2px 4px rgba(79, 127, 255, 0.3);' 
                  : 'background: transparent; color: #64748b;'
              }`}
              onmouseover={(e) => {
                if (props.activeFilter !== 'proximos') {
                  (e.target as HTMLElement).style.background = '#f1f5f9';
                  (e.target as HTMLElement).style.color = '#475569';
                }
              }}
              onmouseout={(e) => {
                if (props.activeFilter !== 'proximos') {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = '#64748b';
                }
              }}
            >
              Próximos
            </button>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div style="display: flex; align-items: center; gap: 1rem;">
            
            {/* Barra de búsqueda */}
            <div style="position: relative;">
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={props.searchTerm}
                oninput={(e) => props.onSearchChange((e.target as HTMLInputElement).value)}
                style="width: 300px; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; background: white; transition: all 0.2s; color: #374151;"
                onfocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#4F7FFF';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(79, 127, 255, 0.1)';
                }}
                onblur={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#e2e8f0';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              />
              <div style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none;">
                🔍
              </div>
            </div>

            {/* Botón de filtros */}
            <button 
              style="display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 8px; color: #64748b; cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 0.9rem;"
              onmouseover={(e) => {
                (e.target as HTMLElement).style.background = '#f1f5f9';
                (e.target as HTMLElement).style.borderColor = '#cbd5e1';
              }}
              onmouseout={(e) => {
                (e.target as HTMLElement).style.background = 'white';
                (e.target as HTMLElement).style.borderColor = '#e2e8f0';
              }}
            >
              <span>🎛️</span>
              Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
