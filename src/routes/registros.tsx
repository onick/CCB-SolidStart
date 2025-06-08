import { Component, createSignal, For, onMount, Show, onCleanup } from 'solid-js';
import { eventosService, registroEventosService } from '../lib/supabase/services';
import AdminLayout from '../components/AdminLayout';
import * as echarts from 'echarts';
// 🎨 Importando solid-icons para mejor rendimiento y integración nativa
import {
    FaRegularCalendar,
    FaRegularClock,
    FaSolidArrowsRotate,
    FaSolidCalendarDay,
    FaSolidChartBar,
    FaSolidChartLine,
    FaSolidCheck,
    FaSolidCircleCheck,
    FaSolidCode,
    FaSolidDownload,
    FaSolidGear,
    FaSolidHouse,
    FaSolidInbox,
    FaSolidPercent,
    FaSolidQrcode,
    FaSolidSpinner,
    FaSolidTags,
    FaSolidTicket,
    FaSolidUserCheck,
    FaSolidUsers
} from 'solid-icons/fa';
import '../styles/admin.css';

const Registros: Component = () => {
  const [registros, setRegistros] = createSignal([]);
  const [eventos, setEventos] = createSignal([]);
  const [estadisticas, setEstadisticas] = createSignal({
    total: 0,
    confirmados: 0,
    checkins: 0,
    pendientes: 0,
    hoy: 0,
    tasaAsistencia: 0
  });
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterEstado, setFilterEstado] = createSignal('todos');
  const [filterEvento, setFilterEvento] = createSignal('todos');


  // Variables para los gráficos ECharts
  let chartEstadisticas: echarts.ECharts | null = null;
  let chartTendencia: echarts.ECharts | null = null;

  onMount(() => {
    cargarDatos();
    // Auto-recarga cada 30 segundos
    setInterval(cargarDatos, 30000);
    // Inicializar gráficos después de cargar datos
    setTimeout(() => {
      inicializarGraficos();
    }, 1000);
  });

  // Limpiar gráficos ECharts al desmontar el componente
  onCleanup(() => {
    if (chartEstadisticas) chartEstadisticas.dispose();
    if (chartTendencia) chartTendencia.dispose();
  });

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      console.log('📋 Cargando registros y estadísticas...');
      
      const [registrosData, eventosData, estadisticasData] = await Promise.all([
        registroEventosService.obtenerTodosLosRegistros(),
        eventosService.obtenerTodos(),
        registroEventosService.obtenerEstadisticasRegistros()
      ]);
      
      setRegistros(registrosData);
      setEventos(eventosData);
      setEstadisticas(estadisticasData);
      
      console.log('✅ Datos cargados:', {
        registros: registrosData.length,
        eventos: eventosData.length,
        estadisticas: estadisticasData
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredRegistros = () => {
    return registros().filter(registro => {
      const matchesSearch = registro.codigo_confirmacion.toLowerCase().includes(searchTerm().toLowerCase()) ||
                           (registro.visitante?.nombre?.toLowerCase().includes(searchTerm().toLowerCase())) ||
                           (registro.visitante?.apellido?.toLowerCase().includes(searchTerm().toLowerCase())) ||
                           (registro.visitante?.email?.toLowerCase().includes(searchTerm().toLowerCase()));
      
      const matchesEstado = filterEstado() === 'todos' || registro.estado === filterEstado();
      const matchesEvento = filterEvento() === 'todos' || registro.evento_id === filterEvento();
      
      return matchesSearch && matchesEstado && matchesEvento;
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado': return '#10B981';
      case 'checkin': return '#3B82F6';
      case 'pendiente': return '#F59E0B';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmado': return '✅';
      case 'checkin': return '🎫';
      case 'pendiente': return '⏳';
      case 'cancelado': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventoTitulo = (eventoId: string) => {
    const evento = eventos().find(e => e.id === eventoId);
    return evento?.titulo || 'Evento no encontrado';
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    window.location.href = '/admin';
  };

  // 🚀 Función para inicializar ambos gráficos ECharts
  const inicializarGraficos = () => {
    console.log('📊 ¡Inicializando gráficos ECharts!');
    
    // 🍩 GRÁFICO DE DONA - Estado de Registros
    const chartContainer1 = document.getElementById('chartEstadisticasRegistros');
    if (chartContainer1 && !chartEstadisticas) {
      chartEstadisticas = echarts.init(chartContainer1);
      
      const pieOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Estado de Registros',
          subtext: `Total: ${estadisticas().total} registros`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1f2937'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#6b7280'
          }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#374151',
          borderWidth: 1,
          borderRadius: 8,
          textStyle: {
            color: '#f9fafb',
            fontSize: 14
          },
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 15,
          itemGap: 25,
          textStyle: {
            fontSize: 12,
            color: '#6b7280'
          },
          itemWidth: 18,
          itemHeight: 14
        },
        series: [
          {
            name: 'Registros',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: false,
            emphasis: {
              scale: true,
              scaleSize: 8,
              itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            labelLine: {
              show: false
            },
            label: {
              show: false,
              position: 'center'
            },
            data: [
              {
                value: estadisticas().checkins,
                name: 'Check-ins',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#34d399' },
                    { offset: 1, color: '#10b981' }
                  ])
                }
              },
              {
                value: estadisticas().confirmados,
                name: 'Confirmados',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#60a5fa' },
                    { offset: 1, color: '#3b82f6' }
                  ])
                }
              },
              {
                value: estadisticas().pendientes,
                name: 'Pendientes',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#fbbf24' },
                    { offset: 1, color: '#f59e0b' }
                  ])
                }
              }
            ],
            animationType: 'scale',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      
      chartEstadisticas.setOption(pieOption);
    }

    // 📈 GRÁFICO DE LÍNEA MODERNO - Tendencia de Registros
    const chartContainer2 = document.getElementById('chartTendenciaRegistros');
    if (chartContainer2 && !chartTendencia) {
      chartTendencia = echarts.init(chartContainer2);
      
      const lineOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Tendencia Semanal',
          subtext: 'Últimos 7 días',
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1f2937'
          },
          subtextStyle: {
            fontSize: 12,
            color: '#6b7280'
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#374151',
          borderWidth: 1,
          borderRadius: 8,
          textStyle: {
            color: '#f9fafb',
            fontSize: 13
          },
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#6b7280'
            }
          }
        },
        legend: {
          top: 35,
          itemGap: 120,
          itemWidth: 18,
          itemHeight: 12,
          textStyle: {
            fontSize: 13,
            color: '#6b7280',
            padding: [0, 0, 0, 30]
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          top: '25%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: 'Registros',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [12, 19, 15, 25, 18, 30, 22],
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ])
            },
            itemStyle: {
              color: '#3b82f6',
              borderColor: '#ffffff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ])
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(59, 130, 246, 0.5)'
              }
            }
          },
          {
            name: 'Check-ins',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [8, 14, 12, 20, 15, 25, 18],
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#34d399' },
                { offset: 1, color: '#10b981' }
              ])
            },
            itemStyle: {
              color: '#10b981',
              borderColor: '#ffffff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
              ])
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(16, 185, 129, 0.5)'
              }
            }
          }
        ],
        animationDuration: 1500
      };
      
      chartTendencia.setOption(lineOption);
    }

    // 🎯 Hacer que los gráficos se adapten al tamaño de ventana
    window.addEventListener('resize', () => {
      if (chartEstadisticas) chartEstadisticas.resize();
      if (chartTendencia) chartTendencia.resize();
    });
  };

  return (
    <AdminLayout currentPage="registros" onLogout={handleLogout}>
        <header class="main-header">
          <div class="header-content">
            <div class="header-left">
              <h1 style="font-size: 32px; font-weight: 800; color: #1F2937; margin: 0 0 8px 0;">
                📋 Gestión de Registros
              </h1>
              <p style="font-size: 16px; color: #6B7280; margin: 0;">
                Monitorea y gestiona todos los registros de eventos en tiempo real
              </p>
            </div>
          </div>
        </header>

        <div class="main-content">
          {/* Estadísticas */}
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon green">
                  <FaSolidChartLine size={24} color="white" />
                </div>
                <div class="stat-title">Total Registros</div>
              </div>
              <div class="stat-number">{estadisticas().total}</div>
              <div class="stat-label">Registros totales</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon blue">
                  <FaSolidCircleCheck size={24} color="white" />
                </div>
                <div class="stat-title">Confirmados</div>
              </div>
              <div class="stat-number">{estadisticas().confirmados}</div>
              <div class="stat-label">Asistencias confirmadas</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon purple">
                  <FaSolidUserCheck size={24} color="white" />
                </div>
                <div class="stat-title">Check-ins</div>
              </div>
              <div class="stat-number">{estadisticas().checkins}</div>
              <div class="stat-label">Personas presentes</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon orange">
                  <FaRegularClock size={24} color="white" />
                </div>
                <div class="stat-title">Pendientes</div>
              </div>
              <div class="stat-number">{estadisticas().pendientes}</div>
              <div class="stat-label">Por confirmar</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-header">
                <div class="stat-icon red">
                  <FaSolidCalendarDay size={24} color="white" />
                </div>
                <div class="stat-title">Hoy</div>
              </div>
              <div class="stat-number">{estadisticas().hoy}</div>
              <div class="stat-label">Registros de hoy</div>
            </div>
            
          </div>

          {/* Gráficos de Estadísticas de Registros */}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            {/* Gráfico Estado de Registros */}
            <div class="content-card">
              <div class="card-header">
                <h2 class="card-title">
                  <FaSolidChartBar size={20} style={{"margin-right": "8px", "color": "#3b82f6"}} />
                  Estado de Registros
                </h2>
              </div>
              <div style="padding: 20px; height: 350px;">
                <div id="chartEstadisticasRegistros" style="width: 100%; height: 100%;"></div>
              </div>
            </div>

            {/* Gráfico Tendencia de Registros */}
            <div class="content-card">
              <div class="card-header">
                <h2 class="card-title">
                  <FaSolidChartLine size={20} style={{"margin-right": "8px", "color": "#10b981"}} />
                  Tendencia de Registros
                </h2>
              </div>
              <div style="padding: 20px; height: 350px;">
                <div id="chartTendenciaRegistros" style="width: 100%; height: 100%;"></div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div class="content-card" style="margin-bottom: 20px;">
            <div class="card-header">
              <h2 class="card-title">Filtros de Búsqueda</h2>
            </div>
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 15px; align-items: end;">
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Buscar:</label>
                  <input
                    type="text"
                    placeholder="Código, nombre, apellido o email..."
                    value={searchTerm()}
                    onInput={(e) => setSearchTerm(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  />
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Estado:</label>
                  <select
                    value={filterEstado()}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todos">Todos</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="checkin">Check-ins</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Evento:</label>
                  <select
                    value={filterEvento()}
                    onChange={(e) => setFilterEvento(e.target.value)}
                    style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;"
                  >
                    <option value="todos">Todos los eventos</option>
                    <For each={eventos()}>
                      {(evento) => (
                        <option value={evento.id}>{evento.titulo}</option>
                      )}
                    </For>
                  </select>
                </div>
                <button
                  onclick={cargarDatos}
                  style="background: #3B82F6; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                >
                  <FaSolidArrowsRotate size={16} color="white" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Registros */}
          <div class="content-card">
            <div class="card-header">
              <h2 class="card-title">Registros ({filteredRegistros().length})</h2>
            </div>
            
            <Show when={isLoading()}>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #666;">
                <FaSolidSpinner size={24} style={{"animation": "spin 1s linear infinite", "margin-bottom": "10px"}} />
                <p style="font-size: 16px; margin: 0;">Cargando registros...</p>
              </div>
            </Show>
            
            <Show when={!isLoading() && filteredRegistros().length === 0}>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #999;">
                <FaSolidInbox size={48} style={{"margin-bottom": "15px", "opacity": "0.5"}} />
                <p style="font-size: 18px; margin: 0; font-weight: 500;">No hay registros que mostrar</p>
                <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.7;">Los registros aparecerán aquí cuando se creen</p>
              </div>
            </Show>

            <Show when={!isLoading() && filteredRegistros().length > 0}>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Código</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Visitante</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Evento</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Fecha Registro</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Estado</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredRegistros()}>
                      {(registro) => (
                        <tr style="border-bottom: 1px solid #E5E7EB; hover:background-color: #F9FAFB;">
                          <td style="padding: 12px;">
                            <div style="font-family: monospace; font-weight: 600; color: #1f2937; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                              {registro.codigo_confirmacion}
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <div>
                              <div style="font-weight: 500; color: #111827;">
                                {registro.visitante?.nombre} {registro.visitante?.apellido}
                              </div>
                              <div style="font-size: 12px; color: #6B7280;">
                                {registro.visitante?.email}
                              </div>
                              <Show when={registro.visitante?.telefono}>
                                <div style="font-size: 12px; color: #6B7280;">
                                  📞 {registro.visitante?.telefono}
                                </div>
                              </Show>
                            </div>
                          </td>
                          <td style="padding: 12px;">
                            <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #374151;">
                              {getEventoTitulo(registro.evento_id)}
                            </div>
                          </td>
                          <td style="padding: 12px; color: #374151; font-size: 13px;">
                            {formatDate(registro.fecha_registro)}
                          </td>
                          <td style="padding: 12px;">
                            <span style={`background: ${getEstadoColor(registro.estado)}20; color: ${getEstadoColor(registro.estado)}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; width: fit-content;`}>
                              <span>{getEstadoIcon(registro.estado)}</span>
                              {registro.estado}
                            </span>
                          </td>
                          <td style="padding: 12px;">
                            <Show when={registro.estado === 'confirmado'}>
                              <button 
                                onclick={async () => {
                                  const success = await registroEventosService.confirmarCheckin(registro.codigo_confirmacion);
                                  if (success) {
                                    alert('✅ Check-in confirmado exitosamente');
                                    cargarDatos();
                                  } else {
                                    alert('❌ Error al confirmar check-in');
                                  }
                                }}
                                style="background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 4px;"
                              >
                                <FaSolidCheck size={14} />
                                Check-in
                              </button>
                            </Show>
                            <Show when={registro.estado === 'checkin'}>
                              <span style="color: #10B981; font-size: 12px; font-weight: 600;">
                                ✅ Asistió
                              </span>
                            </Show>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </div>
    </AdminLayout>
  );
};

export default Registros; 