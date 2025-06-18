import { FaSolidCalendarPlus } from 'solid-icons/fa';
import { Component } from 'solid-js';
import AdminHeader from '../../AdminHeader';

interface EventosHeaderProps {
  onNuevoEvento: () => void;
}

const EventosHeader: Component<EventosHeaderProps> = (props) => {
  return (
    <AdminHeader
      pageTitle="Gestión de Eventos"
      pageSubtitle="Administra todos los eventos del Centro Cultural"
      breadcrumbs={[
        { label: 'Centro Cultural Banreservas' },
        { label: 'Gestión' },
        { label: 'Eventos', active: true }
      ]}
      buttons={[
        {
          label: 'Nuevo Evento',
          icon: FaSolidCalendarPlus,
          onClick: props.onNuevoEvento,
          variant: 'primary'
        }
      ]}
    />
  );
};

export default EventosHeader; 