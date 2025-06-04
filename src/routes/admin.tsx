import { Component, createEffect, createSignal, onMount, Show } from 'solid-js';
import { eventosService, visitantesService } from '../lib/supabase/services';
import '../styles/admin.css';

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

  // Efecto que escucha los cambios de autenticación
  createEffect(() => {
    console.log('🔄 Efecto reactivo - isAuthenticated cambió a:', isAuthenticated());
  });

  // Efecto para cargar estadísticas cuando el usuario se autentica
  createEffect(() => {
    if (isAuthenticated()) {
      console.log('🔄 Usuario autenticado, cargando estadísticas...');
      cargarEstadisticas();
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
      <div class="admin-panel">
        {/* Sidebar */}
        <aside class="admin-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">
              <img src="/images/logo.png" alt="CCB" class="sidebar-logo-icon" />
              <div class="sidebar-brand">
                <h1>CCB Admin</h1>
                <p>Centro Cultural</p>
              </div>
            </div>
          </div>
          
          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="nav-section-title">Principal</div>
              <div class="nav-item active">
                <FaSolidHouse size={18} color="#F39D1E" />
                <span>Dashboard</span>
              </div>
              <div class="nav-item">
                <FaSolidChartBar size={18} color="white" />
                <span>Reportes</span>
              </div>
              <div class="nav-item">
                <FaSolidGear size={18} color="white" />
                <span>Configuración</span>
              </div>
            </div>
            
            <div class="nav-section">
              <div class="nav-section-title">Gestionar</div>
              <div class="nav-item" onclick={() => window.location.href='/eventos'} style="cursor: pointer;">
                <FaRegularCalendar size={18} color="white" />
                <span>Eventos</span>
              </div>
              <div class="nav-item">
                <FaSolidUsers size={18} color="white" />
                <span>Visitantes</span>
              </div>
              <div class="nav-item" onclick={() => window.location.href='/registros'} style="cursor: pointer;">
                <FaSolidTicket size={18} color="white" />
                <span>Registros</span>
              </div>
              <div class="nav-item">
                <FaSolidTags size={18} color="white" />
                <span>Promociones</span>
              </div>
            </div>
            
            <div class="nav-section">
              <div class="nav-section-title">Herramientas</div>
              <div class="nav-item">
                <FaSolidCode size={18} color="white" />
                <span>Integraciones</span>
              </div>
              <div class="nav-item">
                <FaSolidDownload size={18} color="white" />
                <span>Exportar</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main class="admin-main">
          <header class="main-header">
            <div class="header-left">
              <div class="breadcrumb">
                <span>Eventos</span> / <span>Dashboard</span> / Centro Cultural Banreservas
              </div>
              <h1 class="main-title">¡Bienvenido de vuelta, Admin! 👋</h1>
              <p class="main-subtitle">Gestiona todos los aspectos del Centro Cultural Banreservas</p>
            </div>
            <div class="header-right">
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
                    <p class="card-subtitle">Feb 14 - Feb 21</p>
                  </div>
                </div>
                <div class="chart-placeholder">
                  <div>
                    📊 Aquí iría un gráfico de registros de eventos<br/>
                    <small>Similar al gráfico "Product Sales" de hi events</small>
                  </div>
                </div>
              </div>

              <div class="content-card">
                <div class="card-header">
                  <div>
                    <h2 class="card-title">Actividad Reciente</h2>
                  </div>
                </div>
                <div class="activity-list">
                  <div class="activity-item">
                    <div class="activity-avatar">
                      <FaSolidUserCheck size={16} color="#4a90e2" />
                    </div>
                    <div class="activity-content">
                      <div class="activity-text"><strong>María González</strong> se registró para "Concierto de Jazz"</div>
                      <div class="activity-time">Hace 2 horas</div>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <div class="activity-avatar">
                      <FaSolidCalendarDay size={16} color="#4a90e2" />
                    </div>
                    <div class="activity-content">
                      <div class="activity-text"><strong>Evento creado:</strong> "Exposición de Arte Contemporáneo"</div>
                      <div class="activity-time">Hace 5 horas</div>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <div class="activity-avatar">
                      <FaSolidUsers size={16} color="#4a90e2" />
                    </div>
                    <div class="activity-content">
                      <div class="activity-text"><strong>15 personas</strong> se registraron para "Taller de Fotografía"</div>
                      <div class="activity-time">Ayer</div>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <div class="activity-avatar">
                      <FaSolidStar size={16} color="#4a90e2" />
                    </div>
                    <div class="activity-content">
                      <div class="activity-text"><strong>Evento destacado:</strong> "Noche de Poesía" alcanzó 100 registros</div>
                      <div class="activity-time">Hace 2 días</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
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