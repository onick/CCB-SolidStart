import { Component, createSignal, onMount, Show, For, onCleanup } from 'solid-js';
import '../../styles/admin.css';
import * as echarts from 'echarts';
import AdminLayout from '../../components/AdminLayout';
import { estadisticasService } from '../../lib/supabase/services';

// Solid Icons
import {
  FaSolidFilePdf,
  FaSolidDownload,
  FaSolidChartLine,
  FaSolidUsers,
  FaSolidTicket,
  FaSolidRotate,
  FaSolidGear,
  FaSolidEye,
  FaSolidFileExport,
  FaSolidClock,
  FaSolidHouse,
  FaSolidChartBar,
  FaSolidUserCheck,
  FaSolidCode,
  FaSolidShare,
  FaSolidPlus,
  FaSolidArrowRightFromBracket,
  FaSolidArrowUp,
  FaSolidArrowDown,
  FaSolidCalendarDays,
  FaSolidFilter,
  FaSolidChartPie
} from 'solid-icons/fa';
import { FaRegularCalendar } from 'solid-icons/fa';

const ReportesAdmin: Component = () => {
  
  const [cargando, setCargando] = createSignal(false);
  const [cargandoTopEventos, setCargandoTopEventos] = createSignal(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = createSignal('24h');
  const [rangoFechas, setRangoFechas] = createSignal({
    inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  
  const [metricas, setMetricas] = createSignal({
    eventos: {
      total: 124,
      activos: 8,
      variacion: 15.3,
      tendencia: 'up'
    },
    visitantes: {
      total: 2847,
      nuevosHoy: 23,
      variacion: -2.1,
      tendencia: 'down'
    },
    registros: {
      total: 1456,
      confirmados: 1234,
      variacion: 8.7,
      tendencia: 'up'
    },
    ingresos: {
      total: 458750,
      esteMes: 125400,
      variacion: 12.4,
      tendencia: 'up'
    }
  });

  const [datosGrafico, setDatosGrafico] = createSignal([
    { hora: '00:00', valor: 0.05 },
    { hora: '03:00', valor: 0.08 },
    { hora: '06:00', valor: 0.15 },
    { hora: '09:00', valor: 0.28 },
    { hora: '12:00', valor: 0.45 },
    { hora: '15:00', valor: 0.38 },
    { hora: '18:00', valor: 0.52 },
    { hora: '21:00', valor: 0.35 },
    { hora: '24:00', valor: 0.15 }
  ]);

  const [topEventos, setTopEventos] = createSignal([]);

  // ECharts referencias para 4 gráficos principales
  let chartEventosDistribucion: echarts.ECharts | null = null;
  let chartTendenciaEventos: echarts.ECharts | null = null;
  let chartRegistrosEstado: echarts.ECharts | null = null;
  let chartActividadTiempo: echarts.ECharts | null = null;

  onMount(() => {
    cargarDatos();
    cargarTopEventos(); // ✅ Cargar datos reales de top eventos
    setTimeout(() => {
      inicializarGraficos();
    }, 100);
    
    // Event listener para resize
    const handleResize = () => {
      if (chartEventosDistribucion) chartEventosDistribucion.resize();
      if (chartTendenciaEventos) chartTendenciaEventos.resize();
      if (chartRegistrosEstado) chartRegistrosEstado.resize();
      if (chartActividadTiempo) chartActividadTiempo.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Simular actualización de datos en tiempo real
    setInterval(() => {
      actualizarMetricas();
    }, 30000);
    
    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
    });
  });

  onCleanup(() => {
    if (chartEventosDistribucion) chartEventosDistribucion.dispose();
    if (chartTendenciaEventos) chartTendenciaEventos.dispose();
    if (chartRegistrosEstado) chartRegistrosEstado.dispose();
    if (chartActividadTiempo) chartActividadTiempo.dispose();
  });

  const inicializarGraficos = () => {
    console.log('📊 ¡Inicializando 4 gráficos profesionales ECharts!');
    
    // 🔥 GRÁFICO 1 - Distribución de Eventos por Categoría (Barras)
    const container1 = document.getElementById('chartEventosDistribucion');
    if (container1 && !chartEventosDistribucion) {
      chartEventosDistribucion = echarts.init(container1);
      
      const barOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          textStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);',
          formatter: function(params: any) {
            const data = params[0];
            return `<div style="font-weight: 600;">${data.name}</div>
                    <div style="color: #3b82f6; margin-top: 4px;">${data.value} eventos activos</div>`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Conciertos', 'Exposiciones', 'Talleres', 'Teatro', 'Conferencias', 'Festivales'],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 12,
            fontWeight: '500'
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              width: 1
            }
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        series: [{
          data: [
            { value: 35, itemStyle: { color: '#3b82f6' } },
            { value: 28, itemStyle: { color: '#10b981' } },
            { value: 42, itemStyle: { color: '#f59e0b' } },
            { value: 19, itemStyle: { color: '#8b5cf6' } },
            { value: 26, itemStyle: { color: '#ef4444' } },
            { value: 33, itemStyle: { color: '#06b6d4' } }
          ],
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 4,
            shadowOffsetY: 2
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetY: 4
            }
          },
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }]
      };
      
      chartEventosDistribucion.setOption(barOption);
    }

    // 🚀 GRÁFICO 2 - Tendencia de Eventos (Línea temporal)
    const container2 = document.getElementById('chartTendenciaEventos');
    if (container2 && !chartTendenciaEventos) {
      chartTendenciaEventos = echarts.init(container2);
      
      const lineOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#10b981',
          borderWidth: 1,
          textStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: '#10b981',
              width: 1,
              opacity: 0.6
            }
          }
        },
        legend: {
          data: ['Eventos Creados', 'Eventos Finalizados'],
          top: '5%',
          textStyle: {
            color: '#6b7280',
            fontSize: 12
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
          axisLine: {
            show: false
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
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              width: 1
            }
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          },
          axisLine: {
            show: false
          }
        },
        series: [
          {
            name: 'Eventos Creados',
            type: 'line',
            data: [15, 23, 18, 32, 26, 35, 29],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#10b981'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                  { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 6,
            animationDuration: 1000
          },
          {
            name: 'Eventos Finalizados',
            type: 'line',
            data: [12, 19, 15, 28, 22, 30, 25],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#8b5cf6'
            },
            symbol: 'circle',
            symbolSize: 6,
            animationDuration: 1200
          }
        ]
      };
      
      chartTendenciaEventos.setOption(lineOption);
    }

    // 🍕 GRÁFICO 3 - Estado de Registros (Pie Chart)
    const container3 = document.getElementById('chartRegistrosEstado');
    if (container3 && !chartRegistrosEstado) {
      chartRegistrosEstado = echarts.init(container3);
      
      const pieOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#f59e0b',
          borderWidth: 1,
          textStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);',
          formatter: function(params: any) {
            return `<div style="font-weight: 600;">${params.name}</div>
                    <div style="color: #f59e0b; margin-top: 4px;">${params.value} registros (${params.percent}%)</div>`;
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#6b7280',
            fontSize: 12
          }
        },
        series: [{
          name: 'Registros',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: [
            { value: 1234, name: 'Confirmados', itemStyle: { color: '#10b981' } },
            { value: 156, name: 'Pendientes', itemStyle: { color: '#f59e0b' } },
            { value: 89, name: 'Cancelados', itemStyle: { color: '#ef4444' } },
            { value: 67, name: 'En Espera', itemStyle: { color: '#8b5cf6' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          animationDuration: 1500,
          animationType: 'scale'
        }]
      };
      
      chartRegistrosEstado.setOption(pieOption);
    }

    // 📈 GRÁFICO 4 - Actividad en Tiempo Real (Área)
    const container4 = document.getElementById('chartActividadTiempo');
    if (container4 && !chartActividadTiempo) {
      chartActividadTiempo = echarts.init(container4);
      
      const areaOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: '#8b5cf6',
          borderWidth: 1,
          textStyle: {
            color: '#ffffff',
            fontSize: 13
          },
          extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: '#8b5cf6',
              width: 1,
              opacity: 0.6
            }
          }
        },
        legend: {
          data: ['Check-ins', 'Registros', 'Visitas Web'],
          top: '5%',
          textStyle: {
            color: '#6b7280',
            fontSize: 12
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              width: 1
            }
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          },
          axisLine: {
            show: false
          }
        },
        series: [
          {
            name: 'Check-ins',
            type: 'line',
            data: [12, 28, 45, 67, 89, 72, 95, 108, 124, 98],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#8b5cf6'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(139, 92, 246, 0.4)' },
                  { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 5,
            animationDuration: 1000
          },
          {
            name: 'Registros',
            type: 'line',
            data: [8, 18, 32, 45, 62, 55, 78, 85, 96, 82],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#f59e0b'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                  { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 5,
            animationDuration: 1200
          },
          {
            name: 'Visitas Web',
            type: 'line',
            data: [25, 42, 68, 95, 134, 125, 156, 178, 198, 165],
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#06b6d4'
            },
            symbol: 'circle',
            symbolSize: 5,
            animationDuration: 1400
          }
        ]
      };
      
      chartActividadTiempo.setOption(areaOption);
    }
  };

  const cargarDatos = async () => {
    setCargando(true);
    
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar métricas simuladas
      setMetricas({
        eventos: {
          total: 124 + Math.floor(Math.random() * 10),
          activos: 8 + Math.floor(Math.random() * 3),
          variacion: 15.3 + (Math.random() - 0.5) * 5,
          tendencia: Math.random() > 0.5 ? 'up' : 'down'
        },
        visitantes: {
          total: 2847 + Math.floor(Math.random() * 100),
          nuevosHoy: 23 + Math.floor(Math.random() * 10),
          variacion: -2.1 + (Math.random() - 0.5) * 8,
          tendencia: Math.random() > 0.4 ? 'up' : 'down'
        },
        registros: {
          total: 1456 + Math.floor(Math.random() * 50),
          confirmados: 1234 + Math.floor(Math.random() * 30),
          variacion: 8.7 + (Math.random() - 0.5) * 6,
          tendencia: 'up'
        },
        ingresos: {
          total: 458750 + Math.floor(Math.random() * 10000),
          esteMes: 125400 + Math.floor(Math.random() * 5000),
          variacion: 12.4 + (Math.random() - 0.5) * 8,
          tendencia: 'up'
        }
      });
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // 📊 CARGAR TOP EVENTOS REALES DESDE SUPABASE
  const cargarTopEventos = async () => {
    try {
      setCargandoTopEventos(true);
      console.log('📊 Cargando top eventos desde Supabase...');
      
      const eventosReales = await estadisticasService.obtenerTopEventosReportes(5);
      
      if (eventosReales && eventosReales.length > 0) {
        setTopEventos(eventosReales);
        console.log('✅ Top eventos cargados:', eventosReales.length);
      } else {
        console.log('⚠️ No se encontraron eventos, manteniendo datos mock');
        // Fallback a datos de ejemplo si no hay datos reales
        setTopEventos([
          { id: 1, evento: 'Sin eventos disponibles', registros: 0, checkins: 0, ingresos: 0, variacion: 0 }
        ]);
      }
      
    } catch (error) {
      console.error('❌ Error cargando top eventos:', error);
      // Mantener array vacío en caso de error
      setTopEventos([]);
    } finally {
      setCargandoTopEventos(false);
    }
  };

  const actualizarMetricas = () => {
    const nuevasMetricas = metricas();
    nuevasMetricas.eventos.total += Math.floor(Math.random() * 3);
    nuevasMetricas.visitantes.nuevosHoy += Math.floor(Math.random() * 2);
    setMetricas({ ...nuevasMetricas });
  };

  const exportarReporte = async (formato: string) => {
    setCargando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular descarga
      const elemento = document.createElement('a');
      elemento.href = '#';
      elemento.download = `reporte-ccb-${new Date().toISOString().split('T')[0]}.${formato}`;
      elemento.style.display = 'none';
      document.body.appendChild(elemento);
      elemento.click();
      document.body.removeChild(elemento);
      
      console.log(`Reporte exportado en formato ${formato.toUpperCase()}`);
      
    } catch (error) {
      console.error('Error exportando reporte:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    // Lógica de logout
    console.log('Cerrando sesión...');
    window.location.href = '/';
  };

  return (
    <AdminLayout>
      <div class="admin-content" style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        
        {/* Header Moderno y Profesional */}
        <header class="admin-header" style="background: rgba(0,0,0,0.1); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.2); padding: 24px 32px;">
          <div class="header-left">
            <div class="breadcrumb" style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">
              <span>Centro Cultural Banreservas</span> / <span>Analytics</span> / <span>Reportes</span>
            </div>
            <h1 class="main-title" style="color: white; display: flex; align-items: center; gap: 12px;">
              <FaSolidChartLine size={32} />
              Analytics Dashboard
            </h1>
            <p class="main-subtitle" style="color: rgba(255,255,255,0.9);">
              Monitoreo en tiempo real y análisis de datos del Centro Cultural
            </p>
          </div>
          <div class="header-right">
            <button class="btn-header" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);" onClick={() => cargarDatos()}>
              <FaSolidRotate size={16} />
              Actualizar
            </button>
            <button class="btn-header" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);">
              <FaSolidDownload size={16} />
              Exportar
            </button>
            <button class="btn-header btn-logout" onclick={handleLogout}>
              <FaSolidArrowRightFromBracket size={16} color="white" />
              Salir
            </button>
          </div>
        </header>

        {/* Content Profesional */}
        <div class="main-content" style="background: #f8fafc; padding: 24px;">
          
          {/* Filtros y Controles */}
          <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Filtros de Análisis</h3>
              <div style="display: flex; gap: 12px; align-items: center;">
                <FaSolidFilter size={16} color="#6b7280" />
                <span style="font-size: 14px; color: #6b7280;">Período activo</span>
              </div>
            </div>
            
            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="display: flex; gap: 8px;">
                <For each={[
                  { value: '24h', label: '24 Horas' },
                  { value: '7d', label: '7 Días' },
                  { value: '30d', label: '30 Días' },
                  { value: '90d', label: '90 Días' }
                ]}>
                  {(periodo) => (
                    <button 
                      class={`btn-filter ${periodoSeleccionado() === periodo.value ? 'active' : ''}`}
                      onClick={() => setPeriodoSeleccionado(periodo.value)}
                      style="padding: 8px 16px; border-radius: 6px; font-size: 14px;"
                    >
                      {periodo.label}
                    </button>
                  )}
                </For>
              </div>
              
              <div style="border-left: 1px solid #e5e7eb; padding-left: 16px; display: flex; gap: 12px; align-items: center;">
                <FaSolidCalendarDays size={16} color="#6b7280" />
                <input 
                  type="date" 
                  value={rangoFechas().inicio}
                  onChange={(e) => setRangoFechas(prev => ({ ...prev, inicio: e.target.value }))}
                  style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px;"
                />
                <span style="color: #6b7280;">hasta</span>
                <input 
                  type="date" 
                  value={rangoFechas().fin}
                  onChange={(e) => setRangoFechas(prev => ({ ...prev, fin: e.target.value }))}
                  style="border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px;"
                />
              </div>
            </div>
          </div>

          {/* Métricas Principales Compactas */}
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
            
            {/* Métrica 1 - Eventos */}
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Eventos Totales</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {metricas().eventos.total}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidArrowUp size={12} color="#10b981" />
                    <span style="font-size: 12px; font-weight: 600; color: #10b981;">
                      +{metricas().eventos.variacion.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style="background: #eff6ff; padding: 12px; border-radius: 10px;">
                  <FaSolidTicket size={24} color="#3b82f6" />
                </div>
              </div>
            </div>

            {/* Métrica 2 - Visitantes */}
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Visitantes</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {metricas().visitantes.total.toLocaleString()}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidArrowUp size={12} color="#10b981" />
                    <span style="font-size: 12px; font-weight: 600; color: #10b981;">
                      +{metricas().visitantes.nuevosHoy} hoy
                    </span>
                  </div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 10px;">
                  <FaSolidUsers size={24} color="#10b981" />
                </div>
              </div>
            </div>

            {/* Métrica 3 - Registros */}
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Registros</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {metricas().registros.total.toLocaleString()}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidArrowUp size={12} color="#10b981" />
                    <span style="font-size: 12px; font-weight: 600; color: #10b981;">
                      +{metricas().registros.variacion.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style="background: #fffbeb; padding: 12px; border-radius: 10px;">
                  <FaSolidUserCheck size={24} color="#f59e0b" />
                </div>
              </div>
            </div>

            {/* Métrica 4 - Check-ins */}
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 500; color: #6b7280; margin: 0 0 4px 0;">Check-ins</h4>
                  <div style="font-size: 28px; font-weight: 700; color: #1f2937;">
                    {Math.round(metricas().registros.total * 0.85).toLocaleString()}
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <FaSolidArrowUp size={12} color="#10b981" />
                    <span style="font-size: 12px; font-weight: 600; color: #10b981;">
                      85% asistencia
                    </span>
                  </div>
                </div>
                <div style="background: #faf5ff; padding: 12px; border-radius: 10px;">
                  <FaSolidChartLine size={24} color="#8b5cf6" />
                </div>
              </div>
            </div>

          </div>

          {/* 4 Gráficos Profesionales en Layout 2x2 */}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
            
            {/* Gráfico 1 - Distribución de Eventos por Categoría */}
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Distribución por Categoría</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Eventos activos por tipo</p>
              </div>
              <div style="height: 300px;">
                <div id="chartEventosDistribucion" style="width: 100%; height: 100%;"></div>
              </div>
            </div>

            {/* Gráfico 2 - Tendencia de Eventos */}
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Tendencia Mensual</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Evolución de eventos en el tiempo</p>
              </div>
              <div style="height: 300px;">
                <div id="chartTendenciaEventos" style="width: 100%; height: 100%;"></div>
              </div>
            </div>

            {/* Gráfico 3 - Estado de Registros */}
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Estado de Registros</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Distribución por estado</p>
              </div>
              <div style="height: 300px;">
                <div id="chartRegistrosEstado" style="width: 100%; height: 100%;"></div>
              </div>
            </div>

            {/* Gráfico 4 - Actividad en Tiempo Real */}
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0;">Actividad en Tiempo Real</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Métricas por hora del día</p>
              </div>
              <div style="height: 300px;">
                <div id="chartActividadTiempo" style="width: 100%; height: 100%;"></div>
              </div>
            </div>

          </div>

          {/* Top Eventos - Lista Profesional */}
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <div>
                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 8px;">
                  Top 5 Eventos por Performance
                  <Show when={cargandoTopEventos()}>
                    <span style="font-size: 12px; color: #6b7280; font-weight: 400;">🔄 Actualizando...</span>
                  </Show>
                </h3>
                <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">
                  {cargandoTopEventos() ? 'Cargando datos reales desde Supabase...' : 'Ranking basado en registros y check-ins reales'}
                </p>
              </div>
              <button 
                class="btn-primary" 
                style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px;"
              >
                <FaSolidEye size={14} />
                Ver todos
              </button>
            </div>
            
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <th style="text-align: left; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Ranking</th>
                    <th style="text-align: left; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Evento</th>
                    <th style="text-align: right; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Registros</th>
                    <th style="text-align: right; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Check-in</th>
                    <th style="text-align: center; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Tendencia</th>
                    <th style="text-align: center; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <Show when={cargandoTopEventos()}>
                    <tr>
                      <td colspan="6" style="padding: 32px; text-align: center; color: #6b7280;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                          🔄 <span>Cargando datos reales desde Supabase...</span>
                        </div>
                      </td>
                    </tr>
                  </Show>
                  
                  <Show when={!cargandoTopEventos() && topEventos().length === 0}>
                    <tr>
                      <td colspan="6" style="padding: 32px; text-align: center; color: #6b7280;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                          📊 <span>No hay eventos con datos suficientes para mostrar</span>
                          <button 
                            onClick={() => cargarTopEventos()} 
                            style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; margin-top: 8px;"
                          >
                            🔄 Recargar datos
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Show>

                  <Show when={!cargandoTopEventos() && topEventos().length > 0}>
                    <For each={topEventos()}>
                      {(evento, index) => (
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                          <td style="padding: 16px 12px;">
                            <div style={`display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; font-weight: 600; font-size: 14px; color: white; background: ${index() === 0 ? '#f59e0b' : index() === 1 ? '#6b7280' : index() === 2 ? '#cd7c2f' : '#9ca3af'}`}>
                              {index() + 1}
                            </div>
                          </td>
                          <td style="padding: 16px 12px;">
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">{evento.evento}</div>
                          </td>
                          <td style="padding: 16px 12px; text-align: right;">
                            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">{evento.registros}</span>
                          </td>
                          <td style="padding: 16px 12px; text-align: right;">
                            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">{evento.checkins || 0}</span>
                          </td>
                          <td style="padding: 16px 12px; text-align: center;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                              {evento.variacion >= 0 ? (
                                <FaSolidArrowUp size={12} color="#10b981" />
                              ) : (
                                <FaSolidArrowDown size={12} color="#ef4444" />
                              )}
                              <span style={`font-size: 12px; font-weight: 600; color: ${evento.variacion >= 0 ? '#10b981' : '#ef4444'}`}>
                                {Math.abs(evento.variacion).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td style="padding: 16px 12px; text-align: center;">
                            <button style="background: #f3f4f6; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; color: #6b7280; cursor: pointer;">
                              <FaSolidEye size={12} />
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportesAdmin; 