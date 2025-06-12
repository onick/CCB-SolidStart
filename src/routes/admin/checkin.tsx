import { Component, createSignal, createEffect, Show } from 'solid-js';
import { visitantesService, eventosService } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin.css';
import '../../styles/checkin-admin.css';

// Solid Icons
import {
  FaSolidUserCheck,
  FaSolidCode,
  FaSolidPhone,
  FaSolidMagnifyingGlass,
  FaSolidCheck,
  FaSolidXmark,
  FaSolidClock,
  FaSolidTicket,
  FaSolidUsers,
  FaSolidCalendarCheck,
  FaSolidRotate
} from 'solid-icons/fa';

interface CheckInResult {
  success: boolean;
  visitante?: Visitante;
  evento?: Evento;
  codigo?: string;
  error?: string;
  timestamp?: string;
}

const CheckInAdmin: Component = () => {
  // Estados principales
  const [codigoInput, setCodigoInput] = createSignal('');
  const [telefonoInput, setTelefonoInput] = createSignal('');
  const [tipoCheckIn, setTipoCheckIn] = createSignal<'codigo' | 'telefono'>('codigo');
  const [resultado, setResultado] = createSignal<CheckInResult | null>(null);
  const [procesando, setProcesando] = createSignal(false);
  
  // Estados de datos
  const [visitantes, setVisitantes] = createSignal<Visitante[]>([]);
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [checkInsRecientes, setCheckInsRecientes] = createSignal<CheckInResult[]>([]);
  
  // Estadísticas del día
  const [estadisticasHoy, setEstadisticasHoy] = createSignal({
    totalCheckIns: 4,
    visitantesUnicos: 4,
    eventosActivos: 1,
    ultimoCheckIn: '09:28' as string | null
  });

  // Cargar datos iniciales
  createEffect(async () => {
    try {
      const [visitantesData, eventosData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      
      // Simular check-ins recientes
      const checkInsSimulados = generarCheckInsRecientes();
      setCheckInsRecientes(checkInsSimulados);
      
    } catch (error) {
      console.error('❌ Error cargando datos para check-in:', error);
    }
  });

  const generarCheckInsRecientes = (): CheckInResult[] => {
    const hoy = new Date();
    const checkIns: CheckInResult[] = [
      {
        success: true,
        visitante: { id: '1', nombre: 'Rafaela De Oleo', email: 'rafaela@gmail.com', telefono: '809-123-4567' },
        codigo: 'CCB-EYDA0MFV',
        timestamp: '09:28'
      },
      {
        success: true,
        visitante: { id: '2', nombre: 'Danilo Medina', email: 'danilo@example.com', telefono: '809-987-6543' },
        codigo: 'CCB-G822KUY9',
        timestamp: '08:59'
      },
      {
        success: true,
        visitante: { id: '3', nombre: 'Carmela', email: 'carmela@example.com', telefono: '809-456-7890' },
        codigo: 'CCB-Q2P9M2T',
        timestamp: '08:18'
      }
    ];
    
    return checkIns;
  };

  const realizarCheckIn = async () => {
    if (procesando()) return;
    
    setProcesando(true);
    setResultado(null);
    
    try {
      // Simular proceso de check-in
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (tipoCheckIn() === 'codigo') {
        const codigo = codigoInput().trim().toUpperCase();
        if (['CCB-DEMO1', 'CCB-TEST1', 'CCB-VALID'].includes(codigo)) {
          setResultado({
            success: true,
            visitante: { id: '4', nombre: 'Usuario Demo', email: 'demo@ccb.com', telefono: '809-000-0000' },
            codigo: codigo,
            timestamp: new Date().toISOString()
          });
          setCodigoInput('');
        } else {
          setResultado({
            success: false,
            error: `Código "${codigo}" no válido o no encontrado`
          });
        }
      } else {
        const telefono = telefonoInput().trim();
        if (telefono.length >= 7) {
          setResultado({
            success: true,
            visitante: { id: '5', nombre: 'Usuario por Teléfono', email: 'telefono@ccb.com', telefono: telefono },
            timestamp: new Date().toISOString()
          });
          setTelefonoInput('');
        } else {
          setResultado({
            success: false,
            error: 'Teléfono no encontrado en la base de datos'
          });
        }
      }
    } catch (error) {
      setResultado({
        success: false,
        error: 'Error al procesar el check-in'
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AdminLayout currentPage="checkin">
      <div class="admin-content">
        {/* Header de la página */}
        <div class="checkin-page-header">
          <div class="checkin-page-title">
            <div class="checkin-title-left">
              <FaSolidUserCheck class="checkin-title-icon" />
              <div class="checkin-title-text">
                <h1>Check-in de Entrada</h1>
                <p>Valida códigos de invitación y registra asistencias</p>
              </div>
            </div>
            <div class="checkin-live-indicator">
              <div class="checkin-live-dot"></div>
              En vivo
            </div>
          </div>
        </div>

        {/* Estadísticas del día */}
        <div class="checkin-stats-grid">
          <div class="checkin-stat-card">
            <div class="checkin-stat-icon">
              <FaSolidUserCheck />
            </div>
            <div class="checkin-stat-number">{estadisticasHoy().totalCheckIns}</div>
            <div class="checkin-stat-label">Check-ins Hoy</div>
          </div>

          <div class="checkin-stat-card">
            <div class="checkin-stat-icon">
              <FaSolidUsers />
            </div>
            <div class="checkin-stat-number">{estadisticasHoy().visitantesUnicos}</div>
            <div class="checkin-stat-label">Visitantes Únicos</div>
          </div>

          <div class="checkin-stat-card">
            <div class="checkin-stat-icon">
              <FaSolidTicket />
            </div>
            <div class="checkin-stat-number">{estadisticasHoy().eventosActivos}</div>
            <div class="checkin-stat-label">Eventos Activos</div>
          </div>

          <div class="checkin-stat-card">
            <div class="checkin-stat-icon">
              <FaSolidClock />
            </div>
            <div class="checkin-stat-number">{estadisticasHoy().ultimoCheckIn || '--:--'}</div>
            <div class="checkin-stat-label">Último Check-in</div>
          </div>
        </div>

        {/* Panel principal de check-in */}
        <div class="checkin-main-panel">
          {/* Selector de tipo de check-in */}
          <div class="checkin-type-selector">
            <button 
              class={`checkin-type-btn ${tipoCheckIn() === 'codigo' ? 'active' : ''}`}
              onClick={() => setTipoCheckIn('codigo')}
            >
              <FaSolidCode />
              Por Código
            </button>
            <button 
              class={`checkin-type-btn ${tipoCheckIn() === 'telefono' ? 'active' : ''}`}
              onClick={() => setTipoCheckIn('telefono')}
            >
              <FaSolidPhone />
              Por Teléfono
            </button>
          </div>

          {/* Campo de entrada */}
          <div class="checkin-input-container">
            <Show when={tipoCheckIn() === 'codigo'}>
              <label class="checkin-input-label">
                <FaSolidCode style={{ "margin-right": "8px" }} />
                Código de Invitación
              </label>
              <input
                type="text"
                class="checkin-input"
                placeholder="Escanea o ingresa código..."
                value={codigoInput()}
                onInput={(e) => setCodigoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && realizarCheckIn()}
                autofocus
              />
              <div style={{ "font-size": "12px", "color": "rgba(255, 255, 255, 0.6)", "margin-top": "8px" }}>
                Códigos de prueba: CCB-DEMO1, CCB-TEST1, CCB-VALID
              </div>
            </Show>

            <Show when={tipoCheckIn() === 'telefono'}>
              <label class="checkin-input-label">
                <FaSolidPhone style={{ "margin-right": "8px" }} />
                Número de Teléfono
              </label>
              <input
                type="tel"
                class="checkin-input"
                placeholder="Ingresa teléfono del visitante..."
                value={telefonoInput()}
                onInput={(e) => setTelefonoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && realizarCheckIn()}
              />
            </Show>
          </div>

          {/* Botón de check-in */}
          <button
            class="checkin-submit-btn"
            onClick={realizarCheckIn}
            disabled={procesando() || (!codigoInput().trim() && !telefonoInput().trim())}
          >
            <Show when={procesando()}>
              <div class="checkin-loading-spinner"></div>
              Procesando...
            </Show>
            <Show when={!procesando()}>
              <FaSolidUserCheck style={{ "margin-right": "8px" }} />
              Realizar Check-in
            </Show>
          </button>

          {/* Resultado del check-in */}
          <Show when={resultado()}>
            <div class={`checkin-status ${resultado()?.success ? 'success' : 'error'}`}>
              <div class="checkin-status-icon">
                {resultado()?.success ? <FaSolidCheck /> : <FaSolidXmark />}
              </div>
              <div class="checkin-status-title">
                {resultado()?.success ? '¡Check-in Exitoso!' : 'Error en Check-in'}
              </div>
              <div class="checkin-status-message">
                {resultado()?.success 
                  ? `Bienvenido ${resultado()?.visitante?.nombre}` 
                  : resultado()?.error
                }
              </div>

              <Show when={resultado()?.success && resultado()?.visitante}>
                <div class="checkin-visitor-info">
                  <div class="checkin-visitor-avatar">
                    {resultado()?.visitante?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <div class="checkin-visitor-details">
                    <div class="checkin-detail-item">
                      <div class="checkin-detail-label">Visitante</div>
                      <div class="checkin-detail-value">{resultado()?.visitante?.nombre}</div>
                    </div>
                    <div class="checkin-detail-item">
                      <div class="checkin-detail-label">Email</div>
                      <div class="checkin-detail-value">{resultado()?.visitante?.email}</div>
                    </div>
                    <Show when={resultado()?.codigo}>
                      <div class="checkin-detail-item">
                        <div class="checkin-detail-label">Código</div>
                        <div class="checkin-detail-value">{resultado()?.codigo}</div>
                      </div>
                    </Show>
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        </div>

        {/* Check-ins recientes */}
        <div class="checkin-recent-section">
          <div class="checkin-recent-header">
            <h3 class="checkin-recent-title">
              <FaSolidClock />
              Check-ins Recientes
            </h3>
            <button class="checkin-recent-refresh">
              <FaSolidRotate style={{ "margin-right": "4px" }} />
              Actualizar
            </button>
          </div>

          <div class="checkin-recent-list">
            <For each={checkInsRecientes()}>
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
      </div>
    </AdminLayout>
  );
};

export default CheckInAdmin;
