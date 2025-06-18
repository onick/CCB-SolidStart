import { Component, createSignal, For, onMount, Show } from 'solid-js';
import AdminHeader from '../../components/AdminHeader';
import AdminLayout from '../../components/AdminLayout';
import { toast } from '../../components/ui/toast';
import { Evento, Visitante } from '../../lib/supabase/client';
import { eventosService, forceInvalidateCache, visitantesService } from '../../lib/supabase/services';
import { simularEnvioEmail, prepararDatosEmail } from '../../lib/server/emailActions';
import { enviarInvitacionPorEmail, crearDatosInvitacionDesdeAdmin } from '../../lib/server/invitacionesService';

// 🧩 COMPONENTES MODULARES IMPORTADOS
import {
    VisitantesFilters,
    VisitantesStats,
    VisitantesTable,
    type EstadisticasVisitantes,
    type Invitacion
} from '../../components/visitantes';

// Estilos CSS
import '../../styles/admin.css';
import '../../styles/visitantes-admin.css';

// Solid Icons
import {
    FaSolidCalendarCheck,
    FaSolidChartLine,
    FaSolidDownload,
    FaSolidEnvelope,
    FaSolidFileImport,
    FaSolidHeart,
    FaSolidPen,
    FaSolidPhone,
    FaSolidRotate,
    FaSolidTicket,
    FaSolidUpload,
    FaSolidUserCheck,
    FaSolidUsers
} from 'solid-icons/fa';

