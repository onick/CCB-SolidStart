import { Component, createSignal, createEffect, Show } from 'solid-js';
import { visitantesService, eventosService } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import '../../styles/admin.css';

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
  FaSolidCalendarCheck
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
    totalCheckIns: 0,
    visitantesUnicos: 0,
    eventosActivos: 0,
    ultimoCheckIn: null as string | null
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
      
      // Calcular estadísticas del día
      actualizarEstadisticasHoy(checkInsSimulados);
      
    } catch (error) {
      console.error('❌ Error cargando datos para check-in:', error);
    }
  });

  const generarCheckInsRecientes = (): CheckInResult[] => {
    const hoy = new Date();
    const checkIns: CheckInResult[] = [];
    
    // Generar 3-5 check-ins recientes simulados
    for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
      const visitante = visitantes()[Math.floor(Math.random() * visitantes().length)];
      const evento = eventos()[Math.floor(Math.random() * eventos().length)];
      
      if (visitante && evento) {
        checkIns.push({
          success: true,
          visitante,
          evento,
          codigo: `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          timestamp: new Date(hoy.getTime() - Math.random() * 8 * 60 * 60 * 1000).toISOString()
        });
      }
    }
    
    return checkIns.sort((a, b) => 
      new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
  };

  const actualizarEstadisticasHoy = (checkIns: CheckInResult[]) => {
    const hoy = new Date().toDateString();
    const checkInsHoy = checkIns.filter(ci => 
      ci.timestamp && new Date(ci.timestamp).toDateString() === hoy
    );
    
    const visitantesUnicos = new Set(checkInsHoy.map(ci => ci.visitante?.id)).size;
    const eventosActivos = eventos().filter(e => e.estado === 'activo').length;
    
    setEstadisticasHoy({
      totalCheckIns: checkInsHoy.length,
      visitantesUnicos,
      eventosActivos,
      ultimoCheckIn: checkInsHoy[0]?.timestamp || null
    });
  };

  const realizarCheckIn = async () => {
    if (procesando()) return;
    
    setProcesando(true);
    setResultado(null);
    
    try {
      let resultado: CheckInResult;
      
      if (tipoCheckIn() === 'codigo') {
        if (!codigoInput().trim()) {
          throw new Error('Ingresa un código válido');
        }
        resultado = await buscarPorCodigo(codigoInput().trim().toUpperCase());
      } else {
        if (!telefonoInput().trim()) {
          throw new Error('Ingresa un número de teléfono válido');
        }
        resultado = await buscarPorTelefono(telefonoInput().trim());
      }
      
      if (resultado.success) {
        // Agregar timestamp
        resultado.timestamp = new Date().toISOString();
        
        // Actualizar lista de check-ins recientes
        setCheckInsRecientes(prev => [resultado, ...prev.slice(0, 9)]);
        
        // Actualizar estadísticas
        actualizarEstadisticasHoy([resultado, ...checkInsRecientes()]);
        
        // Limpiar inputs
        setCodigoInput('');
        setTelefonoInput('');
        
        // Reproducir sonido de éxito (opcional)
        reproducirSonidoExito();
      }
      
      setResultado(resultado);
      
    } catch (error: any) {
      setResultado({
        success: false,
        error: error.message || 'Error procesando check-in'
      });
    } finally {
      setProcesando(false);
    }
  };

  const buscarPorCodigo = async (codigo: string): Promise<CheckInResult> => {
    // Simular búsqueda en base de datos de invitaciones
    // En producción, esto vendría de Supabase
    
    // Generar códigos válidos simulados basados en visitantes existentes
    const codigosValidos = visitantes().slice(0, 5).map((v, index) => ({
      codigo: `CCB-TEST${index + 1}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      visitanteId: v.id,
      eventoId: eventos()[0]?.id || 'evento-1'
    }));
    
    // Códigos de prueba específicos
    const codigosDemo = [
      { codigo: 'CCB-DEMO1', visitanteId: visitantes()[0]?.id, eventoId: eventos()[0]?.id },
      { codigo: 'CCB-TEST1', visitanteId: visitantes()[1]?.id, eventoId: eventos()[0]?.id },
      { codigo: 'CCB-VALID', visitanteId: visitantes()[2]?.id, eventoId: eventos()[0]?.id }
    ];
    
    const todosLosCodigos = [...codigosDemo, ...codigosValidos];
    
    const invitacion = todosLosCodigos.find(c => c.codigo === codigo);
    
    if (!invitacion) {
      return {
        success: false,
        error: `Código "${codigo}" no válido o expirado`
      };
    }
    
    const visitante = visitantes().find(v => v.id === invitacion.visitanteId);
    const evento = eventos().find(e => e.id === invitacion.eventoId);
    
    if (!visitante || !evento) {
      return {
        success: false,
        error: 'Datos de invitación inconsistentes'
      };
    }
    
    return {
      success: true,
      visitante,
      evento,
      codigo
    };
  };

  const buscarPorTelefono = async (telefono: string): Promise<CheckInResult> => {
    const visitante = visitantes().find(v => 
      v.telefono && v.telefono.includes(telefono)
    );
    
    if (!visitante) {
      return {
        success: false,
        error: `No se encontró visitante con teléfono "${telefono}"`
      };
    }
    
    // Buscar evento activo para hoy
    const eventoActivo = eventos().find(e => e.estado === 'activo');
    
    if (!eventoActivo) {
      return {
        success: false,
        error: 'No hay eventos activos para hoy'
      };
    }
    
    return {
      success: true,
      visitante,
      evento: eventoActivo
    };
  };

  const reproducirSonidoExito = () => {
    // Crear sonido de éxito simple
    if ('AudioContext' in window) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const limpiarResultado = () => {
    setResultado(null);
  };

  const formatearTiempo = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div class="admin-content">
      {/* Header */}
      <div class="breadcrumb">
        <span>Check-in</span>
        <span>/</span>
        <span>Entrada</span>
        <span>/</span>
        <span>Centro Cultural Banreservas</span>
      </div>

      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <FaSolidUserCheck size={28} color="#10B981" style="margin-right: 12px;" />
            Check-in de Entrada ✅
          </h1>
          <p class="welcome-subtitle">Valida códigos de invitación y registra asistencias</p>
        </div>
        <div class="welcome-actions">
          <button class="header-btn share">
            <FaSolidCalendarCheck size={16} />
            Hoy: {estadisticasHoy().totalCheckIns}
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10B981 0%, #047857 100%);">
            <FaSolidUserCheck size={24} color="white" />
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticasHoy().totalCheckIns}</h3>
            <p class="stat-label">CHECK-INS HOY</p>
            <p class="stat-sublabel">Asistencias registradas</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);">
            <FaSolidUsers size={24} color="white" />
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticasHoy().visitantesUnicos}</h3>
            <p class="stat-label">VISITANTES ÚNICOS</p>
            <p class="stat-sublabel">Personas diferentes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
            <FaSolidTicket size={24} color="white" />
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{estadisticasHoy().eventosActivos}</h3>
            <p class="stat-label">EVENTOS ACTIVOS</p>
            <p class="stat-sublabel">Disponibles hoy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);">
            <FaSolidClock size={24} color="white" />
          </div>
          <div class="stat-content">
            <h3 class="stat-number">
              {estadisticasHoy().ultimoCheckIn 
                ? formatearTiempo(estadisticasHoy().ultimoCheckIn!) 
                : '--:--'
              }
            </h3>
            <p class="stat-label">ÚLTIMO CHECK-IN</p>
            <p class="stat-sublabel">Hora de entrada</p>
          </div>
        </div>
      </div>

      {/* Interface de Check-in */}
      <div class="checkin-container">
        <div class="checkin-form">
          <div class="form-header">
            <h2>🎫 Registro de Entrada</h2>
            <div class="type-selector">
              <button 
                class={`type-btn ${tipoCheckIn() === 'codigo' ? 'active' : ''}`}
                onClick={() => setTipoCheckIn('codigo')}
              >
                <FaSolidCode size={16} />
                Código
              </button>
              <button 
                class={`type-btn ${tipoCheckIn() === 'telefono' ? 'active' : ''}`}
                onClick={() => setTipoCheckIn('telefono')}
              >
                <FaSolidPhone size={16} />
                Teléfono
              </button>
            </div>
          </div>

          <div class="input-section">
            <Show when={tipoCheckIn() === 'codigo'}>
              <div class="input-group large">
                <FaSolidCode size={20} color="#666" />
                <input
                  type="text"
                  placeholder="Escanea o ingresa código (ej: CCB-DEMO1)"
                  value={codigoInput()}
                  onInput={(e) => setCodigoInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && realizarCheckIn()}
                  class="code-input"
                  autofocus
                />
              </div>
              <div class="help-text">
                💡 Códigos de prueba: CCB-DEMO1, CCB-TEST1, CCB-VALID
              </div>
            </Show>

            <Show when={tipoCheckIn() === 'telefono'}>
              <div class="input-group large">
                <FaSolidPhone size={20} color="#666" />
                <input
                  type="tel"
                  placeholder="Número de teléfono registrado"
                  value={telefonoInput()}
                  onInput={(e) => setTelefonoInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && realizarCheckIn()}
                  class="phone-input"
                  autofocus
                />
              </div>
              <div class="help-text">
                💡 Busca por teléfono registrado en la base de datos
              </div>
            </Show>

            <button 
              class="checkin-btn"
              onClick={realizarCheckIn}
              disabled={procesando()}
            >
              {procesando() ? (
                <>🔄 Procesando...</>
              ) : (
                <>
                  <FaSolidUserCheck size={20} />
                  Realizar Check-in
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resultado del Check-in */}
        <Show when={resultado()}>
          <div class={`checkin-result ${resultado()!.success ? 'success' : 'error'}`}>
            <div class="result-header">
              {resultado()!.success ? (
                <>
                  <FaSolidCheck size={32} color="#10B981" />
                  <h3>✅ Check-in Exitoso</h3>
                </>
              ) : (
                <>
                  <FaSolidXmark size={32} color="#EF4444" />
                  <h3>❌ Check-in Fallido</h3>
                </>
              )}
              <button class="close-result" onClick={limpiarResultado}>×</button>
            </div>

            <Show when={resultado()!.success && resultado()!.visitante}>
              <div class="visitor-info">
                <div class="visitor-avatar large">
                  {resultado()!.visitante!.nombre.charAt(0)}
                </div>
                <div class="visitor-details">
                  <h2>{resultado()!.visitante!.nombre}</h2>
                  <p>{resultado()!.visitante!.email}</p>
                  <Show when={resultado()!.codigo}>
                    <p class="code-used">Código: {resultado()!.codigo}</p>
                  </Show>
                  <Show when={resultado()!.evento}>
                    <p class="event-name">Evento: {resultado()!.evento!.nombre}</p>
                  </Show>
                  <p class="timestamp">
                    {new Date().toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </Show>

            <Show when={!resultado()!.success}>
              <div class="error-message">
                <p>{resultado()!.error}</p>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* Check-ins Recientes */}
      <div class="recent-checkins">
        <h3>🕐 Check-ins Recientes</h3>
        <div class="checkins-list">
          <Show when={checkInsRecientes().length === 0}>
            <div class="empty-state">
              <p>No hay check-ins registrados hoy</p>
            </div>
          </Show>
          
          <Show when={checkInsRecientes().length > 0}>
            {checkInsRecientes().map((checkin, index) => (
              <div class="checkin-item" key={index}>
                <div class="checkin-avatar">
                  {checkin.visitante?.nombre.charAt(0)}
                </div>
                <div class="checkin-info">
                  <div class="visitor-name">{checkin.visitante?.nombre}</div>
                  <div class="event-name">{checkin.evento?.nombre}</div>
                  <Show when={checkin.codigo}>
                    <div class="code-used">Código: {checkin.codigo}</div>
                  </Show>
                </div>
                <div class="checkin-time">
                  {formatearTiempo(checkin.timestamp!)}
                </div>
                <div class="checkin-status success">
                  <FaSolidCheck size={16} />
                </div>
              </div>
            ))}
          </Show>
        </div>
      </div>
    </div>
  );
};

export default CheckInAdmin;