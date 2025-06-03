import { Route, Router, useLocation } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import './App.css';
import Admin from './routes/admin';
import Eventos from './routes/eventos';
import SetupSupabase from './routes/setup-supabase';

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={Home} />
        <Route path="/eventos" component={Eventos} />
        <Route path="/admin" component={Admin} />
        <Route path="/setup-supabase" component={SetupSupabase} />
        <Route path="/registro" component={Registro} />
        <Route path="/visitantes" component={Visitantes} />
      </Route>
    </Router>
  );
};

// Componente Layout sin navegación superior
const Layout: Component = (props: any) => {
  const location = useLocation();
  
  return (
    <div class="app">
      {/* Botón de Administración Circular - Solo mostrar si NO estamos en /admin */}
      {location.pathname !== '/admin' && (
        <div class="admin-floating-btn" onclick={() => window.location.href = '/admin'}>
          <i class="fas fa-cog"></i>
          <div class="admin-tooltip">Panel de Administración</div>
        </div>
      )}
      
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

// Componente Home
const Home: Component = () => {
  return (
    <div class="home">
      <div class="hero">
        <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="hero-logo" />
        <h1>Bienvenido al Centro Cultural Banreservas</h1>
        <p>Descubre nuestros eventos culturales y regístrate para participar</p>
      </div>
      
      <div class="main-actions">
        <div class="action-card" onclick={() => window.location.href = '/eventos'}>
          <div class="action-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <h3>Ver Eventos</h3>
          <p>Explora nuestra programación cultural y reserva tu lugar</p>
        </div>
        
        <div class="action-card" onclick={() => window.location.href = '/registro'}>
          <div class="action-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h3>Registrarse</h3>
          <p>Únete a nuestra comunidad cultural y recibe notificaciones</p>
        </div>
        
        <div class="action-card" onclick={() => window.location.href = '/visitantes'}>
          <div class="action-icon">
            <i class="fas fa-check-in"></i>
          </div>
          <h3>Check-in</h3>
          <p>Confirma tu asistencia a eventos y talleres</p>
        </div>
      </div>
    </div>
  );
};

// Componente Registro
const Registro: Component = () => {
  const [formData, setFormData] = createSignal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData());
    // Aquí puedes agregar la lógica para enviar los datos
    alert('Registro enviado correctamente!');
  };

  return (
    <div class="registro">
      <div class="registro-container">
        <h2>Registro de Visitante</h2>
        <form onSubmit={handleSubmit} class="registro-form">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              value={formData().nombre}
              onInput={(e) => setFormData({...formData(), nombre: e.target.value})}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              value={formData().apellido}
              onInput={(e) => setFormData({...formData(), apellido: e.target.value})}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData().email}
              onInput={(e) => setFormData({...formData(), email: e.target.value})}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              value={formData().telefono}
              onInput={(e) => setFormData({...formData(), telefono: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" class="btn btn-primary">Registrar Visitante</button>
        </form>
      </div>
    </div>
  );
};

// Componente Visitantes
const Visitantes: Component = () => {
  const [visitantes] = createSignal([
    { id: 1, nombre: 'María González', email: 'maria@email.com', telefono: '809-123-4567', documento: '001-1234567-8' },
    { id: 2, nombre: 'Carlos Rodríguez', email: 'carlos@email.com', telefono: '809-987-6543', documento: '001-9876543-2' },
    { id: 3, nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '809-555-0123', documento: '001-5555012-3' },
  ]);

  return (
    <div class="visitantes">
      <div class="visitantes-header">
        <h2>Lista de Visitantes Registrados</h2>
        <a href="/registro" class="btn btn-primary">Nuevo Visitante</a>
      </div>
      
      <div class="visitantes-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visitantes().map(visitante => (
              <tr>
                <td>{visitante.id}</td>
                <td>{visitante.nombre}</td>
                <td>{visitante.email}</td>
                <td>{visitante.telefono}</td>
                <td>{visitante.documento}</td>
                <td>
                  <button class="btn btn-small btn-secondary">Editar</button>
                  <button class="btn btn-small btn-danger">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;