// components/admin/eventos/EventosHeaderConfig.tsx - Configuración específica del header para eventos

import { Component } from 'solid-js';
import AdminHeader from '../../AdminHeader';
import {
  FaSolidRefresh,
  FaSolidPlus,
  FaSolidCalendarDays
} from 'solid-icons/fa';

interface Props {
  onActualizar: () => void;
  onNuevoEvento: () => void;
}

const EventosHeaderConfig: Component<Props> = (props) => {
  const breadcrumbs = [
    { label: 'Centro Cultural Banreservas' },
    { label: 'Gestión' },
    { label: 'Eventos', active: true }
  ];
  
  const headerButtons = [
    {
      label: 'Actualizar',
      icon: FaSolidRefresh,
      onClick: props.onActualizar,
      variant: 'secondary' as const,
      title: 'Actualizar lista de eventos'
    },
    {
      label: 'Nuevo Evento',
      icon: FaSolidPlus,
      onClick: props.onNuevoEvento,
      variant: 'primary' as const,
      title: 'Crear un nuevo evento'
    }
  ];

  return (
    <AdminHeader
      pageTitle="🎭 Gestión de Eventos"
      pageSubtitle="Administra todos los eventos del Centro Cultural"
      breadcrumbs={breadcrumbs}
      buttons={headerButtons}
      titleIcon={FaSolidCalendarDays}
    />
  );
};

export default EventosHeaderConfig;
