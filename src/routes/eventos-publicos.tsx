import { Component, createSignal, onMount, createEffect } from 'solid-js';
import type { Evento, FormularioRegistro, FiltroEvento } from '../types/eventos';
import { eventosService, registroEventosService, visitantesService, forceInvalidateCache } from '../lib/supabase/services';
import visitorStore from '../stores/visitorStore';
import { filtrarEventos, getCurrentTime } from '../utils/eventHelpers';
import { validarFormulario } from '../utils/validators';
import { generateEventCode, generateUniqueEventCode } from '../utils/codeGenerator';

// Componentes modulares
import Header from '../components/eventos/Header';
import EventFilters from '../components/eventos/EventFilters';
import EventGrid from '../components/eventos/EventGrid';
import EventModal from '../components/eventos/EventModal';

// Estilos
import '../styles/global.css';

const EventosPublicos: Component = () => {
  // Estados esenciales
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeFilter, setActiveFilter] = createSignal<FiltroEvento>('todos');
  const [searchTerm, setSearchTerm] = createSignal('');
  const [showRegistroModal, setShowRegistroModal] = createSignal(false);
  const [selectedEvento, setSelectedEvento] = createSignal<Evento | null>(null);
  const [currentTime, setCurrentTime] = createSignal(getCurrentTime());
  
  // Estado del formulario
  const [registroData, setRegistroData] = createSignal<FormularioRegistro>({
    nombre: '',
    email: '',
    telefono: ''
  });

  // Computed values
  const filteredEventos = () => filtrarEventos(eventos(), activeFilter(), searchTerm());

  // Funciones de carga de datos
  const cargarEventos = async () => {
    try {
      setIsLoading(true);
      console.log('🎭 Cargando eventos desde Supabase...');
      
      const eventosData = await eventosService.obtenerTodos();
      setEventos(eventosData);
      
      console.log('✅ Eventos cargados:', eventosData.length);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      // Fallback a datos mock si es necesario
      setEventos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const recargarEventos = () => {
    forceInvalidateCache();
    cargarEventos();
  };

  // Actualizar reloj cada minuto
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(interval);
  });

  // Cargar datos al montar
  onMount(() => {
    cargarEventos();
  });

  // Funciones del modal
  const openRegistroModal = (evento: Evento) => {
    setSelectedEvento(evento);
    setShowRegistroModal(true);
    limpiarFormulario();
  };

  const closeRegistroModal = () => {
    setShowRegistroModal(false);
    setSelectedEvento(null);
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setRegistroData({
      nombre: '',
      email: '',
      telefono: ''
    });
  };

  // Manejo de inputs
  const handleInputChange = (field: keyof FormularioRegistro, value: string) => {
    setRegistroData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones de registro
  const verificarRegistroExistente = (eventoId: string, email: string) => {
    const registros = localStorage.getItem('ccb_registros_usuario');
    if (!registros) return null;
    
    try {
      const registrosArray = JSON.parse(registros);
      return registrosArray.find((registro: any) => 
        registro.eventoId === eventoId && 
        registro.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error verificando registro existente:', error);
      return null;
    }
  };

  const guardarRegistroLocal = (eventoId: string, email: string, nombre: string, codigo: string, eventoTitulo: string) => {
    const registros = JSON.parse(localStorage.getItem('ccb_registros_usuario') || '[]');
    
    const nuevoRegistro = {
      eventoId,
      email: email.toLowerCase(),
      nombre,
      codigo,
      eventoTitulo,
      fechaRegistro: new Date().toISOString(),
      estado: 'confirmado'
    };
    
    registros.push(nuevoRegistro);
    localStorage.setItem('ccb_registros_usuario', JSON.stringify(registros));
    
    // Sincronizar con servicios administrativos
    sincronizarRegistroConAdmin(nuevoRegistro, eventoId);
    
    // 🔧 CORRECCIÓN: NO incrementar contador aquí - se hará solo si Supabase tiene éxito
    // actualizarContadorEventos(eventoId); // REMOVIDO para evitar duplicación
  };

  const sincronizarRegistroConAdmin = async (registro: any, eventoId: string) => {
    try {
      console.log('🔄 Sincronizando registro con servicios administrativos...', registro);
      
      // CORRECCIÓN: Verificar si ya existe el visitante primero usando visitorStore
      const visitanteExistente = visitorStore.findVisitor(registro.email);
      let visitanteCreado = visitanteExistente;
      
      if (!visitanteExistente) {
        // PASO 1: Crear visitante solo si no existe
        const visitanteData = {
          nombre: registro.nombre,
          apellido: '',
          email: registro.email,
          telefono: registro.telefono || '',
          codigo_unico: registro.codigo,
          fecha_registro: new Date().toISOString(),
        };
        
        visitanteCreado = await visitorStore.addVisitor(visitanteData);
        console.log('✅ Nuevo visitante creado:', visitanteCreado?.email);
      } else {
        console.log('✅ Visitante existente encontrado:', visitanteExistente.email);
      }
      
      // PASO 2: Crear registro de evento en Supabase (solo si visitante válido)
      if (visitanteCreado) {
        const registroEventoData = {
          evento_id: eventoId,
          visitante_id: visitanteCreado.id,
          codigo_confirmacion: registro.codigo, // 🔧 CORRECCIÓN: campo correcto del schema
          fecha_registro: new Date().toISOString(),
          estado: 'confirmado', // 🔧 CORRECCIÓN: usar schema real verificado
        };
        
        const registroCreado = await registroEventosService.crear(registroEventoData);
        console.log('✅ Registro de evento sincronizado:', registroCreado?.codigo_confirmacion);
        
        // 🔧 CORRECCIÓN DEFINITIVA: El trigger de BD ya incrementa automáticamente
        // NO necesitamos incrementar manualmente el contador
        if (registroCreado) {
          console.log('✅ Registro exitoso en Supabase - trigger de BD actualizará contador automáticamente');
          console.log('🔄 Invalidando cache para reflejar cambios...');
        } else {
          console.error('❌ Registro falló en Supabase');
        }
      } else {
        console.error('❌ Visitante no válido - NO incrementando contador');
      }
      
      // Invalidar cache para sincronización con panel admin
      forceInvalidateCache();
      console.log('🔄 Cache invalidado tras nuevo registro - Panel admin sincronizado');
      
    } catch (error) {
      console.error('❌ Error sincronizando registro con servicios administrativos:', error);
      console.log('⚠️ El registro local se guardó correctamente, solo falló la sincronización con Supabase');
      
      // Invalidar cache incluso si Supabase falla
      forceInvalidateCache();
    }
  };

  const actualizarContadorEventos = async (eventoId: string) => {
    console.log('📊 Actualizando contador para evento:', eventoId);
    
    try {
      // 🔧 CORRECCIÓN DEFINITIVA: Obtener valor actual desde Supabase ANTES de incrementar
      const eventoActual = await eventosService.obtenerPorId(eventoId);
      if (!eventoActual) {
        console.error('❌ Evento no encontrado en Supabase:', eventoId);
        return;
      }
      
      const registradosActuales = eventoActual.registrados || 0;
      const nuevosRegistrados = registradosActuales + 1;
      
      console.log(`📈 Incremento CORRECTO: ${registradosActuales} → ${nuevosRegistrados}`);
      
      // Actualizar PRIMERO en Supabase con valor exacto
      const eventoActualizado = await eventosService.actualizar(eventoId, {
        registrados: nuevosRegistrados, // ✅ Valor exacto calculado
        updated_at: new Date().toISOString()
      });
      
      if (eventoActualizado) {
        console.log('✅ Supabase actualizado exitosamente');
        
        // DESPUÉS actualizar estado local con el valor confirmado desde Supabase
        setEventos(prev => prev.map(evento => {
          if (evento.id === eventoId) {
            return {
              ...evento,
              registrados: nuevosRegistrados
            };
          }
          return evento;
        }));
        
        console.log('✅ Estado local sincronizado con Supabase - NO HAY DUPLICACIÓN');
      } else {
        console.error('❌ Error actualizando en Supabase - estado local NO modificado');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando contador de eventos:', error);
    }
  };

  const crearVisitanteDesdeEvento = (nombre: string, email: string, telefono: string) => {
    const visitantesGuardados = localStorage.getItem('visitantes_ccb') || '[]';
    const visitantes = JSON.parse(visitantesGuardados);
    
    const visitanteExistente = visitantes.find((v: any) => 
      v.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!visitanteExistente) {
      const nuevoVisitante = {
        id: `visitor-${Date.now()}-${Math.random()}`,
        nombre,
        email: email.toLowerCase(),
        telefono,
        fechaRegistro: new Date().toISOString()
      };
      
      visitantes.push(nuevoVisitante);
      localStorage.setItem('visitantes_ccb', JSON.stringify(visitantes));
      console.log('✅ Nuevo visitante guardado en localStorage:', email);
    }
  };

  const handleRegistro = async (evento: Evento) => {
    if (!validarFormulario(registroData())) {
      alert('❌ Por favor, completa todos los campos requeridos.');
      return;
    }

    const data = registroData();
    
    // Verificar si ya está registrado
    const registroExistente = verificarRegistroExistente(evento.id, data.email);
    if (registroExistente) {
      const fechaRegistro = new Date(registroExistente.fechaRegistro).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      alert(`ℹ️ Ya estás registrado en este evento!\n\n👤 Nombre: ${registroExistente.nombre}\n📧 Email: ${registroExistente.email}\n🎫 Código: ${registroExistente.codigo}\n📅 Registrado: ${fechaRegistro}\n\n💡 Guarda tu código para hacer check-in el día del evento.`);
      closeRegistroModal();
      return;
    }

    try {
      // 1. Crear visitante general si no existe
      crearVisitanteDesdeEvento(data.nombre, data.email, data.telefono);
      
      // 2. Generar código único garantizado verificando BD
      console.log('🎫 Generando código único para evento:', evento.titulo);
      const codigo = await generateUniqueEventCode(
        evento.id, 
        data.email,
        registroEventosService.verificarCodigoExiste
      );
      console.log('✅ Código único generado:', codigo);
      
      // 3. Guardar registro de evento
      guardarRegistroLocal(evento.id, data.email, data.nombre, codigo, evento.titulo);
      
      // 4. Mensaje de confirmación
      alert(`🎉 ¡Registro exitoso!\n\n👤 ${data.nombre}\n📧 ${data.email}\n🎫 ${codigo}\n\n📧 Recibirás un email con la información del evento.\n💾 Tus datos se han guardado para futuras visitas.\n💡 Guarda tu código para hacer check-in el día del evento.`);
      
      closeRegistroModal();
    } catch (error) {
      console.error('❌ Error durante el registro:', error);
      alert('❌ Error generando código único. Por favor, intenta nuevamente.');
    }
  };

  const mostrarHistorialRegistros = () => {
    const registros = localStorage.getItem('ccb_registros_usuario');
    if (!registros) {
      alert('📋 No tienes registros de eventos aún.\n\n¡Regístrate en algún evento para comenzar!');
      return;
    }
    
    try {
      const registrosArray = JSON.parse(registros);
      if (registrosArray.length === 0) {
        alert('📋 No tienes registros de eventos aún.\n\n¡Regístrate en algún evento para comenzar!');
        return;
      }
      
      let mensaje = '📋 TUS REGISTROS DE EVENTOS:\n\n';
      registrosArray.forEach((registro: any, index: number) => {
        const fecha = new Date(registro.fechaRegistro).toLocaleDateString('es-ES');
        mensaje += `${index + 1}. ${registro.eventoTitulo}\n`;
        mensaje += `   📧 ${registro.email}\n`;
        mensaje += `   🎫 ${registro.codigo}\n`;
        mensaje += `   📅 ${fecha}\n\n`;
      });
      
      alert(mensaje);
    } catch (error) {
      console.error('Error mostrando historial:', error);
      alert('❌ Error al cargar el historial de registros.');
    }
  };

  return (
    <div style="min-height: 100vh; background: #F8FAFC; margin: 0; padding: 0; width: 100vw; box-sizing: border-box;">
      {/* Header */}
      <Header 
        currentTime={currentTime()}
        onHistorialClick={mostrarHistorialRegistros}
        onActualizarClick={recargarEventos}
      />

      {/* Filtros */}
      <EventFilters 
        activeFilter={activeFilter()}
        onFilterChange={setActiveFilter}
        searchTerm={searchTerm()}
        onSearchChange={setSearchTerm}
      />

      {/* Contenido Principal */}
      <main style="padding: 2rem;">
        <EventGrid 
          eventos={filteredEventos()}
          isLoading={isLoading()}
          onEventoClick={openRegistroModal}
        />
      </main>

      {/* Modal de Registro */}
      <EventModal 
        show={showRegistroModal()}
        evento={selectedEvento()}
        registroData={registroData()}
        onClose={closeRegistroModal}
        onRegistro={handleRegistro}
        onInputChange={handleInputChange}
      />

      {/* Estilos adicionales */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          main {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EventosPublicos;
