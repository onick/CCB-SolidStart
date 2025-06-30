import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import type { EventoAdmin } from '../types';
import './EventosTable.css';

interface EventosTableViewProps {
  eventos: EventoAdmin[];
  cargando: boolean;
  mensaje: string;
  eliminandoEvento: string | null;
  onEditarEvento: (evento: EventoAdmin) => void;
  onEliminarEvento: (evento: EventoAdmin) => void;
}

const EventosTableView: Component<EventosTableViewProps> = (props) => {
  // Estados para filtros y ordenamiento
  const [filtroCategoria, setFiltroCategoria] = createSignal('todas');
  const [filtroEstado, setFiltroEstado] = createSignal('todos');
  const [busqueda, setBusqueda] = createSignal('');
  const [ordenPor, setOrdenPor] = createSignal<'fecha' | 'capacidad' | 'registrados' | 'titulo'>('fecha');
  const [ordenAsc, setOrdenAsc] = createSignal(true);

  // Iconos por categoría
  const iconoCategoria = (categoria: string) => {
    const iconos: { [key: string]: string } = {
      'concierto': '🎵',
      'exposicion': '🎨',
      'teatro': '🎭',
      'taller': '🛠️',
      'conferencia': '🎤',
      'default': '🎪'
    };
    return iconos[categoria.toLowerCase()] || iconos.default;
  };

  // Calcular porcentaje de ocupación
  const porcentajeOcupacion = (registrados: number, capacidad: number) => {
    return Math.round((registrados / capacidad) * 100);
  };

  // Color para barra de progreso
  const colorProgreso = (porcentaje: number) => {
    if (porcentaje >= 90) return '#ef4444'; // Rojo - casi lleno
    if (porcentaje >= 70) return '#f59e0b'; // Amarillo - moderado
    return '#10b981'; // Verde - disponible
  };

  // Obtener categorías únicas
  const categorias = createMemo(() => {
    const cats = new Set(props.eventos.map(e => e.categoria));
    return Array.from(cats);
  });

  // Eventos filtrados y ordenados
  const eventosFiltrados = createMemo(() => {
    let eventos = props.eventos;

    // Filtrar por búsqueda
    if (busqueda()) {
      eventos = eventos.filter(evento => 
        evento.titulo.toLowerCase().includes(busqueda().toLowerCase()) ||
        evento.descripcion.toLowerCase().includes(busqueda().toLowerCase()) ||
        evento.ubicacion.toLowerCase().includes(busqueda().toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filtroCategoria() !== 'todas') {
      eventos = eventos.filter(evento => evento.categoria === filtroCategoria());
    }

    // Filtrar por estado
    if (filtroEstado() !== 'todos') {
      eventos = eventos.filter(evento => evento.estado === filtroEstado());
    }

    // Ordenar
    eventos.sort((a, b) => {
      const factor = ordenAsc() ? 1 : -1;
      
      switch (ordenPor()) {
        case 'fecha':
          return factor * (new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        case 'capacidad':
          return factor * (a.capacidad - b.capacidad);
        case 'registrados':
          return factor * ((a.registrados || 0) - (b.registrados || 0));
        case 'titulo':
          return factor * a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

    return eventos;
  });

  const handleOrdenar = (columna: typeof ordenPor extends () => infer T ? T : never) => {
    if (ordenPor() === columna) {
      setOrdenAsc(!ordenAsc());
    } else {
      setOrdenPor(columna);
      setOrdenAsc(true);
    }
  };

  return (
    <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
      {/* Header con controles */}
      <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            📊 Gestión de Eventos - Vista Tabla
          </h2>
          <span style="color: rgba(255,255,255,0.9); font-size: 14px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 16px;">
            {props.mensaje}
          </span>
        </div>

        {/* Controles de filtro */}
        <div style="display: grid; grid-template-columns: 1fr 200px 150px 150px; gap: 16px; align-items: center;">
          {/* Búsqueda */}
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar eventos..."
              value={busqueda()}
              onInput={(e) => setBusqueda(e.currentTarget.value)}
              style="width: 100%; padding: 10px 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white; placeholder-color: rgba(255,255,255,0.7);"
            />
          </div>

          {/* Filtro categoría */}
          <select
            value={filtroCategoria()}
            onChange={(e) => setFiltroCategoria(e.currentTarget.value)}
            style="padding: 10px 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white;"
          >
            <option value="todas" style="color: #111;">Todas las categorías</option>
            <For each={categorias()}>
              {(categoria) => (
                <option value={categoria} style="color: #111;">
                  {iconoCategoria(categoria)} {categoria}
                </option>
              )}
            </For>
          </select>

          {/* Filtro estado */}
          <select
            value={filtroEstado()}
            onChange={(e) => setFiltroEstado(e.currentTarget.value)}
            style="padding: 10px 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white;"
          >
            <option value="todos" style="color: #111;">Todos los estados</option>
            <option value="activo" style="color: #111;">🟢 Activo</option>
            <option value="inactivo" style="color: #111;">🔴 Inactivo</option>
          </select>

          {/* Contador resultados */}
          <div style="text-align: right; color: rgba(255,255,255,0.9); font-size: 14px;">
            {eventosFiltrados().length} evento{eventosFiltrados().length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>      {/* Estados de carga y contenido */}
      <Show when={props.cargando}>
        <div style="text-align: center; padding: 60px; color: #6b7280;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
          <div style="font-size: 18px; font-weight: 500;">Cargando eventos...</div>
          <div style="font-size: 14px; margin-top: 8px; opacity: 0.7;">{props.mensaje}</div>
        </div>
      </Show>

      <Show when={!props.cargando && eventosFiltrados().length === 0}>
        <div style="text-align: center; padding: 60px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
          <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">
            {props.eventos.length === 0 ? 'No hay eventos disponibles' : 'No se encontraron eventos'}
          </div>
          <div style="font-size: 14px; opacity: 0.7;">
            {props.eventos.length === 0 
              ? 'Crea tu primer evento para comenzar' 
              : 'Intenta cambiar los filtros de búsqueda'
            }
          </div>
        </div>
      </Show>

      {/* Tabla de eventos */}
      <Show when={!props.cargando && eventosFiltrados().length > 0}>
        <div style="overflow-x: auto;">
          <table class="eventos-table" style="width: 100%; border-collapse: collapse;">
            {/* Header de tabla */}
            <thead style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <tr>
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <button 
                    onClick={() => handleOrdenar('titulo')}
                    style="background: none; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                  >
                    📌 EVENTO
                    {ordenPor() === 'titulo' && (ordenAsc() ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <button 
                    onClick={() => handleOrdenar('fecha')}
                    style="background: none; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                  >
                    📅 FECHA
                    {ordenPor() === 'fecha' && (ordenAsc() ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <button 
                    onClick={() => handleOrdenar('capacidad')}
                    style="background: none; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                  >
                    👥 CAPACIDAD
                    {ordenPor() === 'capacidad' && (ordenAsc() ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  <button 
                    onClick={() => handleOrdenar('registrados')}
                    style="background: none; border: none; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px;"
                  >
                    📊 REGISTRADOS
                    {ordenPor() === 'registrados' && (ordenAsc() ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  🎯 ESTADO
                </th>
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                  ⚡ ACCIONES
                </th>
              </tr>
            </thead>            {/* Body de tabla */}
            <tbody>
              <For each={eventosFiltrados()}>
                {(evento) => {
                  const porcentaje = porcentajeOcupacion(evento.registrados || 0, evento.capacidad);
                  const eliminando = props.eliminandoEvento === evento.id;
                  
                  return (
                    <tr 
                      style={`border-bottom: 1px solid #f3f4f6; transition: all 0.2s ease; ${eliminando ? 'background: #fef2f2; opacity: 0.7;' : ''}`}
                      onMouseEnter={(e) => !eliminando && (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={(e) => !eliminando && (e.currentTarget.style.background = 'white')}
                    >
                      {/* Columna Evento */}
                      <td style="padding: 16px; vertical-align: top;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                          <div style="font-size: 24px; margin-top: 2px;">
                            {iconoCategoria(evento.categoria)}
                          </div>
                          <div>
                            <div style="font-weight: 600; color: #111827; margin-bottom: 4px; font-size: 16px;">
                              {eliminando && '🗑️ '}{evento.titulo}
                            </div>
                            <div style="color: #6b7280; font-size: 14px; line-height: 1.4; margin-bottom: 6px;">
                              {evento.descripcion.length > 80 
                                ? evento.descripcion.substring(0, 80) + '...' 
                                : evento.descripcion
                              }
                            </div>
                            <div style="display: flex; gap: 12px; font-size: 12px; color: #9ca3af;">
                              <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 12px;">
                                {evento.categoria}
                              </span>
                              <span>📍 {evento.ubicacion}</span>
                              <span>🕐 {evento.hora}</span>
                            </div>
                          </div>
                        </div>
                        
                        {eliminando && (
                          <div style="margin-top: 8px; padding: 6px 12px; background: #fee2e2; color: #dc2626; border-radius: 6px; font-size: 12px; display: inline-block;">
                            ⏳ Sincronizando eliminación...
                          </div>
                        )}
                      </td>

                      {/* Columna Fecha */}
                      <td style="padding: 16px; vertical-align: top;">
                        <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">
                          {new Date(evento.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div style="color: #6b7280; font-size: 14px;">
                          {evento.hora}
                        </div>
                      </td>

                      {/* Columna Capacidad */}
                      <td style="padding: 16px; vertical-align: top;">
                        <div style="font-weight: 600; font-size: 18px; color: #374151; margin-bottom: 4px;">
                          {evento.capacidad}
                        </div>
                        <div style="color: #6b7280; font-size: 12px;">
                          personas máx.
                        </div>
                      </td>                      {/* Columna Registrados con barra de progreso */}
                      <td style="padding: 16px; vertical-align: top;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <div>
                            <div style="font-weight: 600; font-size: 18px; color: #374151; margin-bottom: 2px;">
                              {evento.registrados || 0}
                            </div>
                            <div style="color: #6b7280; font-size: 12px;">
                              {porcentaje}% ocupado
                            </div>
                          </div>
                          
                          <div style="flex: 1; min-width: 80px;">
                            {/* Barra de progreso */}
                            <div style="background: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
                              <div 
                                style={`height: 100%; background: ${colorProgreso(porcentaje)}; width: ${porcentaje}%; transition: all 0.3s ease; border-radius: 4px;`}
                              ></div>
                            </div>
                            <div style="font-size: 10px; color: #9ca3af; text-align: center;">
                              {evento.registrados || 0}/{evento.capacidad}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Estado */}
                      <td style="padding: 16px; text-align: center; vertical-align: top;">
                        <span style={`
                          display: inline-block;
                          padding: 6px 12px;
                          border-radius: 16px;
                          font-size: 12px;
                          font-weight: 500;
                          ${evento.estado === 'activo' 
                            ? 'background: #dcfce7; color: #16a34a;' 
                            : 'background: #fee2e2; color: #dc2626;'
                          }
                        `}>
                          {evento.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                        </span>
                      </td>

                      {/* Columna Acciones */}
                      <td style="padding: 16px; text-align: center; vertical-align: top;">
                        <div style="display: flex; gap: 8px; justify-content: center;">
                          <button 
                            title="Editar evento"
                            style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;"
                            onMouseOver={(e) => !eliminando && (e.currentTarget.style.background = '#059669')}
                            onMouseOut={(e) => !eliminando && (e.currentTarget.style.background = '#10b981')}
                            onClick={() => props.onEditarEvento(evento)}
                            disabled={eliminando}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            title="Eliminar evento"
                            style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;"
                            onMouseOver={(e) => !eliminando && (e.currentTarget.style.background = '#dc2626')}
                            onMouseOut={(e) => !eliminando && (e.currentTarget.style.background = '#ef4444')}
                            onClick={() => props.onEliminarEvento(evento)}
                            disabled={eliminando}
                          >
                            {eliminando ? '⏳' : '🗑️'} {eliminando ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      {/* Footer con estadísticas */}
      <Show when={!props.cargando && eventosFiltrados().length > 0}>
        <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6b7280;">
            <div>
              Mostrando {eventosFiltrados().length} de {props.eventos.length} eventos
            </div>
            <div style="display: flex; gap: 24px;">
              <span>
                🟢 Activos: {eventosFiltrados().filter(e => e.estado === 'activo').length}
              </span>
              <span>
                👥 Total registrados: {eventosFiltrados().reduce((sum, e) => sum + (e.registrados || 0), 0)}
              </span>
              <span>
                📊 Capacidad total: {eventosFiltrados().reduce((sum, e) => sum + e.capacidad, 0)}
              </span>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default EventosTableView;