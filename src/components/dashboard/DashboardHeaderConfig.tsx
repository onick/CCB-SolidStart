// components/dashboard/DashboardHeaderConfig.tsx - Configuración específica del header para dashboard

import { Component } from 'solid-js';
import AdminHeader from '../AdminHeader';
import {
  FaSolidShare,
  FaSolidPlus,
  FaSolidArrowRightFromBracket,
  FaSolidHouse
} from 'solid-icons/fa';

interface Props {
  onLogout: () => void;
}

const DashboardHeaderConfig: Component<Props> = (props) => {
  const breadcrumbs = [
    { label: 'Eventos' },
    { label: 'Dashboard' },
    { label: 'Centro Cultural Banreservas', active: true }
  ];
  
  const headerButtons = [
    {
      label: 'Ver Página Principal',
      icon: FaSolidShare,
      onClick: () => window.open('/', '_blank'),
      variant: 'success' as const,
      title: 'Ver página principal del sitio'
    },
    {
      label: 'Compartir',
      icon: FaSolidShare,
      variant: 'secondary' as const
    },
    {
      label: 'Nuevo Evento',
      icon: FaSolidPlus,
      variant: 'primary' as const
    },
    {
      label: 'Cerrar Sesión',
      icon: FaSolidArrowRightFromBracket,
      onClick: props.onLogout,
      variant: 'logout' as const
    }
  ];

  return (
    <AdminHeader
      pageTitle="¡Bienvenido de vuelta, Admin!"
      pageSubtitle="Gestiona todos los aspectos del Centro Cultural Banreservas"
      breadcrumbs={breadcrumbs}
      buttons={headerButtons}
      titleIcon={FaSolidHouse}
    />
  );
};

export default DashboardHeaderConfig;
