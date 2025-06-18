import { Component, For } from 'solid-js';
import { CheckinRecentListProps } from './interfaces';
import { FaSolidClock, FaSolidRotate } from 'solid-icons/fa';

const CheckinRecentList: Component<CheckinRecentListProps> = (props) => {
  return (
    <div class="checkin-recent-section">
      <div class="checkin-recent-header">
        <h3 class="checkin-recent-title">
          <FaSolidClock />
          Check-ins Recientes
        </h3>
        <button class="checkin-recent-refresh" onClick={props.onRefresh}>
          <FaSolidRotate style={{ "margin-right": "4px" }} />
          Actualizar
        </button>
      </div>

      <div class="checkin-recent-list">
        <For each={props.checkInsRecientes}>
          {(checkIn) => (
            <div class="checkin-recent-item">
              <div class="checkin-recent-avatar">
                {checkIn.visitante?.nombre?.charAt(0)?.toUpperCase()}
              </div>
              <div class="checkin-recent-info">
                <div class="checkin-recent-name">{checkIn.visitante?.nombre}</div>
                <div class="checkin-recent-event">Código: {checkIn.codigo}</div>
              </div>
              <div class="checkin-recent-time">{checkIn.timestamp}</div>
              <div class="checkin-recent-status"></div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default CheckinRecentList;
