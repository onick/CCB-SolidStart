import { useNavigate } from "@solidjs/router";
import WelcomeCard from "../components/WelcomeCard";
import "../styles/welcome.css";
// 🎨 Importando solid-icons para mejor rendimiento y integración nativa
import {
    FaRegularCalendar,
    FaSolidCircleCheck,
    FaSolidGear,
    FaSolidUserPlus
} from 'solid-icons/fa';

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
            icon={<FaRegularCalendar size={32} color="white" />}
            title="Ver Eventos"
            description="Explore nuestros eventos actuales y próximos"
            onClick={() => navigate("/eventos-publicos")}
          />
          <WelcomeCard
            icon={<FaSolidUserPlus size={32} color="white" />}
            title="Registrarse"
            description="Regístrese para un evento específico"
            onClick={() => navigate("/register")}
          />
          <WelcomeCard
            icon={<FaSolidCircleCheck size={32} color="white" />}
            title="Check-in"
            description="Confirme su asistencia a un evento"
            onClick={() => navigate("/checkin")}
          />
        </div>
        
        <div class="admin-access">
          <button class="btn-admin" onClick={() => navigate("/admin")}>
            <FaSolidGear size={16} color="white" />
            Acceso Administrativo
          </button>
        </div>
      </div>
    </div>
  );
}