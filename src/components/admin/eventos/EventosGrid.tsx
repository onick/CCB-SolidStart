import { Component, Show, For } from 'solid-js';
import type { EventosGridProps } from './types';
import EventoAdminCard from './EventoAdminCard';

const EventosGrid: Component<EventosGridProps> = (props) => {
  return (
    <>
      {/* Estado de carga */}
      <Show when={props.cargando}>
        <div style="text-align: center; padding: 2rem; color: #666;">
          🔄 {props.mensaje}
        </div>
      </Show>

      {/* Lista de eventos */}
      <Show when={!props.cargando}>
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0;">📊 Lista de Eventos</h2>
            <span style="color: #6b7280; font-size: 14px;">{props.mensaje}</span>
          </div>
          
          <Show when={props.eventos.length === 0}>
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
              📭 No hay eventos disponibles
              <br />
              <button class="header-btn create" style="margin-top: 16px;">
                ➕ Crear tu primer evento
              </button>
            </div>
          </Show>

          <Show when={props.eventos.length > 0}>
            <div style="display: grid; gap: 16px;">
              <For each={props.eventos}>
                {(evento) => (
                  <EventoAdminCard
                    evento={evento}
                    onEditar={props.onEditarEvento}
                    onEliminar={props.onEliminarEvento}
                    eliminando={props.eliminandoEvento === evento.id}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </>
  );
};

export default EventosGrid;
