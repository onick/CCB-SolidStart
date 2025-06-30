import { Component } from 'solid-js';

interface ViewToggleProps {
  vistaActual: 'grid' | 'tabla';
  onCambiarVista: (vista: 'grid' | 'tabla') => void;
}

const ViewToggle: Component<ViewToggleProps> = (props) => {
  return (
    <div style="display: flex; background: #f3f4f6; border-radius: 8px; padding: 4px;">
      <button
        onClick={() => props.onCambiarVista('grid')}
        style={`
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          ${props.vistaActual === 'grid' 
            ? 'background: white; color: #059669; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' 
            : 'background: transparent; color: #6b7280;'
          }
        `}
      >
        📋 Vista Grid
      </button>
      <button
        onClick={() => props.onCambiarVista('tabla')}
        style={`
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          ${props.vistaActual === 'tabla' 
            ? 'background: white; color: #059669; box-shadow: 0 1px 3px rgba(0,0,0,0.1);' 
            : 'background: transparent; color: #6b7280;'
          }
        `}
      >
        📊 Vista Tabla
      </button>
    </div>
  );
};

export default ViewToggle;