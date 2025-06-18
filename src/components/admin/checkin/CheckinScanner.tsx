import { Component, Show } from 'solid-js';
import { CheckinScannerProps } from './interfaces';
import {
  FaSolidCode,
  FaSolidPhone,
  FaSolidUserCheck
} from 'solid-icons/fa';

const CheckinScanner: Component<CheckinScannerProps> = (props) => {
  return (
    <div class="checkin-main-panel">
      {/* Selector de tipo de check-in */}
      <div class="checkin-type-selector">
        <button 
          class={`checkin-type-btn ${props.tipoCheckIn === 'codigo' ? 'active' : ''}`}
          onClick={() => props.setTipoCheckIn('codigo')}
        >
          <FaSolidCode />
          Por Código
        </button>
        <button 
          class={`checkin-type-btn ${props.tipoCheckIn === 'telefono' ? 'active' : ''}`}
          onClick={() => props.setTipoCheckIn('telefono')}
        >
          <FaSolidPhone />
          Por Teléfono
        </button>
      </div>

      {/* Campo de entrada */}
      <div class="checkin-input-container">
        <Show when={props.tipoCheckIn === 'codigo'}>
          <label class="checkin-input-label">
            <FaSolidCode style={{ "margin-right": "8px" }} />
            Código de Invitación
          </label>
          <input
            type="text"
            class="checkin-input"
            placeholder="Escanea o ingresa código..."
            value={props.codigoInput}
            onInput={(e) => props.setCodigoInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && props.onCheckIn()}
            autofocus
          />
          <div style={{ "font-size": "12px", "color": "rgba(255, 255, 255, 0.6)", "margin-top": "8px" }}>
            Códigos de prueba: CCB-DEMO1, CCB-TEST1, CCB-VALID
          </div>
        </Show>

        <Show when={props.tipoCheckIn === 'telefono'}>
          <label class="checkin-input-label">
            <FaSolidPhone style={{ "margin-right": "8px" }} />
            Número de Teléfono
          </label>
          <input
            type="tel"
            class="checkin-input"
            placeholder="Ingresa teléfono del visitante..."
            value={props.telefonoInput}
            onInput={(e) => props.setTelefonoInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && props.onCheckIn()}
          />
        </Show>
      </div>

      {/* Botón de check-in */}
      <button
        class="checkin-submit-btn"
        onClick={props.onCheckIn}
        disabled={props.procesando || (!props.codigoInput.trim() && !props.telefonoInput.trim())}
      >
        <Show when={props.procesando}>
          <div class="checkin-loading-spinner"></div>
          Procesando...
        </Show>
        <Show when={!props.procesando}>
          <FaSolidUserCheck style={{ "margin-right": "8px" }} />
          Realizar Check-in
        </Show>
      </button>
    </div>
  );
};

export default CheckinScanner;
