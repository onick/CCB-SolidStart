import { Component, Show, For } from 'solid-js';
import EventCard from './EventCard';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  registrados: number;
  capacidad: number;
  precio: number;
}

interface EventsListProps {
  eventos: Evento[];
  cargando: boolean;
  mensaje: string;
  eliminandoEvento: string | null;
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  onCreateFirst?: () => void;
}

const EventsList: Component<EventsListProps> = (props) => {
  return (
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #059669; margin: 0;">📊 Lista de Eventos</h2>
        <span style="color: #6b7280; font-size: 14px;">{props.mensaje}</span>
      </div>
      
      <Show when={props.eventos.length === 0 && !props.cargando}>
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
          📭 No hay eventos disponibles
          <br />
          <button 
            class="header-btn create" 
            style="margin-top: 16px;"
            onClick={props.onCreateFirst}
          >
            ➕ Crear tu primer evento
          </button>
        </div>
      </Show>

      <Show when={props.eventos.length > 0}>
        <div style="display: grid; gap: 16px;">
          <For each={props.eventos}>
            {(evento) => (
              <EventCard
                evento={evento}
                eliminandoEvento={props.eliminandoEvento}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default EventsList;