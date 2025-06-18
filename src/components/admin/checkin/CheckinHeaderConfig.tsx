// components/admin/checkin/CheckInHeaderConfig.tsx - Configuración específica del header para check-in

import { Component } from 'solid-js';
import AdminHeader from '../../AdminHeader';
import {
  FaSolidRotate,
  FaSolidUserCheck,
  FaSolidDownload,
  FaSolidChartLine
} from 'solid-icons/fa';

interface Props {
  onActualizar?: () => void;
  onExportar?: () => void;
}

const CheckInHeaderConfig: Component<Props> = (props) => {
  const breadcrumbs = [
    { label: 'Centro Cultural Banreservas' },
    { label: 'Operaciones' },
    { label: 'Check-in', active: true }
  ];
  
  const headerButtons = [
    {
      label: 'Actualizar',
      icon: FaSolidRotate,
      onClick: props.onActualizar || (() => console.log('🔄 Actualizar check-ins')),
      variant: 'secondary' as const,
      title: 'Actualizar datos en tiempo real'
    },
    {
      label: 'Exportar',
      icon: FaSolidDownload,
      onClick: props.onExportar || (() => console.log('📊 Exportar reporte de check-ins')),
      variant: 'primary' as const,
      title: 'Exportar reporte de asistencia'
    }
  ];

  return (
    <AdminHeader
      pageTitle="🎫 Check-in de Entrada"
      pageSubtitle="Sistema en tiempo real para validar códigos y registrar asistencias"
      breadcrumbs={breadcrumbs}
      buttons={headerButtons}
      titleIcon={FaSolidUserCheck}
    />
  );
};

export default CheckInHeaderConfig;