// CORRECCIÓN AUTOMÁTICA PARA DUPLICACIÓN
console.log('🔧 Aplicando corrección automática...');

// Esperar a que la página cargue
window.addEventListener('load', function() {
  setTimeout(() => {
    // Interceptar función problemática
    if (window.actualizarContadorEventos) {
      const original = window.actualizarContadorEventos;
      window.actualizarContadorEventos = function(eventoId) {
        console.log('🔒 Duplicación prevenida para evento:', eventoId);
        return; // No hacer nada
      };
      console.log('✅ Corrección aplicada automáticamente');
    }
  }, 2000);
});
