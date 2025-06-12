import { Component, For } from 'solid-js';
import '../styles/admin-header.css';

// Solid Icons
import { FaSolidChartLine } from 'solid-icons/fa';

interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

interface HeaderButton {
  label: string;
  icon: any;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'logout';
  title?: string;
}

interface AdminHeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  breadcrumbs: BreadcrumbItem[];
  buttons: HeaderButton[];
  titleIcon?: any;
}

const AdminHeader: Component<AdminHeaderProps> = (props) => {
  
  const getButtonClass = (variant: string = 'primary') => {
    const baseClass = 'admin-header-btn';
    switch (variant) {
      case 'logout':
        return `${baseClass} ${baseClass}--logout`;
      default:
        return baseClass;
    }
  };

  return (
    <header class="admin-header-unified">
      {/* Patrón de fondo */}
      <div class="admin-header-pattern"></div>
      
      <div class="admin-header-left">
        <div class="admin-header-breadcrumb">
          <For each={props.breadcrumbs}>
            {(item, index) => (
              <>
                <span class={item.active ? 'breadcrumb-active' : 'breadcrumb-item'}>
                  {item.label}
                </span>
                {index() < props.breadcrumbs.length - 1 && (
                  <span class="breadcrumb-separator">/</span>
                )}
              </>
            )}
          </For>
        </div>
        
        <h1 class="admin-header-title">
          {props.titleIcon && <props.titleIcon size={32} />}
          {props.pageTitle}
        </h1>
        
        <p class="admin-header-subtitle">
          {props.pageSubtitle}
        </p>
      </div>
      
      <div class="admin-header-right">
        <For each={props.buttons}>
          {(button) => (
            <button
              class={getButtonClass(button.variant)}
              onClick={button.onClick}
              title={button.title}
            >
              <button.icon size={16} />
              {button.label}
            </button>
          )}
        </For>
      </div>
    </header>
  );
};

export default AdminHeader;