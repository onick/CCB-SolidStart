// Script para verificar la configuración de Supabase
// Ejecutar con: node verificar-configuracion.js

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICADOR DE CONFIGURACIÓN - CENTRO CULTURAL BANRESERVAS\n');

// 1. Verificar archivo .env
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 Verificando archivos de configuración:');
console.log(`   ✅ .env: ${envExists ? 'EXISTE' : '❌ NO EXISTE'}`);

if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar variables necesarias
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
    
    console.log(`   📋 VITE_SUPABASE_URL: ${hasSupabaseUrl ? '✅ CONFIGURADA' : '❌ FALTA'}`);
    console.log(`   🔑 VITE_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ CONFIGURADA' : '❌ FALTA'}`);
    
    if (hasSupabaseUrl && hasSupabaseKey) {
        console.log('\n🎯 ESTADO: Configuración básica COMPLETA');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('   1. Abre tu proyecto en Supabase');
        console.log('   2. Ve a Settings → API');
        console.log('   3. Copia tu Project URL y anon key reales');
        console.log('   4. Reemplaza los valores en el archivo .env');
        console.log('   5. Ejecuta el esquema SQL en Supabase');
    }
} else {
    console.log('\n❌ ACCIÓN REQUERIDA: Crear archivo .env');
    console.log('   Ejecuta: cp env-example.txt .env');
}

// 2. Verificar esquema SQL
const schemaPath = path.join(__dirname, 'src', 'lib', 'supabase', 'schema.sql');
const schemaExists = fs.existsSync(schemaPath);

console.log(`\n📊 Esquema de base de datos:`);
console.log(`   ✅ schema.sql: ${schemaExists ? 'EXISTE' : '❌ NO EXISTE'}`);

// 3. Verificar servicios
const servicesPath = path.join(__dirname, 'src', 'lib', 'supabase', 'services.ts');
const servicesExists = fs.existsSync(servicesPath);

console.log(`\n⚙️ Servicios de base de datos:`);
console.log(`   ✅ services.ts: ${servicesExists ? 'EXISTE' : '❌ NO EXISTE'}`);

console.log('\n' + '='.repeat(50));
console.log('🏁 RESUMEN:');

if (envExists && schemaExists && servicesExists) {
    console.log('✅ Todo está PREPARADO para conectar con Supabase');
    console.log('📋 Solo falta:');
    console.log('   1. Crear proyecto en Supabase');
    console.log('   2. Ejecutar schema.sql');
    console.log('   3. Actualizar credenciales en .env');
    console.log('   4. Reiniciar servidor de desarrollo');
} else {
    console.log('❌ Faltan algunos archivos de configuración');
}

console.log('\n🌐 Documentación completa en: README-DATABASE.md'); 