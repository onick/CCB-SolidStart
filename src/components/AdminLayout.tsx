import { Component, JSX } from 'solid-js';
import { FaSolidHouse, FaSolidChartBar, FaSolidGear, FaRegularCalendar, FaSolidUsers, FaSolidTicket, FaSolidUserCheck, FaSolidCode, FaSolidDownload, FaSolidArrowRightFromBracket } from 'solid-icons/fa';

interface AdminLayoutProps {
  children: JSX.Element;
  currentPage?: string;
  onLogout?: () => void;
}

const AdminLayout: Component<AdminLayoutProps> = (props) => {
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    if (props.onLogout) {
      props.onLogout();
    } else {
      window.location.href = '/admin';
    }
  };

  const isActivePage = (page: string) => {
    return props.currentPage === page ? 'active' : '';
  };

  return (
    <div class="admin-panel">
      {/* Sidebar Compartido */}
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
            <div class={`nav-item ${isActivePage('dashboard')}`} onclick={() => window.location.href='/admin'} style="cursor: pointer;">
              <FaSolidHouse size={18} color={props.currentPage === 'dashboard' ? '#F39D1E' : 'white'} />
              <span>Dashboard</span>
            </div>
            <div class={`nav-item ${isActivePage('reportes')}`} onclick={() => window.location.href='/admin/reportes'} style="cursor: pointer;">
              <FaSolidChartBar size={18} color={props.currentPage === 'reportes' ? '#F39D1E' : 'white'} />
              <span>Reportes</span>
            </div>
            <div class="nav-item">
              <FaSolidGear size={18} color="white" />
              <span>Configuración</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">Gestionar</div>
            <div class={`nav-item ${isActivePage('eventos')}`} onclick={() => window.location.href='/eventos'} style="cursor: pointer;">
              <FaRegularCalendar size={18} color={props.currentPage === 'eventos' ? '#F39D1E' : 'white'} />
              <span>Eventos</span>
            </div>
            <div class={`nav-item ${isActivePage('visitantes')}`} onclick={() => window.location.href='/admin/visitantes'} style="cursor: pointer;">
              <FaSolidUsers size={18} color={props.currentPage === 'visitantes' ? '#F39D1E' : 'white'} />
              <span>Visitantes</span>
            </div>
            <div class={`nav-item ${isActivePage('registros')}`} onclick={() => window.location.href='/registros'} style="cursor: pointer;">
              <FaSolidTicket size={18} color={props.currentPage === 'registros' ? '#F39D1E' : 'white'} />
              <span>Registros</span>
            </div>
            <div class={`nav-item ${isActivePage('checkin')}`} onclick={() => window.location.href='/admin/checkin'} style="cursor: pointer;">
              <FaSolidUserCheck size={18} color={props.currentPage === 'checkin' ? '#F39D1E' : 'white'} />
              <span>Check-in</span>
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

      {/* Contenido Principal */}
      <main class="admin-main">
        {props.children}
      </main>
    </div>
  );
};

export default AdminLayout; 