const VisitantesAdmin: Component = () => {
  // ============================================================================
  // 🏗️ ESTADOS PRINCIPALES
  // ============================================================================
  const [visitantes, setVisitantes] = createSignal<Visitante[]>([]);
  const [eventos, setEventos] = createSignal<Evento[]>([]);
  const [cargando, setCargando] = createSignal(true);
  
  // Estados de filtros
  const [busqueda, setBusqueda] = createSignal('');
  const [filtroInteres, setFiltroInteres] = createSignal('');
  const [filtroEstado, setFiltroEstado] = createSignal('');
  
  // Estados para eliminación
  const [eliminandoVisitante, setEliminandoVisitante] = createSignal<string | null>(null);
  const [eliminandoSeleccionados, setEliminandoSeleccionados] = createSignal(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = createSignal(false);
  const [mostrarConfirmacionEliminarSeleccionados, setMostrarConfirmacionEliminarSeleccionados] = createSignal(false);
  const [visitanteParaEliminar, setVisitanteParaEliminar] = createSignal<Visitante | null>(null);

  // Estados de modales
  const [modalInvitacion, setModalInvitacion] = createSignal(false);
  const [modalDetalles, setModalDetalles] = createSignal(false);
  const [modalImportacion, setModalImportacion] = createSignal(false);
  const [visitanteSeleccionado, setVisitanteSeleccionado] = createSignal<Visitante | null>(null);
  
  // Estados de invitaciones
  const [invitaciones, setInvitaciones] = createSignal<Invitacion[]>([]);
  const [eventoInvitacion, setEventoInvitacion] = createSignal('');
  const [visitantesSeleccionados, setVisitantesSeleccionados] = createSignal<string[]>([]);
  
  // Estados de importación
  const [archivoImportacion, setArchivoImportacion] = createSignal<File | null>(null);
  const [datosImportacion, setDatosImportacion] = createSignal<any[]>([]);
  const [procesandoImportacion, setProcesandoImportacion] = createSignal(false);
  const [resultadoImportacion, setResultadoImportacion] = createSignal<{
    exitosos: number;
    errores: number;
    duplicados: number;
    detalles: string[];
  } | null>(null);
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = createSignal(1);
  const [elementosPorPagina, setElementosPorPagina] = createSignal(10);
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = createSignal<EstadisticasVisitantes>({
    total: 0,
    activos: 0,
    hoy: 0,
    estaSemana: 0,
    invitacionesEnviadas: 0,
    tasaRespuesta: 0
  });

  // ============================================================================
  // 🔄 DATOS CALCULADOS Y DERIVADOS
  // ============================================================================
  
  // Visitantes filtrados y paginados
  const visitantesFiltrados = () => {
    let filtrados = visitantes();
    
    // Filtro por búsqueda
    if (busqueda()) {
      const termino = busqueda().toLowerCase();
      filtrados = filtrados.filter(v => 
        v.nombre.toLowerCase().includes(termino) ||
        (v.apellido && v.apellido.toLowerCase().includes(termino)) ||
        `${v.nombre} ${v.apellido || ''}`.toLowerCase().includes(termino) ||
        v.email.toLowerCase().includes(termino) ||
        v.telefono?.includes(termino)
      );
    }
    
    // Filtro por interés
    if (filtroInteres()) {
      filtrados = filtrados.filter(v => 
        v.intereses?.includes(filtroInteres())
      );
    }
    
    // Filtro por estado
    if (filtroEstado()) {
      filtrados = filtrados.filter(v => v.estado === filtroEstado());
    }
    
    return filtrados;
  };

  // Configuración de paginación
  const paginacionConfig = () => {
    const totalVisitantes = visitantesFiltrados().length;
    const totalPaginas = Math.ceil(totalVisitantes / elementosPorPagina());
    
    return {
      paginaActual: paginaActual(),
      elementosPorPagina: elementosPorPagina(),
      totalPaginas
    };
  };

  // Visitantes paginados
  const visitantesPaginados = () => {
    const inicio = (paginaActual() - 1) * elementosPorPagina();
    const fin = inicio + elementosPorPagina();
    return visitantesFiltrados().slice(inicio, fin);
  };

  // Intereses únicos para el filtro
  const interesesUnicos = () => {
    const intereses = new Set<string>();
    visitantes().forEach(v => {
      v.intereses?.forEach(interes => intereses.add(interes));
    });
    return Array.from(intereses);
  };

  // ============================================================================
  // 🔄 CARGA Y GESTIÓN DE DATOS
  // ============================================================================

  onMount(() => {
    cargarDatos();
    
    // Auto-refresh silencioso cada 30 segundos
    setInterval(() => {
      cargarDatosSilencioso();
    }, 30000);
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      console.log('👥 Cargando visitantes y eventos...');
      
      forceInvalidateCache();
      
      const [visitantesData, eventosData, estadisticasData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      
      // Convertir estadísticas al formato correcto
      setEstadisticas({
        total: estadisticasData.total,
        activos: estadisticasData.activos,
        hoy: estadisticasData.hoy,
        estaSemana: estadisticasData.estaSemana,
        invitacionesEnviadas: 0, // Valor por defecto
        tasaRespuesta: 0 // Valor por defecto
      });
      
      // Cargar invitaciones mock
      const invitacionesMock = generarInvitacionesMock(visitantesData);
      setInvitaciones(invitacionesMock);
      
      console.log('✅ Datos cargados:', {
        visitantes: visitantesData.length,
        eventos: eventosData.length,
        invitaciones: invitacionesMock.length
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosSilencioso = async () => {
    try {
      console.log('🔄 Actualizando datos en segundo plano...');
      
      forceInvalidateCache();
      
      const [visitantesData, eventosData, estadisticasData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      setEstadisticas(estadisticasData);
      
      const invitacionesMock = generarInvitacionesMock(visitantesData);
      setInvitaciones(invitacionesMock);
      
      console.log('✅ Datos actualizados silenciosamente');
    } catch (error) {
      console.error('❌ Error en actualización silenciosa:', error);
    }
  };

  // ============================================================================
  // 🎯 FUNCIONES DE INTERACCIÓN
  // ============================================================================

  const toggleSeleccionVisitante = (visitanteId: string) => {
    setVisitantesSeleccionados(prev => 
      prev.includes(visitanteId)
        ? prev.filter(id => id !== visitanteId)
        : [...prev, visitanteId]
    );
  };

  const onVerDetalles = (visitante: Visitante) => {
    console.log('Visitante seleccionado:', visitante);
    setVisitanteSeleccionado(visitante);
    setModalDetalles(true);
  };

  const onEnviarInvitacion = (visitanteId: string) => {
    if (eventos().length > 0) {
      enviarInvitacion(visitanteId, eventos()[0].id);
    } else {
      alert('No hay eventos disponibles');
    }
  };

  const onEliminarVisitante = (visitante: Visitante) => {
    iniciarEliminacion(visitante);
  };

  const onInvitarSeleccionados = () => {
    setModalInvitacion(true);
  };

  const onEliminarSeleccionados = () => {
    iniciarEliminacionSeleccionados();
  };

  const onImportarVisitantes = () => {
    setModalImportacion(true);
  };

  // ============================================================================
  // 🔧 FUNCIONES AUXILIARES (del archivo original)
  // ============================================================================

  const generarInvitacionesMock = (visitantes: Visitante[]): Invitacion[] => {
    return visitantes.slice(0, Math.min(5, visitantes.length)).map((visitante, index) => ({
      id: `inv-${Date.now()}-${index}`,
      visitanteId: visitante.id,
      eventoId: eventos()[0]?.id || 'evento-1',
      codigo: `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      estado: ['enviada', 'abierta', 'confirmada'][Math.floor(Math.random() * 3)] as any,
      fechaEnvio: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      email: visitante.email
    }));
  };

  const enviarInvitacion = async (visitanteId: string, eventoId: string) => {
    try {
      const visitante = visitantes().find(v => v.id === visitanteId);
      const evento = eventos().find(e => e.id === eventoId);
      
      if (!visitante || !evento) {
        console.error('❌ Visitante o evento no encontrado');
        return;
      }
      
      const codigoInvitacion = `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // 📧 ENVIAR EMAIL DE INVITACIÓN
      const datosInvitacion = crearDatosInvitacionDesdeAdmin(
        visitante,
        evento,
        codigoInvitacion,
        fechaExpiracion
      );
      
      console.log('📧 Enviando invitación por email a:', visitante.email);
      const resultadoEmail = await enviarInvitacionPorEmail(datosInvitacion);
      
      // Crear registro de invitación local
      const nuevaInvitacion: Invitacion = {
        id: `inv-${Date.now()}-${Math.random()}`,
        visitanteId,
        eventoId,
        codigo: codigoInvitacion,
        estado: resultadoEmail.success ? 'enviada' : 'expirada',
        fechaEnvio: new Date().toISOString(),
        fechaExpiracion: fechaExpiracion,
        email: visitante.email
      };
      
      setInvitaciones(prev => [...prev, nuevaInvitacion]);
      
      if (resultadoEmail.success) {
        mostrarToastExito(
          `✅ Invitación enviada por email a ${visitante.nombre} ${visitante.apellido || ''}`
        );
        if (resultadoEmail.simulated) {
          console.log('🧪 Modo simulación - Email no enviado realmente');
        }
      } else {
        mostrarToastError(`❌ Error enviando email: ${resultadoEmail.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      mostrarToastError('❌ Error enviando invitación');
    }
  };

  const iniciarEliminacion = (visitante: Visitante) => {
    console.log('🗑️ Iniciando eliminación del visitante:', `${visitante.nombre} ${visitante.apellido || ''}`);
    setVisitanteParaEliminar(visitante);
    setMostrarConfirmacionEliminar(true);
  };

  const confirmarEliminacion = async () => {
    const visitante = visitanteParaEliminar();
    if (!visitante) return;

    console.log('🗑️ [OPTIMISTIC] Eliminando visitante de UI:', `${visitante.nombre} ${visitante.apellido || ''}`);
    setEliminandoVisitante(visitante.id);
    
    // 🚀 ACTUALIZACIÓN OPTIMISTA: Eliminar de la UI inmediatamente
    const visitantesOriginales = visitantes();
    setVisitantes(prev => prev.filter(v => v.id !== visitante.id));
    
    // Limpiar modal inmediatamente
    setVisitanteParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
    
    // Mostrar toast de éxito optimista
    mostrarToastExito(`✅ ${visitante.nombre} ${visitante.apellido || ''} eliminado`);
    
    try {
      // Sincronizar con servidor en segundo plano
      console.log('📡 Sincronizando eliminación con servidor...');
      const eliminado = await visitantesService.eliminar(visitante.id);
      
      if (eliminado) {
        console.log('✅ Visitante eliminado del servidor exitosamente');
        setEliminandoVisitante(null);
        
        // Actualizar estadísticas después de eliminación exitosa
        const nuevasEstadisticas = await visitantesService.obtenerEstadisticas();
        setEstadisticas({
          total: nuevasEstadisticas.total,
          activos: nuevasEstadisticas.activos,
          hoy: nuevasEstadisticas.hoy,
          estaSemana: nuevasEstadisticas.estaSemana,
          invitacionesEnviadas: estadisticas().invitacionesEnviadas,
          tasaRespuesta: estadisticas().tasaRespuesta
        });
      } else {
        throw new Error('No se pudo eliminar el visitante del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar del servidor, revirtiendo...', error);
      
      // 🔄 REVERTIR: Restaurar el visitante en la UI
      setVisitantes(visitantesOriginales);
      setEliminandoVisitante(null);
      
      // Mostrar toast de error y reversión
      mostrarToastError(`❌ Error al eliminar "${visitante.nombre} ${visitante.apellido || ''}" - acción revertida`);
    }
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación individual cancelada');
    setVisitanteParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
  };

  const iniciarEliminacionSeleccionados = () => {
    if (visitantesSeleccionados().length === 0) {
      mostrarToastError('⚠️ Selecciona al menos un visitante');
      return;
    }
    console.log('🗑️ Iniciando eliminación masiva:', visitantesSeleccionados().length);
    setMostrarConfirmacionEliminarSeleccionados(true);
  };

  const confirmarEliminacionSeleccionados = async () => {
    const idsSeleccionados = visitantesSeleccionados();
    if (idsSeleccionados.length === 0) return;

    console.log('🗑️ [OPTIMISTIC] Eliminando visitantes seleccionados de UI:', idsSeleccionados.length);
    setEliminandoSeleccionados(true);
    
    // 🚀 ACTUALIZACIÓN OPTIMISTA: Eliminar de la UI inmediatamente
    const visitantesOriginales = visitantes();
    const visitantesEliminados = visitantes().filter(v => idsSeleccionados.includes(v.id));
    setVisitantes(prev => prev.filter(v => !idsSeleccionados.includes(v.id)));
    
    // Limpiar estados del modal y selecciones inmediatamente
    setMostrarConfirmacionEliminarSeleccionados(false);
    setVisitantesSeleccionados([]);
    
    // Mostrar toast de éxito optimista
    mostrarToastExito(`✅ ${idsSeleccionados.length} visitantes eliminados`);
    
    try {
      // Sincronizar con servidor en segundo plano
      console.log('📡 Sincronizando eliminación masiva con servidor...');
      const resultados = await Promise.allSettled(
        idsSeleccionados.map(id => visitantesService.eliminar(id))
      );
      
      // Contar éxitos y errores
      const eliminacionesExitosas = resultados.filter(r => r.status === 'fulfilled' && r.value === true);
      const errores = resultados.length - eliminacionesExitosas.length;
      
      if (eliminacionesExitosas.length === idsSeleccionados.length) {
        console.log('✅ Todas las eliminaciones fueron exitosas');
        setEliminandoSeleccionados(false);
        
        // Actualizar estadísticas después de eliminación exitosa
        try {
          const nuevasEstadisticas = await visitantesService.obtenerEstadisticas();
          setEstadisticas({
            total: nuevasEstadisticas.total,
            activos: nuevasEstadisticas.activos,
            hoy: nuevasEstadisticas.hoy,
            estaSemana: nuevasEstadisticas.estaSemana,
            invitacionesEnviadas: estadisticas().invitacionesEnviadas,
            tasaRespuesta: estadisticas().tasaRespuesta
          });
        } catch (statsError) {
          console.error('⚠️ Error actualizando estadísticas:', statsError);
        }
      } else if (eliminacionesExitosas.length > 0) {
        // Eliminación parcial - algunos fallos
        console.log(`⚠️ Eliminación parcial: ${eliminacionesExitosas.length}/${idsSeleccionados.length} exitosas`);
        setEliminandoSeleccionados(false);
        mostrarToastError(`⚠️ Solo ${eliminacionesExitosas.length} de ${idsSeleccionados.length} visitantes pudieron eliminarse`);
      } else {
        // Fallo total - revertir todo
        throw new Error('No se pudo eliminar ningún visitante del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error en eliminación masiva, revirtiendo...', error);
      
      // 🔄 REVERTIR: Restaurar todos los visitantes en la UI
      setVisitantes(visitantesOriginales);
      setEliminandoSeleccionados(false);
      
      // Mostrar toast de error y reversión
      mostrarToastError(`❌ Error en eliminación masiva - acción revertida`);
    }
  };

  const cancelarEliminacionSeleccionados = () => {
    console.log('❌ Eliminación masiva cancelada');
    setMostrarConfirmacionEliminarSeleccionados(false);
  };

  const enviarInvitacionesMasivas = async () => {
    // Validar que haya eventos disponibles
    if (eventosDisponiblesParaInvitacion().length === 0) {
      alert('⚠️ No hay eventos disponibles para invitaciones. Solo se pueden enviar invitaciones a eventos activos o próximos que no hayan finalizado.');
      return;
    }
    
    // Validar selecciones
    if (!eventoInvitacion() || visitantesSeleccionados().length === 0) {
      alert('⚠️ Selecciona un evento y al menos un visitante');
      return;
    }
    
    // Verificar que el evento seleccionado sigue siendo válido
    const eventoSeleccionado = eventosDisponiblesParaInvitacion().find(e => e.id === eventoInvitacion());
    if (!eventoSeleccionado) {
      alert('⚠️ El evento seleccionado ya no está disponible para invitaciones');
      setEventoInvitacion('');
      return;
    }
    
    try {
      const promesas = visitantesSeleccionados().map(visitanteId => 
        enviarInvitacion(visitanteId, eventoInvitacion())
      );
      
      await Promise.all(promesas);
      
      alert(`✅ ${visitantesSeleccionados().length} invitaciones enviadas exitosamente`);
      setModalInvitacion(false);
      setVisitantesSeleccionados([]);
      setEventoInvitacion('');
      
    } catch (error) {
      console.error('❌ Error en invitaciones masivas:', error);
      alert('❌ Error enviando invitaciones masivas');
    }
  };

  // Funciones de importación
  const procesarArchivoImportacion = async (archivo: File) => {
    try {
      const texto = await archivo.text();
      let datos: any[] = [];
      
      if (archivo.name.endsWith('.csv')) {
        const lineas = texto.split('\n').filter(linea => linea.trim());
        const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lineas.length; i++) {
          const valores = lineas[i].split(',').map(v => v.trim());
          const visitante: any = {};
          
          encabezados.forEach((encabezado, index) => {
            const valor = valores[index]?.replace(/\"/g, '').trim() || '';
            
            // Formatear campos específicos
            if (encabezado.includes('nombre')) {
              visitante.nombre = valor.substring(0, 100); // Limitar a 100 caracteres
            } else if (encabezado.includes('apellido')) {
              visitante.apellido = valor.substring(0, 100); // Limitar a 100 caracteres
            } else if (encabezado.includes('email')) {
              visitante.email = valor.toLowerCase().substring(0, 255); // Email en minúsculas
            } else if (encabezado.includes('telefono')) {
              visitante.telefono = valor.replace(/[^\d+\-\s()]/g, '').substring(0, 50); // Solo números y caracteres válidos
            } else if (encabezado.includes('cedula')) {
              visitante.cedula = valor.replace(/[^\d\-]/g, '').substring(0, 50); // Solo números y guiones
            } else if (encabezado.includes('intereses')) {
              visitante.intereses = valor ? valor.split(';').map(i => i.trim()) : [];
            }
          });
          
          // Validar campos requeridos
          if (visitante.nombre && visitante.email) {
            visitante.fecha_registro = new Date().toISOString();
            visitante.estado = 'activo';
            datos.push(visitante);
          }
        }
      } else if (archivo.name.endsWith('.json')) {
        const jsonData = JSON.parse(texto);
        datos = Array.isArray(jsonData) ? jsonData : [jsonData];
      }
      
      if (datos.length === 0) {
        mostrarToastError('No se encontraron datos válidos para importar');
        return;
      }
      
      setDatosImportacion(datos);
      mostrarToastExito(`✅ ${datos.length} registros encontrados`);
    } catch (error) {
      console.error('Error procesando archivo:', error);
      mostrarToastError('Error al procesar el archivo');
      setDatosImportacion([]);
    }
  };

  const ejecutarImportacion = async () => {
    if (!datosImportacion() || datosImportacion().length === 0) {
      mostrarToastError('No hay datos para importar');
      return;
    }

    setProcesandoImportacion(true);

    try {
      // Procesar todos los visitantes en un solo lote
      const resultado = await visitantesService.crearLote(datosImportacion());

      if (resultado.exitosos > 0) {
        mostrarToastExito(`✅ ${resultado.exitosos} visitantes importados correctamente`);
        // Actualizar la lista de visitantes
        await cargarDatos();
      }

      if (resultado.errores > 0) {
        mostrarToastError(`❌ ${resultado.errores} errores durante la importación`);
        console.error('Detalles de errores:', resultado.detalles);
      }

      // Cerrar el modal y limpiar estados
      setModalImportacion(false);
      setDatosImportacion([]);
      setArchivoImportacion(null);
      
      // Limpiar el input de archivo
      const input = document.getElementById('file-import') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error) {
      console.error('Error al ejecutar importación:', error);
      mostrarToastError('Error al importar visitantes');
    } finally {
      setProcesandoImportacion(false);
    }
  };

  const resetearImportacion = () => {
    setArchivoImportacion(null);
    setDatosImportacion([]);
    setResultadoImportacion(null);
    setModalImportacion(false);
  };

  // Funciones de toast simplificadas
  const mostrarToastExito = (mensaje: string) => {
    toast.success(mensaje);
  };

  const mostrarToastError = (mensaje: string) => {
    toast.error(mensaje);
  };

  // ============================================================================
  // 🎯 FUNCIONES DE PAGINACIÓN
  // ============================================================================

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacionConfig().totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const cambiarElementosPorPagina = (elementos: number) => {
    setElementosPorPagina(elementos);
    setPaginaActual(1); // Resetear a primera página
  };

  // ============================================================================
  // 🎯 FUNCIÓN HELPER: Filtrar eventos disponibles para invitaciones
  const eventosDisponiblesParaInvitacion = () => {
    return eventos().filter(evento => {
      // Solo eventos activos o próximos
      const estadosValidos = ['activo', 'proximo'];
      if (!estadosValidos.includes(evento.estado)) {
        console.log(`❌ Evento "${evento.titulo}" excluido por estado: ${evento.estado}`);
        return false;
      }
      
      // Verificar que la fecha no haya pasado
      const fechaEvento = new Date(evento.fecha);
      const ahora = new Date();
      
      // Considerar que un evento del día actual aún es válido
      const fechaEventoSinHora = new Date(fechaEvento.getFullYear(), fechaEvento.getMonth(), fechaEvento.getDate());
      const ahoraSinHora = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      
      if (fechaEventoSinHora < ahoraSinHora) {
        console.log(`❌ Evento "${evento.titulo}" excluido por fecha pasada: ${evento.fecha}`);
        return false;
      }
      
      console.log(`✅ Evento "${evento.titulo}" disponible para invitaciones`);
      return true;
    });
  };

  // 🎨 RENDER DEL COMPONENTE
  // ============================================================================

  return (
    <AdminLayout currentPage="visitantes">
      <div>
        {/* Header de la Página */}
        <AdminHeader
          pageTitle="Gestión de Visitantes"
          pageSubtitle="Administra visitantes, intereses e invitaciones del Centro Cultural"
          breadcrumbs={[
            { label: 'Centro Cultural Banreservas' },
            { label: 'Gestión' },
            { label: 'Visitantes', active: true }
          ]}
          buttons={[
            {
              label: 'Actualizar',
              icon: FaSolidRotate,
              onClick: () => cargarDatos(),
              variant: 'secondary' as const
            },
            {
              label: 'Invitar',
              icon: FaSolidEnvelope,
              onClick: () => setModalInvitacion(true),
              variant: 'secondary' as const
            },
            {
              label: 'Importar',
              icon: FaSolidFileImport,
              onClick: () => setModalImportacion(true),
              variant: 'primary' as const
            },
            {
              label: 'Exportar',
              icon: FaSolidDownload,
              variant: 'secondary' as const
            }
          ]}
          titleIcon={FaSolidUsers}
        />

        {/* Indicador de Carga */}
        <Show when={cargando()}>
          <div style="text-align: center; padding: 2rem; color: #666;">
            🔄 Cargando visitantes...
          </div>
        </Show>

        {/* Contenido Principal */}
        <Show when={!cargando()}>
          {/* 📊 ESTADÍSTICAS MODULARES */}
          <VisitantesStats 
            estadisticas={estadisticas()}
            invitaciones={invitaciones()}
          />

          {/* 🔍 FILTROS MODULARES */}
          <VisitantesFilters
            busqueda={busqueda()}
            setBusqueda={setBusqueda}
            filtroInteres={filtroInteres()}
            setFiltroInteres={setFiltroInteres}
            filtroEstado={filtroEstado()}
            setFiltroEstado={setFiltroEstado}
            interesesUnicos={interesesUnicos()}
            visitantesFiltrados={visitantesFiltrados()}
            totalVisitantes={visitantes().length}
          />

          {/* 📋 TABLA MODULAR */}
          <VisitantesTable
            visitantesFiltrados={visitantesPaginados()}
            invitaciones={invitaciones()}
            visitantesSeleccionados={visitantesSeleccionados()}
            setVisitantesSeleccionados={setVisitantesSeleccionados}
            toggleSeleccionVisitante={toggleSeleccionVisitante}
            eliminandoVisitante={eliminandoVisitante()}
            eliminandoSeleccionados={eliminandoSeleccionados()}
            onVerDetalles={onVerDetalles}
            onEnviarInvitacion={onEnviarInvitacion}
            onEliminarVisitante={onEliminarVisitante}
            onInvitarSeleccionados={onInvitarSeleccionados}
            onEliminarSeleccionados={onEliminarSeleccionados}
            onImportarVisitantes={onImportarVisitantes}
            paginacion={paginacionConfig()}
            onCambioPagina={cambiarPagina}
            onCambioElementosPorPagina={cambiarElementosPorPagina}
          />
        </Show>
        {/* ================================================ */}
        {/* 🎭 MODALES DE LA APLICACIÓN */}
        {/* ================================================ */}

        {/* Modal de Invitaciones Masivas */}
        <Show when={modalInvitacion()}>
          <div class="modal-overlay" onClick={() => setModalInvitacion(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>📧 Invitaciones Masivas</h3>
                <button class="modal-close" onClick={() => setModalInvitacion(false)}>×</button>
              </div>
              
              <div class="modal-body">
                <div class="form-group">
                  <label>Evento:</label>
                  <Show when={eventosDisponiblesParaInvitacion().length > 0} fallback={
                    <div class="no-events-message">
                      <p>⚠️ No hay eventos disponibles para invitaciones</p>
                      <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        Solo se pueden enviar invitaciones a eventos activos o próximos que no hayan finalizado.
                      </p>
                    </div>
                  }>
                    <select value={eventoInvitacion()} onChange={(e) => setEventoInvitacion(e.target.value)}>
                      <option value="">Seleccionar evento</option>
                      <For each={eventosDisponiblesParaInvitacion()}>
                        {(evento) => (
                          <option value={evento.id}>
                            {evento.titulo} - {new Date(evento.fecha).toLocaleDateString('es-DO', {
                              weekday: 'short',
                              year: 'numeric', 
                              month: 'short',
                              day: 'numeric'
                            })}
                          </option>
                        )}
                      </For>
                    </select>
                  </Show>
                </div>
                
                <div class="selected-visitors">
                  <h4>Visitantes seleccionados ({visitantesSeleccionados().length}):</h4>
                  <div class="visitor-list">
                    <For each={visitantes().filter(v => visitantesSeleccionados().includes(v.id))}>
                      {(visitante) => (
                        <div class="visitor-item">
                          <span>{visitante.nombre} {visitante.apellido || ''}</span>
                          <span class="visitor-email">{visitante.email}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button class="btn-secondary" onClick={() => setModalInvitacion(false)}>
                  Cancelar
                </button>
                <button class="btn-primary" onClick={enviarInvitacionesMasivas}>
                  Enviar {visitantesSeleccionados().length} Invitaciones
                </button>
              </div>
            </div>
          </div>
        </Show>
        {/* Modal de Detalles de Visitante */}
        <Show when={modalDetalles() && visitanteSeleccionado()}>
          <div class="modal-overlay" onClick={() => setModalDetalles(false)}>
            <div class="modal-content visitor-modal" onClick={(e) => e.stopPropagation()}>
              {/* Header del Modal */}
              <div class="visitor-modal-header">
                <div class="header-content">
                  <div class="visitor-avatar-large">
                    {(visitanteSeleccionado()?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div class="visitor-main-info">
                    <h1 class="visitor-name">{visitanteSeleccionado()?.nombre || 'Nombre no disponible'}</h1>
                    <div class="visitor-contact">
                      <div class="contact-item">
                        <FaSolidEnvelope size={14} />
                        <span>{visitanteSeleccionado()?.email}</span>
                      </div>
                      <Show when={visitanteSeleccionado()?.telefono}>
                        <div class="contact-item">
                          <FaSolidPhone size={14} />
                          <span>{visitanteSeleccionado()?.telefono}</span>
                        </div>
                      </Show>
                    </div>
                    <div class="visitor-meta">
                      <span class="meta-item">
                        <FaSolidUsers size={12} />
                        ID: {visitanteSeleccionado()?.id.substring(0, 8)}...
                      </span>
                      <span class="meta-item">
                        <FaSolidCalendarCheck size={12} />
                        Registro: {new Date(visitanteSeleccionado()?.created_at || '').toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
                <button class="modal-close-btn" onClick={() => setModalDetalles(false)}>
                  <span>×</span>
                </button>
              </div>

              {/* Contenido del Modal */}
              <div class="visitor-modal-body">
                {/* Estadísticas Principales */}
                <div class="stats-section">
                  <h3 class="section-title">
                    <FaSolidChartLine size={16} />
                    Estadísticas de Participación
                  </h3>
                  <div class="stats-grid">
                    <div class="stat-card primary">
                      <div class="stat-icon">
                        <FaSolidTicket size={20} />
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id).length}</div>
                        <div class="stat-label">Eventos Registrados</div>
                      </div>
                    </div>
                    
                    <div class="stat-card success">
                      <div class="stat-icon">
                        <FaSolidUserCheck size={20} />
                      </div>
                      <div class="stat-content">
                        <div class="stat-number">{invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id && i.estado === 'confirmada').length}</div>
                        <div class="stat-label">Check-ins Realizados</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intereses */}
                <div class="interests-section">
                  <h3 class="section-title">
                    <FaSolidHeart size={16} />
                    Intereses y Preferencias
                  </h3>
                  <div class="interests-container">
                    <Show 
                      when={visitanteSeleccionado()?.intereses?.length > 0}
                      fallback={
                        <div class="empty-state">
                          <div class="empty-icon">🎯</div>
                          <p>No hay intereses registrados</p>
                        </div>
                      }
                    >
                      <div class="interests-grid">
                        <For each={visitanteSeleccionado()?.intereses || []}>
                          {(interes) => (
                            <div class="interest-badge">
                              <FaSolidHeart size={12} />
                              <span>{interes}</span>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Footer con acciones */}
              <div class="visitor-modal-footer">
                <div class="footer-actions">
                  <button class="btn-secondary" onClick={() => setModalDetalles(false)}>
                    Cerrar
                  </button>
                  <button class="btn-primary">
                    <FaSolidPen size={14} />
                    Editar Visitante
                  </button>
                  <button class="btn-success">
                    <FaSolidEnvelope size={14} />
                    Enviar Invitación
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Show>
        {/* Modal de Importación */}
        <Show when={modalImportacion()}>
          <div class="modal-overlay" onClick={() => setModalImportacion(false)}>
            <div class="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>📥 Importar Visitantes</h3>
                <button class="modal-close" onClick={() => setModalImportacion(false)}>×</button>
              </div>
              
              <div class="modal-body">
                <Show when={!resultadoImportacion()}>
                  <div class="import-section">
                    <div class="import-instructions">
                      <h4>📋 Instrucciones:</h4>
                      <ul>
                        <li>📄 Formatos soportados: CSV, JSON</li>
                        <li>📝 Campos requeridos: <strong>nombre, email</strong></li>
                        <li>📞 Campos opcionales: telefono, intereses</li>
                        <li>⚠️ Los emails duplicados serán ignorados</li>
                      </ul>
                    </div>
                    
                    <div class="file-upload-area">
                      <Show when={!archivoImportacion()}>
                        <div class="upload-dropzone">
                          <FaSolidUpload size={48} color="#666" />
                          <p>Arrastra tu archivo aquí o haz clic para seleccionar</p>
                          <input 
                            type="file" 
                            accept=".csv,.json"
                            style="display: none;"
                            id="file-import"
                            onChange={async (e) => {
                              const archivo = e.target.files?.[0];
                              if (archivo) {
                                try {
                                  setArchivoImportacion(archivo);
                                  await procesarArchivoImportacion(archivo);
                                } catch (error) {
                                  console.error('Error al procesar archivo:', error);
                                  // El error ya se maneja en procesarArchivoImportacion
                                }
                              }
                              // Limpiar el input para permitir seleccionar el mismo archivo
                              e.target.value = '';
                            }}
                          />
                          <button 
                            class="btn-primary"
                            onClick={() => document.getElementById('file-import')?.click()}
                          >
                            Seleccionar Archivo
                          </button>
                        </div>
                      </Show>
                      
                      <Show when={archivoImportacion()}>
                        <div class="file-selected">
                          <div class="file-info">
                            <FaSolidFileImport size={24} color="#10B981" />
                            <div>
                              <p><strong>{archivoImportacion()?.name}</strong></p>
                              <p>{datosImportacion().length} registros encontrados</p>
                            </div>
                          </div>
                          <button 
                            class="btn-secondary"
                            onClick={() => {
                              setArchivoImportacion(null);
                              setDatosImportacion([]);
                            }}
                          >
                            Cambiar archivo
                          </button>
                        </div>
                      </Show>
                    </div>
                  </div>
                </Show>
                
                <Show when={resultadoImportacion()}>
                  <div class="import-results">
                    <h4>📊 Resultados de la Importación:</h4>
                    <div class="results-summary">
                      <div class="result-item success">
                        <strong>✅ Exitosos:</strong> {resultadoImportacion()?.exitosos}
                      </div>
                      <div class="result-item warning">
                        <strong>⚠️ Duplicados:</strong> {resultadoImportacion()?.duplicados}
                      </div>
                      <div class="result-item error">
                        <strong>❌ Errores:</strong> {resultadoImportacion()?.errores}
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
              
              <div class="modal-footer">
                <Show when={!resultadoImportacion()}>
                  <button class="btn-secondary" onClick={() => setModalImportacion(false)}>
                    Cancelar
                  </button>
                  <Show when={datosImportacion().length > 0}>
                    <button 
                      class="btn-primary" 
                      onClick={ejecutarImportacion}
                      disabled={procesandoImportacion()}
                    >
                      <Show when={procesandoImportacion()}>
                        🔄 Importando...
                      </Show>
                      <Show when={!procesandoImportacion()}>
                        📥 Importar {datosImportacion().length} Visitantes
                      </Show>
                    </button>
                  </Show>
                </Show>
                
                <Show when={resultadoImportacion()}>
                  <button class="btn-primary" onClick={resetearImportacion}>
                    ✅ Finalizar
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </Show>
        {/* Modal de confirmación eliminación individual */}
        <Show when={mostrarConfirmacionEliminar()}>
          <div class="modal-overlay" onClick={() => setMostrarConfirmacionEliminar(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>🗑️ Confirmar Eliminación</h3>
                <button class="modal-close" onClick={cancelarEliminacion}>×</button>
              </div>
              
              <div class="modal-body">
                <p>¿Estás seguro de que quieres eliminar al visitante <strong>"{visitanteParaEliminar()?.nombre}"</strong>?</p>
                <p style="color: #dc2626; font-size: 14px; margin-top: 12px;">
                  ⚠️ Esta acción no se puede deshacer. Se eliminará toda la información del visitante.
                </p>
              </div>
              
              <div class="modal-footer">
                <button class="btn-secondary" onClick={cancelarEliminacion}>
                  Cancelar
                </button>
                <button 
                  class="btn-danger"
                  onClick={confirmarEliminacion}
                  disabled={eliminandoVisitante() === visitanteParaEliminar()?.id}
                >
                  {eliminandoVisitante() === visitanteParaEliminar()?.id ? '⏳ Eliminando...' : '🗑️ Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* Modal de confirmación eliminación masiva */}
        <Show when={mostrarConfirmacionEliminarSeleccionados()}>
          <div class="modal-overlay" onClick={() => setMostrarConfirmacionEliminarSeleccionados(false)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <div class="modal-header">
                <h3>🗑️ Eliminar Visitantes Seleccionados</h3>
                <button class="modal-close" onClick={cancelarEliminacionSeleccionados}>×</button>
              </div>
              
              <div class="modal-body">
                <p>¿Estás seguro de que quieres eliminar <strong>{visitantesSeleccionados().length} visitantes</strong>?</p>
                
                <div style="max-height: 200px; overflow-y: auto; margin: 16px 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">Visitantes a eliminar:</h4>
                  <For each={visitantes().filter(v => visitantesSeleccionados().includes(v.id))}>
                    {(visitante) => (
                      <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                        <span style="font-size: 13px; color: #111827;">• {visitante.nombre}</span>
                        <span style="font-size: 12px; color: #6b7280;">({visitante.email})</span>
                      </div>
                    )}
                  </For>
                </div>
                
                <p style="color: #dc2626; font-size: 14px;">
                  ⚠️ Esta acción no se puede deshacer. Se eliminará toda la información de estos visitantes.
                </p>
              </div>
              
              <div class="modal-footer">
                <button class="btn-secondary" onClick={cancelarEliminacionSeleccionados}>
                  Cancelar
                </button>
                <button 
                  class="btn-danger"
                  onClick={confirmarEliminacionSeleccionados}
                  disabled={eliminandoSeleccionados()}
                >
                  {eliminandoSeleccionados() ? '⏳ Eliminando...' : `🗑️ Eliminar ${visitantesSeleccionados().length} visitantes`}
                </button>
              </div>
            </div>
          </div>
        </Show>

      </div>
    </AdminLayout>
  );
};

export default VisitantesAdmin;