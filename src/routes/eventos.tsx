import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { type Evento } from "../lib/supabase/client";
import { eventosService } from '../lib/supabase/services';
import '../styles/admin.css';
import AdminLayout from '../components/AdminLayout';
import AdminHeader from '../components/AdminHeader';

// solid-icons for better performance and native Solid.js integration
import {
    FaRegularCalendar,
    FaSolidCalendarXmark,
    FaSolidChartBar,
    FaSolidCode,
    FaSolidDownload,
    FaSolidGear,
    FaSolidHouse,
    FaSolidPenToSquare,
    FaSolidSpinner,
    FaSolidTags,
    FaSolidTicket,
    FaSolidTrash,
    FaSolidUsers,
    FaSolidWandMagicSparkles,
    FaSolidPlus,
    FaSolidRotate,
    FaSolidCalendarDays,
    FaSolidArrowRightFromBracket
} from 'solid-icons/fa';

// Componente Modal para Nuevo Evento
interface ModalNuevoEventoProps {
  onClose: () => void;
  onEventoCreado: () => void;
}

const ModalNuevoEvento: Component<ModalNuevoEventoProps> = (props) => {
  const [formData, setFormData] = createSignal({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    duracion: 2,
    ubicacion: '',
    capacidad: 100,
    precio: 0,
    categoria: 'Concierto',
    imagen: ''
  });
  const [guardando, setGuardando] = createSignal(false);
  const [error, setError] = createSignal('');

  const categorias = ['Concierto', 'Teatro', 'Exposición', 'Taller', 'Conferencia', 'Danza', 'Literatura', 'Cine'];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      const datos = formData();
      
      // Validaciones
      if (!datos.titulo.trim()) {
        throw new Error('El título es obligatorio');
      }
      if (!datos.descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      if (!datos.fecha) {
        throw new Error('La fecha es obligatoria');
      }
      if (!datos.hora) {
        throw new Error('La hora es obligatoria');
      }
      if (!datos.ubicacion.trim()) {
        throw new Error('La ubicación es obligatoria');
      }

      // Crear evento con imagen por defecto si no se proporciona
      const nuevoEvento = {
        ...datos,
        registrados: 0,
        estado: 'activo',
        imagen: datos.imagen || `https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=${encodeURIComponent(datos.titulo)}`
      };

      await eventosService.crear(nuevoEvento);
      
      console.log('✅ Evento creado exitosamente:', nuevoEvento.titulo);
      props.onEventoCreado();
      props.onClose();
      
    } catch (error: any) {
      console.error('❌ Error creando evento:', error);
      setError(error.message || 'Error al crear el evento');
    } finally {
      setGuardando(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        
        {/* Header del Modal */}
        <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #f3f4f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0;">
              ➕ Crear Nuevo Evento
            </h2>
            <button 
              onClick={props.onClose}
              style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer; padding: 4px;"
            >
              ×
            </button>
          </div>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
            Completa la información del evento que aparecerá en la página pública
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style="padding: 24px;">
          <div style="display: grid; gap: 20px;">
            
            {/* Título */}
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                Título del Evento *
              </label>
              <input 
                type="text"
                value={formData().titulo}
                onInput={(e) => updateFormData('titulo', e.currentTarget.value)}
                placeholder="Ej: Concierto de Jazz Contemporáneo"
                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                Descripción *
              </label>
              <textarea 
                value={formData().descripcion}
                onInput={(e) => updateFormData('descripcion', e.currentTarget.value)}
                placeholder="Describe el evento en detalle..."
                rows="3"
                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; transition: border-color 0.2s;"
                onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Fecha y Hora */}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Fecha *
                </label>
                <input 
                  type="date"
                  value={formData().fecha}
                  onInput={(e) => updateFormData('fecha', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Hora *
                </label>
                <input 
                  type="time"
                  value={formData().hora}
                  onInput={(e) => updateFormData('hora', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Categoría y Duración */}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Categoría
                </label>
                <select 
                  value={formData().categoria}
                  onChange={(e) => updateFormData('categoria', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <For each={categorias}>
                    {(categoria) => <option value={categoria}>{categoria}</option>}
                  </For>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Duración (horas)
                </label>
                <input 
                  type="number"
                  value={formData().duracion}
                  onInput={(e) => updateFormData('duracion', parseInt(e.currentTarget.value) || 0)}
                  min="1"
                  max="12"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                Ubicación *
              </label>
              <input 
                type="text"
                value={formData().ubicacion}
                onInput={(e) => updateFormData('ubicacion', e.currentTarget.value)}
                placeholder="Ej: Auditorio Principal, Sala Norte..."
                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Capacidad y Precio */}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Capacidad (personas)
                </label>
                <input 
                  type="number"
                  value={formData().capacidad}
                  onInput={(e) => updateFormData('capacidad', parseInt(e.currentTarget.value) || 0)}
                  min="1"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Precio (RD$)
                </label>
                <input 
                  type="number"
                  value={formData().precio}
                  onInput={(e) => updateFormData('precio', parseInt(e.currentTarget.value) || 0)}
                  min="0"
                  placeholder="0 = Entrada libre"
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* URL de Imagen (opcional) */}
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                URL de Imagen (opcional)
              </label>
              <input 
                type="url"
                value={formData().imagen}
                onInput={(e) => updateFormData('imagen', e.currentTarget.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                Si no proporcionas una imagen, se generará una automáticamente
              </p>
            </div>

          </div>

          {/* Mensaje de Error */}
          <Show when={error()}>
            <div style="margin-top: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 14px;">
              ❌ {error()}
            </div>
          </Show>

          {/* Botones */}
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            <button 
              type="button"
              onClick={props.onClose}
              disabled={guardando()}
              style="padding: 12px 24px; border: 2px solid #e5e7eb; background: white; color: #374151; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={guardando()}
              style={`padding: 12px 24px; border: none; background: ${guardando() ? '#9ca3af' : '#3b82f6'}; color: white; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: ${guardando() ? 'not-allowed' : 'pointer'}; transition: all 0.2s; display: flex; align-items: center; gap: 8px;`}
            >
              <Show when={guardando()}>
                <FaSolidSpinner size={14} class="animate-spin" />
              </Show>
              {guardando() ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Eventos: Component = () => {
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [cargando, setCargando] = createSignal(false);
  const [mostrarModal, setMostrarModal] = createSignal(false);

  onMount(() => {
    cargarEventos();
  });

  const cargarEventos = async () => {
    setCargando(true);
    try {
      const eventosObtenidos = await eventosService.obtenerTodos();
      setEventos(eventosObtenidos);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setCargando(false);
    }
  };

  const crearEventosDePrueba = async () => {
    console.log('🎭 Creando eventos de prueba...');
    setCargando(true);
    
    try {
      // Crear algunos eventos de prueba
      const eventosPrueba = [
        {
          titulo: "Concierto de Jazz",
          descripcion: "Una noche mágica con los mejores exponentes del jazz",
          categoria: "Música",
          fecha: "2025-07-15",
          hora: "20:00",
          duracion: 120,
          ubicacion: "Sala Principal",
          capacidad: 200,
          precio: 1500,
          estado: "activo"
        },
        {
          titulo: "Exposición de Arte Contemporáneo",
          descripcion: "Muestra de artistas dominicanos emergentes",
          categoria: "Arte",
          fecha: "2025-07-20",
          hora: "10:00",
          duracion: 480,
          ubicacion: "Galería Norte",
          capacidad: 150,
          precio: 0,
          estado: "proximo"
        }
      ];

      for (const evento of eventosPrueba) {
        await eventosService.crear(evento);
      }

      // Recargar eventos
      await cargarEventos();
      console.log('✅ Eventos de prueba creados exitosamente');
      
    } catch (error) {
      console.error('❌ Error creando eventos de prueba:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    // Lógica de logout
  };

  return (
    <AdminLayout currentPage="eventos" onLogout={handleLogout}>
        <AdminHeader
          pageTitle="Gestión de Eventos 🎭"
          pageSubtitle="Administra todos los eventos del Centro Cultural Banreservas"
          breadcrumbs={[
            { label: 'Centro Cultural Banreservas' },
            { label: 'Gestión' },
            { label: 'Eventos', active: true }
          ]}
          buttons={[
            {
              label: 'Crear Pruebas',
              icon: FaSolidWandMagicSparkles,
              onClick: crearEventosDePrueba,
              variant: 'secondary' as const
            },
            {
              label: 'Actualizar',
              icon: FaSolidRotate,
              onClick: () => cargarEventos()
            },
            {
              label: 'Nuevo Evento',
              icon: FaSolidPlus,
              onClick: () => setMostrarModal(true),
              variant: 'primary' as const
            },
            {
              label: 'Cerrar Sesión',
              icon: FaSolidArrowRightFromBracket,
              onClick: handleLogout,
              variant: 'logout' as const
            }
          ]}
          titleIcon={FaSolidCalendarDays}
        />

        <div class="main-content" style="background: #f8fafc; padding: 24px;">
          
          <Show when={cargando()}>
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
              🔄 Cargando eventos desde Supabase...
            </div>
          </Show>

          {/* Métricas de eventos */}
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
            
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Eventos Totales</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">{eventos().length}</div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidTicket size={12} color="#3b82f6" />
                    <span style="font-size: 12px; font-weight: 600; color: #3b82f6;">Programados</span>
                  </div>
                </div>
                <div style="background: #eff6ff; padding: 12px; border-radius: 10px;">
                  <FaSolidCalendarDays size={24} color="#3b82f6" />
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Eventos Activos</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {eventos().filter(e => e.estado === 'activo').length}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidUsers size={12} color="#10b981" />
                    <span style="font-size: 12px; font-weight: 600; color: #10b981;">En curso</span>
                  </div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 10px;">
                  <FaSolidUsers size={24} color="#10b981" />
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Registrados</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {eventos().reduce((total, evento) => total + (evento.registrados || 0), 0)}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidTicket size={12} color="#f59e0b" />
                    <span style="font-size: 12px; font-weight: 600; color: #f59e0b;">Asistentes</span>
                  </div>
                </div>
                <div style="background: #fffbeb; padding: 12px; border-radius: 10px;">
                  <FaSolidTicket size={24} color="#f59e0b" />
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Capacidad</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {eventos().reduce((total, evento) => total + (evento.capacidad || 0), 0)}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidUsers size={12} color="#8b5cf6" />
                    <span style="font-size: 12px; font-weight: 600; color: #8b5cf6;">Total disponible</span>
                  </div>
                </div>
                <div style="background: #faf5ff; padding: 12px; border-radius: 10px;">
                  <FaSolidUsers size={24} color="#8b5cf6" />
                </div>
              </div>
            </div>

          </div>

          {/* Lista de eventos */}
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Lista de Eventos ({eventos().length})</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Gestiona todos los eventos del centro cultural</p>
              </div>
              <button 
                onClick={() => setMostrarModal(true)}
                style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;"
              >
                <FaSolidPlus size={14} />
                Nuevo Evento
              </button>
            </div>

            <div style="display: grid; gap: 12px;">
              <For each={eventos()}>
                {(evento) => (
                  <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                    <div style="flex: 1;">
                      <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">{evento.titulo}</div>
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">{evento.descripcion}</div>
                      <div style="display: flex; gap: 16px; align-items: center;">
                        <span style="font-size: 12px; color: #6b7280;">📅 {evento.fecha}</span>
                        <span style="font-size: 12px; color: #6b7280;">🕐 {evento.hora}</span>
                        <span style="font-size: 12px; color: #6b7280;">📍 {evento.ubicacion}</span>
                        <span style={`font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: ${
                          evento.estado === 'activo' ? '#FEF3C7' : '#F3F4F6'
                        }; color: ${
                          evento.estado === 'activo' ? '#92400E' : '#6B7280'
                        }`}>
                          {evento.estado?.toUpperCase() || 'BORRADOR'}
                        </span>
                      </div>
                    </div>
                    
                    <div style="text-align: right;">
                      <div style="font-size: 18px; font-weight: 700; color: #1f2937;">{evento.registrados || 0}</div>
                      <div style="font-size: 12px; color: #6b7280;">de {evento.capacidad} registrados</div>
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                      <button style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;">
                        <FaSolidGear size={12} />
                      </button>
                      <button style="background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;">
                        <FaSolidPenToSquare size={12} />
                      </button>
                      <button style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;">
                        <FaSolidTrash size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </For>

              <Show when={eventos().length === 0 && !cargando()}>
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                  <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                  <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">No hay eventos disponibles</h3>
                  <p style="margin: 0 0 20px 0;">Crea tu primer evento o carga datos de prueba.</p>
                  <div style="display: flex; gap: 12px; justify-content: center;">
                    <button 
                      onClick={() => setMostrarModal(true)}
                      style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; font-size: 14px; border: none; cursor: pointer;"
                    >
                      Crear Evento
                    </button>
                    <button 
                      onClick={crearEventosDePrueba}
                      style="background: #6b7280; color: white; padding: 12px 24px; border-radius: 6px; font-size: 14px; border: none; cursor: pointer;"
                    >
                      Cargar Datos de Prueba
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          </div>

        </div>

        {/* Modal de Nuevo Evento */}
        <Show when={mostrarModal()}>
          <ModalNuevoEvento 
            onClose={() => setMostrarModal(false)}
            onEventoCreado={cargarEventos}
          />
        </Show>
    </AdminLayout>
  );
};

export default Eventos;