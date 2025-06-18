import { FaSolidSave, FaSolidXmark } from 'solid-icons/fa';
import { Component, createSignal } from 'solid-js';
import type { Evento } from '../../../lib/supabase/client';

interface EventoFormProps {
  evento?: Evento;
  onGuardar: (evento: Evento) => void;
  onCancelar: () => void;
}

const EventoForm: Component<EventoFormProps> = (props) => {
  const [titulo, setTitulo] = createSignal(props.evento?.titulo || '');
  const [fecha, setFecha] = createSignal(props.evento?.fecha || '');
  const [hora, setHora] = createSignal(props.evento?.hora || '');
  const [descripcion, setDescripcion] = createSignal(props.evento?.descripcion || '');
  const [categoria, setCategoria] = createSignal(props.evento?.categoria || '');
  const [duracion, setDuracion] = createSignal(props.evento?.duracion || 1);
  const [ubicacion, setUbicacion] = createSignal(props.evento?.ubicacion || '');
  const [capacidad, setCapacidad] = createSignal(props.evento?.capacidad || 0);
  const [precio, setPrecio] = createSignal(props.evento?.precio || 0);
  const [imagen, setImagen] = createSignal(props.evento?.imagen || '');
  const [estado, setEstado] = createSignal(props.evento?.estado || 'proximo');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onGuardar({
      id: props.evento?.id,
      titulo: titulo(),
      fecha: fecha(),
      hora: hora(),
      descripcion: descripcion(),
      categoria: categoria(),
      duracion: duracion(),
      ubicacion: ubicacion(),
      capacidad: capacidad(),
      registrados: props.evento?.registrados || 0,
      precio: precio(),
      imagen: imagen(),
      estado: estado() as 'proximo' | 'activo' | 'completado',
      created_at: props.evento?.created_at,
      updated_at: props.evento?.updated_at
    });
  };

  return (
    <form onSubmit={handleSubmit} class="evento-form">
      <div class="form-group">
        <label for="titulo">Título del Evento</label>
        <input
          id="titulo"
          type="text"
          value={titulo()}
          onInput={(e) => setTitulo(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label for="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          value={fecha()}
          onInput={(e) => setFecha(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label for="hora">Hora</label>
        <input
          id="hora"
          type="time"
          value={hora()}
          onInput={(e) => setHora(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          value={descripcion()}
          onInput={(e) => setDescripcion(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label for="categoria">Categoría</label>
        <select
          id="categoria"
          value={categoria()}
          onChange={(e) => setCategoria(e.currentTarget.value)}
          required
        >
          <option value="">Seleccionar categoría</option>
          <option value="concierto">Concierto</option>
          <option value="exposicion">Exposición</option>
          <option value="teatro">Teatro</option>
          <option value="taller">Taller</option>
          <option value="conferencia">Conferencia</option>
        </select>
      </div>

      <div class="form-group">
        <label for="duracion">Duración (horas)</label>
        <input
          id="duracion"
          type="number"
          min="0.5"
          step="0.5"
          value={duracion()}
          onInput={(e) => setDuracion(Number(e.currentTarget.value))}
          required
        />
      </div>

      <div class="form-group">
        <label for="ubicacion">Ubicación</label>
        <input
          id="ubicacion"
          type="text"
          value={ubicacion()}
          onInput={(e) => setUbicacion(e.currentTarget.value)}
          required
        />
      </div>

      <div class="form-group">
        <label for="capacidad">Capacidad</label>
        <input
          id="capacidad"
          type="number"
          min="1"
          value={capacidad()}
          onInput={(e) => setCapacidad(Number(e.currentTarget.value))}
          required
        />
      </div>

      <div class="form-group">
        <label for="precio">Precio</label>
        <input
          id="precio"
          type="number"
          min="0"
          value={precio()}
          onInput={(e) => setPrecio(Number(e.currentTarget.value))}
          required
        />
      </div>

      <div class="form-group">
        <label for="imagen">URL de la Imagen</label>
        <input
          id="imagen"
          type="url"
          value={imagen()}
          onInput={(e) => setImagen(e.currentTarget.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div class="form-group">
        <label for="estado">Estado</label>
        <select
          id="estado"
          value={estado()}
          onChange={(e) => setEstado(e.currentTarget.value as 'proximo' | 'activo' | 'completado')}
        >
          <option value="proximo">Próximo</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secundario" onClick={props.onCancelar}>
          <FaSolidXmark /> Cancelar
        </button>
        <button type="submit" class="btn-primario">
          <FaSolidSave /> Guardar Evento
        </button>
      </div>
    </form>
  );
};

export default EventoForm; 