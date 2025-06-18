import { Component, For } from 'solid-js';
import type { Evento } from '../../../lib/supabase/client';
import EventoCard from './EventoCard';

interface EventosListProps {
  eventos: Evento[];
  cargando: boolean;
  onVerDetalles: (evento: Evento) => void;
  onEditar: (evento: Evento) => void;
  onEliminar: (evento: Evento) => void;
}

const EventosList: Component<EventosListProps> = (props) => {
  return (
    <div class="eventos-list">
      <div class="eventos-grid">
        <For each={props.eventos}>
          {(evento) => (
            <EventoCard
              evento={evento}
              onVerDetalles={() => props.onVerDetalles(evento)}
              onEditar={() => props.onEditar(evento)}
              onEliminar={() => props.onEliminar(evento)}
            />
          )}
        </For>
      </div>
    </div>
  );
};

export default EventosList; 