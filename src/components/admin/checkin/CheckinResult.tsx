import { Component, Show } from 'solid-js';
import { CheckinResultProps } from './interfaces';
import { FaSolidCheck, FaSolidXmark } from 'solid-icons/fa';

const CheckinResult: Component<CheckinResultProps> = (props) => {
  return (
    <Show when={props.resultado}>
      <div class={`checkin-status ${props.resultado?.success ? 'success' : 'error'}`}>
        <div class="checkin-status-icon">
          {props.resultado?.success ? <FaSolidCheck /> : <FaSolidXmark />}
        </div>
        <div class="checkin-status-title">
          {props.resultado?.success ? '¡Check-in Exitoso!' : 'Error en Check-in'}
        </div>
        <div class="checkin-status-message">
          {props.resultado?.success 
            ? `Bienvenido ${props.resultado?.visitante?.nombre}` 
            : props.resultado?.error
          }
        </div>

        <Show when={props.resultado?.success && props.resultado?.visitante}>
          <div class="checkin-visitor-info">
            <div class="checkin-visitor-avatar">
              {props.resultado?.visitante?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div class="checkin-visitor-details">
              <div class="checkin-detail-item">
                <div class="checkin-detail-label">Visitante</div>
                <div class="checkin-detail-value">{props.resultado?.visitante?.nombre}</div>
              </div>
              <div class="checkin-detail-item">
                <div class="checkin-detail-label">Email</div>
                <div class="checkin-detail-value">{props.resultado?.visitante?.email}</div>
              </div>
              <Show when={props.resultado?.codigo}>
                <div class="checkin-detail-item">
                  <div class="checkin-detail-label">Código</div>
                  <div class="checkin-detail-value">{props.resultado?.codigo}</div>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default CheckinResult;
