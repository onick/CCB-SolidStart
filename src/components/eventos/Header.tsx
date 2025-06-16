import { Component } from 'solid-js';
import { FaSolidUser } from 'solid-icons/fa';
import { getCurrentTime } from '../../utils/eventHelpers';

interface HeaderProps {
  currentTime: string;
  onHistorialClick: () => void;
  onActualizarClick: () => void;
}

const Header: Component<HeaderProps> = (props) => {
  return (
    <>
      {/* Header Principal */}
      <div style="background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); padding: 1rem 2rem; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); margin-left: -2rem; margin-right: -2rem; position: relative;">
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1400px; margin: 0 auto;">
          
          {/* Logo y título */}
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              <img
                src="/images/logo.png"
                alt="Centro Cultural Banreservas"
                style="width: 44px; height: 44px; object-fit: contain; border-radius: 50%;"
              />
            </div>
            <div>
              <h1 style="color: white; font-size: 1.5rem; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
                Centro Cultural Banreservas
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0;">
                Gestión de eventos culturales
              </p>
            </div>
          </div>

          {/* Botones y reloj */}
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button
              onclick={props.onHistorialClick}
              style="background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; font-weight: 500;"
              onmouseover={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onmouseout={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
              title="Ver mi historial de registros"
            >
              <FaSolidUser size={14} />
              Mis Registros
            </button>
            
            <button
              onclick={props.onActualizarClick}
              style="background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; font-weight: 500;"
              onmouseover={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onmouseout={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              Actualizar
            </button>
            
            <div style="background: rgba(255,255,255,0.15); color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 1rem; font-weight: 600; font-family: 'Courier New', monospace; border: 1px solid rgba(255,255,255,0.3);">
              {props.currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Título Principal */}
      <div style="background: #f8fafc; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; margin-left: -2rem; margin-right: -2rem; position: relative;">
        <div style="max-width: 1400px; margin: 0 auto;">
          <h2 style="color: #1e293b; font-size: 1.5rem; font-weight: 700; margin: 0;">
            Próximas actividades
          </h2>
        </div>
      </div>
    </>
  );
};

export default Header;
