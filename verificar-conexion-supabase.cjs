// Verificación de conexión a Supabase
require('dotenv').config();
const https = require('https');

console.log('🔗 VERIFICANDO CONEXIÓN A SUPABASE...\n');

// Usar variables de entorno del proyecto
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('📋 Configuración:');
console.log(`URL: ${supabaseUrl || 'No configurada'}`);
console.log(`Key: ${supabaseKey ? '✅ Configurada' : '❌ No configurada'}\n`);

if (!supabaseUrl || !supabaseKey) {
    console.log('❌ ERROR: Variables de entorno no configuradas');
    console.log('📝 Asegúrate de tener un archivo .env con:');
    console.log('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY=tu-clave-aqui');
    process.exit(1);
}

// Extraer solo el dominio de la URL
const urlObj = new URL(supabaseUrl);
const hostname = urlObj.hostname;

const options = {
    hostname: hostname,
    port: 443,
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
    }
};

console.log('🚀 Intentando conectar...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`📊 Status HTTP: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            console.log('🎉 ¡CONEXIÓN EXITOSA!');
            console.log('✅ Tu base de datos de Supabase está funcionando correctamente');
            console.log('🔧 Puedes usar todas las funcionalidades del proyecto');
        } else if (res.statusCode === 401) {
            console.log('❌ ERROR DE AUTENTICACIÓN');
            console.log('🔑 La clave API no es válida o ha expirado');
            console.log('📝 Verifica tus credenciales en Supabase Dashboard');
        } else {
            console.log(`❌ ERROR: Status ${res.statusCode}`);
            console.log('📄 Respuesta:', data.substring(0, 200));
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Error de conexión:', error.message);
    console.log('🌐 Verifica tu conexión a internet');
});

req.setTimeout(10000, () => {
    console.log('⏰ Timeout: La conexión tardó demasiado');
    req.destroy();
});

req.end(); 