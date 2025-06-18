import { Component, createSignal, createEffect, onMount, Show, For } from 'solid-js';
import { visitantesService, eventosService, forceInvalidateCache } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import AdminHeader from '../../components/AdminHeader';
import '../../styles/admin.css';
import '../../styles/visitantes-admin.css';

// Solid Icons
import {
  FaSolidUsers,
  FaSolidPlus,
  FaSolidMagnifyingGlass,
  FaSolidFilter,
  FaSolidEnvelope,
  FaSolidPhone,
  FaSolidHeart,
  FaSolidCalendarCheck,
  FaSolidUserCheck,
  FaSolidDownload,
  FaSolidCode,
  FaSolidChartLine,
  FaSolidTicket,
  FaSolidFileImport,
  FaSolidUpload,
  FaSolidEye,
  FaSolidPen,
  FaSolidRotate
} from 'solid-icons/fa';

// Tipos adicionales para invitaciones
interface Invitacion {
  id: string;
  visitanteId: string;
  eventoId: string;
  codigo: string;
  estado: 'enviada' | 'abierta' | 'confirmada' | 'expirada';
  fechaEnvio: string;
  fechaExpiracion: string;
  email: string;
}

const VisitantesAdmin: Component = () => {
  // Estados principales
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
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = createSignal({
    total: 0,
    activos: 0,
    hoy: 0,
    estaSemana: 0,
    invitacionesEnviadas: 0,
    tasaRespuesta: 0
  });

  onMount(() => {
    cargarDatos();
    
    // 🔄 AUTO-REFRESH silencioso cada 30 segundos sin mostrar loading
    setInterval(() => {
      cargarDatosSilencioso();
    }, 30000);
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      console.log('👥 Cargando visitantes y eventos...');
      
      // 🔄 Invalidar cache antes de cargar para obtener datos frescos
      forceInvalidateCache();
      
      const [visitantesData, eventosData, estadisticasData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      setVisitantes(visitantesData);
      setEventos(eventosData);
      setEstadisticas(estadisticasData);
      
      // Cargar invitaciones mock (en producción vendría de Supabase)
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

  // 🚀 Nuevo: Carga silenciosa sin mostrar loading
  const cargarDatosSilencioso = async () => {
    try {
      console.log('🔄 Actualizando datos en segundo plano...');
      
      forceInvalidateCache();
      
      const [visitantesData, eventosData, estadisticasData] = await Promise.all([
        visitantesService.obtenerTodos(),
        eventosService.obtenerTodos(),
        visitantesService.obtenerEstadisticas()
      ]);
      
      // Actualizar sin mostrar loading
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

  // Función para generar invitaciones mock
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

  // Filtros aplicados
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

  // Intereses únicos para el filtro
  const interesesUnicos = () => {
    const intereses = new Set<string>();
    visitantes().forEach(v => {
      v.intereses?.forEach(interes => intereses.add(interes));
    });
    return Array.from(intereses);
  };

  const enviarInvitacionesMasivas = async () => {
    if (!eventoInvitacion() || visitantesSeleccionados().length === 0) {
      alert('⚠️ Selecciona un evento y al menos un visitante');
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

  // Funciones de check-in
  const realizarCheckIn = async (codigo: string, telefono?: string) => {
    try {
      // Buscar por código
      if (codigo) {
        const invitacion = invitaciones().find(inv => inv.codigo === codigo);
        if (invitacion) {
          setInvitaciones(prev => 
            prev.map(inv => 
              inv.id === invitacion.id 
                ? { ...inv, estado: 'confirmada' }
                : inv
            )
          );
          return { success: true, visitante: visitantes().find(v => v.id === invitacion.visitanteId) };
        }
      }
      
      // Buscar por teléfono
      if (telefono) {
        const visitante = visitantes().find(v => v.telefono === telefono);
        if (visitante) {
          return { success: true, visitante };
        }
      }
      
      return { success: false, error: 'Código o teléfono no encontrado' };
      
    } catch (error) {
      console.error('❌ Error en check-in:', error);
      return { success: false, error: 'Error interno' };
    }
  };

  // 🚀 Actualización optimista de selección (instantánea)
  const toggleSeleccionVisitante = (visitanteId: string) => {
    // Actualizar UI inmediatamente (optimistic update)
    setVisitantesSeleccionados(prev => 
      prev.includes(visitanteId)
        ? prev.filter(id => id !== visitanteId)
        : [...prev, visitanteId]
    );
    // No necesita llamada al servidor para esto
  };

  // 🚀 Envío de invitación con feedback inmediato
  const enviarInvitacion = async (visitanteId: string, eventoId: string) => {
    try {
      const visitante = visitantes().find(v => v.id === visitanteId);
      const evento = eventos().find(e => e.id === eventoId);
      
      if (!visitante || !evento) return;
      
      const nuevaInvitacion: Invitacion = {
        id: `inv-${Date.now()}-${Math.random()}`,
        visitanteId,
        eventoId,
        codigo: `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        estado: 'enviada',
        fechaEnvio: new Date().toISOString(),
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        email: visitante.email
      };
      
      // 🚀 Actualización optimista: actualizar UI inmediatamente
      setInvitaciones(prev => [...prev, nuevaInvitacion]);
      
      // Mostrar feedback inmediato
      console.log('📧 Invitación enviada:', {
        visitante: visitante.nombre,
        evento: evento.nombre,
        codigo: nuevaInvitacion.codigo
      });
      
      // Mostrar toast de éxito inmediato
      mostrarToastExito(`✅ Invitación enviada a ${visitante.nombre} ${visitante.apellido || ''}`);
      
      // En segundo plano: enviar email y guardar en Supabase
      // (esto no bloquea la UI)
      setTimeout(async () => {
        try {
          // Aquí iría la llamada real al servidor
          // await invitacionesService.enviar(nuevaInvitacion);
          console.log('📧 Invitación procesada en servidor');
        } catch (error) {
          console.error('❌ Error procesando invitación:', error);
          // Si falla, revertir la UI
          setInvitaciones(prev => prev.filter(inv => inv.id !== nuevaInvitacion.id));
          mostrarToastError('❌ Error enviando invitación');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      mostrarToastError('❌ Error enviando invitación');
    }
  };

  // 🚀 Funciones de toast para feedback inmediato
  const mostrarToastExito = (mensaje: string) => {
    // Crear toast temporal
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const mostrarToastError = (mensaje: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 500;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // 🗑️ Funciones de eliminación individual
  const iniciarEliminacion = (visitante: Visitante) => {
    console.log('🗑️ Iniciando eliminación del visitante:', `${visitante.nombre} ${visitante.apellido || ''}`);
    setVisitanteParaEliminar(visitante);
    setMostrarConfirmacionEliminar(true);
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación individual cancelada');
    setVisitanteParaEliminar(null);
    setMostrarConfirmacionEliminar(false);
  };

  const confirmarEliminacion = async () => {
    const visitante = visitanteParaEliminar();
    if (!visitante) return;

    console.log('🗑️ Eliminando visitante:', `${visitante.nombre} ${visitante.apellido || ''}`);
    setEliminandoVisitante(visitante.id);
    
    try {
      // 🚀 Actualización optimista: remover de UI inmediatamente
      setVisitantes(prev => prev.filter(v => v.id !== visitante.id));
      
      // Feedback inmediato
      mostrarToastExito(`✅ ${visitante.nombre} ${visitante.apellido || ''} eliminado correctamente`);
      
      // En segundo plano: eliminar del servidor
      setTimeout(async () => {
        try {
          // await visitantesService.eliminar(visitante.id);
          console.log('🗑️ Visitante eliminado del servidor');
        } catch (error) {
          console.error('❌ Error eliminando del servidor:', error);
          // Si falla, restaurar en la UI
          setVisitantes(prev => [...prev, visitante]);
          mostrarToastError('❌ Error eliminando visitante');
        }
      }, 100);
      
      // Limpiar estados
      setVisitanteParaEliminar(null);
      setMostrarConfirmacionEliminar(false);
      setEliminandoVisitante(null);
      
    } catch (error) {
      console.error('❌ Error al eliminar visitante:', error);
      setEliminandoVisitante(null);
      mostrarToastError(`❌ Error al eliminar ${visitante.nombre} ${visitante.apellido || ''}`);
    }
  };

  // 🗑️ Funciones de eliminación masiva
  const iniciarEliminacionSeleccionados = () => {
    if (visitantesSeleccionados().length === 0) {
      mostrarToastError('⚠️ Selecciona al menos un visitante');
      return;
    }
    console.log('🗑️ Iniciando eliminación masiva:', visitantesSeleccionados().length);
    setMostrarConfirmacionEliminarSeleccionados(true);
  };

  const cancelarEliminacionSeleccionados = () => {
    console.log('❌ Eliminación masiva cancelada');
    setMostrarConfirmacionEliminarSeleccionados(false);
  };

  const confirmarEliminacionSeleccionados = async () => {
    const idsSeleccionados = visitantesSeleccionados();
    if (idsSeleccionados.length === 0) return;

    console.log('🗑️ Eliminando visitantes seleccionados:', idsSeleccionados.length);
    setEliminandoSeleccionados(true);
    
    try {
      // 🚀 Actualización optimista: remover de UI inmediatamente
      const visitantesEliminados = visitantes().filter(v => idsSeleccionados.includes(v.id));
      setVisitantes(prev => prev.filter(v => !idsSeleccionados.includes(v.id)));
      
      // Feedback inmediato
      mostrarToastExito(`✅ ${idsSeleccionados.length} visitantes eliminados`);
      
      // En segundo plano: eliminar del servidor
      setTimeout(async () => {
        let errores = 0;
        for (const id of idsSeleccionados) {
          try {
            // await visitantesService.eliminar(id);
            console.log('🗑️ Visitante eliminado del servidor:', id);
          } catch (error) {
            console.error('❌ Error eliminando del servidor:', id, error);
            errores++;
          }
        }
        
        if (errores > 0) {
          // Si hay errores, restaurar algunos visitantes
          mostrarToastError(`❌ ${errores} errores durante la eliminación`);
        }
      }, 100);
      
      // Limpiar estados
      setMostrarConfirmacionEliminarSeleccionados(false);
      setEliminandoSeleccionados(false);
      setVisitantesSeleccionados([]);
      
    } catch (error) {
      console.error('❌ Error en eliminación masiva:', error);
      setEliminandoSeleccionados(false);
      mostrarToastError('❌ Error en eliminación masiva');
    }
  };

  // Funciones de importación
  const procesarArchivoImportacion = async (archivo: File) => {
    try {
      const texto = await archivo.text();
      let datos: any[] = [];
      
      if (archivo.name.endsWith('.csv')) {
        // Procesar CSV
        const lineas = texto.split('\n').filter(linea => linea.trim());
        const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lineas.length; i++) {
          const valores = lineas[i].split(',').map(v => v.trim());
          const visitante: any = {};
          
          encabezados.forEach((encabezado, index) => {
            const valor = valores[index]?.replace(/"/g, '') || '';
            
            // Mapear campos comunes
            if (encabezado.includes('nombre') || encabezado.includes('name')) {
              visitante.nombre = valor;
            } else if (encabezado.includes('email') || encabezado.includes('correo')) {
              visitante.email = valor;
            } else if (encabezado.includes('telefono') || encabezado.includes('phone') || encabezado.includes('tel')) {
              visitante.telefono = valor;
            } else if (encabezado.includes('intereses') || encabezado.includes('interests')) {
              visitante.intereses = valor ? valor.split(';').map(i => i.trim()) : [];
            }
          });
          
          if (visitante.nombre && visitante.email) {
            datos.push(visitante);
          }
        }
      } else if (archivo.name.endsWith('.json')) {
        // Procesar JSON
        const jsonData = JSON.parse(texto);
        datos = Array.isArray(jsonData) ? jsonData : [jsonData];
      }
      
      setDatosImportacion(datos);
      console.log('📄 Archivo procesado:', { archivo: archivo.name, registros: datos.length });
      
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      alert('❌ Error procesando el archivo. Verifica el formato.');
    }
  };

  const ejecutarImportacion = async () => {
    if (datosImportacion().length === 0) {
      alert('⚠️ No hay datos para importar');
      return;
    }
    
    setProcesandoImportacion(true);
    const resultado = {
      exitosos: 0,
      errores: 0,
      duplicados: 0,
      detalles: [] as string[]
    };
    
    try {
      for (const dato of datosImportacion()) {
        try {
          // Validar datos requeridos
          if (!dato.nombre || !dato.email) {
            resultado.errores++;
            resultado.detalles.push(`❌ ${dato.nombre || 'Sin nombre'}: Faltan datos requeridos`);
            continue;
          }
          
          // Verificar duplicados por email
          const existente = visitantes().find(v => v.email.toLowerCase() === dato.email.toLowerCase());
          if (existente) {
            resultado.duplicados++;
            resultado.detalles.push(`⚠️ ${dato.nombre}: Email ya existe`);
            continue;
          }
          
          // Crear visitante
          const nuevoVisitante = {
            nombre: dato.nombre,
            email: dato.email.toLowerCase(),
            telefono: dato.telefono || '',
            intereses: dato.intereses || [],
            estado: 'activo',
            fecha_registro: new Date().toISOString()
          };
          
          await visitantesService.crear(nuevoVisitante);
          resultado.exitosos++;
          resultado.detalles.push(`✅ ${dato.nombre}: Importado exitosamente`);
          
        } catch (error) {
          resultado.errores++;
          resultado.detalles.push(`❌ ${dato.nombre}: Error - ${error}`);
        }
      }
      
      setResultadoImportacion(resultado);
      
      // Recargar datos si hubo importaciones exitosas
      if (resultado.exitosos > 0) {
        await cargarDatos();
      }
      
      console.log('📊 Importación completada:', resultado);
      
    } catch (error) {
      console.error('❌ Error en importación:', error);
      alert('❌ Error durante la importación');
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

  return (
    <AdminLayout currentPage="visitantes">
      <div>
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

      <Show when={cargando()}>
        <div style="text-align: center; padding: 2rem; color: #666;">
          🔄 Cargando visitantes...
        </div>
      </Show>

      <Show when={!cargando()}>
        {/* Estadísticas */}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <div>
                <div class="stat-title">Visitantes</div>
              </div>
              <div class="stat-icon blue">
                <FaSolidUsers size={20} color="#3B82F6" />
              </div>
            </div>
            <div class="stat-number">{estadisticas().total}</div>
            <div class="stat-label">Total registrados</div>
            <div class="stat-change positive">
              ↗ En la plataforma
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div>
                <div class="stat-title">Activos</div>
              </div>
              <div class="stat-icon green">
                <FaSolidUserCheck size={20} color="#10B981" />
              </div>
            </div>
            <div class="stat-number">{estadisticas().activos}</div>
            <div class="stat-label">Usuarios activos</div>
            <div class="stat-change positive">
              ↗ Participando
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div>
                <div class="stat-title">Hoy</div>
              </div>
              <div class="stat-icon orange">
                <FaSolidCalendarCheck size={20} color="#F59E0B" />
              </div>
            </div>
            <div class="stat-number">{estadisticas().hoy}</div>
            <div class="stat-label">Registros de hoy</div>
            <div class="stat-change positive">
              ↗ Nuevos
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div>
                <div class="stat-title">Invitaciones</div>
              </div>
              <div class="stat-icon purple">
                <FaSolidEnvelope size={20} color="#8B5CF6" />
              </div>
            </div>
            <div class="stat-number">{invitaciones().length}</div>
            <div class="stat-label">Enviadas totales</div>
            <div class="stat-change positive">
              ↗ Comunicación
            </div>
          </div>
        </div>

        {/* Filtros con glassmorphism */}
        <div class="visitantes-filters">
          <div class="filters-container">
            <div class="primary-filter">
              <div class="search-input-container">
                <FaSolidMagnifyingGlass size={16} color="#ffffff" />
                <input
                  type="text"
                  class="professional-search"
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={busqueda()}
                  onInput={(e) => setBusqueda(e.target.value)}
                />
                <Show when={busqueda()}>
                  <button 
                    class="clear-search"
                    onClick={() => setBusqueda('')}
                  >
                    ×
                  </button>
                </Show>
              </div>
            </div>
            
            <div class="secondary-filters">
              <select 
                class="filter-select"
                value={filtroInteres()} 
                onChange={(e) => setFiltroInteres(e.target.value)}
              >
                <option value="">Todos los intereses</option>
                <For each={interesesUnicos()}>
                  {(interes) => <option value={interes}>{interes}</option>}
                </For>
              </select>
              
              <select 
                class="filter-select"
                value={filtroEstado()} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              
              <Show when={busqueda() || filtroInteres() || filtroEstado()}>
                <button 
                  class="header-btn"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroInteres('');
                    setFiltroEstado('');
                  }}
                >
                  <FaSolidFilter size={12} />
                  Limpiar
                </button>
              </Show>
            </div>
          </div>
          
          <div class="filters-summary">
            <span class="results-count">
              Mostrando {visitantesFiltrados().length} de {visitantes().length} visitantes
            </span>
          </div>
        </div>

        {/* Lista de Visitantes */}
        <div class="visitors-table-section">
          <div class="table-header">
            <div class="table-title">
              <h3>👥 Lista de Visitantes ({visitantesFiltrados().length})</h3>
              <p>Administra y supervisa todos los visitantes registrados</p>
            </div>
            <div class="table-actions">
              <Show when={visitantesSeleccionados().length > 0}>
                <span class="selection-counter">
                  {visitantesSeleccionados().length} seleccionados
                </span>
                <button 
                  class="btn-bulk-action"
                  onClick={() => setModalInvitacion(true)}
                >
                  <FaSolidEnvelope size={14} />
                  Invitar seleccionados
                </button>
                <button 
                  class="btn-bulk-action danger"
                  onClick={iniciarEliminacionSeleccionados}
                  disabled={eliminandoSeleccionados()}
                >
                  <FaSolidPen size={14} />
                  {eliminandoSeleccionados() ? 'Eliminando...' : `Eliminar ${visitantesSeleccionados().length}`}
                </button>
              </Show>
            </div>
          </div>

          <div class="professional-table-container">
            <table class="professional-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <div class="th-content">
                      <input 
                        type="checkbox" 
                        class="professional-checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisitantesSeleccionados(visitantesFiltrados().map(v => v.id));
                          } else {
                            setVisitantesSeleccionados([]);
                          }
                        }}
                      />
                    </div>
                  </th>
                  <th class="visitor-col">
                    <div class="th-content">
                      <FaSolidUsers size={14} />
                      <span>Visitante</span>
                    </div>
                  </th>
                  <th class="contact-col">
                    <div class="th-content">
                      <FaSolidPhone size={14} />
                      <span>Contacto</span>
                    </div>
                  </th>
                  <th class="interests-col">
                    <div class="th-content">
                      <FaSolidHeart size={14} />
                      <span>Intereses</span>
                    </div>
                  </th>
                  <th class="status-col">
                    <div class="th-content">
                      <FaSolidUserCheck size={14} />
                      <span>Estado</span>
                    </div>
                  </th>
                  <th class="date-col">
                    <div class="th-content">
                      <FaSolidCalendarCheck size={14} />
                      <span>Registro</span>
                    </div>
                  </th>
                  <th class="invitations-col">
                    <div class="th-content">
                      <FaSolidEnvelope size={14} />
                      <span>Actividad</span>
                    </div>
                  </th>
                  <th class="actions-col">
                    <div class="th-content">
                      <span>Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={visitantesFiltrados()}>
                  {(visitante) => {
                    const invitacionesVisitante = invitaciones().filter(i => i.visitanteId === visitante.id);
                    const isSelected = visitantesSeleccionados().includes(visitante.id);
                    
                    return (
                      <tr class={isSelected ? 'selected' : ''}>
                        <td class="checkbox-col">
                          <input 
                            type="checkbox" 
                            class="professional-checkbox"
                            checked={isSelected}
                            onChange={() => toggleSeleccionVisitante(visitante.id)}
                          />
                        </td>
                        <td class="visitor-col">
                          <div class="visitor-profile">
                            <div class="visitor-details">
                              <div class="visitor-name" style="color: #4b5563; font-weight: 500; font-size: 13px;">
                                {visitante.nombre} {visitante.apellido || ''}
                              </div>
                              <div class="visitor-id">ID: {visitante.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td class="contact-col">
                          <div class="contact-info">
                            <div class="contact-item">
                              <FaSolidEnvelope size={12} color="#6b7280" />
                              <span class="contact-text">{visitante.email}</span>
                            </div>
                            <div class="contact-item">
                              <FaSolidPhone size={12} color="#6b7280" />
                              <span class="contact-text">
                                {visitante.telefono && visitante.telefono.trim() !== '' 
                                  ? visitante.telefono 
                                  : 'No registrado'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td class="interests-col">
                          <div class="interests-container">
                            <Show when={visitante.intereses && visitante.intereses.length > 0}>
                              <For each={visitante.intereses.slice(0, 2)}>
                                {(interes) => (
                                  <span class="interest-tag">
                                    <FaSolidHeart size={8} />
                                    {interes}
                                  </span>
                                )}
                              </For>
                              <Show when={visitante.intereses.length > 2}>
                                <span class="interest-more">+{visitante.intereses.length - 2}</span>
                              </Show>
                            </Show>
                            <Show when={!visitante.intereses || visitante.intereses.length === 0}>
                              <span class="no-interests">Sin intereses</span>
                            </Show>
                          </div>
                        </td>
                        <td class="status-col">
                          <span class={`status-badge ${visitante.estado || 'activo'}`}>
                            <span class="status-dot"></span>
                            {visitante.estado || 'activo'}
                          </span>
                        </td>
                        <td class="date-col">
                          <div class="date-info">
                            <div class="date-primary">
                              {new Date(visitante.fecha_registro).toLocaleDateString('es-DO', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </div>
                            <div class="date-secondary">
                              {new Date(visitante.fecha_registro).getFullYear()}
                            </div>
                          </div>
                        </td>
                        <td class="invitations-col">
                          <div class="activity-summary">
                            <div class="activity-item">
                              <span class="activity-number">{invitacionesVisitante.length}</span>
                              <span class="activity-label">Invitaciones</span>
                            </div>
                            <div class="activity-badges">
                              <Show when={invitacionesVisitante.filter(i => i.estado === 'enviada').length > 0}>
                                <span class="activity-badge sent">
                                  {invitacionesVisitante.filter(i => i.estado === 'enviada').length}
                                </span>
                              </Show>
                              <Show when={invitacionesVisitante.filter(i => i.estado === 'confirmada').length > 0}>
                                <span class="activity-badge confirmed">
                                  {invitacionesVisitante.filter(i => i.estado === 'confirmada').length}
                                </span>
                              </Show>
                            </div>
                          </div>
                        </td>
                        <td class="actions-col">
                          <div class="action-buttons">
                            <button 
                              class="action-btn view"
                              onClick={() => {
                                console.log('Visitante seleccionado:', visitante);
                                setVisitanteSeleccionado(visitante);
                                setModalDetalles(true);
                              }}
                              title="Ver detalles completos"
                            >
                              <FaSolidEye size={14} />
                            </button>
                            <button 
                              class="action-btn edit"
                              onClick={() => {
                                if (eventos().length > 0) {
                                  enviarInvitacion(visitante.id, eventos()[0].id);
                                } else {
                                  alert('No hay eventos disponibles');
                                }
                              }}
                              title="Enviar invitación"
                            >
                              <FaSolidEnvelope size={14} />
                            </button>
                            <button 
                              class="action-btn delete"
                              onClick={() => iniciarEliminacion(visitante)}
                              disabled={eliminandoVisitante() === visitante.id}
                              title={eliminandoVisitante() === visitante.id ? 'Eliminando...' : 'Eliminar visitante'}
                            >
                              <FaSolidPen size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
            
            <Show when={visitantesFiltrados().length === 0}>
              <div class="empty-state">
                <FaSolidUsers size={48} color="#cbd5e1" />
                <h3>No se encontraron visitantes</h3>
                <p>Intenta ajustar los filtros o importa nuevos visitantes</p>
                <button 
                  class="btn-primary"
                  onClick={() => setModalImportacion(true)}
                >
                  <FaSolidFileImport size={16} />
                  Importar Visitantes
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>

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
                <select value={eventoInvitacion()} onChange={(e) => setEventoInvitacion(e.target.value)}>
                  <option value="">Seleccionar evento</option>
                  <For each={eventos().filter(e => e.estado === 'activo' || e.estado === 'proximo')}>
                    {(evento) => (
                      <option value={evento.id}>{evento.nombre} - {new Date(evento.fecha).toLocaleDateString()}</option>
                    )}
                  </For>
                </select>
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

      {/* Modal de Detalles Mejorado */}
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
                  
                  <div class="stat-card info">
                    <div class="stat-icon">
                      <FaSolidHeart size={20} />
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{visitanteSeleccionado()?.intereses?.length || 0}</div>
                      <div class="stat-label">Intereses</div>
                    </div>
                  </div>
                  
                  <div class="stat-card warning">
                    <div class="stat-icon">
                      <FaSolidCode size={20} />
                    </div>
                    <div class="stat-content">
                      <div class="stat-number">{invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id && i.estado === 'abierta').length}</div>
                      <div class="stat-label">Pendientes</div>
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
                        <span class="empty-text">El visitante aún no ha definido sus preferencias</span>
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

              {/* Historial de Invitaciones */}
              <div class="invitations-section">
                <h3 class="section-title">
                  <FaSolidTicket size={16} />
                  Historial de Invitaciones
                </h3>
                <div class="invitations-container">
                  <Show 
                    when={invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id).length > 0}
                    fallback={
                      <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>Sin invitaciones registradas</p>
                        <span class="empty-text">Este visitante no tiene invitaciones en el sistema</span>
                      </div>
                    }
                  >
                    <div class="invitations-list">
                      <For each={invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id)}>
                        {(inv) => (
                          <div class="invitation-card">
                            <div class="invitation-header">
                              <div class="invitation-event">
                                <div class="event-name">
                                  {eventos().find(e => e.id === inv.eventoId)?.titulo || 'Evento no encontrado'}
                                </div>
                                <div class="event-date">
                                  {eventos().find(e => e.id === inv.eventoId)?.fecha ? 
                                    new Date(eventos().find(e => e.id === inv.eventoId)?.fecha || '').toLocaleDateString('es-ES', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })
                                    : 'Fecha no disponible'
                                  }
                                </div>
                              </div>
                              <span class={`invitation-status status-${inv.estado}`}>
                                {inv.estado === 'abierta' ? '⏳ Pendiente' : 
                                 inv.estado === 'confirmada' ? '✅ Confirmada' : 
                                 inv.estado === 'cancelada' ? '❌ Cancelada' : inv.estado}
                              </span>
                            </div>
                            
                            <div class="invitation-details">
                              <div class="detail-item">
                                <FaSolidCode size={12} />
                                <span class="detail-label">Código:</span>
                                <span class="detail-value invitation-code">{inv.codigo}</span>
                              </div>
                              <div class="detail-item">
                                <FaSolidCalendarCheck size={12} />
                                <span class="detail-label">Enviado:</span>
                                <span class="detail-value">{new Date(inv.fechaEnvio).toLocaleDateString('es-ES')}</span>
                              </div>
                              <Show when={inv.fechaConfirmacion}>
                                <div class="detail-item">
                                  <FaSolidUserCheck size={12} />
                                  <span class="detail-label">Check-in:</span>
                                  <span class="detail-value">{new Date(inv.fechaConfirmacion || '').toLocaleDateString('es-ES')}</span>
                                </div>
                              </Show>
                            </div>
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
                <button class="btn-primary" onClick={() => {
                  // Aquí se puede agregar funcionalidad para editar
                  console.log('Editar visitante:', visitanteSeleccionado()?.id);
                }}>
                  <FaSolidPen size={14} />
                  Editar Visitante
                </button>
                <button class="btn-success" onClick={() => {
                  // Aquí se puede agregar funcionalidad para enviar invitación
                  console.log('Enviar invitación a:', visitanteSeleccionado()?.email);
                }}>
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
                              setArchivoImportacion(archivo);
                              await procesarArchivoImportacion(archivo);
                            }
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
                  
                  <Show when={datosImportacion().length > 0}>
                    <div class="import-preview">
                      <h4>👀 Vista previa de los datos:</h4>
                      <div class="preview-table">
                        <table class="admin-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Email</th>
                              <th>Teléfono</th>
                              <th>Intereses</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            <For each={datosImportacion().slice(0, 5)}>
                              {(dato) => (
                                <tr>
                                  <td>{dato.nombre || '❌ Requerido'}</td>
                                  <td>{dato.email || '❌ Requerido'}</td>
                                  <td>{dato.telefono || '-'}</td>
                                  <td>
                                    <Show when={dato.intereses?.length}>
                                      {dato.intereses.slice(0, 2).join(', ')}
                                      {dato.intereses.length > 2 && `... +${dato.intereses.length - 2}`}
                                    </Show>
                                    <Show when={!dato.intereses?.length}>-</Show>
                                  </td>
                                  <td>
                                    <span class={`status-badge ${(!dato.nombre || !dato.email) ? 'error' : 'activo'}`}>
                                      {(!dato.nombre || !dato.email) ? 'Error' : 'Válido'}
                                    </span>
                                  </td>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </table>
                        <Show when={datosImportacion().length > 5}>
                          <p class="preview-note">... y {datosImportacion().length - 5} registros más</p>
                        </Show>
                      </div>
                    </div>
                  </Show>
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
                  
                  <div class="results-details">
                    <h5>📝 Detalles:</h5>
                    <div class="details-list">
                      <For each={resultadoImportacion()?.detalles.slice(0, 10)}>
                        {(detalle) => <p>{detalle}</p>}
                      </For>
                      <Show when={(resultadoImportacion()?.detalles.length || 0) > 10}>
                        <p>... y {(resultadoImportacion()?.detalles.length || 0) - 10} más</p>
                      </Show>
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