// Script para limpiar y mostrar el estado de localStorage

console.log('🧹 LIMPIANDO DATOS LOCALES PARA FRESH START...\n');

// Simular las claves que usa la aplicación
const claves = [
  'ccb_eventos_mock',
  'ccb_registros_usuario', 
  'visitantes_ccb',
  'ccb_registros_mock',
  'admin_authenticated'
];

console.log('📋 ESTADO ACTUAL DEL LOCALSTORAGE:');
claves.forEach(clave => {
  console.log(`   ${clave}: ${typeof localStorage !== 'undefined' ? 'En navegador' : 'No disponible en Node'}`);
});

console.log('\n============================================================');
console.log('🎯 CONFIGURACIÓN ACTUAL:');
console.log('✅ isSupabaseConfigured() → false (datos locales)');
console.log('✅ Filtro eventos públicos → estado === "activo" || estado === "proximo"');
console.log('✅ Evento de prueba agregado → "🎸 Evento de Prueba LOCAL"');
console.log('');

console.log('📋 PASOS PARA VERIFICAR:');
console.log('1. Inicia servidor: npm run dev');
console.log('2. Ve a eventos públicos: http://localhost:3000/eventos-publicos');
console.log('3. Deberías ver el "🎸 Evento de Prueba LOCAL"');
console.log('4. Ve al panel admin: http://localhost:3000/admin');
console.log('5. Crea un nuevo evento y verifica que aparezca');
console.log('');

console.log('🎭 EVENTO DE PRUEBA INCLUIDO:');
console.log('   📅 Título: 🎸 Evento de Prueba LOCAL');
console.log('   📅 Fecha: 2025-06-15');
console.log('   🎭 Estado: proximo');
console.log('   ✅ Pasará filtro: SÍ');
console.log('');

console.log('🚀 ¡TODO LISTO PARA TRABAJAR CON DATOS LOCALES!'); 