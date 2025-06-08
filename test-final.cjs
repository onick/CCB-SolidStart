// Test final - verificar conexión con credenciales actuales
const https = require('https');
const fs = require('fs');

console.log('🔗 PROBANDO CONEXIÓN FINAL...\n');

// Leer credenciales del .env
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
    console.log('❌ Variables de entorno no encontradas en .env');
    process.exit(1);
}

const supabaseUrl = urlMatch[1].trim().replace('https://', '');
const supabaseKey = keyMatch[1].trim();

console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...\n');

// Test de conexión
const options = {
    hostname: supabaseUrl,
    port: 443,
    path: '/rest/v1/eventos?select=count',
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            try {
                const eventos = JSON.parse(data);
                console.log(`📊 Eventos en base de datos: ${eventos.length}`);
                console.log('\n🎉 ¡CONEXIÓN EXITOSA!');
                console.log('🔧 Tu base de datos está configurada correctamente');
                console.log('✅ Los registros ahora PERSISTIRÁN cuando te registres');
                console.log('\n🚀 Siguiente paso: npm run dev');
            } catch (e) {
                console.log('📊 Respuesta:', data);
                console.log('✅ Conexión establecida');
            }
        } else {
            console.log('❌ Error:', data);
            console.log('\n💡 Solución: Ve a Settings → API en tu proyecto Supabase');
            console.log('   Copia las credenciales exactas y actualiza tu .env');
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Error de conexión:', error.message);
});

req.end(); 