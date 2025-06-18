import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { visitantesService, eventosService } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import { CheckInHeaderConfig } from '../../components/admin/checkin';
import '../../styles/admin.css';
import '../../styles/checkin-admin.css';

// Solid Icons
import {
  FaSolidUserCheck,
  FaSolidCode,
  FaSolidPhone,
  FaSolidCheck,
  FaSolidXmark,
  FaSolidClock,
  FaSolidTicket,
  FaSolidUsers,
  FaSolidRotate
} from 'solid-icons/fa';

// ==================================================================================
// TIPOS Y INTERFACES
// ==================================================================================

interface CheckInResult {
  success: boolean;
  visitante?: Visitante;
  evento?: Evento;
  codigo?: string;
  error?: string;
  timestamp?: string;
}

interface EstadisticasHoy {
  totalCheckIns: number;
  visitantesUnicos: number;
  eventosActivos: number;
  ultimoCheckIn: string | null;
}

// ==================================================================================
// COMPONENTES MODULARES
// ==================================================================================

// Componente: Tarjeta de estadística
interface StatCardProps {
  icon: Component;
  number: number | string;
  label: string;
}

const StatCard: Component<StatCardProps> = (props) => (
  <div class="checkin-stat-card">
    <div class="checkin-stat-icon">
      <props.icon />
    </div>
    <div class="checkin-stat-number">{props.number}</div>
    <div class="checkin-stat-label">{props.label}</div>
  </div>
);

// Componente: Grid de estadísticas
interface StatsGridProps {
  estadisticas: EstadisticasHoy;
}

const StatsGrid: Component<StatsGridProps> = (props) => (
  <div class="checkin-stats-grid">
    <StatCard 
      icon={FaSolidUserCheck} 
      number={props.estadisticas.totalCheckIns} 
      label="Check-ins Hoy" 
    />
    <StatCard 
      icon={FaSolidUsers} 
      number={props.estadisticas.visitantesUnicos} 
      label="Visitantes Únicos" 
    />
    <StatCard 
      icon={FaSolidTicket} 
      number={props.estadisticas.eventosActivos} 
      label="Eventos Activos" 
    />
    <StatCard 
      icon={FaSolidClock} 
      number={props.estadisticas.ultimoCheckIn || '--:--'} 
      label="Último Check-in" 
    />
  </div>
);

// Componente: Selector de tipo de check-in
interface TypeSelectorProps {
  tipoActual: 'codigo' | 'telefono';
  onCambiarTipo: (tipo: 'codigo' | 'telefono') => void;
}

const TypeSelector: Component<TypeSelectorProps> = (props) => (
  <div class="checkin-type-selector">
    <button 
      class={`checkin-type-btn ${props.tipoActual === 'codigo' ? 'active' : ''}`}
      onClick={() => props.onCambiarTipo('codigo')}
    >
      <FaSolidCode />
      Por Código
    </button>
    <button 
      class={`checkin-type-btn ${props.tipoActual === 'telefono' ? 'active' : ''}`}
      onClick={() => props.onCambiarTipo('telefono')}
    >
      <FaSolidPhone />
      Por Teléfono
    </button>
  </div>
);

// Componente: Campo de entrada
interface InputFieldProps {
  tipo: 'codigo' | 'telefono';
  valor: string;
  onInput: (valor: string) => void;
  onEnter: () => void;
}

const InputField: Component<InputFieldProps> = (props) => (
  <div class="checkin-input-container">
    <Show when={props.tipo === 'codigo'}>
      <label class="checkin-input-label">
        <FaSolidCode style={{ "margin-right": "8px" }} />
        Código de Invitación
      </label>
      <input
        type="text"
        class="checkin-input"
        placeholder="Escanea o ingresa código..."
        value={props.valor}
        onInput={(e) => props.onInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && props.onEnter()}
        autofocus
      />
      <div style={{ "font-size": "12px", "color": "rgba(255, 255, 255, 0.6)", "margin-top": "8px" }}>
        Códigos de prueba: CCB-DEMO1, CCB-TEST1, CCB-VALID
      </div>
    </Show>

    <Show when={props.tipo === 'telefono'}>
      <label class="checkin-input-label">
        <FaSolidPhone style={{ "margin-right": "8px" }} />
        Número de Teléfono
      </label>
      <input
        type="tel"
        class="checkin-input"
        placeholder="Ingresa teléfono del visitante..."
        value={props.valor}
        onInput={(e) => props.onInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && props.onEnter()}
      />
    </Show>
  </div>
);

