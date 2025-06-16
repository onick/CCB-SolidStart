import { Component, Show } from 'solid-js';
import type { Evento, FormularioRegistro } from '../../types/eventos';
import { formatDate, obtenerEstadoDisponibilidad } from '../../utils/eventHelpers';
import { validarFormulario } from '../../utils/validators';

interface EventModalProps {
  show: boolean;
  evento: Evento | null;
  registroData: FormularioRegistro;
  onClose: () => void;
  onRegistro: (evento: Evento) => void;
  onInputChange: (field: keyof FormularioRegistro, value: string) => void;
}

const EventModal: Component<EventModalProps> = (props) => {
  const formularioValido = () => validarFormulario(props.registroData);

  return (
    <Show when={props.show && props.evento}>
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem;">
        <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 25px rgba(0,0,0,0.15); position: relative; animation: modalSlideIn 0.3s ease-out;">
          
          {/* Botón cerrar */}
          <button 
            onclick={props.onClose}
            style="position: absolute; top: 1rem; right: 1rem; background: #F3F4F6; color: #6B7280; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
            onmouseover={(e) => (e.target as HTMLElement).style.background = '#E5E7EB'}
            onmouseout={(e) => (e.target as HTMLElement).style.background = '#F3F4F6'}
          >
            ×
          </button>

          <Show when={props.evento} keyed>
            {(evento) => {
              const dateInfo = formatDate(evento.fecha);
              const estadoDisponibilidad = obtenerEstadoDisponibilidad(evento);

              return (
                <>
                  {/* Header del Modal */}
                  <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🎫</div>
                    <h2 style="color: #111827; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                      Registro al Evento
                    </h2>
                    <h3 style="color: #0EA5E9; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                      {evento.titulo}
                    </h3>
                    <p style="color: #6B7280; font-size: 0.9rem;">
                      📧 Recibirás tu código por email para el día del evento
                    </p>
                  </div>

                  {/* Información del Evento */}
                  <div style="background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 0.5rem;">📅</span>
                        <span>{dateInfo.fechaCompleta}</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 0.5rem;">🕐</span>
                        <span>{evento.hora}</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 0.5rem;">📍</span>
                        <span>{evento.ubicacion}</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 0.5rem;">⏱️</span>
                        <span>{evento.duracion} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado de disponibilidad */}
                  <div style={`background: ${estadoDisponibilidad.bgColor}; color: ${estadoDisponibilidad.color}; padding: 0.75rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.9rem; margin-bottom: 1.5rem;`}>
                    {estadoDisponibilidad.icono} {estadoDisponibilidad.mensaje}
                  </div>

                  {/* Formulario */}
                  <form style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                      <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        value={props.registroData.nombre}
                        oninput={(e) => props.onInputChange('nombre', (e.target as HTMLInputElement).value)}
                        placeholder="Tu nombre completo"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;"
                        onfocus={(e) => (e.target as HTMLElement).style.borderColor = '#0EA5E9'}
                        onblur={(e) => (e.target as HTMLElement).style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div>
                      <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={props.registroData.email}
                        oninput={(e) => props.onInputChange('email', (e.target as HTMLInputElement).value)}
                        placeholder="tu@email.com"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;"
                        onfocus={(e) => (e.target as HTMLElement).style.borderColor = '#0EA5E9'}
                        onblur={(e) => (e.target as HTMLElement).style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div>
                      <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={props.registroData.telefono}
                        oninput={(e) => props.onInputChange('telefono', (e.target as HTMLInputElement).value)}
                        placeholder="(809) 123-4567"
                        style="width: 100%; padding: 0.75rem; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;"
                        onfocus={(e) => (e.target as HTMLElement).style.borderColor = '#0EA5E9'}
                        onblur={(e) => (e.target as HTMLElement).style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    {/* Botones */}
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                      <button
                        type="button"
                        onclick={props.onClose}
                        style="flex: 1; padding: 0.75rem; background: #F3F4F6; color: #6B7280; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;"
                        onmouseover={(e) => (e.target as HTMLElement).style.background = '#E5E7EB'}
                        onmouseout={(e) => (e.target as HTMLElement).style.background = '#F3F4F6'}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onclick={() => {
                          if (formularioValido() && estadoDisponibilidad.puedeRegistrarse) {
                            props.onRegistro(evento);
                          }
                        }}
                        disabled={!formularioValido() || !estadoDisponibilidad.puedeRegistrarse}
                        style={`flex: 1; padding: 0.75rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: ${
                          formularioValido() && estadoDisponibilidad.puedeRegistrarse ? 'pointer' : 'not-allowed'
                        }; transition: all 0.2s; ${
                          formularioValido() && estadoDisponibilidad.puedeRegistrarse 
                            ? 'background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white;' 
                            : 'background: #E5E7EB; color: #9CA3AF;'
                        }`}
                        onmouseover={(e) => {
                          if (formularioValido() && estadoDisponibilidad.puedeRegistrarse) {
                            (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                          }
                        }}
                        onmouseout={(e) => {
                          if (formularioValido() && estadoDisponibilidad.puedeRegistrarse) {
                            (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                          }
                        }}
                      >
                        {formularioValido() && estadoDisponibilidad.puedeRegistrarse ? '✅ Confirmar Registro' : 'Completa el formulario'}
                      </button>
                    </div>
                  </form>
                </>
              );
            }}
          </Show>
        </div>
      </div>

      {/* Estilos CSS para la animación */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </Show>
  );
};

export default EventModal;
