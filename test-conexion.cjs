// Test simple de conexión a Supabase
const https = require('https');

console.log('🔗 PROBANDO CONEXIÓN A SUPABASE...\n');

const supabaseUrl = 'ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3Jkbm5wbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

const options = {
    hostname: supabaseUrl,
    port: 443,
    path: '/rest/v1/',
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
        console.log(`📊 Respuesta:`, data.substring(0, 200));
        
        if (res.statusCode === 200) {
            console.log('\n🎉 ¡CONEXIÓN EXITOSA! El proyecto funciona correctamente.');
            console.log('🔧 Ahora podemos configurar las tablas para que los registros persistan.');
        } else {
            console.log('\n❌ Error de conexión. Revisar credenciales o permisos.');
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Error:', error.message);
});

req.end(); 