import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService } from '../lib/supabase/services';
import '../styles/global.css';

const EventosPublicos: Component = () => {
  const [eventos, setEventos] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeFilter, setActiveFilter] = createSignal('todos');
  const [showRegistroModal, setShowRegistroModal] = createSignal(false);
  const [selectedEvento, setSelectedEvento] = createSignal(null);
  const [showSyncInfo, setShowSyncInfo] = createSignal(true);

  onMount(async () => {
    console.log('📅 Cargando eventos públicos...');
    try {
      const eventosData = await eventosService.obtenerTodos();
      console.log('📊 Eventos obtenidos:', eventosData);
      
      // Solo mostrar eventos activos al público
      const eventosActivos = eventosData.filter(evento => evento.estado === 'activo');
      console.log('🎯 Eventos activos filtrados:', eventosActivos);
      
      setEventos(eventosActivos);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  });

  // Función para recargar eventos (útil para sincronización)
  const recargarEventos = async () => {
    console.log('🔄 Recargando eventos públicos...');
    setIsLoading(true);
    try {
      const eventosData = await eventosService.obtenerTodos();
      console.log('📊 Eventos recargados:', eventosData);
      
      // Solo mostrar eventos activos al público
      const eventosActivos = eventosData.filter(evento => evento.estado === 'activo');
      console.log('🎯 Eventos activos después de recarga:', eventosActivos);
      
      setEventos(eventosActivos);
    } catch (error) {
      console.error('❌ Error recargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-recarga cada 30 segundos para mantener sincronización
  setInterval(() => {
    console.log('⏰ Auto-recarga de eventos (cada 30s)');
    recargarEventos();
  }, 30000);

  // Ocultar información de sincronización después de 10 segundos
  setTimeout(() => {
    setShowSyncInfo(false);
  }, 10000);

  const filteredEventos = () => {
    let eventosBase = eventos();

    // Aplicar filtro principal (TODOS, PRÓXIMOS, EN CURSO)
    if (activeFilter() === 'proximos') {
      eventosBase = eventosBase.filter(evento => {
        const now = new Date();
        const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
        const thirtyMinBefore = new Date(eventDateTime.getTime() - (30 * 60 * 1000));
        return now < thirtyMinBefore;
      });
    } else if (activeFilter() === 'en-curso') {
      eventosBase = eventosBase.filter(evento => isEventoActivo(evento));
    }

    return eventosBase;
  };

  // Función para determinar si un evento está activo para check-in
  const isEventoActivo = (evento: any) => {
    const now = new Date();
    const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
    const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
    const thirtyMinBefore = new Date(eventDateTime.getTime() - (30 * 60 * 1000));
    
    return now >= thirtyMinBefore && now <= eventEndTime;
  };

  // Función para determinar el estado del evento
  const getEventStatus = (evento: any) => {
    const now = new Date();
    const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
    const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
    const thirtyMinBefore = new Date(eventDateTime.getTime() - (30 * 60 * 1000));
    
    if (now > eventEndTime) {
      return { status: 'Finalizado', color: '#6B7280', bgColor: '#F3F4F6' };
    } else if (now >= thirtyMinBefore && now <= eventEndTime) {
      return { status: 'En curso', color: '#059669', bgColor: '#D1FAE5' };
    } else {
      return { status: 'Próximamente', color: '#EA580C', bgColor: '#FED7AA' };
    }
  };

  // Función para generar código único
  const generateEventCode = (eventId: string, userEmail: string) => {
    const timestamp = Date.now();
    const hash = btoa(`${eventId}-${userEmail}-${timestamp}`).slice(0, 8);
    return `CCB-${hash.toUpperCase()}`;
  };

  // Función para abrir modal de registro
  const openRegistroModal = (evento: any) => {
    setSelectedEvento(evento);
    setShowRegistroModal(true);
  };

  const formatDate = (fecha: string) => {
    const date = new Date(fecha);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatTime = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style="min-height: 100vh; background: #F8FAFC; margin: 0; padding: 0;">
      {/* Header Azul pegado al borde superior */}
      <header style="background: #0EA5E9; padding: 1rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100vw; margin: -30px 0 0 0; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <img 
              src="/images/logo.png" 
              alt="Centro Cultural Banreservas" 
              style="width: 44px; height: 44px; object-fit: contain; border-radius: 50%;"
            />
          </div>
          <span style="color: white; font-size: 1.1rem; font-weight: 600;">Centro Cultural Banreservas</span>
        </div>
        <div style="display: flex; align-items: center; gap: 2rem;">
          <span style="color: white; font-size: 1.1rem; font-weight: 600;">Eventos</span>
          <button 
            onclick={recargarEventos}
            style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            🔄 Actualizar
          </button>
          <span style="color: white; font-size: 1.1rem; font-weight: 500;">{getCurrentTime()}</span>
        </div>
      </header>

      {/* Navegación por Pestañas */}
      <div class="nav-buttons-container" style="background: white; padding: 1.5rem 1rem; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: center; width: 100vw; margin: 0; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw;">
        <div class="nav-buttons-group" style="display: flex; gap: 1rem; background: #F3F4F6; padding: 0.5rem; border-radius: 12px;">
          <button 
            class="nav-button"
            onclick={() => setActiveFilter('todos')}
            style={`padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; min-width: 120px; ${
              activeFilter() === 'todos' 
                ? 'background: #0EA5E9; color: white; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);' 
                : 'background: transparent; color: #6B7280; hover:background: white; hover:color: #374151;'
            }`}
            onMouseEnter={(e) => {
              if (activeFilter() !== 'todos') {
                (e.target as HTMLButtonElement).style.background = 'white';
                (e.target as HTMLButtonElement).style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter() !== 'todos') {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#6B7280';
              }
            }}
          >
            Todos
          </button>
          <button 
            class="nav-button"
            onclick={() => setActiveFilter('en-curso')}
            style={`padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; min-width: 120px; ${
              activeFilter() === 'en-curso' 
                ? 'background: #0EA5E9; color: white; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);' 
                : 'background: transparent; color: #6B7280; hover:background: white; hover:color: #374151;'
            }`}
            onMouseEnter={(e) => {
              if (activeFilter() !== 'en-curso') {
                (e.target as HTMLButtonElement).style.background = 'white';
                (e.target as HTMLButtonElement).style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter() !== 'en-curso') {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#6B7280';
              }
            }}
          >
            En curso
          </button>
          <button 
            class="nav-button"
            onclick={() => setActiveFilter('proximos')}
            style={`padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; min-width: 120px; ${
              activeFilter() === 'proximos' 
                ? 'background: #0EA5E9; color: white; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);' 
                : 'background: transparent; color: #6B7280; hover:background: white; hover:color: #374151;'
            }`}
            onMouseEnter={(e) => {
              if (activeFilter() !== 'proximos') {
                (e.target as HTMLButtonElement).style.background = 'white';
                (e.target as HTMLButtonElement).style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter() !== 'proximos') {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#6B7280';
              }
            }}
          >
            Próximos
          </button>
        </div>
      </div>

      {/* Información de Sincronización */}
      <Show when={showSyncInfo()}>
        <div style="background: #EFF6FF; border-left: 4px solid #0EA5E9; padding: 1rem; margin: 0; border-bottom: 1px solid #E5E7EB;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 1rem;">
            <div style="color: #0EA5E9; font-size: 1.2rem;">ℹ️</div>
            <div style="flex: 1;">
              <p style="margin: 0; color: #1E40AF; font-size: 0.9rem; font-weight: 500;">
                <strong>Sincronización Automática:</strong> Los eventos creados en el sistema administrativo aparecen aquí automáticamente. 
                La página se actualiza cada 30 segundos o puedes usar el botón "🔄 Actualizar" en el header.
              </p>
            </div>
            <button 
              onclick={() => setShowSyncInfo(false)}
              style="background: transparent; border: none; color: #0EA5E9; cursor: pointer; font-size: 1.1rem; padding: 0.25rem;"
              title="Ocultar información"
            >
              ✕
            </button>
          </div>
        </div>
      </Show>

      {/* Contenido Principal */}
      <main style="padding: 2rem;">
        
        {/* Loading */}
        <Show when={isLoading()}>
          <div style="text-align: center; padding: 4rem; color: #6B7280;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top: 3px solid #0EA5E9; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
            <p style="font-size: 1rem; font-weight: 500;">Cargando eventos...</p>
          </div>
        </Show>

        {/* No events */}
        <Show when={!isLoading() && filteredEventos().length === 0}>
          <div style="text-align: center; padding: 4rem; color: #6B7280;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📅</div>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #374151;">No hay eventos disponibles</h3>
            <p style="opacity: 0.8; font-size: 1rem; margin-bottom: 1rem;">No se encontraron eventos activos en esta categoría.</p>
            <div style="background: #F3F4F6; padding: 1rem; border-radius: 8px; margin: 1rem auto; max-width: 500px;">
              <p style="font-size: 0.9rem; color: #6B7280; margin: 0;">
                💡 <strong>¿Esperando eventos nuevos?</strong><br/>
                Los eventos creados en el panel de administración aparecerán aquí automáticamente.<br/>
                Haz clic en "🔄 Actualizar" en el header para sincronizar manualmente.
              </p>
            </div>
          </div>
        </Show>

        {/* Lista de Eventos */}
        <Show when={!isLoading() && filteredEventos().length > 0}>
          <div class="eventos-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; max-width: none; padding: 0.75rem;">
            <For each={filteredEventos()}>
              {(evento) => {
                const dateInfo = formatDate(evento.fecha);
                const statusInfo = getEventStatus(evento);
                
                return (
                  <div 
                    style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: none; cursor: pointer; transition: all 0.3s ease; width: 100%;"
                    onclick={() => openRegistroModal(evento)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header con degradado morado */}
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; position: relative; overflow: hidden;">
                      {/* Círculos decorativos */}
                      <div style="position: absolute; top: -30px; left: -30px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                      <div style="position: absolute; top: 50px; right: -20px; width: 60px; height: 60px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                      <div style="position: absolute; bottom: -40px; left: 100px; width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                      
                      {/* Status badge */}
                      <div style="position: absolute; top: 1rem; right: 1rem;">
                        <span 
                          style={`padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: white; background: ${statusInfo.status === 'ACTIVO' ? '#10B981' : statusInfo.status === 'PRÓXIMO' ? '#F59E0B' : '#6B7280'};`}
                        >
                          {statusInfo.status}
                        </span>
                      </div>
                      
                      {/* Título */}
                      <h3 style="color: white; font-size: 1.4rem; font-weight: 700; margin: 0; text-align: center; line-height: 1.3; position: relative; z-index: 2;">
                        {evento.titulo}
                      </h3>
                    </div>

                    {/* Contenido inferior */}
                    <div style="padding: 1.5rem;">
                      {/* Información del evento */}
                      <div style="margin-bottom: 1.5rem;">
                        <div style="color: #374151; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">
                          📅 {dateInfo.day} {dateInfo.month} 2025
                        </div>
                        <div style="color: #6B7280; font-size: 0.9rem; margin-bottom: 0.5rem;">
                          📍 {evento.ubicacion}
                        </div>
                        <div style="color: #6B7280; font-size: 0.9rem;">
                          🕐 {formatTime(evento.hora)} - {formatTime(`${parseInt(evento.hora.split(':')[0]) + evento.duracion}:${evento.hora.split(':')[1]}`)}
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <div style="flex: 1; text-align: center;">
                          <div style="background: #EFF6FF; color: #0EA5E9; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-size: 1.5rem; font-weight: bold;">
                            0
                          </div>
                          <div style="color: #6B7280; font-size: 0.8rem; font-weight: 500;">Registrados</div>
                        </div>
                        <div style="flex: 1; text-align: center;">
                          <div style="background: #FEF3E2; color: #F59E0B; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-size: 1.5rem; font-weight: bold;">
                            0
                          </div>
                          <div style="color: #6B7280; font-size: 0.8rem; font-weight: 500;">Check-Ins</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </main>

      {/* Modal de Registro */}
      <Show when={showRegistroModal()}>
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem;">
          <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 25px rgba(0,0,0,0.15); position: relative; animation: modalSlideIn 0.3s ease-out;">
            
            {/* Cerrar Modal */}
            <button 
              onclick={() => setShowRegistroModal(false)}
              style="position: absolute; top: 1rem; right: 1rem; background: #F3F4F6; color: #6B7280; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#E5E7EB';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#F3F4F6';
              }}
            >
              ×
            </button>

            {/* Header del Modal */}
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="font-size: 2rem; margin-bottom: 1rem;">🎫</div>
              <h2 style="color: #111827; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                Registro al Evento
              </h2>
              <Show when={selectedEvento()}>
                <h3 style="color: #0EA5E9; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                  {selectedEvento()?.titulo}
                </h3>
                <p style="color: #6B7280; font-size: 0.9rem;">
                  {selectedEvento() && isEventoActivo(selectedEvento()) 
                    ? '🔴 Este evento está activo - Tu código estará listo para check-in'
                    : '📧 Recibirás tu código por email'
                  }
                </p>
              </Show>
            </div>

            {/* Formulario */}
            <form style="display: flex; flex-direction: column; gap: 1rem;">
              
              {/* Nombre Completo */}
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                  Nombre Completo *
                </label>
                <input 
                  type="text" 
                  placeholder="Ingresa tu nombre completo"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                />
              </div>

              {/* Email */}
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                  Correo Electrónico *
                </label>
                <input 
                  type="email" 
                  placeholder="tu@email.com"
                  required
                  style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                  Teléfono (Opcional)
                </label>
                <input 
                  type="tel" 
                  placeholder="809-555-0123"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                />
              </div>

              {/* Botones de Acción */}
              <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                <button 
                  type="button"
                  onclick={() => setShowRegistroModal(false)}
                  style="flex: 1; padding: 0.75rem; border: 1px solid #D1D5DB; background: white; color: #6B7280; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s;"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  onclick={(e) => {
                    e.preventDefault();
                    console.log('Procesando registro...', {
                      evento: selectedEvento(),
                      esActivo: selectedEvento() && isEventoActivo(selectedEvento())
                    });
                    alert('¡Registro procesado! (Demo)');
                    setShowRegistroModal(false);
                  }}
                  style="flex: 2; padding: 0.75rem; border: none; background: #0EA5E9; color: white; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = '#0284C7';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = '#0EA5E9';
                  }}
                >
                  Registrarse
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      <style>
        {`
          /* Reset de márgenes y padding globales para eliminar espacios blancos */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
            width: 100%;
            height: 100%;
          }
          
          #root, #app {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
          }

          /* Asegurar que no hay espacios en la parte superior */
          html {
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Eliminar cualquier espacio superior del contenedor principal */
          .main-container {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          /* Responsive Grid para Eventos */
          @media (max-width: 768px) {
            .eventos-grid {
              grid-template-columns: 1fr !important;
              padding: 0 0.5rem !important;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .eventos-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (min-width: 1025px) {
            .eventos-grid {
              grid-template-columns: repeat(5, 1fr) !important;
            }
          }

          /* Responsive Botones de Navegación */
          @media (max-width: 768px) {
            .nav-buttons-container {
              padding: 1rem !important;
            }
            .nav-buttons-group {
              flex-direction: column !important;
              gap: 0.5rem !important;
              padding: 0.75rem !important;
            }
            .nav-button {
              min-width: auto !important;
              padding: 0.5rem 1rem !important;
              font-size: 0.9rem !important;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .nav-buttons-group {
              gap: 0.75rem !important;
            }
            .nav-button {
              min-width: 100px !important;
              padding: 0.6rem 1.25rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EventosPublicos; 