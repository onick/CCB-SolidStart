// types/dashboard.ts - Interfaces para componentes del dashboard

export interface DashboardStats {
  eventos: {
    total: number;
    activos: number;
    visitantes: number;
    checkins: number;
    ingresos: number;
  };
  visitantes: {
    total: number;
    activos: number;
    hoy: number;
    estaSemana: number;
  };
  isLoading: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  change: string;
  icon: any; // solid-icons component
  iconColor: 'blue' | 'purple' | 'teal' | 'orange' | 'green' | 'red';
  isLoading?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointBorderWidth?: number;
    pointRadius?: number;
    borderWidth?: number;
  }>;
}

export interface DashboardHeaderProps {
  breadcrumbs: Array<{
    label: string;
    active?: boolean;
  }>;
  buttons: Array<{
    label: string;
    icon: any;
    onClick?: () => void;
    variant: 'success' | 'secondary' | 'primary' | 'logout';
    title?: string;
  }>;
}
