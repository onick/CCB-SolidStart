import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService } from '../lib/supabase/services';
import '../styles/global.css';

const EventosPublicos: Component = () => {
  const [eventos, setEventos] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterCategory, setFilterCategory] = createSignal('todas');
  const [currentSlide, setCurrentSlide] = createSignal(0);
  const [isAutoPlaying, setIsAutoPlaying] = createSignal(true);

  onMount(async () => {
    console.log('📅 Cargando eventos públicos...');
    try {
      const eventosData = await eventosService.obtenerTodos();
      // Solo mostrar eventos activos al público
      const eventosActivos = eventosData.filter(evento => evento.estado === 'activo');
      setEventos(eventosActivos);
      
      // Auto-play del carrusel
      startAutoPlay();
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  });

  const startAutoPlay = () => {
    setInterval(() => {
      if (isAutoPlaying() && filteredEventos().length > 0) {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(filteredEventos().length / getEventsPerSlide()));
      }
    }, 5000); // Cambiar cada 5 segundos
  };

  const getEventsPerSlide = () => {
    // Responsive: mostrar diferentes cantidades según el tamaño de pantalla
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const filteredEventos = () => {
    return eventos().filter(evento => {
      const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm().toLowerCase()) ||
                           evento.descripcion.toLowerCase().includes(searchTerm().toLowerCase());
      const matchesCategory = filterCategory() === 'todas' || evento.categoria === filterCategory();
      
      return matchesSearch && matchesCategory;
    });
  };

  const getTotalSlides = () => {
    return Math.ceil(filteredEventos().length / getEventsPerSlide());
  };

  const getCurrentSlideEvents = () => {
    const eventsPerSlide = getEventsPerSlide();
    const startIndex = currentSlide() * eventsPerSlide;
    return filteredEventos().slice(startIndex, startIndex + eventsPerSlide);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % getTotalSlides());
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + getTotalSlides()) % getTotalSlides());
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
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

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'concierto': return '🎵';
      case 'teatro': return '🎭';
      case 'exposicion': return '🖼️';
      case 'taller': return '🛠️';
      case 'conferencia': return '🎤';
      case 'danza': return '💃';
      default: return '🎪';
    }
  };

  return (
    <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #f6ad55 50%, #f093fb 100%); overflow-x: hidden;">
      {/* Header */}
      <header style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 1rem 0; box-shadow: 0 2px 20px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="/images/logo.png" alt="CCB" style="height: 50px;" />
            <div>
              <h1 style="margin: 0; color: #1a202c; font-size: 1.5rem;">Centro Cultural Banreservas</h1>
              <p style="margin: 0; color: #4a5568; font-size: 0.9rem;">Eventos y Actividades Culturales</p>
            </div>
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button 
              onclick={() => setIsAutoPlaying(!isAutoPlaying())}
              style={`background: ${isAutoPlaying() ? '#e67e22' : '#6b7280'}; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s;`}
            >
              <i class={`fas ${isAutoPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
              {isAutoPlaying() ? ' Pausar' : ' Reproducir'}
            </button>
            <a href="/" style="background: #667eea; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
              <i class="fas fa-home"></i> Inicio
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="color: white; font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: 800;">
            🎭 Nuestros Eventos
          </h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 1.2rem; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
            Descubre las actividades culturales que tenemos para ti
          </p>
        </div>

        {/* Filtros */}
        <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 2rem; margin-bottom: 3rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: end;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #2d3748; font-size: 1.1rem;">🔍 Buscar eventos:</label>
              <input
                type="text"
                placeholder="¿Qué evento te interesa?"
                value={searchTerm()}
                onInput={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentSlide(0); // Resetear al primer slide cuando se filtra
                }}
                style="width: 100%; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #2d3748; font-size: 1.1rem;">🎪 Categoría:</label>
              <select
                value={filterCategory()}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentSlide(0); // Resetear al primer slide cuando se filtra
                }}
                style="width: 100%; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
              >
                <option value="todas">🎪 Todas</option>
                <option value="concierto">🎵 Conciertos</option>
                <option value="teatro">🎭 Teatro</option>
                <option value="exposicion">🖼️ Exposiciones</option>
                <option value="taller">🛠️ Talleres</option>
                <option value="conferencia">🎤 Conferencias</option>
                <option value="danza">💃 Danza</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        <Show when={isLoading()}>
          <div style="text-align: center; padding: 4rem; color: white;">
            <div style="display: inline-block; width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p style="font-size: 1.2rem; font-weight: 600;">Cargando eventos mágicos...</p>
          </div>
        </Show>

        {/* No events */}
        <Show when={!isLoading() && filteredEventos().length === 0}>
          <div style="text-align: center; padding: 4rem; color: white;">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.7;">🎭</div>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">No hay eventos disponibles</h3>
            <p style="opacity: 0.8; font-size: 1.1rem;">No se encontraron eventos que coincidan con tu búsqueda.</p>
          </div>
        </Show>

        {/* Carrusel de Eventos */}
        <Show when={!isLoading() && filteredEventos().length > 0}>
          <div style="position: relative;">
            {/* Contador de eventos */}
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); display: inline-block; padding: 0.75rem 1.5rem; border-radius: 25px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                <span style="color: #2d3748; font-weight: 700; font-size: 1.1rem;">
                  📊 {filteredEventos().length} eventos disponibles
                </span>
              </div>
            </div>

            {/* Controles del carrusel */}
            <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 2rem;">
              <button 
                onclick={prevSlide}
                disabled={getTotalSlides() <= 1}
                style={`background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border: none; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #2d3748; box-shadow: 0 4px 16px rgba(0,0,0,0.1); transition: all 0.2s; ${getTotalSlides() <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}`}
                onMouseEnter={(e) => getTotalSlides() > 1 && (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => getTotalSlides() > 1 && (e.target.style.transform = 'scale(1)')}
              >
                <i class="fas fa-chevron-left"></i>
              </button>

              {/* Indicadores de slides */}
              <div style="display: flex; gap: 0.5rem;">
                <For each={Array.from({ length: getTotalSlides() }, (_, i) => i)}>
                  {(index) => (
                    <button
                      onclick={() => goToSlide(index)}
                      style={`width: 12px; height: 12px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.2s; ${currentSlide() === index ? 'background: white; transform: scale(1.2);' : 'background: rgba(255,255,255,0.5);'}`}
                    />
                  )}
                </For>
              </div>

              <button 
                onclick={nextSlide}
                disabled={getTotalSlides() <= 1}
                style={`background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border: none; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #2d3748; box-shadow: 0 4px 16px rgba(0,0,0,0.1); transition: all 0.2s; ${getTotalSlides() <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}`}
                onMouseEnter={(e) => getTotalSlides() > 1 && (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => getTotalSlides() > 1 && (e.target.style.transform = 'scale(1)')}
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Contenedor del carrusel */}
            <div style="overflow: hidden; border-radius: 20px; position: relative;">
              <div 
                style={`display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(-${currentSlide() * 100}%);`}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <For each={Array.from({ length: getTotalSlides() }, (_, i) => i)}>
                  {(slideIndex) => (
                    <div style="min-width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; padding: 1rem;">
                      <For each={filteredEventos().slice(slideIndex * getEventsPerSlide(), (slideIndex + 1) * getEventsPerSlide())}>
                        {(evento) => (
                          <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative;" 
                               onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                 e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)';
                               }}
                               onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                 e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                               }}>
                            
                            {/* Event Image */}
                            <div style="height: 220px; background: linear-gradient(135deg, #667eea, #f6ad55, #f093fb); position: relative; overflow: hidden;">
                              <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-radius: 25px; font-weight: 700; color: #2d3748; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                                <span style="font-size: 1.2rem;">{getCategoryIcon(evento.categoria)}</span>
                                {evento.categoria}
                              </div>
                              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 3rem 1.5rem 1.5rem; color: white;">
                                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">{evento.titulo}</h3>
                              </div>
                              
                              {/* Efecto de brillo */}
                              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent); transform: rotate(45deg); transition: all 0.6s; opacity: 0;" 
                                   class="shine-effect"></div>
                            </div>

                            {/* Event Content */}
                            <div style="padding: 2rem;">
                              <p style="color: #4a5568; margin-bottom: 1.5rem; line-height: 1.7; font-size: 1rem;">
                                {evento.descripcion}
                              </p>

                              {/* Event Details */}
                              <div style="margin-bottom: 2rem;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(66, 153, 225, 0.1); border-radius: 12px;">
                                  <i class="fas fa-calendar" style="color: #667eea; width: 20px; font-size: 1.1rem;"></i>
                                  <span style="color: #2d3748; font-weight: 600; font-size: 1rem;">{formatDate(evento.fecha)}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(246, 173, 85, 0.1); border-radius: 12px;">
                                  <i class="fas fa-clock" style="color: #f6ad55; width: 20px; font-size: 1.1rem;"></i>
                                  <span style="color: #2d3748; font-weight: 600; font-size: 1rem;">{formatTime(evento.hora)} ({evento.duracion}h)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem; background: rgba(240, 147, 251, 0.1); border-radius: 12px;">
                                  <i class="fas fa-map-marker-alt" style="color: #f093fb; width: 20px; font-size: 1.1rem;"></i>
                                  <span style="color: #2d3748; font-weight: 600; font-size: 1rem;">{evento.ubicacion}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(72, 187, 120, 0.1); border-radius: 12px;">
                                  <i class="fas fa-users" style="color: #48bb78; width: 20px; font-size: 1.1rem;"></i>
                                  <span style="color: #2d3748; font-weight: 600; font-size: 1rem;">
                                    {getAvailableSpots(evento)} cupos disponibles de {evento.capacidad}
                                  </span>
                                </div>
                              </div>

                              {/* Availability Bar */}
                              <div style="margin-bottom: 2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                  <span style="font-size: 1rem; color: #4a5568; font-weight: 600;">Ocupación del evento</span>
                                  <span style="font-size: 1.1rem; font-weight: 800; color: #2d3748;">
                                    {Math.round((evento.registrados / evento.capacidad) * 100)}%
                                  </span>
                                </div>
                                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                                  <div 
                                    style={`width: ${(evento.registrados / evento.capacidad) * 100}%; height: 100%; background: linear-gradient(90deg, ${(evento.registrados / evento.capacidad) > 0.8 ? '#f56565, #e53e3e' : (evento.registrados / evento.capacidad) > 0.6 ? '#ed8936, #dd6b20' : '#48bb78, #38a169'}); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 4px;`}
                                  ></div>
                                </div>
                              </div>

                              {/* Register Button */}
                              <button 
                                style={`width: 100%; padding: 1rem; border: none; border-radius: 12px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; ${getAvailableSpots(evento) > 0 ? 'background: linear-gradient(135deg, #667eea, #f6ad55); color: white; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);' : 'background: #e2e8f0; color: #a0aec0; cursor: not-allowed;'}`}
                                disabled={getAvailableSpots(evento) === 0}
                                onMouseEnter={(e) => {
                                  if (getAvailableSpots(evento) > 0) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (getAvailableSpots(evento) > 0) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                                  }
                                }}
                              >
                                {getAvailableSpots(evento) > 0 ? (
                                  <>
                                    <i class="fas fa-ticket-alt" style="margin-right: 0.5rem;"></i> 
                                    🎫 Registrarse al Evento
                                  </>
                                ) : (
                                  <>
                                    <i class="fas fa-times-circle" style="margin-right: 0.5rem;"></i> 
                                    😔 Evento Lleno
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>
      </main>

      {/* Footer */}
      <footer style="background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); margin-top: 4rem; padding: 3rem 0; text-align: center; color: rgba(255,255,255,0.9);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
          <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Centro Cultural Banreservas</h3>
          <p style="margin: 0; font-size: 1.1rem; opacity: 0.8;">© 2024 - Todos los derechos reservados | Cultura para todos</p>
        </div>
      </footer>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .shine-effect {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .shine-effect:hover {
            opacity: 1 !important;
            animation: shine 0.6s ease-out;
          }

          @keyframes shine {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) translateY(100%) rotate(45deg);
            }
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .carousel-container {
              padding: 0.5rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EventosPublicos; 