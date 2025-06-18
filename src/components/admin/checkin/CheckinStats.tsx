import { Component } from 'solid-js';
import { CheckinStatsProps } from './interfaces';
import {
  FaSolidUserCheck,
  FaSolidUsers,
  FaSolidTicket,
  FaSolidClock
} from 'solid-icons/fa';

const CheckinStats: Component<CheckinStatsProps> = (props) => {
  return (
    <div class="checkin-stats-grid">
      <div class="checkin-stat-card">
        <div class="checkin-stat-icon">
          <FaSolidUserCheck />
        </div>
        <div class="checkin-stat-number">{props.estadisticas.totalCheckIns}</div>
        <div class="checkin-stat-label">Check-ins Hoy</div>
      </div>

      <div class="checkin-stat-card">
        <div class="checkin-stat-icon">
          <FaSolidUsers />
        </div>
        <div class="checkin-stat-number">{props.estadisticas.visitantesUnicos}</div>
        <div class="checkin-stat-label">Visitantes Únicos</div>
      </div>

      <div class="checkin-stat-card">
        <div class="checkin-stat-icon">
          <FaSolidTicket />
        </div>
        <div class="checkin-stat-number">{props.estadisticas.eventosActivos}</div>
        <div class="checkin-stat-label">Eventos Activos</div>
      </div>

      <div class="checkin-stat-card">
        <div class="checkin-stat-icon">
          <FaSolidClock />
        </div>
        <div class="checkin-stat-number">{props.estadisticas.ultimoCheckIn || '--:--'}</div>
        <div class="checkin-stat-label">Último Check-in</div>
      </div>
    </div>
  );
};

export default CheckinStats;
