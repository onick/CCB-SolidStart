import { useNavigate } from "@solidjs/router";
import WelcomeCard from "../components/WelcomeCard";
import "../styles/welcome.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div class="welcome-view">
      <div class="welcome-content">
        <div class="logo-container">
          <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="logo-real" />
        </div>
        
        <h1>¡Bienvenido al Centro Cultural Banreservas!</h1>
        <p>Por favor seleccione una opción:</p>
        
        <div class="options">
          <WelcomeCard
            icon="fas fa-calendar-alt"
            title="Ver Eventos"
            description="Explore nuestros eventos actuales y próximos"
            onClick={() => navigate("/eventos-publicos")}
          />
          <WelcomeCard
            icon="fas fa-user-plus"
            title="Registrarse"
            description="Regístrese para un evento específico"
            onClick={() => navigate("/register")}
          />
          <WelcomeCard
            icon="fas fa-check-circle"
            title="Check-in"
            description="Confirme su asistencia a un evento"
            onClick={() => navigate("/checkin")}
          />
        </div>
        
        <div class="admin-access">
          <button class="btn-admin" onClick={() => navigate("/admin")}>
            <i class="fas fa-cog"></i>
            Acceso Administrativo
          </button>
        </div>
      </div>
    </div>
  );
}