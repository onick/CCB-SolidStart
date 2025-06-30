import { Component, Show } from 'solid-js';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: Component<ConfirmDeleteModalProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
          <h3 style="margin: 0 0 16px 0; color: #dc2626;">
            🗑️ Confirmar Eliminación
          </h3>
          <p style="margin: 0 0 20px 0; color: #374151;">
            ¿Estás seguro de que quieres eliminar el evento <strong>"{props.itemName}"</strong>?
          </p>
          <p style="margin: 0 0 20px 0; color: #dc2626; font-size: 14px;">
            ⚠️ Esta acción no se puede deshacer.
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button 
              class="btn-secondary"
              style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;"
              onClick={props.onCancel}
              disabled={props.isDeleting}
            >
              Cancelar
            </button>
            <button 
              class="btn-danger"
              style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;"
              onClick={props.onConfirm}
              disabled={props.isDeleting}
            >
              {props.isDeleting ? '⏳ Eliminando...' : '🗑️ Sí, Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ConfirmDeleteModal;