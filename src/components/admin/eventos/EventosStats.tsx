import { Component, Show } from 'solid-js';
import type { EventosStatsProps } from './types';

const EventosStats: Component<EventosStatsProps> = (props) => {
  return (
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
      <h2 style="color: #059669; margin: 0 0 16px 0;">📈 Estadísticas de Eventos</h2>
      
      <Show when={props.cargando}>
        <div style="text-align: center; padding: 20px; color: #666;">
          🔄 Cargando estadísticas...
        </div>
      </Show>

      <Show when={!props.cargando}>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-size: 24px; font-weight: 600; color: #16a34a;">{props.totalEventos}</div>
            <div style="color: #6b7280; font-size: 14px;">Total de Eventos</div>
          </div>
          
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: 600; color: #2563eb;">{props.eventosActivos}</div>
            <div style="color: #6b7280; font-size: 14px;">Eventos Activos</div>
          </div>
          
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <div style="font-size: 24px; font-weight: 600; color: #d97706;">{props.totalRegistrados}</div>
            <div style="color: #6b7280; font-size: 14px;">Total Registrados</div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default EventosStats;
