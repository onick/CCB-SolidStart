// Script para crear un evento de prueba en Supabase
const fs = require('fs');
const https = require('https');

console.log('🎪 CREANDO EVENTO DE PRUEBA...\n');

// Leer credenciales del .env
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
    console.log('❌ Error: Credenciales no encontradas en .env');
    process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

// Datos del evento de prueba
const eventosPrueba = [
    {
        titulo: "🎵 Concierto de Jazz en Vivo",
        descripcion: "Una noche mágica con los mejores músicos de jazz de la República Dominicana. Evento creado desde script de prueba.",
        categoria: "Música",
        fecha: "2024-12-30",
        hora: "20:00:00",
        duracion: 3,
        ubicacion: "Auditorio Principal CCB",
        capacidad: 200,
        registrados: 0,
        precio: 1500.00,
        imagen: "https://via.placeholder.com/400x200/1E40AF/FFFFFF?text=Jazz+En+Vivo",
        estado: "activo"
    },
    {
        titulo: "🎨 Exposición: Arte Digital Dominicano",
        descripcion: "Muestra innovadora de artistas locales que fusionan tecnología y tradición. Evento de prueba del sistema.",
        categoria: "Arte",
        fecha: "2025-01-15",
        hora: "18:00:00",
        duracion: 4,
        ubicacion: "Galería Norte",
        capacidad: 100,
        registrados: 0,
        precio: 800.00,
        imagen: "https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Arte+Digital",
        estado: "activo"
    }
];

// Función para crear evento
function crearEvento(evento, index) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(evento);
        
        const options = {
            hostname: supabaseUrl.replace('https://', '').replace('http://', ''),
            port: 443,
            path: '/rest/v1/eventos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log(`✅ Evento ${index + 1} creado: "${evento.titulo}"`);
                    resolve(JSON.parse(data));
                } else {
                    console.log(`❌ Error creando evento ${index + 1}: HTTP ${res.statusCode}`);
                    console.log('Respuesta:', data);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Error de conexión evento ${index + 1}:`, err.message);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

// Crear eventos de prueba
async function crearEventosDeEjemplo() {
    console.log(`📋 Creando ${eventosPrueba.length} eventos de prueba...\n`);
    
    try {
        for (let i = 0; i < eventosPrueba.length; i++) {
            await crearEvento(eventosPrueba[i], i);
            // Pequeña pausa entre creaciones
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n🎉 ¡EVENTOS CREADOS EXITOSAMENTE!');
        console.log('📋 Ahora puedes verificar en:');
        console.log('   • http://localhost:3000/admin → Panel de Eventos');
        console.log('   • http://localhost:3000/eventos-publicos → Página pública');
        console.log('   • Supabase → Table Editor → eventos');
        
    } catch (error) {
        console.log('\n❌ Error durante la creación:', error.message);
    }
}

// Ejecutar
crearEventosDeEjemplo(); 