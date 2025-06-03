import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService } from '../lib/supabase/services';
import '../styles/global.css';

const EventosPublicos: Component = () => {
  const [eventos, setEventos] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterCategory, setFilterCategory] = createSignal('todas');

  onMount(async () => {
    console.log('📅 Cargando eventos públicos...');
    try {
      const eventosData = await eventosService.obtenerTodos();
      // Solo mostrar eventos activos al público
      const eventosActivos = eventosData.filter(evento => evento.estado === 'activo');
      setEventos(eventosActivos);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  });

  const filteredEventos = () => {
    return eventos().filter(evento => {
      const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm().toLowerCase()) ||
                           evento.descripcion.toLowerCase().includes(searchTerm().toLowerCase());
      const matchesCategory = filterCategory() === 'todas' || evento.categoria === filterCategory();
      
      return matchesSearch && matchesCategory;
    });
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableSpots = (evento: any) => {
    return evento.capacidad - evento.registrados;
  };

  return (
    <div style="min-height: 100vh; background: linear-gradient(135deg, #e67e22 0%, #f39c12 50%, #d68910 100%);">
      {/* Header */}
      <header style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 1rem 0; box-shadow: 0 2px 20px rgba(0,0,0,0.1);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="/images/logo.png" alt="CCB" style="height: 50px;" />
            <div>
              <h1 style="margin: 0; color: #1a202c; font-size: 1.5rem;">Centro Cultural Banreservas</h1>
              <p style="margin: 0; color: #4a5568; font-size: 0.9rem;">Eventos y Actividades Culturales</p>
            </div>
          </div>
          <a href="/" style="background: #e67e22; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
            <i class="fas fa-home"></i> Inicio
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="color: white; font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            Nuestros Eventos
          </h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            Descubre las actividades culturales que tenemos para ti
          </p>
        </div>

        {/* Filtros */}
        <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: end;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2d3748;">Buscar eventos:</label>
              <input
                type="text"
                placeholder="¿Qué evento te interesa?"
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.target.value)}
                style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;"
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2d3748;">Categoría:</label>
              <select
                value={filterCategory()}
                onChange={(e) => setFilterCategory(e.target.value)}
                style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;"
              >
                <option value="todas">Todas</option>
                <option value="concierto">Conciertos</option>
                <option value="teatro">Teatro</option>
                <option value="exposicion">Exposiciones</option>
                <option value="taller">Talleres</option>
                <option value="conferencia">Conferencias</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        <Show when={isLoading()}>
          <div style="text-align: center; padding: 3rem; color: white;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p style="font-size: 1.1rem;">Cargando eventos...</p>
          </div>
        </Show>

        {/* No events */}
        <Show when={!isLoading() && filteredEventos().length === 0}>
          <div style="text-align: center; padding: 3rem; color: white;">
            <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.7;"></i>
            <h3 style="margin-bottom: 0.5rem;">No hay eventos disponibles</h3>
            <p style="opacity: 0.8;">No se encontraron eventos que coincidan con tu búsqueda.</p>
          </div>
        </Show>

        {/* Events Grid */}
        <Show when={!isLoading() && filteredEventos().length > 0}>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
            <For each={filteredEventos()}>
              {(evento) => (
                <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15); transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer;" 
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-8px)';
                       e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                     }}>
                  
                  {/* Event Image */}
                  <div style="height: 200px; background: linear-gradient(45deg, #e67e22, #f39c12); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.9); padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; color: #2d3748;">
                      {evento.categoria}
                    </div>
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 2rem 1.5rem 1rem; color: white;">
                      <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700;">{evento.titulo}</h3>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div style="padding: 1.5rem;">
                    <p style="color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6;">
                      {evento.descripcion}
                    </p>

                    {/* Event Details */}
                    <div style="space-y: 0.75rem; margin-bottom: 1.5rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                        <i class="fas fa-calendar" style="color: #e67e22; width: 16px;"></i>
                        <span style="color: #2d3748; font-weight: 500;">{formatDate(evento.fecha)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                        <i class="fas fa-clock" style="color: #e67e22; width: 16px;"></i>
                        <span style="color: #2d3748; font-weight: 500;">{formatTime(evento.hora)} - {evento.duracion}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                        <i class="fas fa-map-marker-alt" style="color: #e67e22; width: 16px;"></i>
                        <span style="color: #2d3748; font-weight: 500;">{evento.ubicacion}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-users" style="color: #e67e22; width: 16px;"></i>
                        <span style="color: #2d3748; font-weight: 500;">
                          {getAvailableSpots(evento)} cupos disponibles de {evento.capacidad}
                        </span>
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div style="margin-bottom: 1.5rem;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.9rem; color: #4a5568;">Ocupación</span>
                        <span style="font-size: 0.9rem; font-weight: 600; color: #2d3748;">
                          {Math.round((evento.registrados / evento.capacidad) * 100)}%
                        </span>
                      </div>
                      <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                        <div 
                          style={`width: ${(evento.registrados / evento.capacidad) * 100}%; height: 100%; background: ${(evento.registrados / evento.capacidad) > 0.8 ? '#f56565' : (evento.registrados / evento.capacidad) > 0.6 ? '#ed8936' : '#48bb78'}; transition: width 0.3s ease;`}
                        ></div>
                      </div>
                    </div>

                    {/* Register Button */}
                    <button 
                      style={`width: 100%; padding: 0.75rem; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; ${getAvailableSpots(evento) > 0 ? 'background: #e67e22; color: white;' : 'background: #e2e8f0; color: #a0aec0; cursor: not-allowed;'}`}
                      disabled={getAvailableSpots(evento) === 0}
                    >
                      {getAvailableSpots(evento) > 0 ? (
                        <>
                          <i class="fas fa-ticket-alt"></i> Registrarse al Evento
                        </>
                      ) : (
                        <>
                          <i class="fas fa-times-circle"></i> Evento Lleno
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </main>

      {/* Footer */}
      <footer style="background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); margin-top: 4rem; padding: 2rem 0; text-align: center; color: rgba(255,255,255,0.8);">
        <p style="margin: 0;">© 2024 Centro Cultural Banreservas - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default EventosPublicos; 