import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { FaRegularCalendar, FaSolidGear, FaSolidRightToBracket, FaSolidUserPlus } from 'solid-icons/fa';

const Home: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="home">
      <div class="hero">
        <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="hero-logo" />
        <h1>Bienvenido al Centro Cultural Banreservas</h1>
        <p>Descubre nuestros eventos culturales y regístrate para participar</p>
        
        {/* Botón flotante de administración */}
        <div class="admin-floating-btn" onclick={() => navigate('/admin')}>
          <FaSolidGear size={20} color="white" />
          <div class="admin-tooltip">Panel de Administración</div>
        </div>
      </div>
      
      <div class="main-actions">
        <div class="action-card hover-lift" onclick={() => navigate('/eventos-publicos')}>
          <div class="action-icon">
            <FaRegularCalendar size={24} color="white" />
          </div>
          <h3 class="action-card-title">Ver Eventos</h3>
          <p class="action-card-text">Explora nuestra programación cultural y reserva tu lugar</p>
          <div class="badge badge-success mt-2">
            Disponible
          </div>
        </div>
        
        <div class="action-card hover-lift" onclick={() => navigate('/eventos-publicos')}>
          <div class="action-icon">
            <FaSolidUserPlus size={24} color="white" />
          </div>
          <h3 class="action-card-title">Registrarse</h3>
          <p class="action-card-text">Únete a nuestra comunidad cultural y recibe notificaciones</p>
          <div class="badge badge-primary mt-2">
            Gratis
          </div>
        </div>
        
        <div class="action-card hover-lift" onclick={() => navigate('/admin/checkin')}>
          <div class="action-icon">
            <FaSolidRightToBracket size={24} color="white" />
          </div>
          <h3 class="action-card-title">Check-in</h3>
          <p class="action-card-text">Confirma tu asistencia a eventos y talleres</p>
          <div class="badge badge-warning mt-2">
            Activo
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;