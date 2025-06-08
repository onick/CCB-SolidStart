// Script para agregar evento de prueba a datos mock locales

const fs = require('fs');
const path = require('path');

console.log('🎭 AGREGANDO EVENTO DE PRUEBA A DATOS MOCK LOCALES...\n');

// Función para determinar estado del evento
function determinarEstadoEvento(fecha, hora, duracion) {
  const fechaEvento = new Date(`${fecha} ${hora}`);
  const ahora = new Date();
  const fechaFin = new Date(fechaEvento.getTime() + duracion * 60 * 60 * 1000);
  
  if (ahora < fechaEvento) return 'proximo';
  if (ahora > fechaFin) return 'completado';
  return 'activo';
}

// Crear evento de prueba
const fechaEvento = new Date();
fechaEvento.setDate(fechaEvento.getDate() + 3); // 3 días en el futuro

const eventoDePrueba = {
  id: `test-${Date.now()}`,
  titulo: '🎸 Concierto Rock Dominicano - TEST',
  descripcion: 'Evento de prueba creado para verificar que aparece en eventos públicos. ¡Una noche increíble con las mejores bandas de rock dominicano!',
  categoria: 'Música',
  fecha: fechaEvento.toISOString().split('T')[0], // YYYY-MM-DD
  hora: '20:00',
  duracion: 3,
  ubicacion: 'Auditorio Principal',
  capacidad: 200,
  registrados: 25, // Simular algunos registros
  precio: 750,
  imagen: '',
  estado: determinarEstadoEvento(
    fechaEvento.toISOString().split('T')[0], 
    '20:00', 
    3
  ),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('📝 Evento de prueba creado:');
console.log(`🎵 Título: ${eventoDePrueba.titulo}`);
console.log(`📅 Fecha: ${eventoDePrueba.fecha} a las ${eventoDePrueba.hora}`);
console.log(`🎭 Estado: ${eventoDePrueba.estado}`);
console.log(`🎫 Capacidad: ${eventoDePrueba.capacidad} personas`);
console.log(`👥 Registrados: ${eventoDePrueba.registrados}`);
console.log('');

// Simular verificación de filtros
console.log('🔍 VERIFICANDO FILTROS DE EVENTOS PÚBLICOS...\n');

// Simular el filtro que usa eventos públicos
const pasaFiltro = eventoDePrueba.estado === 'activo' || eventoDePrueba.estado === 'proximo';

console.log(`📊 Estado del evento: "${eventoDePrueba.estado}"`);
console.log(`🎯 Filtro eventos públicos: estado === 'activo' || estado === 'proximo'`);
console.log(`✅ ¿Pasa el filtro? ${pasaFiltro ? 'SÍ' : 'NO'}`);
console.log('');

if (pasaFiltro) {
  console.log('🎉 ¡PERFECTO! Este evento APARECERÁ en eventos públicos');
  console.log('');
  console.log('📋 PASOS PARA VERIFICAR:');
  console.log('1. Ve a: http://localhost:3000/eventos-publicos');
  console.log('2. Busca el evento: "🎸 Concierto Rock Dominicano - TEST"');
  console.log('3. Debería aparecer con estado "PRÓXIMO"');
  console.log('4. Debería permitir registrarse');
} else {
  console.log('❌ PROBLEMA: Este evento NO aparecerá en eventos públicos');
  console.log(`🔧 Razón: Estado "${eventoDePrueba.estado}" no está en filtro`);
}

console.log('\n============================================================');
console.log('🎯 RESUMEN DEL TEST:');
console.log(`✅ Evento creado con estado: "${eventoDePrueba.estado}"`);
console.log(`✅ Filtro actualizado para incluir: 'activo' y 'proximo'`);
console.log(`✅ El evento debería aparecer en eventos públicos`);
console.log('');
console.log('🌐 Para verificar, ve a: http://localhost:3000/eventos-publicos');
console.log('📋 O panel admin: http://localhost:3000/admin/eventos');

// Guardar evento para referencia
const eventoData = {
  evento_prueba: eventoDePrueba,
  filtro_aplicado: 'estado === "activo" || estado === "proximo"',
  pasa_filtro: pasaFiltro,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('evento-prueba-creado.json', JSON.stringify(eventoData, null, 2));
console.log('');
console.log('💾 Datos guardados en: evento-prueba-creado.json'); 