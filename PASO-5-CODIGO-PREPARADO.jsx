/* 🚀 PASO 5: Campo de teléfono inteligente con auto-búsqueda 
   Este código se agregará cuando la UI básica esté verificada */

// Código para agregar en modo express:
<Show when={modoExpress()}>
  <div style="background: linear-gradient(135deg, #EEF2FF, #F0F9FF); padding: 1rem; border-radius: 8px; border: 1px solid #C7D2FE; margin-bottom: 1rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
      <span style="font-size: 1.25rem;">⚡</span>
      <h4 style="margin: 0; color: #1E40AF; font-size: 0.9rem; font-weight: 600;">
        Búsqueda Express por Teléfono
      </h4>
    </div>
    
    <div>
      <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
        Número de Teléfono *
      </label>
      <div style="position: relative;">
        <input 
          type="tel" 
          placeholder="809-555-0123"
          required
          value={registroData().telefono}
          onInput={(e) => {
            handleInputChange('telefono', e.currentTarget.value);
            // Auto-búsqueda cuando tenga 8+ caracteres
            if (e.currentTarget.value.length >= 8) {
              buscarVisitantePorTelefono(e.currentTarget.value);
            }
          }}
          style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: all 0.2s; box-sizing: border-box;"
          onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
          onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
        />
      </div>
      
      <Show when={visitanteEncontrado()}>
        <div style="margin-top: 0.5rem; padding: 0.75rem; background: #10B981; color: white; border-radius: 6px; font-size: 0.85rem;">
          ✅ ¡Encontrado! <strong>{visitanteEncontrado()?.nombre} {visitanteEncontrado()?.apellido}</strong>
          <br />
          📧 {visitanteEncontrado()?.email}
        </div>
      </Show>

      <Show when={!visitanteEncontrado() && registroData().telefono.length >= 8}>
        <div style="margin-top: 0.5rem; padding: 0.75rem; background: #F3F4F6; border-radius: 6px; font-size: 0.85rem; color: #374151;">
          👤 Usuario nuevo - necesitaremos tu nombre y email
        </div>
      </Show>

      <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
        Si ya nos has visitado, auto-completaremos tus datos
      </p>
    </div>
  </div>
</Show>

// Y modificar el formulario para mostrar campos solo cuando sea necesario:
<Show when={!modoExpress() || (modoExpress() && !visitanteEncontrado() && registroData().telefono.length >= 8)}>
  {/* Campos de nombre y email */}
</Show>
