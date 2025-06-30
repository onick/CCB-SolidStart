// components/dashboard/SupabaseAlert.tsx - Alerta de configuración de Supabase

import { Component, Show } from 'solid-js';

interface Props {
  isSupabaseConfigured: () => boolean;
}

const SupabaseAlert: Component<Props> = (props) => {
  return (
    <Show when={!props.isSupabaseConfigured()}>
      <div 
        class="mock-data-alert" 
        style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;"
      >
        <h4 style="margin: 0 0 10px 0; color: #92400E;">
          🧪 Usando Datos de Prueba
        </h4>
        <p style="margin: 0 0 15px 0; color: #92400E;">
          Supabase no está configurado. Actualmente se muestran datos mock para demostración.
        </p>
        <a 
          href="/setup-supabase" 
          style="background: #1E40AF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; display: inline-block;"
        >
          ⚙️ Configurar Supabase
        </a>
      </div>
    </Show>
  );
};

export default SupabaseAlert;
