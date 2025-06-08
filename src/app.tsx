import { Route, Router, useLocation } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import './App.css';
// 🎨 Importando solid-icons para mejor rendimiento y integración nativa
import { FaRegularCalendar, FaSolidGear, FaSolidRightToBracket, FaSolidUserPlus, FaSolidHouse } from 'solid-icons/fa';
import Modal from './components/Modal';
import Admin from './routes/admin';
import Eventos from './routes/eventos';
import EventosPublicos from './routes/eventos-publicos';
import Registros from './routes/registros';
import SetupSupabase from './routes/setup-supabase';
import VisitantesAdmin from './routes/admin/visitantes';
import CheckInAdmin from './routes/admin/checkin';
import ReportesAdmin from './routes/admin/reportes';

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={Home} />
        <Route path="/eventos" component={Eventos} />
        <Route path="/eventos-publicos" component={EventosPublicos} />
        <Route path="/registros" component={Registros} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/visitantes" component={VisitantesAdmin} />
        <Route path="/admin/checkin" component={CheckInAdmin} />
        <Route path="/admin/reportes" component={ReportesAdmin} />
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
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

// Componente Home
const Home: Component = () => {
  const [isRegistroModalOpen, setIsRegistroModalOpen] = createSignal(false);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [showBusqueda, setShowBusqueda] = createSignal(false);
  const [emailBusqueda, setEmailBusqueda] = createSignal('');
  const [visitanteEncontrado, setVisitanteEncontrado] = createSignal(false);
  const [formData, setFormData] = createSignal({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    comunicacion: 'correo',
    aceptaDatos: false
  });

  // Función para guardar visitante en localStorage
  const guardarVisitante = (datos: any) => {
    const visitantes = JSON.parse(localStorage.getItem('visitantes_ccb') || '[]');
    const visitanteExiste = visitantes.findIndex((v: any) => v.email === datos.email);
    
    if (visitanteExiste >= 0) {
      visitantes[visitanteExiste] = { ...datos, ultimaVisita: new Date().toISOString() };
    } else {
      visitantes.push({ ...datos, fechaRegistro: new Date().toISOString(), ultimaVisita: new Date().toISOString() });
    }
    
    localStorage.setItem('visitantes_ccb', JSON.stringify(visitantes));
  };

  // Función para buscar visitante por email o teléfono
  const buscarVisitante = () => {
    const busqueda = emailBusqueda().toLowerCase().trim();
    if (!busqueda) {
      alert('Por favor ingresa un email o teléfono para buscar');
      return;
    }

    const visitantes = JSON.parse(localStorage.getItem('visitantes_ccb') || '[]');
    
    // Buscar por email o teléfono
    const visitante = visitantes.find((v: any) => 
      v.email.toLowerCase() === busqueda || 
      v.telefono === busqueda ||
      v.telefono?.replace(/\D/g, '') === busqueda.replace(/\D/g, '') // Comparar solo números
    );
    
    if (visitante) {
      // Autocompletar formulario
      setFormData({
        nombre: visitante.nombre || '',
        apellido: visitante.apellido || '',
        email: visitante.email || '',
        telefono: visitante.telefono || '',
        comunicacion: visitante.comunicacion || 'correo',
        aceptaDatos: false // Siempre debe aceptar de nuevo
      });
      setVisitanteEncontrado(true);
      setShowBusqueda(false);
      
      const tipoEncontrado = visitante.email.toLowerCase() === busqueda ? 'email' : 'teléfono';
      alert(`¡Visitante encontrado por ${tipoEncontrado}! 🎉\nNombre: ${visitante.nombre} ${visitante.apellido}\nÚltima visita: ${new Date(visitante.ultimaVisita).toLocaleDateString('es-ES')}\n\nRevisa tus datos y actualízalos si es necesario.`);
    } else {
      alert('No se encontró ningún visitante con ese email o teléfono.\n¿Es tu primera visita? Puedes registrarte como nuevo visitante.');
      setEmailBusqueda('');
    }
  };

  const handleRegistroSubmit = (e: Event) => {
    e.preventDefault();
    
    // Validación del checkbox de aceptación de datos
    if (!formData().aceptaDatos) {
      alert('Debes aceptar el uso de tus datos personales para continuar.');
      return;
    }
    
    console.log('Datos del formulario:', formData());
    
    // Guardar visitante en localStorage
    guardarVisitante(formData());
    
    if (visitanteEncontrado()) {
      alert('¡Datos actualizados correctamente! 🎉\n¡Bienvenido de nuevo al Centro Cultural Banreservas!');
    } else {
      alert('¡Registro enviado correctamente! 🎉\n¡Bienvenido al Centro Cultural Banreservas!');
    }
    
    setIsRegistroModalOpen(false);
    setIsDropdownOpen(false);
    // Reset form
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      comunicacion: 'correo',
      aceptaDatos: false
    });
    setShowBusqueda(false);
    setEmailBusqueda('');
    setVisitanteEncontrado(false);
  };

  return (
    <div class="home">
      <div class="hero">
        <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="hero-logo" />
        <h1>Bienvenido al Centro Cultural Banreservas</h1>
        <p>Descubre nuestros eventos culturales y regístrate para participar</p>
        <div class="admin-floating-btn" onclick={() => window.location.href = '/admin'}>
          <FaSolidGear size={20} color="white" />
          <div class="admin-tooltip">Panel de Administración</div>
        </div>
      </div>
      
      <div class="main-actions">
        <div class="action-card hover-lift" onclick={() => window.location.href = '/eventos-publicos'}>
          <div class="action-icon">
            <FaRegularCalendar size={24} color="white" />
          </div>
          <h3 class="action-card-title">Ver Eventos</h3>
          <p class="action-card-text">Explora nuestra programación cultural y reserva tu lugar</p>
          <div class="badge badge-success mt-2">
            Disponible
          </div>
        </div>
        
        <div class="action-card hover-lift" onclick={() => setIsRegistroModalOpen(true)}>
          <div class="action-icon">
            <FaSolidUserPlus size={24} color="white" />
          </div>
          <h3 class="action-card-title">Registrarse</h3>
          <p class="action-card-text">Únete a nuestra comunidad cultural y recibe notificaciones</p>
          <div class="badge badge-primary mt-2">
            Gratis
          </div>
        </div>
        
        <div class="action-card hover-lift" onclick={() => window.location.href = '/visitantes'}>
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

      {/* Modal de Registro */}
      <Modal
        isOpen={isRegistroModalOpen()}
        onClose={() => {
          setIsRegistroModalOpen(false);
          setIsDropdownOpen(false);
          setShowBusqueda(false);
          setEmailBusqueda('');
          setVisitanteEncontrado(false);
        }}
        title="Registro de Visitante"
        size="lg"
      >
        <div class="fade-in">
          <div class="mb-md">
            <p class="text-secondary">Únete a nuestra comunidad cultural</p>
            
            {/* Botón para visitantes recurrentes */}
            <div class="busqueda-visitante">
              {!showBusqueda() && !visitanteEncontrado() && (
                <button 
                  type="button"
                  class="btn-busqueda"
                  onclick={() => setShowBusqueda(true)}
                >
                  <span class="busqueda-icon">🔍</span>
                  ¿Ya tienes cuenta? Buscar mis datos
                </button>
              )}
              
              {showBusqueda() && (
                <div class="busqueda-form">
                                     <div class="busqueda-header">
                     <h4>Buscar visitante existente</h4>
                     <button 
                       type="button"
                       class="btn-cerrar-busqueda"
                       onclick={() => {
                         setShowBusqueda(false);
                         setEmailBusqueda('');
                       }}
                     >
                       ✕
                     </button>
                   </div>
                   <div class="busqueda-input-group">
                     <input
                       type="text"
                       class="busqueda-input"
                       placeholder="Ingresa tu email o teléfono..."
                       value={emailBusqueda()}
                       onInput={(e) => setEmailBusqueda(e.target.value)}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter') {
                           buscarVisitante();
                         }
                       }}
                     />
                     <button 
                       type="button"
                       class="btn-buscar"
                       onclick={buscarVisitante}
                     >
                       Buscar
                     </button>
                   </div>
                   <div class="busqueda-ayuda">
                     <small>💡 Puedes buscar usando tu email o número de teléfono</small>
                   </div>
                </div>
              )}
              
              {visitanteEncontrado() && (
                <div class="visitante-encontrado">
                  <span class="encontrado-icon">✅</span>
                  <span class="encontrado-text">Datos cargados - Revisa y actualiza si es necesario</span>
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleRegistroSubmit} class="grid gap-sm">
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group">
                <label class="form-label" for="modal-nombre">Nombre *</label>
                <input
                  type="text"
                  id="modal-nombre"
                  class="form-control"
                  placeholder="Ingresa tu nombre"
                  value={formData().nombre}
                  onInput={(e) => setFormData({...formData(), nombre: e.target.value})}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="modal-apellido">Apellido (recomendado)</label>
                <input
                  type="text"
                  id="modal-apellido"
                  class="form-control"
                  placeholder="Ingresa tu apellido"
                  value={formData().apellido}
                  onInput={(e) => setFormData({...formData(), apellido: e.target.value})}
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group">
                <label class="form-label" for="modal-email">Correo Electrónico *</label>
                <input
                  type="email"
                  id="modal-email"
                  class="form-control"  
                  placeholder="ejemplo@correo.com"
                  value={formData().email}
                  onInput={(e) => setFormData({...formData(), email: e.target.value})}
                  required
                />
                <div class="form-help">Usaremos tu email para enviarte información sobre eventos</div>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="modal-telefono">Teléfono (recomendado)</label>
                <input
                  type="tel"
                  id="modal-telefono"
                  class="form-control"
                  placeholder="(809) 123-4567"
                  value={formData().telefono}
                  onInput={(e) => setFormData({...formData(), telefono: e.target.value})}
                />
                <div class="form-help">Para notificaciones importantes sobre eventos</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Autorizo que se comuniquen conmigo a través de:</label>
              <div class="custom-dropdown">
                <div 
                  class={`dropdown-trigger ${isDropdownOpen() ? 'active' : ''}`}
                  onclick={() => setIsDropdownOpen(!isDropdownOpen())}
                >
                  <span class="dropdown-text">
                    {formData().comunicacion === 'correo' && 'CORREO ELECTRÓNICO'}
                    {formData().comunicacion === 'whatsapp' && 'WHATSAPP'}
                    {formData().comunicacion === 'ambas' && 'AMBAS'}
                  </span>
                  <div class={`dropdown-arrow ${isDropdownOpen() ? 'open' : ''}`}>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div class={`dropdown-menu ${isDropdownOpen() ? 'show' : ''}`}>
                  <div 
                    class={`dropdown-option ${formData().comunicacion === 'correo' ? 'selected' : ''}`}
                    onclick={() => {
                      setFormData({...formData(), comunicacion: 'correo'});
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div class="option-icon">✉️</div>
                    <span>CORREO ELECTRÓNICO</span>
                    {formData().comunicacion === 'correo' && <div class="check-mark">✓</div>}
                  </div>
                  
                  <div 
                    class={`dropdown-option ${formData().comunicacion === 'whatsapp' ? 'selected' : ''}`}
                    onclick={() => {
                      setFormData({...formData(), comunicacion: 'whatsapp'});
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div class="option-icon">📱</div>
                    <span>WHATSAPP</span>
                    {formData().comunicacion === 'whatsapp' && <div class="check-mark">✓</div>}
                  </div>
                  
                  <div 
                    class={`dropdown-option ${formData().comunicacion === 'ambas' ? 'selected' : ''}`}
                    onclick={() => {
                      setFormData({...formData(), comunicacion: 'ambas'});
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div class="option-icon">🔄</div>
                    <span>AMBAS</span>
                    {formData().comunicacion === 'ambas' && <div class="check-mark">✓</div>}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label checkbox-label">
                <input
                  type="checkbox"
                  id="modal-acepta-datos"
                  checked={formData().aceptaDatos}
                  onInput={(e) => setFormData({...formData(), aceptaDatos: e.target.checked})}
                  required
                />
                <span class="checkbox-text">Acepto el uso de mis datos personales para los fines que ya se me han comunicado</span>
              </label>
            </div>
            
            <div class="flex gap-md justify-end items-center mt-md">
              <button 
                type="button" 
                class="btn btn-secondary"
                onclick={() => {
                  setIsRegistroModalOpen(false);
                  setIsDropdownOpen(false);
                  setShowBusqueda(false);
                  setEmailBusqueda('');
                  setVisitanteEncontrado(false);
                }}
              >
                Cancelar
              </button>
              
              <button type="submit" class="btn btn-primary">
                <FaSolidUserPlus size={16} />
                Registrar Visitante
              </button>
            </div>
          </form>
        </div>
      </Modal>
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
    <div class="page-wrapper">
      {/* Hero section para registro */}
      <div class="hero">
        <div class="hero-content">
          <img src="/images/logo.png" alt="Centro Cultural Banreservas" class="hero-logo" />
          <h1 class="hero-title">Registro de Visitante</h1>
          <p class="hero-subtitle">Únete a nuestra comunidad cultural</p>
        </div>
      </div>
      
      <div class="container">
        <div class="form-container fade-in">
          <div class="mb-lg">
            <h2 class="text-primary text-center">Información Personal</h2>
          </div>
          
          <form onSubmit={handleSubmit} class="grid gap-md">
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group">
                <label class="form-label" for="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  class="form-control"
                  placeholder="Ingresa tu nombre"
                  value={formData().nombre}
                  onInput={(e) => setFormData({...formData(), nombre: e.target.value})}
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="apellido">Apellido (recomendado)</label>
                <input
                  type="text"
                  id="apellido"
                  class="form-control"
                  placeholder="Ingresa tu apellido"
                  value={formData().apellido}
                  onInput={(e) => setFormData({...formData(), apellido: e.target.value})}
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="email">Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                class="form-control"
                placeholder="ejemplo@correo.com"
                value={formData().email}
                onInput={(e) => setFormData({...formData(), email: e.target.value})}
                required
              />
              <div class="form-help">Usaremos tu email para enviarte información sobre eventos</div>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="telefono">Teléfono (recomendado)</label>
              <input
                type="tel"
                id="telefono"
                class="form-control"
                placeholder="(809) 123-4567"
                value={formData().telefono}
                onInput={(e) => setFormData({...formData(), telefono: e.target.value})}
              />
              <div class="form-help">Para notificaciones importantes sobre eventos</div>
            </div>
            
            <div class="flex gap-md justify-between items-center">
              <button 
                type="button" 
                class="btn btn-secondary"
                onclick={() => window.location.href = '/'}
              >
                <FaSolidHouse size={16} />
                Volver al Inicio
              </button>
              
              <button type="submit" class="btn btn-primary btn-lg">
                <FaSolidUserPlus size={16} />
                Registrar Visitante
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente Visitantes
const Visitantes: Component = () => {
  const [visitantes, setVisitantes] = createSignal([
    { id: 1, nombre: 'María González', email: 'maria@email.com', telefono: '809-123-4567', documento: '001-1234567-8' },
    { id: 2, nombre: 'Carlos Rodríguez', email: 'carlos@email.com', telefono: '809-987-6543', documento: '001-9876543-2' },
    { id: 3, nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '809-555-0123', documento: '001-5555012-3' },
  ]);

  const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);
  const [visitanteToDelete, setVisitanteToDelete] = createSignal<any>(null);

  const handleDeleteClick = (visitante: any) => {
    setVisitanteToDelete(visitante);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const visitante = visitanteToDelete();
    if (visitante) {
      setVisitantes(prev => prev.filter(v => v.id !== visitante.id));
      alert(`Visitante ${visitante.nombre} eliminado correctamente`);
    }
    setDeleteModalOpen(false);
    setVisitanteToDelete(null);
  };

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
                  <button 
                    class="btn btn-small btn-danger"
                    onclick={() => handleDeleteClick(visitante)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen()}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div class="text-center">
          <div class="mb-md">
            <p class="text-secondary">¿Estás seguro de que deseas eliminar a:</p>
            <p class="text-primary font-weight-bold mt-sm">
              {visitanteToDelete()?.nombre}
            </p>
            <p class="text-muted text-sm">Esta acción no se puede deshacer</p>
          </div>
          
          <div class="flex gap-md justify-center">
            <button 
              class="btn btn-secondary"
              onclick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              class="btn btn-danger"
              onclick={handleConfirmDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;