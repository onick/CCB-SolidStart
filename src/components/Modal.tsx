import { Component, JSX, Show, createEffect } from 'solid-js';
import { FaSolidXmark } from 'solid-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: JSX.Element;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

const Modal: Component<ModalProps> = (props) => {
  const size = () => props.size || 'md';
  const closeOnOverlay = () => props.closeOnOverlay !== false;
  const showCloseButton = () => props.showCloseButton !== false;

  // Handle escape key
  createEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };

    if (props.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  });

  const handleOverlayClick = (e: MouseEvent) => {
    if (closeOnOverlay() && e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal-overlay" onClick={handleOverlayClick}>
        <div class={`modal-content modal-${size()}`}>
          <Show when={props.title || showCloseButton()}>
            <div class="modal-header">
              <Show when={props.title}>
                <h3 class="modal-title">{props.title}</h3>
              </Show>
              <Show when={showCloseButton()}>
                <button 
                  class="modal-close"
                  onClick={props.onClose}
                  aria-label="Cerrar modal"
                >
                  <FaSolidXmark size={20} />
                </button>
              </Show>
            </div>
          </Show>
          
          <div class="modal-body">
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
};

export default Modal; 