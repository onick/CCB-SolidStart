// Verificar registro en Supabase
const https = require('https');
const fs = require('fs');

console.log('🔍 VERIFICANDO REGISTRO EN SUPABASE...\n');

// Leer credenciales del .env
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch[1].trim().replace('https://', '');
const supabaseKey = keyMatch[1].trim();

// Función para consultar Supabase
function consultarTabla(tabla) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: supabaseUrl,
            port: 443,
            path: `/rest/v1/${tabla}?select=*`,
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
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function verificarTodo() {
    try {
        console.log('📊 ESTADO ACTUAL EN SUPABASE:\n');
        
        // Verificar eventos
        const eventos = await consultarTabla('eventos');
        console.log(`✅ Eventos totales: ${eventos.length}`);
        eventos.forEach((evento, i) => {
            console.log(`   ${i+1}. ${evento.titulo} - Registrados: ${evento.registrados}`);
        });
        
        // Verificar visitantes
        const visitantes = await consultarTabla('visitantes');
        console.log(`\n👥 Visitantes totales: ${visitantes.length}`);
        if (visitantes.length > 0) {
            visitantes.forEach((visitante, i) => {
                console.log(`   ${i+1}. ${visitante.nombre} ${visitante.apellido} - ${visitante.email}`);
            });
        }
        
        // Verificar registros de eventos
        const registros = await consultarTabla('registro_eventos');
        console.log(`\n📋 Registros de eventos: ${registros.length}`);
        if (registros.length > 0) {
            registros.forEach((registro, i) => {
                console.log(`   ${i+1}. Código: ${registro.codigo_confirmacion} - Estado: ${registro.estado}`);
                console.log(`       Visitante ID: ${registro.visitante_id}`);
                console.log(`       Evento ID: ${registro.evento_id}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 DIAGNÓSTICO:');
        
        if (visitantes.length === 0 && registros.length === 0) {
            console.log('❌ PROBLEMA: No hay registros en Supabase');
            console.log('💡 CAUSA: Los registros se están guardando en localStorage, no en Supabase');
            console.log('🔧 SOLUCIÓN: El código de registro necesita usar los servicios de Supabase');
        } else if (visitantes.length > 0 && registros.length > 0) {
            console.log('✅ Los registros SÍ están en Supabase');
            console.log('🔧 El panel admin debe estar leyendo de localStorage en lugar de Supabase');
        } else {
            console.log('⚠️  Hay datos parciales - revisar sincronización');
        }
        
    } catch (error) {
        console.log('❌ Error consultando Supabase:', error.message);
    }
}

// Ejecutar
verificarTodo(); 