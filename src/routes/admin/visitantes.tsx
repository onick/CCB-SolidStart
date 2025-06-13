import { Component, createSignal, createEffect, onMount, Show, For } from 'solid-js';
import { visitantesService, eventosService, forceInvalidateCache } from '../../lib/supabase/services';
import { Visitante, Evento } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/admin.css';
import '../../styles/visitantes-filters.css';

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
  FaSolidUpload
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
    
    // 🔄 AUTO-REFRESH cada 30 segundos para sincronización con eventos-públicos
    setInterval(() => {
      cargarDatos();
      console.log('🔄 Auto-refresh: visitantes admin actualizados');
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

  // Funciones de invitaciones
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
      
      // En producción: enviar email y guardar en Supabase
      setInvitaciones(prev => [...prev, nuevaInvitacion]);
      
      console.log('📧 Invitación enviada:', {
        visitante: visitante.nombre,
        evento: evento.nombre,
        codigo: nuevaInvitacion.codigo
      });
      
      alert(`✅ Invitación enviada a ${visitante.nombre}\nCódigo: ${nuevaInvitacion.codigo}`);
      
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      alert('❌ Error enviando invitación');
    }
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

  const toggleSeleccionVisitante = (visitanteId: string) => {
    setVisitantesSeleccionados(prev => 
      prev.includes(visitanteId)
        ? prev.filter(id => id !== visitanteId)
        : [...prev, visitanteId]
    );
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
      <div class="admin-content">
        {/* Header */}
        <div class="breadcrumb">
          <span>Visitantes</span>
          <span>/</span>
          <span>Gestión</span>
          <span>/</span>
          <span>Centro Cultural Banreservas</span>
        </div>

      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <FaSolidUsers size={28} color="#3B82F6" style="margin-right: 12px;" />
            Gestión de Visitantes 👥
          </h1>
          <p class="welcome-subtitle">Administra visitantes, intereses e invitaciones</p>
        </div>
        <div class="welcome-actions">
          <button class="header-btn share" onClick={() => setModalInvitacion(true)}>
            <FaSolidEnvelope size={16} />
            Invitar
          </button>
          <button class="header-btn primary" onClick={() => setModalImportacion(true)}>
            <FaSolidFileImport size={16} />
            Importar
          </button>
          <button class="header-btn create">
            <FaSolidDownload size={16} />
            Exportar
          </button>
        </div>
      </div>

      <Show when={cargando()}>
        <div style="text-align: center; padding: 2rem; color: #666;">
          🔄 Cargando visitantes...
        </div>
      </Show>

      <Show when={!cargando()}>
        {/* Estadísticas */}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);">
              <FaSolidUsers size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().total}</h3>
              <p class="stat-label">TOTAL VISITANTES</p>
              <p class="stat-sublabel">Registrados en plataforma</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #10B981 0%, #047857 100%);">
              <FaSolidUserCheck size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().activos}</h3>
              <p class="stat-label">ACTIVOS</p>
              <p class="stat-sublabel">Visitantes activos</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
              <FaSolidCalendarCheck size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{estadisticas().hoy}</h3>
              <p class="stat-label">HOY</p>
              <p class="stat-sublabel">Registros de hoy</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);">
              <FaSolidEnvelope size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{invitaciones().length}</h3>
              <p class="stat-label">INVITACIONES</p>
              <p class="stat-sublabel">Enviadas totales</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);">
              <FaSolidChartLine size={24} color="white" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{Math.round((invitaciones().filter(i => i.estado === 'confirmada').length / (invitaciones().length || 1)) * 100)}%</h3>
              <p class="stat-label">TASA RESPUESTA</p>
              <p class="stat-sublabel">Invitaciones confirmadas</p>
            </div>
          </div>
        </div>

        {/* Filtros Profesionales */}
        <div class="professional-filters">
          <div class="filters-container">
            <div class="primary-filter">
              <div class="search-input-container">
                <FaSolidMagnifyingGlass size={16} color="#6b7280" />
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
              <div class="filter-group">
                <label class="filter-label">
                  <FaSolidHeart size={12} />
                  Intereses
                </label>
                <select 
                  class="professional-select"
                  value={filtroInteres()} 
                  onChange={(e) => setFiltroInteres(e.target.value)}
                >
                  <option value="">Todos los intereses</option>
                  <For each={interesesUnicos()}>
                    {(interes) => <option value={interes}>{interes}</option>}
                  </For>
                </select>
              </div>
              
              <div class="filter-group">
                <label class="filter-label">
                  <FaSolidUserCheck size={12} />
                  Estado
                </label>
                <select 
                  class="professional-select"
                  value={filtroEstado()} 
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              
              <Show when={busqueda() || filtroInteres() || filtroEstado()}>
                <button 
                  class="clear-filters-btn"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroInteres('');
                    setFiltroEstado('');
                  }}
                >
                  <FaSolidFilter size={12} />
                  Limpiar filtros
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
                <button class="btn-bulk-action">
                  <FaSolidEnvelope size={14} />
                  Invitar seleccionados
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
                            <div class="visitor-avatar">
                              {/* Avatar sin letra - solo gradiente */}
                            </div>
                            <div class="visitor-details">
                              <div class="visitor-name">{visitante.nombre}</div>
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
                          <span class={`professional-status ${visitante.estado || 'activo'}`}>
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
                              class="btn-action primary"
                              onClick={() => {
                                setVisitanteSeleccionado(visitante);
                                setModalDetalles(true);
                              }}
                              title="Ver detalles completos"
                            >
                              <FaSolidUsers size={14} />
                            </button>
                            <button 
                              class="btn-action success"
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
                              class="btn-action secondary"
                              title="Ver códigos de acceso"
                            >
                              <FaSolidCode size={14} />
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
                        <span>{visitante.nombre}</span>
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

      {/* Modal de Detalles */}
      <Show when={modalDetalles() && visitanteSeleccionado()}>
        <div class="modal-overlay" onClick={() => setModalDetalles(false)}>
          <div class="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>👤 Detalles del Visitante</h3>
              <button class="modal-close" onClick={() => setModalDetalles(false)}>×</button>
            </div>
            
            <div class="modal-body">
              <div class="visitor-details">
                <div class="visitor-profile">
                  <div class="visitor-avatar large">
                    {visitanteSeleccionado()?.nombre.charAt(0)}
                  </div>
                  <div class="visitor-info">
                    <h2>{visitanteSeleccionado()?.nombre}</h2>
                    <p>{visitanteSeleccionado()?.email}</p>
                    <p>{visitanteSeleccionado()?.telefono}</p>
                  </div>
                </div>
                
                <div class="visitor-stats">
                  <div class="stat-item">
                    <FaSolidTicket size={16} />
                    <span>Eventos registrados: {invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id).length}</span>
                  </div>
                  <div class="stat-item">
                    <FaSolidCalendarCheck size={16} />
                    <span>Check-ins realizados: {invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id && i.estado === 'confirmada').length}</span>
                  </div>
                </div>
                
                <div class="visitor-interests">
                  <h4>Intereses:</h4>
                  <div class="interests-list">
                    <For each={visitanteSeleccionado()?.intereses || []}>
                      {(interes) => (
                        <span class="interest-tag large">
                          <FaSolidHeart size={12} />
                          {interes}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
                
                <div class="visitor-invitations">
                  <h4>Historial de Invitaciones:</h4>
                  <div class="invitations-list">
                    <For each={invitaciones().filter(i => i.visitanteId === visitanteSeleccionado()?.id)}>
                      {(inv) => (
                        <div class="invitation-item">
                          <div class="inv-code">
                            <FaSolidCode size={14} />
                            {inv.codigo}
                          </div>
                          <div class="inv-event">
                            {eventos().find(e => e.id === inv.eventoId)?.nombre}
                          </div>
                          <div class="inv-date">
                            {new Date(inv.fechaEnvio).toLocaleDateString()}
                          </div>
                          <span class={`status-badge ${inv.estado}`}>
                            {inv.estado}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
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
    </div>
    </AdminLayout>
  );
};

export default VisitantesAdmin;