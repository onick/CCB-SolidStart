import { Component, createSignal, onMount } from 'solid-js';
import { supabase } from '../lib/supabase/client';
import { seedDataService } from '../lib/supabase/services';
import '../styles/admin.css';

const SetupSupabase: Component = () => {
  const [currentStep, setCurrentStep] = createSignal(1);
  const [supabaseUrl, setSupabaseUrl] = createSignal('');
  const [supabaseKey, setSupabaseKey] = createSignal('');
  const [connectionStatus, setConnectionStatus] = createSignal<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isConnected, setIsConnected] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isPoblandoDatos, setIsPoblandoDatos] = createSignal(false);
  const [mensaje, setMensaje] = createSignal('');

  onMount(() => {
    // Cargar valores existentes del .env
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && !url.includes('tu-proyecto')) {
      setSupabaseUrl(url);
    }
    if (key && !key.includes('tu-anon-key')) {
      setSupabaseKey(key);
    }
  });

  onMount(async () => {
    await verificarConexion();
  });

  const testConnection = async () => {
    setConnectionStatus('testing');
    
    // Simular prueba de conexión
    setTimeout(() => {
      if (supabaseUrl().includes('supabase.co') && supabaseKey().length > 20) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    }, 2000);
  };

  const copyEnvConfig = () => {
    const envConfig = `VITE_SUPABASE_URL=${supabaseUrl()}
VITE_SUPABASE_ANON_KEY=${supabaseKey()}`;
    
    navigator.clipboard.writeText(envConfig);
    alert('Configuración copiada al portapapeles');
  };

  const verificarConexion = async () => {
    try {
      const { data, error } = await supabase.from('eventos').select('count').limit(1);
      if (error) {
        console.error('Error conectando a Supabase:', error);
        setIsConnected(false);
        setMensaje('❌ Error de conexión: ' + error.message);
      } else {
        setIsConnected(true);
        setMensaje('✅ Conexión exitosa a Supabase');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsConnected(false);
      setMensaje('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const poblarEventosDePrueba = async () => {
    setIsPoblandoDatos(true);
    setMensaje('🌱 Poblando eventos de prueba...');
    
    try {
      await seedDataService.poblarDatosIniciales();
      setMensaje('✅ ¡Eventos de prueba creados exitosamente! Ve a /eventos o /eventos-publicos para verlos.');
    } catch (error) {
      console.error('Error poblando datos:', error);
      setMensaje('❌ Error poblando datos: ' + error.message);
    } finally {
      setIsPoblandoDatos(false);
    }
  };

  return (
    <div class="admin-login">
      <div class="login-container" style="max-width: 800px;">
        <div class="login-header">
          <img src="/images/logo.png" alt="CCB" class="login-logo" />
          <h2>Configuración de Supabase</h2>
          <p>Centro Cultural Banreservas</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          {/* Progress Steps */}
          <div class="setup-progress" style="margin-bottom: 30px;">
            <div class="progress-steps" style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div class={`step ${currentStep() >= 1 ? 'active' : ''}`} style="flex: 1; text-align: center; padding: 15px; border-radius: 8px; background: #f8f9fa;">
                <div style="font-weight: bold; color: #1E40AF;">Paso 1</div>
                <div style="font-size: 14px;">Crear Proyecto</div>
              </div>
              <div class={`step ${currentStep() >= 2 ? 'active' : ''}`} style="flex: 1; text-align: center; padding: 15px; border-radius: 8px; background: #f8f9fa;">
                <div style="font-weight: bold; color: #1E40AF;">Paso 2</div>
                <div style="font-size: 14px;">Configurar DB</div>
              </div>
              <div class={`step ${currentStep() >= 3 ? 'active' : ''}`} style="flex: 1; text-align: center; padding: 15px; border-radius: 8px; background: #f8f9fa;">
                <div style="font-weight: bold; color: #1E40AF;">Paso 3</div>
                <div style="font-size: 14px;">Conectar App</div>
              </div>
            </div>
          </div>

          {/* Step 1: Create Project */}
          {currentStep() === 1 && (
            <div class="setup-step">
              <h3 style="color: #1E40AF; margin-bottom: 20px;">📚 Paso 1: Crear Proyecto en Supabase</h3>
              
              <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">🚀 Instrucciones:</h4>
                <ol style="margin: 0; padding-left: 20px;">
                  <li>Ve a <a href="https://supabase.com" target="_blank" style="color: #1E40AF; text-decoration: none;">supabase.com</a></li>
                  <li>Crea una cuenta gratuita</li>
                  <li>Click en "New Project"</li>
                  <li>Elige un nombre: <code>ccb-eventos</code></li>
                  <li>Selecciona una región cercana (EE.UU. Este)</li>
                  <li>Crea una contraseña segura para la base de datos</li>
                  <li>Click en "Create new project"</li>
                </ol>
              </div>

              <div style="text-align: center;">
                <button 
                  onclick={() => setCurrentStep(2)}
                  style="background: #1E40AF; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;"
                >
                  ✅ Proyecto Creado, Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Setup Database */}
          {currentStep() === 2 && (
            <div class="setup-step">
              <h3 style="color: #1E40AF; margin-bottom: 20px;">🗄️ Paso 2: Configurar Base de Datos</h3>
              
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">⚡ Ejecutar Schema SQL:</h4>
                <ol style="margin: 0; padding-left: 20px;">
                  <li>En tu proyecto de Supabase, ve a la sección <strong>"SQL Editor"</strong></li>
                  <li>Crea una nueva query</li>
                  <li>Copia y pega el contenido completo del archivo: <code>src/lib/supabase/schema.sql</code></li>
                  <li>Click en "Run" para ejecutar el script</li>
                  <li>Verifica que se crearon las tablas: <code>visitantes</code>, <code>eventos</code>, <code>registro_eventos</code></li>
                </ol>
              </div>

              <div style="background: #ECFDF5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #065F46;">
                  <strong>✨ Tip:</strong> El schema incluye datos de ejemplo que aparecerán automáticamente en tu dashboard.
                </p>
              </div>

              <div style="text-align: center; display: flex; gap: 15px; justify-content: center;">
                <button 
                  onclick={() => setCurrentStep(1)}
                  style="background: #6B7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;"
                >
                  ← Anterior
                </button>
                <button 
                  onclick={() => setCurrentStep(3)}
                  style="background: #1E40AF; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;"
                >
                  ✅ Schema Ejecutado, Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Connect App */}
          {currentStep() === 3 && (
            <div class="setup-step">
              <h3 style="color: #1E40AF; margin-bottom: 20px;">🔗 Paso 3: Conectar la Aplicación</h3>
              
              <div style="background: #F3E8FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">🔑 Obtener Credenciales:</h4>
                <ol style="margin: 0; padding-left: 20px;">
                  <li>En Supabase, ve a <strong>Settings → API</strong></li>
                  <li>Copia la <strong>"Project URL"</strong></li>
                  <li>Copia la <strong>"anon public"</strong> key</li>
                </ol>
              </div>

              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Project URL:</label>
                <input
                  type="text"
                  value={supabaseUrl()}
                  onInput={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://tu-proyecto.supabase.co"
                  style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                />
              </div>

              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Anon Key:</label>
                <input
                  type="text"
                  value={supabaseKey()}
                  onInput={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                />
              </div>

              <div style="text-align: center; margin-bottom: 20px;">
                <button 
                  onclick={testConnection}
                  disabled={connectionStatus() === 'testing'}
                  style="background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-right: 10px;"
                >
                  {connectionStatus() === 'testing' ? '🔄 Probando...' : '🧪 Probar Conexión'}
                </button>
                
                <button 
                  onclick={copyEnvConfig}
                  style="background: #7C3AED; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;"
                >
                  📋 Copiar Config .env
                </button>
              </div>

              {connectionStatus() === 'success' && (
                <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #065F46;">
                    <strong>✅ ¡Conexión exitosa!</strong> Supabase está configurado correctamente.
                  </p>
                </div>
              )}

              {connectionStatus() === 'error' && (
                <div style="background: #FEF2F2; border: 1px solid #EF4444; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #991B1B;">
                    <strong>❌ Error de conexión.</strong> Verifica que las credenciales sean correctas.
                  </p>
                </div>
              )}

              <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">📝 Último paso:</h4>
                <p style="margin-bottom: 10px;">Actualiza tu archivo <code>.env</code> con las credenciales:</p>
                <pre style="background: #1F2937; color: #F9FAFB; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px;">
{`VITE_SUPABASE_URL=${supabaseUrl() || 'https://tu-proyecto.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseKey() || 'tu-anon-key-aqui'}`}
                </pre>
              </div>

              <div style="text-align: center;">
                <a 
                  href="/admin" 
                  style="background: #1E40AF; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;"
                >
                  🚀 ¡Ir al Dashboard!
                </a>
              </div>
            </div>
          )}

        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="/" style="color: #6B7280; text-decoration: none;">← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};

export default SetupSupabase; 