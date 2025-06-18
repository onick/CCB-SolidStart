// ======================================
// COMPONENTE: ESTADÍSTICAS DE VISITANTES
// ======================================
//
// 🎯 FUNCIONALIDAD:
// Componente modular extraído de admin/visitantes.tsx
// Muestra 4 tarjetas de estadísticas en tiempo real
// 
// 🎨 ESTILOS REQUERIDOS:
// - visitantes-admin.css → .stats-grid, .stat-card, .stat-header
// - admin.css → estilos base de dashboard
//
// 📊 MÉTRICAS MOSTRADAS:
// 1. Total de visitantes registrados
// 2. Usuarios activos participando  
// 3. Registros de hoy (nuevos)
// 4. Invitaciones enviadas totales
//
// ======================================

import { Component } from 'solid-js';
import {
  FaSolidUsers,
  FaSolidUserCheck,
  FaSolidCalendarCheck,
  FaSolidEnvelope
} from 'solid-icons/fa';
import { VisitantesStatsProps } from './types/visitantes';

/**
 * Componente de estadísticas de visitantes
 * Extraído del archivo original visitantes.tsx (líneas ~660-740)
 * Mantiene la funcionalidad exacta y estilos CSS existentes
 */
const VisitantesStats: Component<VisitantesStatsProps> = (props) => {
  return (
    <div class="stats-grid">
      {/* Tarjeta 1: Total de Visitantes */}
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Visitantes</div>
          </div>
          <div class="stat-icon blue">
            <FaSolidUsers size={20} color="#3B82F6" />
          </div>
        </div>
        <div class="stat-number">{props.estadisticas.total}</div>
        <div class="stat-label">Total registrados</div>
        <div class="stat-change positive">
          ↗ En la plataforma
        </div>
      </div>

      {/* Tarjeta 2: Usuarios Activos */}
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Activos</div>
          </div>
          <div class="stat-icon green">
            <FaSolidUserCheck size={20} color="#10B981" />
          </div>
        </div>
        <div class="stat-number">{props.estadisticas.activos}</div>
        <div class="stat-label">Usuarios activos</div>
        <div class="stat-change positive">
          ↗ Participando
        </div>
      </div>

      {/* Tarjeta 3: Registros de Hoy */}
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Hoy</div>
          </div>
          <div class="stat-icon orange">
            <FaSolidCalendarCheck size={20} color="#F59E0B" />
          </div>
        </div>
        <div class="stat-number">{props.estadisticas.hoy}</div>
        <div class="stat-label">Registros de hoy</div>
        <div class="stat-change positive">
          ↗ Nuevos
        </div>
      </div>

      {/* Tarjeta 4: Invitaciones Enviadas */}
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-title">Invitaciones</div>
          </div>
          <div class="stat-icon purple">
            <FaSolidEnvelope size={20} color="#8B5CF6" />
          </div>
        </div>
        <div class="stat-number">{props.invitaciones.length}</div>
        <div class="stat-label">Enviadas totales</div>
        <div class="stat-change positive">
          ↗ Comunicación
        </div>
      </div>
    </div>
  );
};

export default VisitantesStats;
