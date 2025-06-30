// components/dashboard/AdminDashboard.tsx - Dashboard principal modularizado

import { Component } from 'solid-js';
import { DashboardStats as StatsType } from '../../types/dashboard';
import AdminLayout from '../AdminLayout';
import DashboardHeaderConfig from './DashboardHeaderConfig';
import SupabaseAlert from './SupabaseAlert';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';

interface Props {
  stats: () => StatsType;
  isSupabaseConfigured: () => boolean;
  onLogout: () => void;
}

const AdminDashboard: Component<Props> = (props) => {
  return (
    <AdminLayout currentPage="dashboard" onLogout={props.onLogout}>
      <DashboardHeaderConfig onLogout={props.onLogout} />
      
      <div class="main-content">
        {/* Alerta de datos mock */}
        <SupabaseAlert isSupabaseConfigured={props.isSupabaseConfigured} />

        {/* Stats Grid */}
        <DashboardStats stats={props.stats} />

        {/* Content Grid - Gráficos */}
        <DashboardCharts stats={props.stats} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
