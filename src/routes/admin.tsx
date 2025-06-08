import { Component, createEffect, createSignal, onMount, Show, onCleanup } from 'solid-js';
import { eventosService, visitantesService } from '../lib/supabase/services';
import '../styles/admin.css';
import { Chart, registerables } from 'chart.js';
import AdminLayout from '../components/AdminLayout';

// solid-icons for better performance and native Solid.js integration
import {
    FaRegularCalendar,
    FaSolidArrowRightFromBracket,
    FaSolidCalendarDay,
    FaSolidChartBar,
    FaSolidChartLine,
    FaSolidCode,
    FaSolidDollarSign,
    FaSolidDownload,
    FaSolidFire,
    FaSolidGear,
    FaSolidHouse,
    FaSolidPlus,
    FaSolidShare,
    FaSolidStar,
    FaSolidTags,
    FaSolidTicket,
    FaSolidUserCheck,
    FaSolidUsers
} from 'solid-icons/fa';

// Función para verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('tu-proyecto') && !key.includes('tu-anon-key');
};

const Admin: Component = () => {
  // Registrar todos los componentes de Chart.js
  Chart.register(...registerables);
  
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Estados para las estadísticas reales
  const [stats, setStats] = createSignal({
    eventos: { total: 0, activos: 0, visitantes: 0, checkins: 0, ingresos: 0 },
    visitantes: { total: 0, activos: 0, hoy: 0, estaSemana: 0 },
    isLoading: true
  });

  // Variables para los gráficos
  let chartEventos: Chart | null = null;
  let chartActividad: Chart | null = null;

  // Efecto que escucha los cambios de autenticación
  createEffect(() => {
    console.log('🔄 Efecto reactivo - isAuthenticated cambió a:', isAuthenticated());
  });

  // Efecto para cargar estadísticas cuando el usuario se autentica
  createEffect(() => {
    if (isAuthenticated()) {
      console.log('🔄 Usuario autenticado, cargando estadísticas...');
      cargarEstadisticas();
      // Inicializar gráficos después de un pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        inicializarGraficos();
      }, 1000);
    }
  });

  // Verificar si ya está autenticado
  onMount(() => {
    console.log('Admin: Verificando autenticación...');
    const authStatus = localStorage.getItem('admin_authenticated');
    console.log('Estado de autenticación:', authStatus);
    
    // Modo de test - bypass automático (SOLO para development)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      console.log('🧪 Modo de test activado - bypass de login');
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      return;
    }
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Inicializar gráficos después de que el DOM esté listo
    setTimeout(() => {
      if (isAuthenticated()) {
        inicializarGraficos();
      }
    }, 500);
  });

  // Limpiar gráficos al desmontar el componente
  onCleanup(() => {
    if (chartEventos) chartEventos.destroy();
    if (chartActividad) chartActividad.destroy();
  });

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log('Intentando login con:', { username: username(), password: password() });
    
    // Pequeño delay para simular autenticación
    setTimeout(() => {
      // Credenciales simples para demo
      if (username() === 'admin' && password() === 'admin123') {
        console.log('Login exitoso');
        
        // Limpiar error PRIMERO
        setError('');
        
        // Guardar en localStorage
        localStorage.setItem('admin_authenticated', 'true');
        
        // Actualizar estado de autenticación ÚLTIMO para triggear re-render
        console.log('🔧 Cambiando isAuthenticated de', isAuthenticated(), 'a true');
        setIsAuthenticated(true);
        
        console.log('🔧 Estado después del cambio:', isAuthenticated());
        
      } else {
        console.log('Credenciales incorrectas');
        setError('Credenciales incorrectas. Usa: admin / admin123');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
    setError('');
  };

  // Función para cargar estadísticas reales desde Supabase
  const cargarEstadisticas = async () => {
    console.log('📊 Cargando estadísticas desde Supabase...');
    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Cargar estadísticas en paralelo
      const [estadisticasEventos, estadisticasVisitantes] = await Promise.all([
        eventosService.obtenerEstadisticas(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      console.log('📊 Estadísticas cargadas:', { estadisticasEventos, estadisticasVisitantes });
      
      setStats({
        eventos: estadisticasEventos,
        visitantes: estadisticasVisitantes,
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // En caso de error, mantener valores por defecto pero ya no cargar
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Función para inicializar los gráficos del dashboard
  const inicializarGraficos = () => {
    console.log('📊 Inicializando gráficos del dashboard...');
    
    // Gráfico de Registros de Eventos
    const ctxEventos = document.getElementById('chartEventos') as HTMLCanvasElement;
    if (ctxEventos && !chartEventos) {
      chartEventos = new Chart(ctxEventos, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Registros',
            data: [45, 62, 38, 75, 52, 89, 67],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: '#f9fafb',
              bodyColor: '#f9fafb',
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6'
              },
              ticks: {
                color: '#6b7280'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280'
              }
            }
          }
        }
      });
    }

    // Gráfico de Actividad de Visitantes
    const ctxActividad = document.getElementById('chartActividad') as HTMLCanvasElement;
    if (ctxActividad && !chartActividad) {
      chartActividad = new Chart(ctxActividad, {
        type: 'doughnut',
        data: {
          labels: ['Check-in', 'Registrados', 'Pendientes'],
          datasets: [{
            data: [stats().eventos.checkins, stats().visitantes.total - stats().eventos.checkins, stats().eventos.visitantes],
            backgroundColor: [
              '#10b981',
              '#3b82f6', 
              '#f59e0b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: '#6b7280'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: '#f9fafb',
              bodyColor: '#f9fafb',
              cornerRadius: 8
            }
          }
        }
      });
    }
  };

  // Función para login rápido (demo)
  const quickLogin = () => {
    console.log('🚀 Quick login iniciado');
    setUsername('admin');
    setPassword('admin123');
    setError('');
    
    // Auto-submit después de un pequeño delay
    setTimeout(() => {
      const form = document.querySelector('.login-form') as HTMLFormElement;
      if (form) {
        console.log('🚀 Ejecutando auto-submit');
        form.requestSubmit();
      }
    }, 100);
  };

  // Renderizado principal con lógica explícita
  const renderContent = () => {
    const authState = isAuthenticated();
    console.log('🎯 renderContent llamado - authState:', authState);
    
    if (!authState) {
      console.log('🔍 Renderizando pantalla de LOGIN - isAuthenticated:', authState);
      return renderLoginScreen();
    } else {
      console.log('✅ Renderizando PANEL PRINCIPAL - isAuthenticated:', authState);
      return renderAdminPanel();
    }
  };

  const renderLoginScreen = () => {
    console.log('🔍 renderLoginScreen() ejecutada');
    return (
      <div class="admin-login">
        <div class="login-container">
          <div class="login-header">
            <img src="/images/logo.png" alt="CCB" class="login-logo" />
            <h2>Panel de Administración</h2>
            <p>Centro Cultural Banreservas</p>
          </div>
          
          <form onSubmit={handleLogin} class="login-form">
            <div class="form-group">
              <label for="username">Usuario:</label>
              <input
                type="text"
                id="username"
                value={username()}
                onInput={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={isLoading()}
                required
              />
            </div>
            
            <div class="form-group">
              <label for="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={isLoading()}
                required
              />
            </div>
            
            {error() && <div class="error-message">{error()}</div>}
            
            <button 
              type="submit" 
              class="btn-login"
              disabled={isLoading()}
            >
              {isLoading() ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div class="login-footer">
            <div class="demo-credentials">
              <p><strong>Credenciales de demo:</strong></p>
              <div class="credentials-box">
                <p><strong>Usuario:</strong> admin</p>
                <p><strong>Contraseña:</strong> admin123</p>
                <button 
                  type="button" 
                  class="btn-quick-login"
                  onclick={quickLogin}
                  disabled={isLoading()}
                >
                  🚀 Login Rápido
                </button>
              </div>
              
              <div style="margin-top: 15px; font-size: 11px; color: #999;">
                <p>🔍 Debug info:</p>
                <p>Usuario actual: "{username()}"</p>
                <p>Contraseña actual: "{password()}"</p>
                <p>Estado: {isLoading() ? 'Cargando...' : 'Listo'}</p>
                {error() && <p style="color: #dc3545;">❌ {error()}</p>}
                
                <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px; color: #1565c0;">
                  <p><strong>🧪 Modo de test:</strong></p>
                  <p>Para bypass del login, usa:</p>
                  <code>/admin?test=true</code>
                </div>
                
                <div style="margin-top: 10px;">
                  <button 
                    type="button" 
                    onclick={() => {
                      console.log('🔧 Forzando refresh del estado');
                      const currentAuth = localStorage.getItem('admin_authenticated');
                      console.log('Estado en localStorage:', currentAuth);
                      if (currentAuth === 'true') {
                        setIsAuthenticated(true);
                        console.log('Estado forzado a true');
                      }
                    }}
                    style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer;"
                  >
                    🔧 Forzar Refresh Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Panel de administración principal
  const renderAdminPanel = () => {
    console.log('✅ renderAdminPanel() ejecutada');
    return (
      <AdminLayout currentPage="dashboard" onLogout={handleLogout}>
          <header class="main-header">
            <div class="header-left">
              <div class="breadcrumb">
                <span>Eventos</span> / <span>Dashboard</span> / Centro Cultural Banreservas
              </div>
              <h1 class="main-title">¡Bienvenido de vuelta, Admin! 👋</h1>
              <p class="main-subtitle">Gestiona todos los aspectos del Centro Cultural Banreservas</p>
            </div>
            <div class="header-right">
              <button 
                class="btn-header btn-success"
                onclick={() => window.open('/', '_blank')}
                title="Ver página principal del sitio"
              >
                <FaSolidShare size={16} color="white" />
                Ver Página Principal
              </button>
              <button class="btn-header btn-secondary">
                <FaSolidShare size={16} color="white" />
                Compartir
              </button>
              <button class="btn-header btn-primary">
                <FaSolidPlus size={16} color="white" />
                Nuevo Evento
              </button>
              <button class="btn-header btn-logout" onclick={handleLogout}>
                <FaSolidArrowRightFromBracket size={16} color="white" />
                Cerrar Sesión
              </button>
            </div>
          </header>

          <div class="main-content">
            {/* Alerta de datos mock */}
            {!isSupabaseConfigured() && (
              <div class="mock-data-alert" style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h4 style="margin: 0 0 10px 0; color: #92400E;">🧪 Usando Datos de Prueba</h4>
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
            )}

            {/* Stats Grid */}
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Eventos</div>
                  </div>
                  <div class="stat-icon blue">
                    <FaRegularCalendar size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : stats().eventos.total.toLocaleString()}
                </div>
                <div class="stat-label">Eventos registrados</div>
                <div class="stat-change positive">
                  ↗ {stats().eventos.activos} activos
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Visitantes</div>
                  </div>
                  <div class="stat-icon purple">
                    <FaSolidUsers size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : stats().visitantes.total.toLocaleString()}
                </div>
                <div class="stat-label">Personas registradas</div>
                <div class="stat-change positive">
                  ↗ {stats().visitantes.hoy} hoy
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Check-ins</div>
                  </div>
                  <div class="stat-icon teal">
                    <FaSolidUserCheck size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : stats().eventos.checkins.toLocaleString()}
                </div>
                <div class="stat-label">Asistencias confirmadas</div>
                <div class="stat-change positive">
                  ↗ {stats().visitantes.estaSemana} esta semana
                </div>
              </div>

{/* Tarjeta de Ingresos desactivada
              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Ingresos</div>
                  </div>
                  <div class="stat-icon orange">
                    <FaSolidDollarSign size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : `$${stats().eventos.ingresos.toLocaleString()}`}
                </div>
                <div class="stat-label">Ingresos totales</div>
                <div class="stat-change positive">
                  ↗ {stats().eventos.visitantes} registrados
                </div>
              </div>
              */}

              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Ocupación</div>
                  </div>
                  <div class="stat-icon green">
                    <FaSolidChartLine size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : `${Math.round((stats().eventos.visitantes / (stats().eventos.total * 200)) * 100)}%`}
                </div>
                <div class="stat-label">Promedio de ocupación</div>
                <div class="stat-change positive">
                  ↗ {stats().visitantes.activos} activos
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-header">
                  <div>
                    <div class="stat-title">Eventos Populares</div>
                  </div>
                  <div class="stat-icon red">
                    <FaSolidFire size={20} color="white" />
                  </div>
                </div>
                <div class="stat-number">
                  {stats().isLoading ? '...' : Math.round(stats().eventos.total * 0.3)}
                </div>
                <div class="stat-label">Con alta demanda</div>
                <div class="stat-change positive">
                  ↗ Trending up
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div class="content-grid">
              <div class="content-card">
                <div class="card-header">
                  <div>
                    <h2 class="card-title">Registros de Eventos</h2>
                    <p class="card-subtitle">Últimos 7 días</p>
                  </div>
                </div>
                <div style="height: 300px; padding: 20px;">
                  <canvas id="chartEventos" width="400" height="300"></canvas>
                </div>
              </div>

              <div class="content-card">
                <div class="card-header">
                  <div>
                    <h2 class="card-title">Estado de Visitantes</h2>
                    <p class="card-subtitle">Distribución actual</p>
                  </div>
                </div>
                <div style="height: 300px; padding: 20px; display: flex; align-items: center; justify-content: center;">
                  <canvas id="chartActividad" width="300" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
      </AdminLayout>
    );
  };

  // Agregar logging antes del render
  console.log('🎯 Componente Admin renderizando - isAuthenticated:', isAuthenticated());

  return (
    <div>
      <Show
        when={isAuthenticated()}
        fallback={renderLoginScreen()}
      >
        {renderAdminPanel()}
      </Show>
    </div>
  );
};

export default Admin;