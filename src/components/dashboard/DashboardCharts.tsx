// components/dashboard/DashboardCharts.tsx - Gráficos del dashboard

import { Component, onMount, onCleanup } from 'solid-js';
import { Chart, registerables } from 'chart.js';
import { DashboardStats } from '../../types/dashboard';

interface Props {
  stats: () => DashboardStats;
}

const DashboardCharts: Component<Props> = (props) => {
  let chartEventos: Chart | null = null;
  let chartActividad: Chart | null = null;

  onMount(() => {
    // Registrar todos los componentes de Chart.js
    Chart.register(...registerables);
    
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      inicializarGraficos();
    }, 500);
  });

  onCleanup(() => {
    if (chartEventos) chartEventos.destroy();
    if (chartActividad) chartActividad.destroy();
  });

  const inicializarGraficos = () => {
    console.log('📊 Inicializando gráficos del dashboard...');
    
    // Gráfico de Registros de Eventos
    const ctxEventos = document.getElementById('chartEventos') as HTMLCanvasElement;
    if (ctxEventos && !chartEventos) {
      chartEventos = new Chart(ctxEventos, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Registros',
            data: [45, 62, 38, 75, 52, 89, 67],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: '#f9fafb',
              bodyColor: '#f9fafb',
              cornerRadius: 8,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f3f4f6'
              },
              ticks: {
                color: '#6b7280'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280'
              }
            }
          }
        }
      });
    }

    // Gráfico de Actividad de Visitantes
    const ctxActividad = document.getElementById('chartActividad') as HTMLCanvasElement;
    if (ctxActividad && !chartActividad) {
      chartActividad = new Chart(ctxActividad, {
        type: 'doughnut',
        data: {
          labels: ['Check-in', 'Registrados', 'Pendientes'],
          datasets: [{
            data: [
              props.stats().eventos.checkins, 
              props.stats().visitantes.total - props.stats().eventos.checkins, 
              props.stats().eventos.visitantes
            ],
            backgroundColor: [
              '#10b981',
              '#3b82f6', 
              '#f59e0b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: '#6b7280'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: '#f9fafb',
              bodyColor: '#f9fafb',
              cornerRadius: 8
            }
          }
        }
      });
    }
  };

  return (
    <div class="content-grid">
      <div class="content-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Registros de Eventos</h2>
            <p class="card-subtitle">Últimos 7 días</p>
          </div>
        </div>
        <div style="height: 300px; padding: 20px;">
          <canvas id="chartEventos" width="400" height="300"></canvas>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Estado de Visitantes</h2>
            <p class="card-subtitle">Distribución actual</p>
          </div>
        </div>
        <div style="height: 300px; padding: 20px; display: flex; align-items: center; justify-content: center;">
          <canvas id="chartActividad" width="300" height="300"></canvas>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
