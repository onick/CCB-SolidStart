import { Component, createSignal } from 'solid-js';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

const LoginForm: Component<LoginFormProps> = (props) => {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await props.onLogin(username(), password());
  };

  const quickLogin = () => {
    console.log('🚀 Quick login iniciado');
    setUsername('admin');
    setPassword('admin123');
    
    // Auto-submit después de un pequeño delay
    setTimeout(() => {
      const form = document.querySelector('.login-form') as HTMLFormElement;
      if (form) {
        console.log('🚀 Ejecutando auto-submit');
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div class="admin-login">
      <div class="login-container">
        <div class="login-header">
          <img src="/images/logo.png" alt="CCB" class="login-logo" />
          <h2>Panel de Administración</h2>
          <p>Centro Cultural Banreservas</p>
        </div>
        
        <form onSubmit={handleSubmit} class="login-form">
          <div class="form-group">
            <label for="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={props.isLoading}
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
              disabled={props.isLoading}
              required
            />
          </div>
          
          {props.error && <div class="error-message">{props.error}</div>}
          
          <button 
            type="submit" 
            class="btn-login"
            disabled={props.isLoading}
          >
            {props.isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
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
                disabled={props.isLoading}
              >
                🚀 Login Rápido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;