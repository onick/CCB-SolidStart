// components/dashboard/index.ts - Exportaciones centralizadas del dashboard

export { default as AdminDashboard } from './AdminDashboard';
export { default as DashboardStats } from './DashboardStats';
export { default as DashboardCharts } from './DashboardCharts';
export { default as DashboardHeaderConfig } from './DashboardHeaderConfig';
export { default as SupabaseAlert } from './SupabaseAlert';

// Re-export types
export type { DashboardStats as DashboardStatsType } from '../../types/dashboard';
