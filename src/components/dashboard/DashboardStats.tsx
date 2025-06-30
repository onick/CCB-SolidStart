// components/dashboard/DashboardStats.tsx - Tarjetas de métricas principales

import { Component } from 'solid-js';
import { DashboardStats as StatsType } from '../../types/dashboard';
import {
  FaRegularCalendar,
  FaSolidUsers,
  FaSolidUserCheck,
  FaSolidDollarSign,
  FaSolidChartLine,
  FaSolidFire
} from 'solid-icons/fa';

interface Props {
  stats: () => StatsType;
}

const DashboardStats: Component<Props> = (props) => {
  return (
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Eventos</div>
          </div>
          <div class="stat-icon blue">
            <FaRegularCalendar size={20} color="white" />
          </div>
        </div>
        <div class="stat-number">
          {props.stats().isLoading ? '...' : props.stats().eventos.total.toLocaleString()}
        </div>
        <div class="stat-label">Eventos registrados</div>
        <div class="stat-change positive">
          ↗ {props.stats().eventos.activos} activos
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Visitantes</div>
          </div>
          <div class="stat-icon purple">
            <FaSolidUsers size={20} color="white" />
          </div>
        </div>
        <div class="stat-number">
          {props.stats().isLoading ? '...' : props.stats().visitantes.total.toLocaleString()}
        </div>
        <div class="stat-label">Personas registradas</div>
        <div class="stat-change positive">
          ↗ {props.stats().visitantes.hoy} hoy
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Check-ins</div>
          </div>
          <div class="stat-icon teal">
            <FaSolidUserCheck size={20} color="white" />
          </div>
        </div>
        <div class="stat-number">
          {props.stats().isLoading ? '...' : props.stats().eventos.checkins.toLocaleString()}
        </div>
        <div class="stat-label">Asistencias confirmadas</div>
        <div class="stat-change positive">
          ↗ {props.stats().visitantes.estaSemana} esta semana
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Ocupación</div>
          </div>
          <div class="stat-icon green">
            <FaSolidChartLine size={20} color="white" />
          </div>
        </div>
        <div class="stat-number">
          {props.stats().isLoading ? '...' : `${Math.round((props.stats().eventos.visitantes / (props.stats().eventos.total * 200)) * 100)}%`}
        </div>
        <div class="stat-label">Promedio de ocupación</div>
        <div class="stat-change positive">
          ↗ {props.stats().visitantes.activos} activos
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Eventos Populares</div>
          </div>
          <div class="stat-icon red">
            <FaSolidFire size={20} color="white" />
          </div>
        </div>
        <div class="stat-number">
          {props.stats().isLoading ? '...' : Math.round(props.stats().eventos.total * 0.3)}
        </div>
        <div class="stat-label">Con alta demanda</div>
        <div class="stat-change positive">
          ↗ Trending up
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
