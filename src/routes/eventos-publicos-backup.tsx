import { useDrag } from 'solid-gesture';
import { FaSolidHouse } from 'solid-icons/fa';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { eventosService, registroEventosService, visitantesService, forceInvalidateCache } from '../lib/supabase/services';
import '../styles/global.css';

const EventosPublicos: Component = () => {
  const [eventos, setEventos] = createSignal<any[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [activeFilter, setActiveFilter] = createSignal('todos');
  const [showRegistroModal, setShowRegistroModal] = createSignal(false);
  const [selectedEvento, setSelectedEvento] = createSignal<any>(null);
  const [showSyncInfo, setShowSyncInfo] = createSignal(false);
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = createSignal('');
  const [searchCategory, setSearchCategory] = createSignal('todos');
  const [isSearchVisible, setIsSearchVisible] = createSignal(false);
  
  // Estados para gestos de swipe
  const [currentEventIndex, setCurrentEventIndex] = createSignal(0);
  const [swipeOffset, setSwipeOffset] = createSignal(0);
  const [isSwipeMode, setIsSwipeMode] = createSignal(false);

  // Estados para manejar datos del formulario
  const [registroData, setRegistroData] = createSignal({
    nombre: '',
    email: '',
    telefono: ''
  });

  // Estados para check-in
  const [checkinData, setCheckinData] = createSignal({
    codigo: '',
    telefono: '',
    email: '',
    metodo: 'codigo' // 'codigo', 'telefono', 'email'
  });

  // NUEVOS ESTADOS PARA INTEGRACIÓN
  const [showVisitorSearch, setShowVisitorSearch] = createSignal(false);
  const [searchResults, setSearchResults] = createSignal<any>(null);
  const [searchValue, setSearchValue] = createSignal('');

  // Estados para Sala Virtual
  const [tipoRegistroVirtual, setTipoRegistroVirtual] = createSignal('individual'); // 'individual' o 'grupal'
  
  // Estados para registro grupal (Sala Virtual)
  const [registroGrupal, setRegistroGrupal] = createSignal({
    // Información institucional
    institucion: '',
    tipoInstitucion: 'colegio', // colegio, universidad, ong, empresa
    
    // Responsable
    nombreResponsable: '',
    cargoResponsable: '',
    emailResponsable: '',
    telefonoResponsable: '',
    
    // Grupo
    numeroParticipantes: '',
    rangoEdades: '',
    nivelEducativo: 'primaria', // primaria, secundaria, universidad, adultos
    
    // Visita
    proposito: 'educativo', // educativo, recreativo, cultural
    fechaPreferida: '',
    horaPreferida: '',
    duracionEstimada: '60', // en minutos
    
    // Adicionales
    requerimientosEspeciales: '',
    visitasPrevias: false,
    comentarios: ''
  });

  // Agregar estilos CSS para la aplicación
  const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      
      @media (max-width: 768px) {
        .mobile-swipe-container {
          display: block !important;
        }
        .desktop-grid {
          display: none !important;
        }
      }
      
      @media (min-width: 769px) {
        .mobile-swipe-container {
          display: none !important;
        }
        .desktop-grid {
          display: grid !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  onMount(async () => {
    addStyles();
    await loadEventos();
  });

  const loadEventos = async () => {
    console.log('📅 Cargando eventos públicos...');
    try {
      const eventosData = await eventosService.obtenerTodos();
      console.log('📊 Eventos obtenidos:', eventosData);
      
      // TEMPORAL: Mostrar TODOS los eventos para diagnóstico
      console.log('🔍 TODOS los eventos obtenidos:', eventosData);
      console.log('🔍 Estados de eventos:');
      eventosData.forEach((evento: any, index: number) => {
        console.log(`   ${index + 1}. "${evento.titulo}" - Estado: "${evento.estado}"`);
      });
      
      // Mostrar eventos activos y próximos (excluir solo completados)
      const eventosDisponibles = eventosData.filter((evento: any) => 
        evento.estado === 'activo' || evento.estado === 'proximo'
      );
      console.log('🎯 Eventos disponibles filtrados:', eventosDisponibles);
      
      setEventos(eventosDisponibles);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para recargar eventos (útil para sincronización)
  const recargarEventos = async () => {
    console.log('🔄 Recargando eventos públicos...');
    setIsLoading(true);
    try {
      const eventosData = await eventosService.obtenerTodos();
      console.log('📊 Eventos recargados:', eventosData);
      
      // TEMPORAL: Mostrar TODOS los eventos recargados para diagnóstico
      console.log('🔍 TODOS los eventos recargados:', eventosData);
      console.log('🔍 Estados de eventos recargados:');
      eventosData.forEach((evento: any, index: number) => {
        console.log(`   ${index + 1}. "${evento.titulo}" - Estado: "${evento.estado}"`);
      });
      
      // Mostrar eventos activos y próximos (excluir solo completados)
      const eventosDisponibles = eventosData.filter((evento: any) => 
        evento.estado === 'activo' || evento.estado === 'proximo'
      );
      console.log('🎯 Eventos disponibles después de recarga:', eventosDisponibles);
      
      setEventos(eventosDisponibles);
    } catch (error) {
      console.error('❌ Error recargando eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 TEMPORAL: Auto-recarga deshabilitada para evitar duplicados
  // TODO: Mover a onMount() para evitar múltiples intervalos
  // setInterval(() => {
  //   console.log('⏰ Auto-recarga de eventos (cada 30s)');
  //   recargarEventos();
  // }, 30000);

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
    
    // Si el evento ya terminó
    if (now > eventEndTime) {
      return { status: 'Finalizado', color: '#6B7280', bgColor: '#F3F4F6' };
    } 
    // Si el evento está en curso (30 min antes hasta que termine)
    else if (now >= thirtyMinBefore && now <= eventEndTime) {
      return { status: 'En curso', color: '#059669', bgColor: '#D1FAE5' };
    } 
    // Si el evento está próximo pero ya disponible para registros
    else {
      // Verificar si el evento está disponible para registros
      const capacidad = evento.capacidad ?? evento.capacidad_maxima ?? 200;
      const registrados = evento.registrados ?? 0;
      const cuposDisponibles = evento.cupos_disponibles ?? (capacidad - registrados);
      const tieneCapacidad = cuposDisponibles > 0 && !evento.esta_lleno;
      
      // Si tiene capacidad disponible, considerarlo activo
      if (tieneCapacidad) {
        return { status: 'Activo', color: '#059669', bgColor: '#D1FAE5' };
      } else {
        return { status: 'Próximamente', color: '#EA580C', bgColor: '#FED7AA' };
      }
    }
  };

  // Función para generar código único TOTALMENTE NUEVA
  const generateEventCode = (eventId: string, userEmail: string) => {
    // Usar múltiples fuentes de aleatoriedad
    const ahora = new Date();
    const timestamp = ahora.getTime();
    const milisegundos = ahora.getMilliseconds();
    const random1 = Math.floor(Math.random() * 9999);
    const random2 = Math.floor(Math.random() * 999);
    
    // Crear string único combinando todo
    const cadenaUnica = `${timestamp}-${milisegundos}-${random1}-${random2}-${userEmail}`;
    
    // Generar hash corto
    let hash = '';
    for (let i = 0; i < cadenaUnica.length; i += 3) {
      hash += cadenaUnica.charCodeAt(i).toString(36);
    }
    
    // Tomar solo 6 caracteres y asegurar que sean únicos
    const codigoFinal = `CCB-${hash.slice(0, 6).toUpperCase()}`;
    
    console.log('🎫 DEBUG - timestamp:', timestamp);
    console.log('🎫 DEBUG - random1:', random1);  
    console.log('🎫 DEBUG - hash generado:', hash.slice(0, 6));
    console.log('🎫 CÓDIGO FINAL:', codigoFinal);
    
    return codigoFinal;
  };

  // ========== FUNCIONES DE INTEGRACIÓN HÍBRIDA ==========

  // Función para buscar visitante en base general
  const buscarVisitanteGeneral = (email: string, telefono: string) => {
    const visitantesData = localStorage.getItem('visitantes_ccb');
    if (!visitantesData) return null;
    
    try {
      const visitantes = JSON.parse(visitantesData);
      
      // Normalizar datos de búsqueda
      const emailNormalizado = email.toLowerCase().trim();
      const telefonoNormalizado = telefono.replace(/[\s\-\(\)]/g, '');
      
      return visitantes.find((visitante: any) => {
        const visitanteEmail = visitante.email?.toLowerCase().trim();
        const visitanteTelefono = visitante.telefono?.replace(/[\s\-\(\)]/g, '');
        
        return (emailNormalizado && visitanteEmail === emailNormalizado) ||
               (telefonoNormalizado && visitanteTelefono === telefonoNormalizado);
      });
    } catch (error) {
      console.error('Error al buscar visitante:', error);
      return null;
    }
  };

  // Función para sincronizar visitante a eventos si no existe
  const sincronizarVisitanteAEventos = (visitante: any, eventoId: string, eventoTitulo: string) => {
    // Verificar si ya existe en eventos
    const registroExistente = verificarRegistroExistente(eventoId, visitante.email);
    if (registroExistente) return registroExistente.codigo;
    
    // Crear nuevo registro de evento
    const codigo = generateEventCode(eventoId, visitante.email);
    guardarRegistroLocal(eventoId, visitante.email, visitante.nombre, codigo, eventoTitulo);
    
    return codigo;
  };

  // Función para crear visitante general desde registro de evento
  const crearVisitanteDesdeEvento = (nombre: string, email: string, telefono: string) => {
    const visitantesData = localStorage.getItem('visitantes_ccb');
    let visitantes = [];
    
    if (visitantesData) {
      try {
        visitantes = JSON.parse(visitantesData);
      } catch (error) {
        console.error('Error al parsear visitantes:', error);
        visitantes = [];
      }
    }
    
    // Verificar si ya existe
    const existe = visitantes.find((v: any) => 
      v.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (!existe) {
      const nuevoVisitante = {
        nombre,
        email,
        telefono: telefono || '',
        comunicacion: 'CORREO ELECTRÓNICO',
        aceptaUso: true,
        fechaRegistro: new Date().toISOString(),
        ultimaVisita: new Date().toISOString()
      };
      
      visitantes.push(nuevoVisitante);
      localStorage.setItem('visitantes_ccb', JSON.stringify(visitantes));
    }
  };

  // Función expandida para check-in híbrido
  const buscarParaCheckin = (metodo: string, valor: string) => {
    if (metodo === 'codigo') {
      // Buscar por código en registros de eventos
      const registrosData = localStorage.getItem('ccb_registros_usuario');
      if (!registrosData) return null;
      
      try {
        const registros = JSON.parse(registrosData);
        return registros.find((registro: any) => 
          registro.codigo.toUpperCase() === valor.toUpperCase()
        );
      } catch (error) {
        console.error('Error al buscar por código:', error);
        return null;
      }
    } else {
      // Buscar por email o teléfono en ambas bases
      const email = metodo === 'email' ? valor : '';
      const telefono = metodo === 'telefono' ? valor : '';
      
      // Primero buscar en visitantes generales
      const visitante = buscarVisitanteGeneral(email, telefono);
      if (visitante) {
        return {
          tipo: 'visitante_general',
          nombre: visitante.nombre,
          email: visitante.email,
          telefono: visitante.telefono,
          ultimaVisita: visitante.ultimaVisita
        };
      }
      
      // Luego buscar en registros de eventos
      const registrosData = localStorage.getItem('ccb_registros_usuario');
      if (registrosData) {
        try {
          const registros = JSON.parse(registrosData);
          const registro = registros.find((r: any) => {
            if (metodo === 'email') {
              return r.email?.toLowerCase() === valor.toLowerCase();
            } else {
              // Para teléfono, buscar en registros que tengan teléfono
              return false; // Los registros de eventos no siempre tienen teléfono
            }
          });
          
          if (registro) {
            return {
              tipo: 'registro_evento',
              nombre: registro.nombre,
              email: registro.email,
              codigo: registro.codigo,
              eventoTitulo: registro.eventoTitulo
            };
          }
        } catch (error) {
          console.error('Error al buscar en registros de eventos:', error);
        }
      }
      
      return null;
    }
  };

  // Función para manejar búsqueda de visitante para pre-llenado
  const buscarVisitanteParaEvento = () => {
    const valor = searchValue().trim();
    if (!valor) {
      alert('❌ Por favor, ingresa tu email o teléfono para buscar tus datos.');
      return;
    }
    
    // Detectar automáticamente si es email o teléfono
    const esEmail = valor.includes('@');
    const email = esEmail ? valor : '';
    const telefono = esEmail ? '' : valor;
    
    const visitante = buscarVisitanteGeneral(email, telefono);
    
    if (visitante) {
      // Pre-llenar formulario con datos encontrados
      setRegistroData({
        nombre: visitante.nombre,
        email: visitante.email,
        telefono: visitante.telefono || ''
      });
      
      setSearchResults(visitante);
      setShowVisitorSearch(false);
      
      const ultimaVisita = new Date(visitante.ultimaVisita).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const tipoDetectado = esEmail ? 'email' : 'teléfono';
      alert(`✅ ¡Datos encontrados por ${tipoDetectado}!\n\n👤 ${visitante.nombre}\n📧 ${visitante.email}\n📱 ${visitante.telefono}\n📅 Última visita: ${ultimaVisita}\n\n✨ Formulario completado automáticamente.`);
    } else {
      const tipoDetectado = esEmail ? 'email' : 'teléfono';
      alert(`❌ No encontramos datos con ese ${tipoDetectado}.\n\n💡 Puedes registrarte normalmente y tus datos se guardarán para futuras visitas.`);
      setSearchResults(null);
    }
  };

  // Función para verificar si el usuario ya está registrado en un evento
  const verificarRegistroExistente = (eventoId: string, email: string) => {
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    if (!registrosGuardados) return null;
    
    try {
      const registros = JSON.parse(registrosGuardados);
      return registros.find((registro: any) => 
        registro.eventoId === eventoId && 
        registro.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error al verificar registros existentes:', error);
      return null;
    }
  };

  // Función para guardar registro en localStorage
  const guardarRegistroLocal = (eventoId: string, email: string, nombre: string, codigo: string, eventoTitulo: string) => {
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    let registros = [];
    
    if (registrosGuardados) {
      try {
        registros = JSON.parse(registrosGuardados);
      } catch (error) {
        console.error('Error al parsear registros guardados:', error);
        registros = [];
      }
    }
    
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

    // NUEVA: Sincronizar con servicios administrativos
    sincronizarRegistroConAdmin(nuevoRegistro, eventoId);
    
    // ✅ ACTUALIZAR CONTADOR SIEMPRE (independiente de Supabase)
    console.log('🔥 Actualizando contador localmente...');
    actualizarContadorEventos(eventoId);
  };

  // NUEVA FUNCIÓN: Sincronizar registro con servicios administrativos
  const sincronizarRegistroConAdmin = async (registro: any, eventoId: string) => {
    try {
      console.log('🔄 Sincronizando registro con servicios administrativos...', registro);
      
      // PASO 1: Crear/buscar visitante en Supabase
      const visitanteData = {
        nombre: registro.nombre,
        apellido: '', // Si no tienes apellido, usar string vacío
        email: registro.email,
        telefono: registro.telefono || '',
        codigo_unico: registro.codigo, // ✅ AGREGADO: código CCB único
        fecha_registro: new Date().toISOString(),
        estado: 'activo' as const
      };
      
      console.log('👤 Verificando si visitante ya existe:', registro.email);
      
      // Crear visitante (permitir emails duplicados para múltiples eventos)
      console.log('👤 Creando visitante en Supabase:', visitanteData);
      const visitanteCreado = await visitantesService.crear(visitanteData);
      
      if (!visitanteCreado) {
        console.log('❌ No se pudo crear visitante en Supabase');
        return;
      }
      
      console.log('✅ Visitante creado:', visitanteCreado.id);
      
      // PASO 2: Registrar en evento con ID real del visitante
      console.log('📝 Registrando en evento con ID real del visitante');
      await registroEventosService.registrarVisitanteEnEvento(
        visitanteCreado.id, // ✅ Ahora usando ID real del visitante
        eventoId,
        registro.codigo
      );
      
      console.log('✅ Registro sincronizado exitosamente con servicios administrativos');
      
      // ✅ FORZAR ACTUALIZACIÓN DE CONTADOR SIEMPRE
      console.log('🔥 FORZANDO actualización de contador desde Supabase...');
      
      // ✅ INVALIDAR CACHE PARA SINCRONIZACIÓN CON PANEL ADMIN
      forceInvalidateCache();
      console.log('🔄 Cache invalidado tras nuevo registro - Panel admin sincronizado');
      
    } catch (error) {
      console.error('❌ Error sincronizando registro con servicios administrativos:', error);
      console.log('⚠️ El registro local se guardó correctamente, solo falló la sincronización con Supabase');
      
      // ✅ INVALIDAR CACHE INCLUSO SI SUPABASE FALLA
      forceInvalidateCache();
    }
  };

  // NUEVA FUNCIÓN: Actualizar contador de registrados en eventos  
  const actualizarContadorEventos = (eventoId: string) => {
    console.log('📊 Actualizando contador para evento:', eventoId);
    
    try {
      // 1. Actualizar estado local (eventos públicos)
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          console.log(`📈 Evento ${evento.titulo}: ${evento.registrados} → ${evento.registrados + 1}`);
          return {
            ...evento,
            registrados: (evento.registrados || 0) + 1
          };
        }
        return evento;
      }));

      // 2. CRÍTICO: Actualizar localStorage para sincronizar con panel admin
      const eventosGuardados = localStorage.getItem('ccb_eventos_mock');
      if (eventosGuardados) {
        const eventos = JSON.parse(eventosGuardados);
        const eventoIndex = eventos.findIndex((e: any) => e.id === eventoId);
        
        if (eventoIndex !== -1) {
          eventos[eventoIndex].registrados = (eventos[eventoIndex].registrados || 0) + 1;
          eventos[eventoIndex].updated_at = new Date().toISOString();
          
          localStorage.setItem('ccb_eventos_mock', JSON.stringify(eventos));
          console.log('✅ Contador sincronizado en localStorage para panel admin');
        }
      }

      // 3. 🚨 CORRECCIÓN: NO actualizar contador aquí porque ya se actualizó en setEventos()
      // La sincronización con eventosService debe usar el valor ACTUAL, no incrementarlo otra vez
      try {
        const eventoActual = eventos().find(e => e.id === eventoId);
        if (eventoActual) {
          console.log(`🔧 CORRECCIÓN: Sincronizando valor actual sin incrementar: ${eventoActual.registrados}`);
          
          // Esto asegura que el panel admin vea los cambios inmediatamente
          if (eventosService && eventosService.actualizar) {
            eventosService.actualizar(eventoId, { 
              registrados: eventoActual.registrados, // ✅ USAR VALOR ACTUAL (ya incrementado)
              updated_at: new Date().toISOString()
            }).then(() => {
              console.log('✅ EventosService sincronizado SIN duplicación');
            }).catch((err) => {
              console.log('⚠️ Error en sincronización eventosService:', err);
            });
          }
        }
      } catch (syncError) {
        console.log('⚠️ Sincronización con eventosService falló, pero localStorage OK:', syncError);
      }

    } catch (error) {
      console.error('❌ Error actualizando contador de eventos:', error);
    }
  };

  // Función para validar formulario
  const validarFormulario = () => {
    const data = registroData();
    return data.nombre.trim() !== '' && data.email.trim() !== '' && data.email.includes('@');
  };

  // Función para validar check-in
  const validarCheckin = () => {
    const data = checkinData();
    if (data.metodo === 'codigo') {
      return data.codigo.trim() !== '' && data.codigo.includes('CCB-');
    } else if (data.metodo === 'email') {
      return data.email.trim() !== '' && data.email.includes('@');
    } else if (data.metodo === 'telefono') {
      return data.telefono.trim() !== '' && data.telefono.length >= 10;
    }
    return false;
  };

  // Función para manejar cambios en inputs
  const handleInputChange = (field: string, value: string) => {
    setRegistroData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en check-in
  const handleCheckinChange = (field: string, value: string) => {
    setCheckinData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para limpiar formulario
  const limpiarFormulario = () => {
    setRegistroData({
      nombre: '',
      email: '',
      telefono: ''
    });
    setCheckinData({
      codigo: '',
      telefono: '',
      email: '',
      metodo: 'codigo'
    });
    setShowVisitorSearch(false);
    setSearchResults(null);
    setSearchValue('');
  };

  // Función para abrir modal de registro
  const openRegistroModal = (evento: any) => {
    setSelectedEvento(evento);
    setShowRegistroModal(true);
    limpiarFormulario(); // Limpiar formulario al abrir
  };

  // Función mejorada para formatear fecha completa en español
  const formatDate = (fecha: string) => {
    const date = new Date(fecha);
    
    // Para la tarjeta compacta (día y mes)
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    
    // Para la fecha completa
    const fechaCompleta = date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Para fecha compacta con año
    const fechaCompacta = date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    return { day, month, fechaCompleta, fechaCompacta };
  };

  // Función mejorada para formatear hora en formato de 12 horas
  const formatTime = (hora: string) => {
    const date = new Date(`2000-01-01T${hora}`);
    
    // Hora en formato 12 horas (AM/PM) con formato español limpio
    const hora12 = date.toLocaleTimeString('es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\sa\.\sm\./, ' AM').replace(/\sp\.\sm\./, ' PM');
    
    // Hora en formato 24 horas
    const hora24 = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return { hora12, hora24 };
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar estado de disponibilidad del evento
  const obtenerEstadoDisponibilidad = (evento: any) => {
    // PRIMERA VERIFICACIÓN: Si el evento ya finalizó, no permitir registros
    const now = new Date();
    const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`);
    const eventEndTime = new Date(eventDateTime.getTime() + (evento.duracion * 60 * 60 * 1000));
    
    // Si el evento ya terminó (más de 30 minutos después del fin)
    const thirtyMinAfterEnd = new Date(eventEndTime.getTime() + (30 * 60 * 1000));
    if (now > thirtyMinAfterEnd) {
      return {
        disponible: false,
        estado: 'finalizado',
        cuposDisponibles: 0,
        mensaje: 'Evento Finalizado',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        icono: '🏁'
      };
    }
    
    const cuposDisponibles = evento.cupos_disponibles ?? (evento.capacidad - evento.registrados);
    const capacidad = evento.capacidad_maxima ?? evento.capacidad ?? 200;
    const registrados = evento.registrados ?? 0;
    const porcentajeOcupacion = (registrados / capacidad) * 100;
    
    if (cuposDisponibles <= 0 || evento.esta_lleno === true) {
      return {
        disponible: false,
        estado: 'agotado',
        cuposDisponibles: 0,
        mensaje: 'Evento Agotado',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        icono: '🚫'
      };
    } else if (cuposDisponibles <= 5 || porcentajeOcupacion >= 90) {
      return {
        disponible: true,
        estado: 'ultimos_cupos',
        cuposDisponibles,
        mensaje: `¡Últimos ${cuposDisponibles} cupos!`,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        icono: '⚡'
      };
    } else {
      return {
        disponible: true,
        estado: 'disponible',
        cuposDisponibles,
        mensaje: `${cuposDisponibles} cupos disponibles`,
        color: '#059669',
        bgColor: '#D1FAE5',
        icono: '✅'
      };
    }
  };

  // Funciones para navegación con gestos
  const goToNextEvent = () => {
    const filtered = filteredEventos();
    if (filtered.length > 0) {
      setCurrentEventIndex((prev) => (prev + 1) % filtered.length);
    }
  };

  const goToPrevEvent = () => {
    const filtered = filteredEventos();
    if (filtered.length > 0) {
      setCurrentEventIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    }
  };

  // Configuración del gesto de drag
  const bind = useDrag(({ down, movement: [mx, my], velocity: [vx], direction: [dx] }) => {
    const filtered = filteredEventos();
    if (filtered.length === 0) return;

    // Solo activar swipe mode en móvil/touch devices
    if (down && !isSwipeMode()) {
      setIsSwipeMode(true);
    }

    if (down) {
      // Durante el arrastre, mostrar el offset
      setSwipeOffset(mx);
    } else {
      // Al soltar, decidir si cambiar de evento
      const threshold = 50; // Umbral mínimo para cambiar evento
      const speedThreshold = 0.2; // Velocidad mínima

      if (Math.abs(mx) > threshold || Math.abs(vx) > speedThreshold) {
        if (dx > 0) {
          // Swipe hacia la derecha (evento anterior)
          goToPrevEvent();
        } else {
          // Swipe hacia la izquierda (evento siguiente)
          goToNextEvent();
        }
      }

      // Resetear offset y swipe mode
      setSwipeOffset(0);
      setTimeout(() => setIsSwipeMode(false), 300);
    }
  }, {
    axis: 'x', // Solo permitir swipe horizontal
    preventScroll: false, // No prevenir scroll vertical
    threshold: 10 // Threshold para iniciar drag
  });

  // Función para determinar el tipo de modal (registro o check-in)
  const getTipoModal = (evento: any) => {
    if (isSalaVirtual(evento)) {
      return 'sala_virtual';
    }
    
    // Si el evento está activo Y tiene registrados, mostrar check-in
    // Si el evento está activo pero SIN registrados, permitir registro directo
    if (isEventoActivo(evento)) {
      const tieneRegistrados = evento.registrados > 0;
      return tieneRegistrados ? 'checkin' : 'registro';
    }
    
    // Si no está activo, siempre mostrar registro
    return 'registro';
  };

  // Función para detectar si es evento de Sala Virtual
  const isSalaVirtual = (evento: any) => {
    return evento.tipo === 'sala_virtual' || 
           evento.titulo.toLowerCase().includes('sala virtual') ||
           evento.titulo.toLowerCase().includes('virtual');
  };

  // Función para manejar cambios en registro grupal
  const handleRegistroGrupalChange = (field: string, value: any) => {
    setRegistroGrupal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para validar registro grupal
  const validarRegistroGrupal = () => {
    const data = registroGrupal();
    return data.institucion.trim() !== '' &&
           data.nombreResponsable.trim() !== '' &&
           data.emailResponsable.trim() !== '' &&
           data.emailResponsable.includes('@') &&
           data.telefonoResponsable.trim() !== '' &&
           data.numeroParticipantes !== '' &&
           parseInt(data.numeroParticipantes) > 1 &&
           data.fechaPreferida !== '';
  };

  // Función para limpiar formularios virtuales
  const limpiarFormulariosVirtual = () => {
    setTipoRegistroVirtual('individual');
    setRegistroGrupal({
      institucion: '',
      tipoInstitucion: 'colegio',
      nombreResponsable: '',
      cargoResponsable: '',
      emailResponsable: '',
      telefonoResponsable: '',
      numeroParticipantes: '',
      rangoEdades: '',
      nivelEducativo: 'primaria',
      proposito: 'educativo',
      fechaPreferida: '',
      horaPreferida: '',
      duracionEstimada: '60',
      requerimientosEspeciales: '',
      visitasPrevias: false,
      comentarios: ''
    });
  };

  // Función para mostrar historial de registros del usuario
  const mostrarHistorialRegistros = () => {
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    
    if (!registrosGuardados) {
      alert('📋 No tienes registros guardados.\n\n💡 Cuando te registres a un evento, aparecerá aquí tu historial.');
      return;
    }
    
    try {
      const registros = JSON.parse(registrosGuardados);
      
      if (registros.length === 0) {
        alert('📋 No tienes registros guardados.\n\n💡 Cuando te registres a un evento, aparecerá aquí tu historial.');
        return;
      }
      
      let mensaje = `📋 Tu Historial de Registros (${registros.length} eventos)\n\n`;
      
      registros.forEach((registro: any, index: number) => {
        const fechaRegistro = new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        
        mensaje += `${index + 1}. 🎪 ${registro.eventoTitulo}\n`;
        mensaje += `   👤 ${registro.nombre}\n`;
        mensaje += `   🎫 ${registro.codigo}\n`;
        mensaje += `   📅 ${fechaRegistro}\n\n`;
      });
      
      mensaje += '💡 Guarda tus códigos para hacer check-in en los eventos.';
      
      alert(mensaje);
    } catch (error) {
      console.error('Error al mostrar historial:', error);
      alert('❌ Error al cargar tu historial de registros.');
    }
  };

  // NUEVA FUNCIÓN: Verificar estado de registros para debugging
  const verificarEstadoRegistros = () => {
    const registrosGuardados = localStorage.getItem('ccb_registros_usuario');
    const visitantesGuardados = localStorage.getItem('visitantes_ccb');
    
    console.log('📊 ESTADO ACTUAL DE REGISTROS:');
    
    if (registrosGuardados) {
      try {
        const registros = JSON.parse(registrosGuardados);
        console.log(`✅ Registros de eventos: ${registros.length}`);
        registros.forEach((registro: any, index: number) => {
          console.log(`   ${index + 1}. ${registro.nombre} - ${registro.eventoTitulo} - ${registro.codigo}`);
        });
      } catch (error) {
        console.error('❌ Error leyendo registros de eventos:', error);
      }
    } else {
      console.log('🚫 No hay registros de eventos en localStorage');
    }
    
    if (visitantesGuardados) {
      try {
        const visitantes = JSON.parse(visitantesGuardados);
        console.log(`✅ Visitantes generales: ${visitantes.length}`);
      } catch (error) {
        console.error('❌ Error leyendo visitantes generales:', error);
      }
    } else {
      console.log('🚫 No hay visitantes generales en localStorage');
    }
  };

  // Exponer función global para verificación desde consola del navegador
  (window as any).verificarRegistrosCCB = verificarEstadoRegistros;

  return (
    <div style="min-height: 100vh; background: #F8FAFC; margin: 0; padding: 0;">
      {/* Header con logo CCB y navegación */}
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
        
        <div style="position: absolute; left: 50%; transform: translateX(-50%); display: flex; align-items: center;">
          <span style="color: white; font-size: 1.8rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: 0.5px;">Próximas actividades</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <button 
            onclick={() => window.location.href = '/'}
            style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.6rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;"
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            title="Ir a la página principal"
          >
            <FaSolidHouse size={20} color="white" />
          </button>
          <button 
            onclick={mostrarHistorialRegistros}
            style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
            }}
            title="Ver mi historial de registros"
          >
            📋 Mis Registros
          </button>
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
          <div style="padding: 0.75rem;">
            
            {/* Navegación de eventos en móvil con swipe */}
            <div class="mobile-swipe-container">
              {/* Indicador de evento actual */}
              <div style="text-align: center; margin-bottom: 1rem;">
                <span style="color: #6B7280; font-size: 0.9rem; font-weight: 500;">
                  Evento {currentEventIndex() + 1} de {filteredEventos().length}
                </span>
                <div style="display: flex; justify-content: center; gap: 0.25rem; margin-top: 0.5rem;">
                  <For each={filteredEventos()}>
                    {(_, index) => (
                      <div 
                        style={`width: 6px; height: 6px; border-radius: 50%; transition: all 0.3s; ${
                          index() === currentEventIndex() 
                            ? 'background: #0EA5E9;' 
                            : 'background: #E5E7EB;'
                        }`}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Hint de swipe */}
              <Show when={!isSwipeMode()}>
                <div style="text-align: center; margin-bottom: 1rem; opacity: 0.7; animation: fadeInOut 2s infinite;">
                  <span style="color: #6B7280; font-size: 0.8rem;">
                    👆 Desliza para ver más eventos
                  </span>
                </div>
              </Show>

              {/* Contenedor de evento con swipe */}
              <div 
                {...bind()}
                style={`
                  position: relative; 
                  overflow: hidden; 
                  touch-action: pan-y;
                  transform: translateX(${swipeOffset()}px);
                  transition: ${isSwipeMode() ? 'none' : 'transform 0.3s ease'};
                `}
              >
                <Show when={filteredEventos()[currentEventIndex()]} keyed>
                  {(evento) => {
                    const dateInfo = formatDate(evento.fecha);
                    const statusInfo = getEventStatus(evento);
                    
                    // Función para obtener el estilo de la categoría del evento
                    const getCategoryStyle = (titulo: string) => {
                      const tituloLower = titulo.toLowerCase();
                      
                      if (tituloLower.includes('concierto') || tituloLower.includes('música') || tituloLower.includes('jazz')) {
                        return { 
                          bg: 'linear-gradient(135deg, #06B6D4, #0891B2)', 
                          icon: '🎵', 
                          label: 'MÚSICA',
                          labelColor: '#06B6D4'
                        };
                      } else if (tituloLower.includes('exposición') || tituloLower.includes('arte') || tituloLower.includes('galería')) {
                        return { 
                          bg: 'linear-gradient(135deg, #F59E0B, #D97706)', 
                          icon: '🎨', 
                          label: 'ARTE VISUAL',
                          labelColor: '#F59E0B'
                        };
                      } else if (tituloLower.includes('teatro') || tituloLower.includes('obra')) {
                        return { 
                          bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          icon: '🎭', 
                          label: 'TEATRO',
                          labelColor: '#8B5CF6'
                        };
                      } else if (tituloLower.includes('taller') || tituloLower.includes('cerámica') || tituloLower.includes('fotografía')) {
                        return { 
                          bg: 'linear-gradient(135deg, #EF4444, #DC2626)', 
                          icon: '🛠️', 
                          label: 'TALLER',
                          labelColor: '#EF4444'
                        };
                      } else if (tituloLower.includes('conferencia') || tituloLower.includes('historia')) {
                        return { 
                          bg: 'linear-gradient(135deg, #10B981, #059669)', 
                          icon: '🎤', 
                          label: 'CONFERENCIA',
                          labelColor: '#10B981'
                        };
                      } else if (tituloLower.includes('festival') || tituloLower.includes('danza') || tituloLower.includes('literatura')) {
                        return { 
                          bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                          icon: '📚', 
                          label: 'LITERATURA',
                          labelColor: '#8B5CF6'
                        };
                      } else {
                        return { 
                          bg: 'linear-gradient(135deg, #6B7280, #4B5563)', 
                          icon: '🎪', 
                          label: 'EVENTO',
                          labelColor: '#6B7280'
                        };
                      }
                    };
                    
                    const categoryStyle = getCategoryStyle(evento.titulo);
                    
                    return (
                      <div 
                        style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: none; cursor: pointer; transition: all 0.3s ease; width: 100%; margin: 0 auto; max-width: 400px;"
                        onclick={() => openRegistroModal(evento)}
                      >
                        {/* Header con imagen o color de categoría e icono */}
                        <div style={`${evento.imagen 
                          ? `background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${evento.imagen}'); background-size: cover; background-position: center;` 
                          : `background: ${categoryStyle.bg};`
                        } padding: 2.5rem; position: relative; min-height: 160px; display: flex; align-items: center; justify-content: center;`}>
                          {/* Etiqueta de categoría */}
                          <div style="position: absolute; top: 1rem; left: 1rem;">
                            <span style="background: rgba(255,255,255,0.9); color: #374151; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px;">
                              {categoryStyle.label}
                            </span>
                          </div>
                          
                          {/* Status badge */}
                          <div style="position: absolute; top: 1rem; right: 1rem;">
                            <span style={`background: ${statusInfo.bgColor}; color: ${statusInfo.color}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          
                          {/* Icono central (solo si no hay imagen) */}
                          {!evento.imagen && (
                            <div style="font-size: 3rem; opacity: 0.9;">
                              {categoryStyle.icon}
                            </div>
                          )}
                          
                          {/* Overlay para mejorar legibilidad con imagen */}
                          {evento.imagen && (
                            <div style="position: absolute; inset: 0; background: linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3)); pointer-events: none;"></div>
                          )}
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div style="padding: 2rem;">
                          {/* Título */}
                          <h3 style="color: #1F2937; font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem 0; line-height: 1.4;">
                            {evento.titulo}
                          </h3>

                          {/* Información del evento */}
                          <div style="margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                              <span style="color: #F59E0B;">📅</span>
                              <span style="color: #374151; font-size: 0.9rem; font-weight: 600;">{formatDate(evento.fecha).fechaCompleta}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                              <span style="color: #F59E0B;">🕐</span>
                              <span style="color: #374151; font-size: 0.9rem; font-weight: 600;">{formatTime(evento.hora).hora12}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <span style="color: #F59E0B;">📍</span>
                              <span style="color: #6B7280; font-size: 0.85rem;">{evento.ubicacion}</span>
                            </div>
                          </div>

                          {/* Precio */}
                          <div style="margin: 1rem 0;">
                            <div style="background: #D1FAE5; color: #059669; padding: 0.5rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.9rem;">
                              💳 Entrada Libre
                            </div>
                          </div>

                          {/* Disponibilidad Dinámica */}
                          <div style="margin-bottom: 1rem;">
                            {(() => {
                              const estadoDisponibilidad = obtenerEstadoDisponibilidad(evento);
                              const capacidad = evento.capacidad_maxima ?? evento.capacidad ?? 200;
                              const registrados = evento.registrados ?? 0;
                              const porcentajeOcupacion = (registrados / capacidad) * 100;
                              
                              return (
                                <div>
                                  {/* Estado visual */}
                                  <div style={`background: ${estadoDisponibilidad.bgColor}; color: ${estadoDisponibilidad.color}; padding: 0.5rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;`}>
                                    {estadoDisponibilidad.icono} {estadoDisponibilidad.mensaje}
                                  </div>
                                  
                                  {/* Barra de progreso */}
                                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #6B7280; margin-bottom: 0.3rem;">
                                    <span>{registrados} registrados</span>
                                    <span>{capacidad} capacidad total</span>
                                  </div>
                                  <div style="background: #F3F4F6; height: 6px; border-radius: 3px; overflow: hidden;">
                                    <div style={`
                                      background: ${
                                        estadoDisponibilidad.estado === 'agotado' 
                                          ? 'linear-gradient(90deg, #EF4444, #DC2626)' 
                                          : estadoDisponibilidad.estado === 'ultimos_cupos'
                                          ? 'linear-gradient(90deg, #F59E0B, #F97316)'
                                          : 'linear-gradient(90deg, #059669, #047857)'
                                      }; 
                                      height: 100%; 
                                      width: ${Math.min(porcentajeOcupacion, 100)}%; 
                                      border-radius: 3px;
                                      transition: all 0.3s;
                                    `}></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </Show>
              </div>

              {/* Botones de navegación */}
              <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
                <button 
                  onclick={goToPrevEvent}
                  style="background: #0EA5E9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
                  disabled={currentEventIndex() === 0}
                >
                  ← Anterior
                </button>
                <button 
                  onclick={goToNextEvent}
                  style="background: #0EA5E9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
                  disabled={currentEventIndex() === filteredEventos().length - 1}
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Grid de eventos en desktop */}
            <div 
              class="desktop-grid" 
              style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding: 0.5rem;"
            >
              <For each={filteredEventos()}>
              {(evento) => {
                const dateInfo = formatDate(evento.fecha);
                const statusInfo = getEventStatus(evento);
                
                // Función para obtener el estilo de la categoría del evento
                const getCategoryStyle = (titulo: string) => {
                  const tituloLower = titulo.toLowerCase();
                  
                  if (tituloLower.includes('concierto') || tituloLower.includes('música') || tituloLower.includes('jazz')) {
                    return { 
                      bg: 'linear-gradient(135deg, #06B6D4, #0891B2)', 
                      icon: '🎵', 
                      label: 'MÚSICA',
                      labelColor: '#06B6D4'
                    };
                  } else if (tituloLower.includes('exposición') || tituloLower.includes('arte') || tituloLower.includes('galería')) {
                    return { 
                      bg: 'linear-gradient(135deg, #F59E0B, #D97706)', 
                      icon: '🎨', 
                      label: 'ARTE VISUAL',
                      labelColor: '#F59E0B'
                    };
                  } else if (tituloLower.includes('teatro') || tituloLower.includes('obra')) {
                    return { 
                      bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                      icon: '🎭', 
                      label: 'TEATRO',
                      labelColor: '#8B5CF6'
                    };
                  } else if (tituloLower.includes('taller') || tituloLower.includes('cerámica') || tituloLower.includes('fotografía')) {
                    return { 
                      bg: 'linear-gradient(135deg, #EF4444, #DC2626)', 
                      icon: '🛠️', 
                      label: 'TALLER',
                      labelColor: '#EF4444'
                    };
                  } else if (tituloLower.includes('conferencia') || tituloLower.includes('historia')) {
                    return { 
                      bg: 'linear-gradient(135deg, #10B981, #059669)', 
                      icon: '🎤', 
                      label: 'CONFERENCIA',
                      labelColor: '#10B981'
                    };
                  } else if (tituloLower.includes('festival') || tituloLower.includes('danza') || tituloLower.includes('literatura')) {
                    return { 
                      bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                      icon: '📚', 
                      label: 'LITERATURA',
                      labelColor: '#8B5CF6'
                    };
                  } else {
                    return { 
                      bg: 'linear-gradient(135deg, #6B7280, #4B5563)', 
                      icon: '🎪', 
                      label: 'EVENTO',
                      labelColor: '#6B7280'
                    };
                  }
                };
                
                const categoryStyle = getCategoryStyle(evento.titulo);
                
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
                    {/* Header con imagen o color de categoría e icono */}
                    <div style={`${evento.imagen 
                      ? `background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${evento.imagen}'); background-size: cover; background-position: center;` 
                      : `background: ${categoryStyle.bg};`
                    } padding: 2.5rem; position: relative; min-height: 160px; display: flex; align-items: center; justify-content: center;`}>
                      {/* Etiqueta de categoría */}
                      <div style="position: absolute; top: 1rem; left: 1rem;">
                        <span style="background: rgba(255,255,255,0.9); color: #374151; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px;">
                          {categoryStyle.label}
                        </span>
                      </div>
                      
                      {/* Status badge */}
                      <div style="position: absolute; top: 1rem; right: 1rem;">
                        <span style={`background: ${statusInfo.bgColor}; color: ${statusInfo.color}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600;`}>
                          {statusInfo.status}
                        </span>
                      </div>
                      
                      {/* Icono central (solo si no hay imagen) */}
                      {!evento.imagen && (
                        <div style="font-size: 3rem; opacity: 0.9;">
                          {categoryStyle.icon}
                        </div>
                      )}
                      
                      {/* Overlay para mejorar legibilidad con imagen */}
                      {evento.imagen && (
                        <div style="position: absolute; inset: 0; background: linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3)); pointer-events: none;"></div>
                      )}
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div style="padding: 2rem;">
                      {/* Título */}
                      <h3 style="color: #1F2937; font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem 0; line-height: 1.4;">
                        {evento.titulo}
                      </h3>

                      {/* Información del evento */}
                      <div style="margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                          <span style="color: #F59E0B;">📅</span>
                          <span style="color: #374151; font-size: 0.9rem; font-weight: 600;">{formatDate(evento.fecha).fechaCompleta}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                          <span style="color: #F59E0B;">🕐</span>
                          <span style="color: #374151; font-size: 0.9rem; font-weight: 600;">{formatTime(evento.hora).hora12}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <span style="color: #F59E0B;">📍</span>
                          <span style="color: #6B7280; font-size: 0.85rem;">{evento.ubicacion}</span>
                        </div>
                      </div>

                      {/* Precio */}
                      <div style="margin: 1rem 0;">
                        <div style="background: #D1FAE5; color: #059669; padding: 0.5rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.9rem;">
                          💳 Entrada Libre
                        </div>
                      </div>

                      {/* Disponibilidad */}
                      <div style="margin-bottom: 1rem;">
                        {(() => {
                          const estadoDisponibilidad = obtenerEstadoDisponibilidad(evento);
                          const capacidad = evento.capacidad_maxima ?? evento.capacidad ?? 200;
                          const registrados = evento.registrados ?? 0;
                          const porcentajeOcupacion = (registrados / capacidad) * 100;
                          
                          return (
                            <div>
                              {/* Estado visual */}
                              <div style={`background: ${estadoDisponibilidad.bgColor}; color: ${estadoDisponibilidad.color}; padding: 0.5rem 1rem; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;`}>
                                {estadoDisponibilidad.icono} {estadoDisponibilidad.mensaje}
                              </div>
                              
                              {/* Barra de progreso */}
                              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #6B7280; margin-bottom: 0.3rem;">
                                <span>{registrados} registrados</span>
                                <span>{capacidad} capacidad total</span>
                              </div>
                              <div style="background: #F3F4F6; height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style={`
                                  background: ${
                                    estadoDisponibilidad.estado === 'agotado' 
                                      ? 'linear-gradient(90deg, #EF4444, #DC2626)' 
                                      : estadoDisponibilidad.estado === 'ultimos_cupos'
                                      ? 'linear-gradient(90deg, #F59E0B, #F97316)'
                                      : 'linear-gradient(90deg, #059669, #047857)'
                                  }; 
                                  height: 100%; 
                                  width: ${Math.min(porcentajeOcupacion, 100)}%; 
                                  border-radius: 3px;
                                  transition: all 0.3s;
                                `}></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
            </div>
          </div>
        </Show>
      </main>

      {/* Modal de Registro */}
      <Show when={showRegistroModal()}>
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem;">
          <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 25px rgba(0,0,0,0.15); position: relative; animation: modalSlideIn 0.3s ease-out;">
            
            {/* Cerrar Modal */}
            <button 
              onclick={() => {
                setShowRegistroModal(false);
                limpiarFormulario();
                limpiarFormulariosVirtual();
              }}
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
              <Show when={selectedEvento()}>
                {(() => {
                  const tipoModal = getTipoModal(selectedEvento());
                  const isCheckin = tipoModal === 'checkin';
                  const isSalaVirtualModal = tipoModal === 'sala_virtual';
                  
                  return (
                    <>
                      <div style="font-size: 2rem; margin-bottom: 1rem;">
                        {isSalaVirtualModal ? '🌐' : isCheckin ? '✅' : '🎫'}
                      </div>
                      <h2 style="color: #111827; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                        {isSalaVirtualModal 
                          ? 'Registro Sala Virtual' 
                          : isCheckin 
                            ? 'Check-in al Evento' 
                            : 'Registro al Evento'
                        }
                      </h2>
                      <h3 style="color: #0EA5E9; font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                        {selectedEvento()?.titulo}
                      </h3>
                      <p style="color: #6B7280; font-size: 0.9rem;">
                        {isSalaVirtualModal
                          ? '🏛️ Acceso permanente al recorrido virtual del Centro Cultural Banreservas'
                          : isCheckin 
                            ? '🔴 El evento está disponible para check-in. Usa tu código o teléfono registrado.'
                            : '📧 Recibirás tu código por email para el día del evento'
                        }
                      </p>
                    </>
                  );
                })()}
              </Show>
            </div>

            {/* Formulario */}
            <form style="display: flex; flex-direction: column; gap: 1rem;">
              <Show when={selectedEvento()}>
                {(() => {
                  const tipoModal = getTipoModal(selectedEvento());
                  const isCheckin = tipoModal === 'checkin';
                  const isSalaVirtualModal = tipoModal === 'sala_virtual';
                  
                  if (isSalaVirtualModal) {
                    // FORMULARIO DE SALA VIRTUAL
                    return (
                      <>
                        {/* Selector de Tipo de Registro */}
                        <div style="margin-bottom: 1.5rem;">
                          <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Tipo de Registro
                          </label>
                          <div style="display: flex; gap: 1rem;">
                            <button
                              type="button"
                              onclick={() => setTipoRegistroVirtual('individual')}
                              style={`flex: 1; padding: 1rem; border: 2px solid ${tipoRegistroVirtual() === 'individual' ? '#0EA5E9' : '#D1D5DB'}; background: ${tipoRegistroVirtual() === 'individual' ? '#EFF6FF' : 'white'}; color: ${tipoRegistroVirtual() === 'individual' ? '#0EA5E9' : '#6B7280'}; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;`}
                            >
                              <div>👤 Individual</div>
                              <div style="font-size: 0.8rem; font-weight: 400; margin-top: 0.25rem;">Para personas individuales</div>
                            </button>
                            <button
                              type="button"
                              onclick={() => setTipoRegistroVirtual('grupo')}
                              style={`flex: 1; padding: 1rem; border: 2px solid ${tipoRegistroVirtual() === 'grupo' ? '#0EA5E9' : '#D1D5DB'}; background: ${tipoRegistroVirtual() === 'grupo' ? '#EFF6FF' : 'white'}; color: ${tipoRegistroVirtual() === 'grupo' ? '#0EA5E9' : '#6B7280'}; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;`}
                            >
                              <div>👥 Grupo</div>
                              <div style="font-size: 0.8rem; font-weight: 400; margin-top: 0.25rem;">Para colegios e instituciones</div>
                            </button>
                          </div>
                        </div>

                        {/* Formulario Individual */}
                        <Show when={tipoRegistroVirtual() === 'individual'}>
                          <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Nombre Completo *
                              </label>
                              <input 
                                type="text" 
                                placeholder="Ingresa tu nombre completo"
                                required
                                value={registroData().nombre}
                                onInput={(e) => handleInputChange('nombre', e.currentTarget.value)}
                                style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                              />
                            </div>
                            <div>
                              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                Correo Electrónico *
                              </label>
                              <input 
                                type="email" 
                                placeholder="tu@email.com"
                                required
                                value={registroData().email}
                                onInput={(e) => handleInputChange('email', e.currentTarget.value)}
                                style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                              />
                              <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                                🌐 Recibirás el enlace de acceso aquí
                              </p>
                            </div>
                          </div>
                        </Show>

                        {/* Formulario Grupal */}
                        <Show when={tipoRegistroVirtual() === 'grupo'}>
                          <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
                            {/* Información de la Institución */}
                            <div style="background: #F9FAFB; padding: 1rem; border-radius: 8px; border: 1px solid #E5E7EB;">
                              <h4 style="color: #374151; font-size: 0.9rem; font-weight: 600; margin: 0 0 1rem 0;">📚 Información de la Institución</h4>
                              
                              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Nombre de la Institución *
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="Ej: Colegio San Patricio"
                                    required
                                    value={registroGrupal().institucion}
                                    onInput={(e) => handleRegistroGrupalChange('institucion', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                  />
                                </div>
                                
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Tipo de Institución *
                                  </label>
                                  <select 
                                    value={registroGrupal().tipoInstitucion}
                                    onChange={(e) => handleRegistroGrupalChange('tipoInstitucion', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; box-sizing: border-box; background: white;"
                                  >
                                    <option value="colegio">🏫 Colegio</option>
                                    <option value="universidad">🎓 Universidad</option>
                                    <option value="instituto">📖 Instituto</option>
                                    <option value="organizacion">🏢 Organización</option>
                                    <option value="otro">📋 Otro</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Información del Responsable */}
                            <div style="background: #F0F9FF; padding: 1rem; border-radius: 8px; border: 1px solid #BAE6FD;">
                              <h4 style="color: #374151; font-size: 0.9rem; font-weight: 600; margin: 0 0 1rem 0;">👨‍🏫 Persona Responsable</h4>
                              
                              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Nombre del Responsable *
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="Nombre del profesor o coordinador"
                                    required
                                    value={registroGrupal().nombreResponsable}
                                    onInput={(e) => handleRegistroGrupalChange('nombreResponsable', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                  />
                                </div>
                                
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Correo Electrónico *
                                  </label>
                                  <input 
                                    type="email" 
                                    placeholder="responsable@institucion.edu"
                                    required
                                    value={registroGrupal().emailResponsable}
                                    onInput={(e) => handleRegistroGrupalChange('emailResponsable', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                  />
                                </div>
                                
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Teléfono *
                                  </label>
                                  <input 
                                    type="tel" 
                                    placeholder="809-555-0123"
                                    required
                                    value={registroGrupal().telefonoResponsable}
                                    onInput={(e) => handleRegistroGrupalChange('telefonoResponsable', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Información del Grupo */}
                            <div style="background: #F0FDF4; padding: 1rem; border-radius: 8px; border: 1px solid #BBF7D0;">
                              <h4 style="color: #374151; font-size: 0.9rem; font-weight: 600; margin: 0 0 1rem 0;">👥 Información del Grupo</h4>
                              
                              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <div style="display: flex; gap: 0.75rem;">
                                  <div style="flex: 1;">
                                    <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                      Número de Participantes *
                                    </label>
                                    <input 
                                      type="number" 
                                      placeholder="25"
                                      min="2"
                                      max="100"
                                      required
                                      value={registroGrupal().numeroParticipantes}
                                      onInput={(e) => handleRegistroGrupalChange('numeroParticipantes', e.currentTarget.value)}
                                      style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                    />
                                  </div>
                                  
                                  <div style="flex: 1;">
                                    <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                      Rango de Edades
                                    </label>
                                    <input 
                                      type="text" 
                                      placeholder="Ej: 8-12 años"
                                      value={registroGrupal().rangoEdades}
                                      onInput={(e) => handleRegistroGrupalChange('rangoEdades', e.currentTarget.value)}
                                      style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Fecha Preferida *
                                  </label>
                                  <input 
                                    type="date" 
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={registroGrupal().fechaPreferida}
                                    onInput={(e) => handleRegistroGrupalChange('fechaPreferida', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                  />
                                </div>
                                
                                <div>
                                  <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                    Comentarios Adicionales
                                  </label>
                                  <textarea 
                                    placeholder="Información adicional sobre el grupo o requisitos especiales..."
                                    value={registroGrupal().comentarios}
                                    onInput={(e) => handleRegistroGrupalChange('comentarios', e.currentTarget.value)}
                                    style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; resize: vertical; min-height: 80px;"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Show>
                      </>
                    );
                  } else if (isCheckin) {
                    // FORMULARIO DE CHECK-IN
                    return (
                      <>
                        {/* Método de Check-in */}
                        <div style="margin-bottom: 1rem;">
                          <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Método de Check-in
                          </label>
                          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                            <button
                              type="button"
                              onclick={() => handleCheckinChange('metodo', 'codigo')}
                              style={`padding: 0.75rem; border: 2px solid ${checkinData().metodo === 'codigo' ? '#0EA5E9' : '#D1D5DB'}; background: ${checkinData().metodo === 'codigo' ? '#EFF6FF' : 'white'}; color: ${checkinData().metodo === 'codigo' ? '#0EA5E9' : '#6B7280'}; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;`}
                            >
                              🎫 Código
                            </button>
                            <button
                              type="button"
                              onclick={() => handleCheckinChange('metodo', 'email')}
                              style={`padding: 0.75rem; border: 2px solid ${checkinData().metodo === 'email' ? '#0EA5E9' : '#D1D5DB'}; background: ${checkinData().metodo === 'email' ? '#EFF6FF' : 'white'}; color: ${checkinData().metodo === 'email' ? '#0EA5E9' : '#6B7280'}; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;`}
                            >
                              📧 Email
                            </button>
                            <button
                              type="button"
                              onclick={() => handleCheckinChange('metodo', 'telefono')}
                              style={`padding: 0.75rem; border: 2px solid ${checkinData().metodo === 'telefono' ? '#0EA5E9' : '#D1D5DB'}; background: ${checkinData().metodo === 'telefono' ? '#EFF6FF' : 'white'}; color: ${checkinData().metodo === 'telefono' ? '#0EA5E9' : '#6B7280'}; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center;`}
                            >
                              📱 Teléfono
                            </button>
                          </div>
                        </div>

                        {/* Campo dinámico según método */}
                        <Show when={checkinData().metodo === 'codigo'}>
                          <div>
                            <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                              Código de Evento *
                            </label>
                            <input 
                              type="text" 
                              placeholder="CCB-XXXXXXXX"
                              required
                              value={checkinData().codigo}
                              onInput={(e) => handleCheckinChange('codigo', e.currentTarget.value.toUpperCase())}
                              style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; font-family: monospace;"
                              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                            />
                            <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                              💡 Introduce el código que recibiste por email
                            </p>
                          </div>
                        </Show>

                        <Show when={checkinData().metodo === 'email'}>
                          <div>
                            <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                              Email Registrado *
                            </label>
                            <input 
                              type="email" 
                              placeholder="tu@email.com"
                              required
                              value={checkinData().email}
                              onInput={(e) => handleCheckinChange('email', e.currentTarget.value)}
                              style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                            />
                            <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                              📧 Usa el email con el que te registraste o el de visitante general
                            </p>
                          </div>
                        </Show>

                        <Show when={checkinData().metodo === 'telefono'}>
                          <div>
                            <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                              Teléfono Registrado *
                            </label>
                            <input 
                              type="tel" 
                              placeholder="809-555-0123"
                              required
                              value={checkinData().telefono}
                              onInput={(e) => handleCheckinChange('telefono', e.currentTarget.value)}
                              style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                            />
                            <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                              📱 Usa el teléfono con el que te registraste como visitante general
                            </p>
                          </div>
                        </Show>
                      </>
                    );
                  } else {
                    // FORMULARIO DE REGISTRO NORMAL
                    return (
                      <>
                        {/* Búsqueda de Visitante Existente */}
                        <Show when={!showVisitorSearch()}>
                          <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                              <div>
                                <h4 style="color: #0369A1; font-size: 0.9rem; font-weight: 600; margin: 0 0 0.25rem 0;">
                                  ¿Ya tienes cuenta?
                                </h4>
                                <p style="color: #0369A1; font-size: 0.8rem; margin: 0;">
                                  Busca tus datos para un registro más rápido
                                </p>
                              </div>
                              <button
                                type="button"
                                onclick={() => setShowVisitorSearch(true)}
                                style="background: #0EA5E9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;"
                                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0284C7'}
                                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0EA5E9'}
                              >
                                🔍 Buscar mis datos
                              </button>
                            </div>
                          </div>
                        </Show>

                        {/* Panel de Búsqueda */}
                        <Show when={showVisitorSearch()}>
                          <div style="background: #EFF6FF; border: 2px solid #0EA5E9; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                              <h4 style="color: #0369A1; font-size: 0.9rem; font-weight: 600; margin: 0;">
                                🔍 Buscar mis datos registrados
                              </h4>
                                                             <button
                                 type="button"
                                 onclick={() => {
                                   setShowVisitorSearch(false);
                                   setSearchValue('');
                                 }}
                                 style="background: transparent; color: #6B7280; border: none; font-size: 1.2rem; cursor: pointer; padding: 0.25rem; border-radius: 4px;"
                                 onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#F3F4F6'}
                                 onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                               >
                                 ×
                               </button>
                             </div>
                             
                             <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                               <div>
                                 <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                   Email o Teléfono
                                 </label>
                                 <input
                                   type="text"
                                   placeholder="tu@email.com o 809-555-0123"
                                   value={searchValue()}
                                   onInput={(e) => setSearchValue(e.currentTarget.value)}
                                   style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                                   onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                                   onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                                 />
                                 <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                                   💡 Detectaremos automáticamente si es email o teléfono
                                 </p>
                               </div>
                               
                               <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                 <button
                                   type="button"
                                   onclick={buscarVisitanteParaEvento}
                                   style="flex: 1; background: #10B981; color: white; border: none; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                                   onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
                                   onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10B981'}
                                 >
                                   🔍 Buscar mis datos
                                 </button>
                                 <button
                                   type="button"
                                   onclick={() => {
                                     setShowVisitorSearch(false);
                                     setSearchValue('');
                                   }}
                                   style="background: #6B7280; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                                   onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#4B5563'}
                                   onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6B7280'}
                                 >
                                   Cancelar
                                 </button>
                               </div>
                            </div>
                          </div>
                        </Show>

                        {/* Nombre Completo */}
                        <div>
                          <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Nombre Completo *
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ingresa tu nombre completo"
                            required
                            value={registroData().nombre}
                            onInput={(e) => handleInputChange('nombre', e.currentTarget.value)}
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
                            value={registroData().email}
                            onInput={(e) => handleInputChange('email', e.currentTarget.value)}
                            style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                          />
                          <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                            📧 Recibirás tu código de evento aquí
                          </p>
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            Teléfono (Recomendado)
                          </label>
                          <input 
                            type="tel" 
                            placeholder="809-555-0123"
                            value={registroData().telefono}
                            onInput={(e) => handleInputChange('telefono', e.currentTarget.value)}
                            style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;"
                            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#0EA5E9'}
                            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#D1D5DB'}
                          />
                          <p style="font-size: 0.75rem; color: #6B7280; margin: 0.25rem 0 0 0;">
                            📱 Te permitirá hacer check-in el día del evento
                          </p>
                        </div>
                      </>
                    );
                  }
                })()}
              </Show>

              {/* Botones de Acción */}
              <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                <button 
                  type="button"
                  onclick={() => {
                    setShowRegistroModal(false);
                    limpiarFormulario();
                    limpiarFormulariosVirtual();
                  }}
                  style="flex: 1; padding: 0.75rem; background: #F3F4F6; color: #374151; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;"
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#E5E7EB'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#F3F4F6'}
                >
                  Cancelar
                </button>
                
                <Show when={selectedEvento()}>
                  {(() => {
                    const evento = selectedEvento();
                    const tipoModal = getTipoModal(evento);
                    const isCheckin = tipoModal === 'checkin';
                    const isSalaVirtualModal = tipoModal === 'sala_virtual';
                    
                    if (isSalaVirtualModal) {
                      // BOTÓN DE SALA VIRTUAL
                      const esRegistroIndividual = tipoRegistroVirtual() === 'individual';
                      const formularioIndividualValido = registroData().nombre.trim() !== '' && 
                                                         registroData().email.trim() !== '' && 
                                                         registroData().email.includes('@');
                      const formularioGrupalValido = validarRegistroGrupal();
                      const isValid = esRegistroIndividual ? formularioIndividualValido : formularioGrupalValido;
                      
                      return (
                        <button 
                          type="button"
                          onclick={() => {
                            if (esRegistroIndividual) {
                              if (!formularioIndividualValido) {
                                const campos = [];
                                if (!registroData().nombre.trim()) campos.push('• Nombre completo');
                                if (!registroData().email.trim() || !registroData().email.includes('@')) campos.push('• Email válido');
                                
                                alert(`❌ Por favor, completa los campos requeridos:\n\n${campos.join('\n')}`);
                                return;
                              }
                              
                              alert(`🌐 ¡Registro a Sala Virtual exitoso!\n\nNombre: ${registroData().nombre}\nEmail: ${registroData().email}\n\n📧 Recibirás el enlace de acceso por email.\n🏛️ ¡Disfruta del recorrido virtual del Centro Cultural Banreservas!`);
                            } else {
                              if (!formularioGrupalValido) {
                                alert('❌ Por favor, completa todos los campos requeridos para el registro grupal.');
                                return;
                              }
                              
                              const data = registroGrupal();
                              alert(`🏫 ¡Registro grupal a Sala Virtual exitoso!\n\nInstitución: ${data.institucion}\nResponsable: ${data.nombreResponsable}\nParticipantes: ${data.numeroParticipantes}\nFecha Preferida: ${data.fechaPreferida}\n\n📧 Nos pondremos en contacto contigo para coordinar la visita virtual.\n🌐 ¡Esperamos que disfruten del recorrido!`);
                            }
                            
                            setShowRegistroModal(false);
                            limpiarFormulario();
                            limpiarFormulariosVirtual();
                          }}
                          style={`flex: 1; padding: 0.75rem; background: ${isValid ? '#10B981' : '#EF4444'}; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: ${isValid ? 'pointer' : 'not-allowed'}; transition: background-color 0.2s; opacity: ${isValid ? '1' : '0.7'};`}
                          disabled={!isValid}
                          onMouseOver={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
                            }
                          }}
                        >
                          {isValid 
                            ? (esRegistroIndividual ? '🌐 Acceder a Sala Virtual' : '🏫 Solicitar Visita Grupal')
                            : 'Completa los campos requeridos'
                          }
                        </button>
                      );
                    } else if (isCheckin) {
                      // BOTÓN DE CHECK-IN HÍBRIDO
                      const isValid = validarCheckin();
                      return (
                        <button 
                          type="button"
                          onclick={() => {
                            if (!validarCheckin()) {
                              const metodo = checkinData().metodo;
                              const campo = metodo === 'codigo' ? 'código' : metodo === 'email' ? 'email' : 'teléfono';
                              alert(`❌ Por favor, introduce tu ${campo} para hacer check-in.`);
                              return;
                            }

                            const metodo = checkinData().metodo;
                            let valor = '';
                            
                            if (metodo === 'codigo') {
                              valor = checkinData().codigo;
                            } else if (metodo === 'email') {
                              valor = checkinData().email;
                            } else {
                              valor = checkinData().telefono;
                            }

                            // BÚSQUEDA HÍBRIDA
                            const resultado = buscarParaCheckin(metodo, valor);
                            
                            if (resultado) {
                              if (resultado.tipo === 'visitante_general') {
                                // Check-in desde base de visitantes generales
                                const ultimaVisita = new Date(resultado.ultimaVisita).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                });
                                
                                alert(`✅ ¡Check-in exitoso desde visitante general!\n\n👤 ${resultado.nombre}\n📧 ${resultado.email}\n📱 ${resultado.telefono}\n📅 Última visita: ${ultimaVisita}\n\n🎪 ¡Disfruta el evento!`);
                                
                                // Crear registro de evento si no existe
                                const codigo = sincronizarVisitanteAEventos(resultado, evento.id, evento.titulo);
                                
                              } else if (resultado.tipo === 'registro_evento') {
                                // Check-in desde registro específico de evento
                                alert(`✅ ¡Check-in exitoso!\n\n👤 ${resultado.nombre}\n📧 ${resultado.email}\n🎫 ${resultado.codigo}\n🎪 ${resultado.eventoTitulo}\n\n🎉 ¡Disfruta el evento!`);
                              } else {
                                // Check-in por código directo
                                alert(`✅ ¡Check-in exitoso!\n\n👤 ${resultado.nombre}\n📧 ${resultado.email}\n🎫 ${resultado.codigo}\n🎪 ${resultado.eventoTitulo}\n\n🎉 ¡Disfruta el evento!`);
                              }
                              
                              setShowRegistroModal(false);
                              limpiarFormulario();
                            } else {
                              let mensajeError = '';
                              if (metodo === 'codigo') {
                                mensajeError = `❌ Código "${valor}" no encontrado.\n\n💡 Verifica que sea correcto o intenta con tu email/teléfono.`;
                              } else {
                                mensajeError = `❌ No encontramos registros con ese ${metodo === 'email' ? 'email' : 'teléfono'}.\n\n💡 Verifica los datos o regístrate si es tu primera vez.`;
                              }
                              alert(mensajeError);
                            }
                          }}
                          style={`flex: 1; padding: 0.75rem; background: ${isValid ? '#10B981' : '#EF4444'}; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: ${isValid ? 'pointer' : 'not-allowed'}; transition: background-color 0.2s; opacity: ${isValid ? '1' : '0.7'};`}
                          disabled={!isValid}
                          onMouseOver={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
                            }
                          }}
                        >
                          {isValid ? '✅ Hacer Check-in' : `Introduce tu ${checkinData().metodo === 'codigo' ? 'código' : checkinData().metodo === 'email' ? 'email' : 'teléfono'}`}
                        </button>
                      );
                    } else {
                      // BOTÓN DE REGISTRO
                      const estadoDisponibilidad = obtenerEstadoDisponibilidad(evento);
                      const puedeRegistrarse = estadoDisponibilidad.cuposDisponibles > 0 && estadoDisponibilidad.estado !== 'finalizado';
                      const formularioValido = validarFormulario();
                      const isValid = puedeRegistrarse && formularioValido;
                      
                      return (
                        <button 
                          type="button"
                          onclick={() => {
                            if (!puedeRegistrarse) {
                              if (estadoDisponibilidad.estado === 'finalizado') {
                                alert('❌ Este evento ya ha finalizado y no acepta más registros.');
                              } else {
                                alert('❌ Este evento ya no tiene cupos disponibles.');
                              }
                              return;
                            }
                            
                            if (!formularioValido) {
                              const campos = [];
                              if (!registroData().nombre.trim()) campos.push('• Nombre completo');
                              if (!registroData().email.trim() || !registroData().email.includes('@')) campos.push('• Email válido');
                              
                              alert(`❌ Por favor, completa los campos requeridos:\n\n${campos.join('\n')}`);
                              return;
                            }
                            
                            // VERIFICAR SI YA ESTÁ REGISTRADO
                            const registroExistente = verificarRegistroExistente(evento.id, registroData().email);
                            
                            if (registroExistente) {
                              const fechaRegistro = new Date(registroExistente.fechaRegistro).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                              
                              if (isEventoActivo(evento)) {
                                // Para eventos en curso: check-in automático
                                alert(`✅ ¡Ya estás registrado y tu check-in se ha realizado automáticamente!\n\n👤 Nombre: ${registroExistente.nombre}\n📧 Email: ${registroExistente.email}\n🎫 Código: ${registroExistente.codigo}\n📅 Registrado: ${fechaRegistro}\n\n🎪 ¡El evento está en curso, disfruta la experiencia!`);
                              } else {
                                // Para eventos futuros: mostrar info y recordar check-in
                                alert(`ℹ️ Ya estás registrado en este evento!\n\n👤 Nombre: ${registroExistente.nombre}\n📧 Email: ${registroExistente.email}\n🎫 Código: ${registroExistente.codigo}\n📅 Registrado: ${fechaRegistro}\n\n💡 Guarda tu código para hacer check-in el día del evento.\n⏰ Usa tu código cuando llegue la fecha del evento.`);
                              }
                              
                              setShowRegistroModal(false);
                              limpiarFormulario();
                              return;
                            }
                            
                            // PROCEDER CON NUEVO REGISTRO (CON INTEGRACIÓN)
                            const data = registroData();
                            
                            // 1. Crear visitante general si no existe
                            crearVisitanteDesdeEvento(data.nombre, data.email, data.telefono);
                            
                            // 2. Generar código y guardar registro de evento
                            const codigo = generateEventCode(evento.id, data.email);
                            guardarRegistroLocal(evento.id, data.email, data.nombre, codigo, evento.titulo);
                            
                            // 3. Mensaje diferenciado según estado del evento
                            if (isEventoActivo(evento) && evento.registrados === 0) {
                              alert(`🎉 ¡Registro e ingreso exitoso!\n\n👤 ${data.nombre}\n📧 ${data.email}\n🎫 ${codigo}\n\n✅ El evento está en curso. Check-in automático.\n💾 Tus datos se han guardado para futuras visitas.\n🎪 ¡Disfruta el evento!`);
                            } else {
                              alert(`🎉 ¡Registro exitoso!\n\n👤 ${data.nombre}\n📧 ${data.email}\n🎫 ${codigo}\n\n📧 Recibirás un email con la información del evento.\n💾 Tus datos se han guardado para futuras visitas.\n💡 Guarda tu código para hacer check-in el día del evento.`);
                            }
                            
                            setShowRegistroModal(false);
                            limpiarFormulario();
                          }}
                          style={`flex: 1; padding: 0.75rem; background: ${!puedeRegistrarse ? '#1F2937' : (formularioValido ? '#10B981' : '#EF4444')}; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: ${isValid ? 'pointer' : 'not-allowed'}; transition: background-color 0.2s; opacity: ${isValid ? '1' : '0.7'};`}
                          disabled={!isValid}
                          onMouseOver={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (isValid) {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#10B981';
                            }
                          }}
                        >
                          {!puedeRegistrarse ? 
                            (estadoDisponibilidad.estado === 'finalizado' ? '⏰ Evento Finalizado' : '🔒 Evento Agotado') :
                            (formularioValido ? '🎫 Registrarse' : 'Completa los campos')
                          }
                        </button>
                      );
                    }
                  })()}
                </Show>
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