// Toast utility functions for CCB SolidStart app
export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    console.log('✅', message);
    // Implementation for success toast
    return showToast(message, 'success', options);
  },
  
  error: (message: string, options?: ToastOptions) => {
    console.error('❌', message);
    // Implementation for error toast
    return showToast(message, 'error', options);
  },
  
  info: (message: string, options?: ToastOptions) => {
    console.log('ℹ️', message);
    // Implementation for info toast
    return showToast(message, 'info', options);
  }
};

function showToast(message: string, type: 'success' | 'error' | 'info', options?: ToastOptions) {
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 500;
    max-width: 400px;
    word-wrap: break-word;
  `;
  
  toastElement.textContent = message;
  document.body.appendChild(toastElement);
  
  // Auto remove after duration
  const duration = options?.duration || 3000;
  setTimeout(() => {
    if (document.body.contains(toastElement)) {
      document.body.removeChild(toastElement);
    }
  }, duration);
  
  return toastElement;
}

export default toast;