// Componente: Botón de check-in
interface SubmitButtonProps {
  procesando: boolean;
  deshabilitado: boolean;
  onClick: () => void;
}

const SubmitButton: Component<SubmitButtonProps> = (props) => (
  <button
    class="checkin-submit-btn"
    onClick={props.onClick}
    disabled={props.deshabilitado}
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
);

// Componente: Resultado del check-in
interface ResultStatusProps {
  resultado: CheckInResult | null;
}

const ResultStatus: Component<ResultStatusProps> = (props) => (
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

// Componente: Item de check-in reciente
interface RecentItemProps {
  checkIn: CheckInResult;
}

const RecentItem: Component<RecentItemProps> = (props) => (
  <div class="checkin-recent-item">
    <div class="checkin-recent-avatar">
      {props.checkIn.visitante?.nombre?.charAt(0)?.toUpperCase()}
    </div>
    <div class="checkin-recent-info">
      <div class="checkin-recent-name">{props.checkIn.visitante?.nombre}</div>
      <div class="checkin-recent-event">Código: {props.checkIn.codigo}</div>
    </div>
    <div class="checkin-recent-time">{props.checkIn.timestamp}</div>
    <div class="checkin-recent-status"></div>
  </div>
);

// Componente: Lista de check-ins recientes
interface RecentListProps {
  checkIns: CheckInResult[];
  onRefresh: () => void;
}

const RecentList: Component<RecentListProps> = (props) => (
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
      <For each={props.checkIns}>
        {(checkIn) => <RecentItem checkIn={checkIn} />}
      </For>
    </div>
  </div>
);

// ==================================================================================
// SERVICIOS Y LÓGICA OPTIMISTA
// ==================================================================================

class CheckInOptimisticService {
  // Actualizar estadísticas de forma optimista
  static actualizarEstadisticasOptimista(
    estadisticas: EstadisticasHoy, 
    nuevoCheckIn: CheckInResult
  ): EstadisticasHoy {
    if (!nuevoCheckIn.success) return estadisticas;
    
    return {
      ...estadisticas,
      totalCheckIns: estadisticas.totalCheckIns + 1,
      visitantesUnicos: estadisticas.visitantesUnicos + 1,
      ultimoCheckIn: new Date().toLocaleTimeString('es-DO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  }

  // Agregar check-in a la lista de forma optimista
  static agregarCheckInOptimista(
    checkIns: CheckInResult[],
    nuevoCheckIn: CheckInResult
  ): CheckInResult[] {
    return [nuevoCheckIn, ...checkIns.slice(0, 9)]; // Máximo 10 items
  }

  // Simular operación de check-in
  static async simularCheckIn(
    tipo: 'codigo' | 'telefono',
    valor: string
  ): Promise<CheckInResult> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (tipo === 'codigo') {
      const codigo = valor.trim().toUpperCase();
      if (['CCB-DEMO1', 'CCB-TEST1', 'CCB-VALID'].includes(codigo)) {
        return {
          success: true,
          visitante: { 
            id: Date.now().toString(), 
            nombre: 'Usuario Demo', 
            email: 'demo@ccb.com', 
            telefono: '809-000-0000' 
          },
          codigo: codigo,
          timestamp: new Date().toLocaleTimeString('es-DO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      } else {
        return {
          success: false,
          error: `Código "${codigo}" no válido o no encontrado`
        };
      }
    } else {
      const telefono = valor.trim();
      if (telefono.length >= 7) {
        return {
          success: true,
          visitante: { 
            id: Date.now().toString(), 
            nombre: 'Usuario por Teléfono', 
            email: 'telefono@ccb.com', 
            telefono: telefono 
          },
          timestamp: new Date().toLocaleTimeString('es-DO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      } else {
        return {
          success: false,
          error: 'Teléfono no encontrado en la base de datos'
        };
      }
    }
  }
}

// ==================================================================================
// COMPONENTE PRINCIPAL - REFACTORIZADO
// ==================================================================================

const CheckInAdmin: Component = () => {
  // Estados principales
  const [codigoInput, setCodigoInput] = createSignal('');
  const [telefonoInput, setTelefonoInput] = createSignal('');
  const [tipoCheckIn, setTipoCheckIn] = createSignal<'codigo' | 'telefono'>('codigo');
  const [resultado, setResultado] = createSignal<CheckInResult | null>(null);
  const [procesando, setProcesando] = createSignal(false);
  
  // Estados de datos con actualizaciones optimistas
  const [visitantes, setVisitantes] = createSignal<Visitante[]>([]);
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [checkInsRecientes, setCheckInsRecientes] = createSignal<CheckInResult[]>([]);
  
  // Estadísticas del día con actualizaciones optimistas
  const [estadisticasHoy, setEstadisticasHoy] = createSignal<EstadisticasHoy>({
    totalCheckIns: 4,
    visitantesUnicos: 4,
    eventosActivos: 1,
    ultimoCheckIn: '09:28'
  });

  // ================================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ================================================================================

  const cargarDatosIniciales = async () => {
    try {
      console.log('🔄 [CHECK-IN] Cargando datos iniciales...');
      
      const [visitantesData, eventosData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      
      // Generar check-ins recientes iniciales
      const checkInsSimulados = generarCheckInsRecientes();
      setCheckInsRecientes(checkInsSimulados);
      
      console.log('✅ [CHECK-IN] Datos cargados exitosamente');
      
    } catch (error) {
      console.error('❌ [CHECK-IN] Error cargando datos:', error);
    }
  };

  const generarCheckInsRecientes = (): CheckInResult[] => {
    return [
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
  };

  // ================================================================================
  // FUNCIONES DE CHECK-IN OPTIMISTA
  // ================================================================================

  const realizarCheckInOptimista = async () => {
    if (procesando()) return;
    
    const valorInput = tipoCheckIn() === 'codigo' ? codigoInput() : telefonoInput();
    if (!valorInput.trim()) return;

    console.log('🚀 [CHECK-IN OPTIMISTA] Iniciando proceso...');
    
    setProcesando(true);
    setResultado(null);
    
    try {
      // PASO 1: Crear resultado optimista inmediato
      const resultadoOptimista: CheckInResult = {
        success: true,
        visitante: { 
          id: 'temp-' + Date.now(), 
          nombre: '⏳ Procesando...', 
          email: 'temp@ccb.com', 
          telefono: '000-000-0000' 
        },
        codigo: tipoCheckIn() === 'codigo' ? valorInput.trim().toUpperCase() : undefined,
        timestamp: new Date().toLocaleTimeString('es-DO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      // PASO 2: Actualizar UI inmediatamente (optimista)
      console.log('⚡ [OPTIMISTA] Actualizando UI inmediatamente...');
      
      // Actualizar estadísticas optimistamente
      const nuevasEstadisticas = CheckInOptimisticService.actualizarEstadisticasOptimista(
        estadisticasHoy(), 
        resultadoOptimista
      );
      setEstadisticasHoy(nuevasEstadisticas);
      
      // Agregar a la lista optimistamente
      const nuevosCheckIns = CheckInOptimisticService.agregarCheckInOptimista(
        checkInsRecientes(),
        resultadoOptimista
      );
      setCheckInsRecientes(nuevosCheckIns);
      
      // Mostrar resultado optimista
      setResultado(resultadoOptimista);
      
      // Limpiar campos inmediatamente
      if (tipoCheckIn() === 'codigo') {
        setCodigoInput('');
      } else {
        setTelefonoInput('');
      }

      // PASO 3: Llamada real al servidor
      console.log('🌐 [SERVIDOR] Enviando petición real...');
      
      const resultadoReal = await CheckInOptimisticService.simularCheckIn(
        tipoCheckIn(),
        valorInput
      );

      // PASO 4: Actualizar con datos reales
      console.log('✅ [REAL] Actualizando con datos del servidor...');
      
      if (resultadoReal.success) {
        // Éxito: actualizar con datos reales
        const estadisticasReales = CheckInOptimisticService.actualizarEstadisticasOptimista(
          { ...estadisticasHoy(), totalCheckIns: estadisticasHoy().totalCheckIns - 1 }, // Restar el optimista
          resultadoReal
        );
        setEstadisticasHoy(estadisticasReales);
        
        // Reemplazar el item optimista con el real
        const checkInsReales = [
          resultadoReal,
          ...checkInsRecientes().slice(1) // Quitar el primero (optimista)
        ];
        setCheckInsRecientes(checkInsReales);
        
        setResultado(resultadoReal);
        
        console.log('🎉 [CHECK-IN] Proceso completado exitosamente');
        
      } else {
        // Error: revertir cambios optimistas
        console.log('❌ [REVERTIR] Servidor devolvió error, revirtiendo...');
        
        // Revertir estadísticas
        const estadisticasRevertidas = {
          ...estadisticasHoy(),
          totalCheckIns: estadisticasHoy().totalCheckIns - 1,
          visitantesUnicos: estadisticasHoy().visitantesUnicos - 1
        };
        setEstadisticasHoy(estadisticasRevertidas);
        
        // Revertir lista (quitar el primer item optimista)
        const checkInsRevertidos = checkInsRecientes().slice(1);
        setCheckInsRecientes(checkInsRevertidos);
        
        // Mostrar error
        setResultado(resultadoReal);
        
        console.log('🔄 [REVERTIDO] Cambios optimistas revertidos');
      }
      
    } catch (error) {
      console.error('💥 [ERROR] Error en check-in:', error);
      
      // Revertir todos los cambios optimistas
      const estadisticasRevertidas = {
        ...estadisticasHoy(),
        totalCheckIns: estadisticasHoy().totalCheckIns - 1,
        visitantesUnicos: estadisticasHoy().visitantesUnicos - 1
      };
      setEstadisticasHoy(estadisticasRevertidas);
      
      const checkInsRevertidos = checkInsRecientes().slice(1);
      setCheckInsRecientes(checkInsRevertidos);
      
      setResultado({
        success: false,
        error: 'Error de conexión. Intenta de nuevo.'
      });
      
    } finally {
      setProcesando(false);
    }
  };

  const refrescarCheckIns = async () => {
    console.log('🔄 [REFRESH] Actualizando lista de check-ins...');
    // En una implementación real, aquí haríamos llamada al servidor
    const checkInsActualizados = generarCheckInsRecientes();
    setCheckInsRecientes(checkInsActualizados);
    console.log('✅ [REFRESH] Lista actualizada');
  };

  const exportarReporte = async () => {
    console.log('📊 [EXPORT] Exportando reporte de check-ins...');
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ [EXPORT] Reporte exportado');
  };

  const actualizarDatos = async () => {
    console.log('🔄 [UPDATE] Actualizando todos los datos...');
    await cargarDatosIniciales();
    await refrescarCheckIns();
    console.log('✅ [UPDATE] Datos actualizados');
  };

  // ================================================================================
  // EFECTOS
  // ================================================================================

  createEffect(() => {
    cargarDatosIniciales();
  });

  // ================================================================================
  // RENDER PRINCIPAL
  // ================================================================================

  return (
    <AdminLayout currentPage="checkin">
      <div>
        {/* Header unificado */}
        <CheckInHeaderConfig 
          onActualizar={actualizarDatos}
          onExportar={exportarReporte}
        />

        {/* Estadísticas */}
        <StatsGrid estadisticas={estadisticasHoy()} />

        {/* Panel principal de check-in */}
        <div class="checkin-main-panel">
          {/* Selector de tipo */}
          <TypeSelector 
            tipoActual={tipoCheckIn()}
            onCambiarTipo={setTipoCheckIn}
          />

          {/* Campo de entrada */}
          <InputField
            tipo={tipoCheckIn()}
            valor={tipoCheckIn() === 'codigo' ? codigoInput() : telefonoInput()}
            onInput={tipoCheckIn() === 'codigo' ? setCodigoInput : setTelefonoInput}
            onEnter={realizarCheckInOptimista}
          />

          {/* Botón de check-in */}
          <SubmitButton
            procesando={procesando()}
            deshabilitado={procesando() || (!codigoInput().trim() && !telefonoInput().trim())}
            onClick={realizarCheckInOptimista}
          />

          {/* Resultado */}
          <ResultStatus resultado={resultado()} />
        </div>

        {/* Check-ins recientes */}
        <RecentList 
          checkIns={checkInsRecientes()}
          onRefresh={refrescarCheckIns}
        />
      </div>
    </AdminLayout>
  );
};

export default CheckInAdmin;