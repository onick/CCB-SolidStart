import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { type Evento } from "../lib/supabase/client";
import { eventosService, forceInvalidateCache } from '../lib/supabase/services';
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

// Componente Modal para Editar Evento
interface ModalEditarEventoProps {
  evento: Evento;
  onClose: () => void;
  onEventoActualizado: () => void;
}

const ModalEditarEvento: Component<ModalEditarEventoProps> = (props) => {
  const [formData, setFormData] = createSignal({
    titulo: props.evento.titulo || '',
    descripcion: props.evento.descripcion || '',
    fecha: props.evento.fecha || '',
    hora: props.evento.hora || '',
    duracion: props.evento.duracion || 2,
    ubicacion: props.evento.ubicacion || '',
    capacidad: props.evento.capacidad || 100,
    precio: props.evento.precio || 0,
    categoria: props.evento.categoria || 'Concierto',
    imagen: props.evento.imagen || '',
    estado: props.evento.estado || 'activo'
  });
  const [guardando, setGuardando] = createSignal(false);
  const [error, setError] = createSignal('');

  const categorias = ['Concierto', 'Teatro', 'Exposición', 'Taller', 'Conferencia', 'Danza', 'Literatura', 'Cine'];
  const estados = ['activo', 'proximo', 'completado', 'cancelado'];

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

      // Actualizar evento
      const eventoActualizado = {
        ...datos,
        registrados: props.evento.registrados, // Preservar registrados existentes
        updated_at: new Date().toISOString()
      };

      const resultado = await eventosService.actualizar(props.evento.id, eventoActualizado);
      
      if (resultado) {
        console.log('✅ Evento actualizado exitosamente:', resultado.titulo);
        props.onEventoActualizado();
        props.onClose();
      } else {
        throw new Error('No se pudo actualizar el evento');
      }
      
    } catch (error: any) {
      console.error('❌ Error actualizando evento:', error);
      setError(error.message || 'Error al actualizar el evento');
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
              ✏️ Editar Evento
            </h2>
            <button 
              onClick={props.onClose}
              style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer; padding: 4px;"
            >
              ×
            </button>
          </div>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
            Modifica la información del evento "{props.evento.titulo}"
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
                  min={props.evento.registrados || 1}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                  Mínimo: {props.evento.registrados || 0} (ya registrados)
                </p>
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Estado
                </label>
                <select 
                  value={formData().estado}
                  onChange={(e) => updateFormData('estado', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <option value="activo">🟢 Activo</option>
                  <option value="proximo">🟡 Próximo</option>
                  <option value="completado">🔴 Completado</option>
                  <option value="cancelado">⚫ Cancelado</option>
                </select>
              </div>
            </div>

            {/* Estado y URL de Imagen */}
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px;">
                  Estado
                </label>
                <select 
                  value={formData().estado}
                  onChange={(e) => updateFormData('estado', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white; transition: border-color 0.2s;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <For each={estados}>
                    {(estado) => (
                      <option value={estado}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </option>
                    )}
                  </For>
                </select>
              </div>
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
              </div>
            </div>

          </div>

          {/* Mensaje de Error */}
          <Show when={error()}>
            <div style="margin-top: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 14px;">
              ❌ {error()}
            </div>
          </Show>

          {/* Botones */}
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6; position: sticky; bottom: 0; background: white;">
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
              style={`padding: 12px 24px; border: none; background: ${guardando() ? '#9ca3af' : '#10b981'}; color: white; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: ${guardando() ? 'not-allowed' : 'pointer'}; transition: all 0.2s; display: flex; align-items: center; gap: 8px;`}
            >
              <Show when={guardando()}>
                <FaSolidSpinner size={14} class="animate-spin" />
              </Show>
              {guardando() ? 'Actualizando...' : '✏️ Actualizar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
                  Estado
                </label>
                <select 
                  value={formData().estado || 'activo'}
                  onChange={(e) => updateFormData('estado', e.currentTarget.value)}
                  style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; background: white;"
                  onfocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onblur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <option value="activo">🟢 Activo</option>
                  <option value="proximo">🟡 Próximo</option>
                  <option value="completado">🔴 Completado</option>
                  <option value="cancelado">⚫ Cancelado</option>
                </select>
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
  
  // Estados para eliminación individual
  const [eliminandoEvento, setEliminandoEvento] = createSignal<string | null>(null);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = createSignal(false);
  const [eventoParaEliminar, setEventoParaEliminar] = createSignal<Evento | null>(null);
  
  // Estados para selección múltiple
  const [eventosSeleccionados, setEventosSeleccionados] = createSignal<Set<string>>(new Set());
  const [eliminandoSeleccionados, setEliminandoSeleccionados] = createSignal(false);
  const [mostrarConfirmacionEliminarSeleccionados, setMostrarConfirmacionEliminarSeleccionados] = createSignal(false);
  
  // Estados para edición
  const [mostrarModalEditar, setMostrarModalEditar] = createSignal(false);
  const [eventoParaEditar, setEventoParaEditar] = createSignal<Evento | null>(null);

  onMount(() => {
    cargarEventos();
    
    // 🔄 AUTO-REFRESH cada 30 segundos para sincronización con eventos-públicos
    setInterval(() => {
      cargarEventos();
      console.log('🔄 Auto-refresh: eventos admin actualizados');
    }, 30000);
  });

  const cargarEventos = async () => {
    setCargando(true);
    try {
      // 🔄 Invalidar cache antes de cargar para obtener datos frescos
      forceInvalidateCache();
      
      const eventosObtenidos = await eventosService.obtenerTodos();
      setEventos(eventosObtenidos);
      console.log('📊 Eventos cargados en admin:', eventosObtenidos.length);
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

  // Funciones para edición de eventos
  const iniciarEdicion = (evento: Evento) => {
    console.log('✏️ Iniciando edición del evento:', evento.titulo);
    setEventoParaEditar(evento);
    setMostrarModalEditar(true);
  };

  const cancelarEdicion = () => {
    console.log('❌ Edición cancelada');
    setEventoParaEditar(null);
    setMostrarModalEditar(false);
  };

  // Funciones para eliminación individual
  const iniciarEliminacion = (evento: Evento) => {
    console.log('🗑️ Iniciando eliminación del evento:', evento.titulo);
    setEventoParaEliminar(evento);
    setMostrarConfirmacionEliminar(true);
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setEventoParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
  };

  const confirmarEliminacion = async () => {
    const evento = eventoParaEliminar();
    if (!evento) return;

    console.log('🗑️ Eliminando evento:', evento.titulo);
    setEliminandoEvento(evento.id);
    
    try {
      const eliminado = await eventosService.eliminar(evento.id);
      
      if (eliminado) {
        console.log('✅ Evento eliminado exitosamente');
        await cargarEventos();
        setEventoParaEliminar(null);
        setMostrarConfirmacionEliminar(false);
        setEliminandoEvento(null);
        console.log(`✅ "${evento.titulo}" eliminado correctamente`);
      } else {
        throw new Error('No se pudo eliminar el evento');
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar evento:', error);
      setEliminandoEvento(null);
      alert(`Error al eliminar el evento: ${error.message}`);
    }
  };

  // Funciones para selección múltiple
  const toggleSeleccionEvento = (eventoId: string) => {
    const seleccionados = new Set(eventosSeleccionados());
    if (seleccionados.has(eventoId)) {
      seleccionados.delete(eventoId);
    } else {
      seleccionados.add(eventoId);
    }
    setEventosSeleccionados(seleccionados);
    console.log('📋 Eventos seleccionados:', seleccionados.size);
  };

  const seleccionarTodos = () => {
    const todosLosIds = new Set(eventos().map(e => e.id));
    setEventosSeleccionados(todosLosIds);
    console.log('✅ Todos los eventos seleccionados:', todosLosIds.size);
  };

  const deseleccionarTodos = () => {
    setEventosSeleccionados(new Set());
    console.log('❌ Todos los eventos deseleccionados');
  };

  const iniciarEliminacionSeleccionados = () => {
    if (eventosSeleccionados().size === 0) {
      alert('Por favor selecciona al menos un evento para eliminar');
      return;
    }
    console.log('🗑️ Iniciando eliminación de eventos seleccionados:', eventosSeleccionados().size);
    setMostrarConfirmacionEliminarSeleccionados(true);
  };

  const cancelarEliminacionSeleccionados = () => {
    console.log('❌ Eliminación de seleccionados cancelada');
    setMostrarConfirmacionEliminarSeleccionados(false);
  };

  const confirmarEliminacionSeleccionados = async () => {
    const seleccionados = Array.from(eventosSeleccionados());
    if (seleccionados.length === 0) return;

    console.log('🗑️ Eliminando eventos seleccionados:', seleccionados.length);
    setEliminandoSeleccionados(true);
    
    try {
      let eliminados = 0;
      let errores = 0;

      // Eliminar eventos uno por uno
      for (const eventoId of seleccionados) {
        try {
          const eliminado = await eventosService.eliminar(eventoId);
          if (eliminado) {
            eliminados++;
            console.log(`✅ Evento ${eventoId} eliminado`);
          } else {
            errores++;
            console.error(`❌ Error eliminando evento ${eventoId}`);
          }
        } catch (error) {
          errores++;
          console.error(`❌ Error eliminando evento ${eventoId}:`, error);
        }
      }

      // Mostrar resumen
      if (eliminados > 0) {
        console.log(`✅ ${eliminados} eventos eliminados exitosamente`);
      }
      if (errores > 0) {
        console.warn(`⚠️ ${errores} eventos no pudieron ser eliminados`);
        alert(`Se eliminaron ${eliminados} eventos. ${errores} eventos tuvieron errores.`);
      } else {
        alert(`✅ ${eliminados} eventos eliminados exitosamente`);
      }

      // Limpiar estados y recargar
      setEventosSeleccionados(new Set());
      setMostrarConfirmacionEliminarSeleccionados(false);
      await cargarEventos();
      
    } catch (error: any) {
      console.error('❌ Error en eliminación múltiple:', error);
      alert(`Error eliminando eventos: ${error.message}`);
    } finally {
      setEliminandoSeleccionados(false);
    }
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
              label: 'Exportar',
              icon: FaSolidDownload,
              onClick: () => console.log('Exportar eventos')
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

            {/* Controles de selección múltiple */}
            <Show when={eventos().length > 0}>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input 
                      type="checkbox"
                      checked={eventosSeleccionados().size === eventos().length && eventos().length > 0}
                      onChange={(e) => e.currentTarget.checked ? seleccionarTodos() : deseleccionarTodos()}
                      style="width: 16px; height: 16px; cursor: pointer;"
                    />
                    <span style="font-size: 14px; font-weight: 500; color: #374151;">
                      Seleccionar todos ({eventosSeleccionados().size}/{eventos().length})
                    </span>
                  </div>
                  
                  <Show when={eventosSeleccionados().size > 0}>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 14px; color: #6b7280;">
                        {eventosSeleccionados().size} eventos seleccionados
                      </span>
                      <button 
                        onClick={deseleccionarTodos}
                        style="font-size: 12px; color: #6b7280; text-decoration: underline; background: none; border: none; cursor: pointer;"
                      >
                        Limpiar selección
                      </button>
                    </div>
                  </Show>
                </div>

                <Show when={eventosSeleccionados().size > 0}>
                  <button 
                    onClick={iniciarEliminacionSeleccionados}
                    disabled={eliminandoSeleccionados()}
                    style={`background: #dc2626; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px; border: none; cursor: ${eliminandoSeleccionados() ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; gap: 6px; opacity: ${eliminandoSeleccionados() ? '0.6' : '1'};`}
                  >
                    <Show when={eliminandoSeleccionados()}>
                      <FaSolidSpinner size={14} class="animate-spin" />
                    </Show>
                    <Show when={!eliminandoSeleccionados()}>
                      <FaSolidTrash size={14} />
                    </Show>
                    {eliminandoSeleccionados() ? `Eliminando ${eventosSeleccionados().size}...` : `Eliminar ${eventosSeleccionados().size} eventos`}
                  </button>
                </Show>
              </div>
            </Show>

            <div style="display: grid; gap: 12px;">
              <For each={eventos()}>
                {(evento) => (
                  <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                    
                    {/* Casilla de selección */}
                    <div style="display: flex; align-items: center;">
                      <input 
                        type="checkbox"
                        checked={eventosSeleccionados().has(evento.id)}
                        onChange={() => toggleSeleccionEvento(evento.id)}
                        style="width: 16px; height: 16px; cursor: pointer;"
                      />
                    </div>

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
                      <button 
                        style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;"
                        title="Configurar evento"
                      >
                        <FaSolidGear size={12} />
                      </button>
                      <button 
                        style="background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;"
                        title="Editar evento"
                        onClick={() => iniciarEdicion(evento)}
                      >
                        <FaSolidPenToSquare size={12} />
                      </button>
                      <button 
                        style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;"
                        title="Eliminar evento"
                        onClick={() => iniciarEliminacion(evento)}
                        disabled={eliminandoEvento() === evento.id}
                      >
                        <Show when={eliminandoEvento() === evento.id}>
                          <FaSolidSpinner size={12} class="animate-spin" />
                        </Show>
                        <Show when={eliminandoEvento() !== evento.id}>
                          <FaSolidTrash size={12} />
                        </Show>
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

        {/* Modal de Editar Evento */}
        <Show when={mostrarModalEditar() && eventoParaEditar()}>
          <ModalEditarEvento 
            evento={eventoParaEditar()!}
            onClose={cancelarEdicion}
            onEventoActualizado={cargarEventos}
          />
        </Show>

        {/* Modal de confirmación de eliminación múltiple */}
        <Show when={mostrarConfirmacionEliminarSeleccionados()}>
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; width: 90%;">
              <h3 style="margin: 0 0 16px 0; color: #dc2626; font-size: 20px; font-weight: 600;">
                🗑️ Confirmar Eliminación Múltiple
              </h3>
              <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.5;">
                ¿Estás seguro de que quieres eliminar <strong>{eventosSeleccionados().size} eventos seleccionados</strong>?
              </p>
              
              {/* Lista de eventos a eliminar */}
              <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin: 16px 0; max-height: 200px; overflow-y: auto;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">Eventos a eliminar:</h4>
                <ul style="margin: 0; padding-left: 16px; font-size: 14px; color: #6b7280;">
                  <For each={eventos().filter(e => eventosSeleccionados().has(e.id))}>
                    {(evento) => <li style="margin-bottom: 4px;">{evento.titulo}</li>}
                  </For>
                </ul>
              </div>
              
              <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 14px;">
                ⚠️ Esta acción no se puede deshacer. Se perderán todos los registros asociados a estos eventos.
              </p>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button 
                  style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
                  onClick={cancelarEliminacionSeleccionados}
                  disabled={eliminandoSeleccionados()}
                >
                  Cancelar
                </button>
                <button 
                  style={`padding: 8px 16px; background: ${eliminandoSeleccionados() ? '#9ca3af' : '#dc2626'}; color: white; border: none; border-radius: 6px; cursor: ${eliminandoSeleccionados() ? 'not-allowed' : 'pointer'}; font-size: 14px; display: flex; align-items: center; gap: 6px;`}
                  onClick={confirmarEliminacionSeleccionados}
                  disabled={eliminandoSeleccionados()}
                >
                  <Show when={eliminandoSeleccionados()}>
                    <FaSolidSpinner size={14} class="animate-spin" />
                  </Show>
                  {eliminandoSeleccionados() ? `Eliminando ${eventosSeleccionados().size}...` : `🗑️ Sí, Eliminar ${eventosSeleccionados().size} eventos`}
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* Modal de confirmación de eliminación individual */}
        <Show when={mostrarConfirmacionEliminar()}>
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
              <h3 style="margin: 0 0 16px 0; color: #dc2626; font-size: 20px; font-weight: 600;">
                🗑️ Confirmar Eliminación
              </h3>
              <p style="margin: 0 0 20px 0; color: #374151; line-height: 1.5;">
                ¿Estás seguro de que quieres eliminar el evento <strong>"{eventoParaEliminar()?.titulo}"</strong>?
              </p>
              <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 14px;">
                ⚠️ Esta acción no se puede deshacer. Se perderán todos los registros asociados.
              </p>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button 
                  style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
                  onClick={cancelarEliminacion}
                  disabled={eliminandoEvento() === eventoParaEliminar()?.id}
                >
                  Cancelar
                </button>
                <button 
                  style={`padding: 8px 16px; background: ${eliminandoEvento() === eventoParaEliminar()?.id ? '#9ca3af' : '#dc2626'}; color: white; border: none; border-radius: 6px; cursor: ${eliminandoEvento() === eventoParaEliminar()?.id ? 'not-allowed' : 'pointer'}; font-size: 14px; display: flex; align-items: center; gap: 6px;`}
                  onClick={confirmarEliminacion}
                  disabled={eliminandoEvento() === eventoParaEliminar()?.id}
                >
                  <Show when={eliminandoEvento() === eventoParaEliminar()?.id}>
                    <FaSolidSpinner size={14} class="animate-spin" />
                  </Show>
                  {eliminandoEvento() === eventoParaEliminar()?.id ? 'Eliminando...' : '🗑️ Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </Show>
    </AdminLayout>
  );
};

export default Eventos;