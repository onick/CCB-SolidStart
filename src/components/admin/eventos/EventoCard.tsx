import { FaSolidEye, FaSolidPen, FaSolidTrash } from 'solid-icons/fa';
import { Component } from 'solid-js';
import type { Evento } from '../../../lib/supabase/client';

interface EventoCardProps {
  evento: Evento;
  onVerDetalles: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

const EventoCard: Component<EventoCardProps> = (props) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div class="evento-card">
      <div class="evento-card-imagen">
        <img 
          src={props.evento.imagen || '/placeholder-evento.jpg'} 
          alt={props.evento.titulo}
        />
        <div class={`evento-estado ${props.evento.estado}`}>
          {props.evento.estado}
        </div>
      </div>
      
      <div class="evento-card-contenido">
        <h3 class="evento-titulo">{props.evento.titulo}</h3>
        <p class="evento-fecha">
          {formatearFecha(props.evento.fecha)} - {props.evento.hora}
        </p>
        <p class="evento-descripcion">{props.evento.descripcion}</p>
        <div class="evento-detalles">
          <span class="evento-categoria">{props.evento.categoria}</span>
          <span class="evento-capacidad">
            {props.evento.registrados}/{props.evento.capacidad} registrados
          </span>
        </div>
      </div>

      <div class="evento-card-acciones">
        <button 
          onClick={props.onVerDetalles}
          class="btn-accion ver"
          title="Ver detalles"
        >
          <FaSolidEye />
        </button>
        <button 
          onClick={props.onEditar}
          class="btn-accion editar"
          title="Editar evento"
        >
          <FaSolidPen />
        </button>
        <button 
          onClick={props.onEliminar}
          class="btn-accion eliminar"
          title="Eliminar evento"
        >
          <FaSolidTrash />
        </button>
      </div>
    </div>
  );
};

export default EventoCard; 