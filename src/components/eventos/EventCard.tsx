import { Component } from 'solid-js';
import type { Evento } from '../../types/eventos';
import { formatDate, getEventStatus, obtenerEstadoDisponibilidad } from '../../utils/eventHelpers';

interface EventCardProps {
  evento: Evento;
  onRegistroClick: (evento: Evento) => void;
}

const EventCard: Component<EventCardProps> = (props) => {
  const dateInfo = () => formatDate(props.evento.fecha);
  const statusInfo = () => getEventStatus(props.evento);
  const estadoDisponibilidad = () => obtenerEstadoDisponibilidad(props.evento);

  // Función para obtener el estilo de la categoría del evento
  const getCategoryStyle = (titulo: string) => {
    const tituloLower = titulo.toLowerCase();
    
    if (tituloLower.includes('concierto') || tituloLower.includes('música') || tituloLower.includes('jazz')) {
      return {
        gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        icon: '🎵',
        label: 'CONCIERTO'
      };
    } else if (tituloLower.includes('teatro') || tituloLower.includes('obra')) {
      return {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        icon: '🎭',
        label: 'TEATRO'
      };
    } else if (tituloLower.includes('exposición') || tituloLower.includes('muestra') || tituloLower.includes('galería')) {
      return {
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        icon: '🎨',
        label: 'EXPOSICIÓN'
      };
    } else if (tituloLower.includes('conferencia') || tituloLower.includes('charla')) {
      return {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        icon: '🎤',
        label: 'CONFERENCIA'
      };
    } else if (tituloLower.includes('taller') || tituloLower.includes('curso')) {
      return {
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        icon: '🛠️',
        label: 'TALLER'
      };
    } else if (tituloLower.includes('cine') || tituloLower.includes('película')) {
      return {
        gradient: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
        icon: '🎬',
        label: 'CINE'
      };
    } else {
      return {
        gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        icon: '🎪',
        label: 'EVENTO'
      };
    }
  };

  const categoryStyle = () => getCategoryStyle(props.evento.titulo);
  const capacidad = () => props.evento.capacidad ?? 200;
  const registrados = () => props.evento.registrados ?? 0;
  const porcentajeOcupacion = () => (registrados() / capacidad()) * 100;

  return (
    <div 
      style="background: white; border-radius: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; transition: all 0.3s ease; cursor: pointer; transform: scale(1); border: 1px solid #E5E7EB; width: 100%; height: 100%; display: flex; flex-direction: column;"
      onmouseover={(e) => {
        // Conservar efectos de hover existentes
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.02) translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
      }}
      onmouseout={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onclick={() => props.onRegistroClick(props.evento)}
    >
      
      {/* Imagen placeholder con gradiente según categoría - NUEVO DISEÑO */}
      <div style={`background: ${categoryStyle().gradient}; height: 200px; position: relative; display: flex; align-items: center; justify-content: center;`}>
        {/* Placeholder de imagen con patrón */}
        <div style="position: absolute; inset: 0; background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; opacity: 0.3;"></div>
        
        {/* Icono central más grande */}
        <div style="font-size: 4rem; margin-bottom: 0.5rem; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;">
          {categoryStyle().icon}
        </div>

        {/* Badge de categoría - NUEVO POSICIONAMIENTO */}
        <div style="position: absolute; top: 1rem; left: 1rem;">
          <span style="background: rgba(255,255,255,0.95); color: #374151; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            {categoryStyle().label}
          </span>
        </div>

        {/* Badge de estado - NUEVO POSICIONAMIENTO Y DISEÑO MÁS PROMINENTE */}
        <div style="position: absolute; top: 1rem; right: 1rem;">
          <span style={`background: ${statusInfo().badgeBg}; color: ${statusInfo().badgeColor}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.15);`}>
            {statusInfo().badge}
          </span>
        </div>
      </div>

      {/* Contenido con layout vertical mejorado */}
      <div style="padding: 1.5rem;">
        
        {/* Título con mejor tipografía */}
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #111827; margin-bottom: 1rem; line-height: 1.2; letter-spacing: -0.025em;">
          {props.evento.titulo}
        </h3>

        {/* Información del evento con mejor espaciado */}
        <div style="margin-bottom: 1.5rem; space-y: 1rem;">
          <div style="display: flex; align-items: center; color: #4B5563; font-size: 0.9rem; margin-bottom: 0.75rem;">
            <div style="background: #F3F4F6; border-radius: 8px; padding: 0.5rem; margin-right: 0.75rem; display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem;">
              <span style="font-size: 1rem;">📅</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #111827;">{dateInfo().fechaTexto}</div>
              <div style="font-size: 0.8rem; color: #6B7280;">{props.evento.hora}</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; color: #4B5563; font-size: 0.9rem; margin-bottom: 0.75rem;">
            <div style="background: #F3F4F6; border-radius: 8px; padding: 0.5rem; margin-right: 0.75rem; display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem;">
              <span style="font-size: 1rem;">📍</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #111827;">Ubicación</div>
              <div style="font-size: 0.8rem; color: #6B7280;">{props.evento.ubicacion}</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; color: #4B5563; font-size: 0.9rem;">
            <div style="background: #F3F4F6; border-radius: 8px; padding: 0.5rem; margin-right: 0.75rem; display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem;">
              <span style="font-size: 1rem;">⏱️</span>
            </div>
            <div>
              <div style="font-weight: 600; color: #111827;">Duración</div>
              <div style="font-size: 0.8rem; color: #6B7280;">{props.evento.duracion} minutos</div>
            </div>
          </div>
        </div>

        {/* Precio con diseño mejorado */}
        <div style="margin-bottom: 1.5rem;">
          <div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); color: #059669; padding: 0.75rem 1rem; border-radius: 12px; text-align: center; font-weight: 700; font-size: 0.9rem; border: 1px solid #86EFAC;">
            💳 Entrada Libre
          </div>
        </div>

        {/* Estado de disponibilidad OPTIMIZADO - más compacto */}
        <div style="margin-bottom: 1.5rem;">
          <div style={`background: ${estadoDisponibilidad().bgColor}; color: ${estadoDisponibilidad().color}; padding: 0.6rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: 1px solid ${estadoDisponibilidad().color}30;`}>
            <span style="font-size: 0.9rem;">{estadoDisponibilidad().icono}</span>
            <span>{estadoDisponibilidad().mensaje}</span>
          </div>
          
          {/* Barra de progreso más sutil pero clara */}
          <div style="background: #F9FAFB; border-radius: 8px; height: 8px; overflow: hidden; margin-top: 0.75rem; border: 1px solid #E5E7EB;">
            <div style={`background: linear-gradient(90deg, #0EA5E9, #06B6D4); height: 100%; width: ${Math.min(porcentajeOcupacion(), 100)}%; transition: width 0.3s ease; border-radius: 6px;`}></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: #6B7280; font-weight: 500;">
            <span>{registrados()} registrados</span>
            <span>{capacidad()} capacidad total</span>
          </div>
        </div>

        {/* Botón de registro con diseño más grande y visible */}
        <button
          onclick={(e) => {
            e.stopPropagation();
            props.onRegistroClick(props.evento);
          }}
          disabled={!estadoDisponibilidad().disponible}
          style={`width: 100%; padding: 1rem; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: ${
            estadoDisponibilidad().disponible ? 'pointer' : 'not-allowed'
          }; transition: all 0.2s ease; ${
            estadoDisponibilidad().disponible 
              ? 'background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: white; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);' 
              : 'background: #F3F4F6; color: #9CA3AF; border: 2px solid #E5E7EB;'
          }`}
          onmouseover={(e) => {
            if (estadoDisponibilidad().disponible) {
              (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #0284C7 0%, #0891B2 100%)';
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
            }
          }}
          onmouseout={(e) => {
            if (estadoDisponibilidad().disponible) {
              (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
            }
          }}
        >
          {estadoDisponibilidad().disponible ? (
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <span style="font-size: 1.1rem;">📝</span>
              <span>Registrarse</span>
            </div>
          ) : (
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <span style="font-size: 1.1rem;">🚫</span>
              <span>No Disponible</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
