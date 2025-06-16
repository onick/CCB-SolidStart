import { Component, For, Show } from 'solid-js';
import type { Evento } from '../../types/eventos';
import EventCard from './EventCard';

interface EventGridProps {
  eventos: Evento[];
  isLoading: boolean;
  onEventoClick: (evento: Evento) => void;
}

const EventGrid: Component<EventGridProps> = (props) => {
  return (
    <>
      {/* Loading */}
      <Show when={props.isLoading}>
        <div style="text-align: center; padding: 4rem; color: #6B7280;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top: 3px solid #0EA5E9; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
          <p style="font-size: 1rem; font-weight: 500;">Cargando eventos...</p>
        </div>
      </Show>

      {/* No events */}
      <Show when={!props.isLoading && props.eventos.length === 0}>
        <div style="text-align: center; padding: 4rem; color: #6B7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📅</div>
          <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #374151;">No hay eventos disponibles</h3>
          <p style="opacity: 0.8; font-size: 1rem; margin-bottom: 1rem;">No se encontraron eventos activos en esta categoría.</p>
          <div style="background: #F3F4F6; padding: 1rem; border-radius: 8px; margin: 1rem auto; max-width: 500px;">
            <p style="font-size: 0.9rem; color: #6B7280; margin: 0;">
              💡 <strong>¿Esperando eventos nuevos?</strong><br/>
              Los eventos creados en el panel de administración aparecerán aquí automáticamente.<br/>
              Haz clic en "🔄 Actualizar" en el header para sincronizar manualmente.
            </p>
          </div>
        </div>
      </Show>

      {/* Grid de eventos */}
      <Show when={!props.isLoading && props.eventos.length > 0}>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; padding: 2rem; justify-items: stretch; align-items: start; max-width: 1400px; margin: 0 auto;">
          <For each={props.eventos}>
            {(evento) => (
              <EventCard 
                evento={evento} 
                onRegistroClick={props.onEventoClick}
              />
            )}
          </For>
        </div>
      </Show>
    </>
  );
};

export default EventGrid;
