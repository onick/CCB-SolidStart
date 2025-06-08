// Script para debuggear registros
const fs = require('fs');
const https = require('https');

console.log('🔍 DEBUGGEANDO REGISTROS...\n');

// Leer credenciales
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

// Función para consultar Supabase
function consultarTabla(tabla) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: supabaseUrl.replace('https://', '').replace('http://', ''),
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

async function debuggearTodo() {
    try {
        console.log('📊 ESTADO DE LAS TABLAS EN SUPABASE:\n');
        
        // Verificar eventos
        const eventos = await consultarTabla('eventos');
        console.log(`✅ Eventos en Supabase: ${eventos.length}`);
        eventos.forEach((evento, i) => {
            console.log(`   ${i+1}. ${evento.titulo} - Registrados: ${evento.registrados}`);
        });
        
        // Verificar visitantes
        const visitantes = await consultarTabla('visitantes');
        console.log(`\n✅ Visitantes en Supabase: ${visitantes.length}`);
        visitantes.forEach((visitante, i) => {
            console.log(`   ${i+1}. ${visitante.nombre} ${visitante.apellido} - ${visitante.email}`);
        });
        
        // Verificar registros de eventos
        const registros = await consultarTabla('registro_eventos');
        console.log(`\n✅ Registros de eventos en Supabase: ${registros.length}`);
        registros.forEach((registro, i) => {
            console.log(`   ${i+1}. Código: ${registro.codigo_confirmacion} - Estado: ${registro.estado}`);
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('📋 DIAGNÓSTICO:');
        
        if (eventos.length > 0 && registros.length === 0) {
            console.log('⚠️  PROBLEMA DETECTADO: Los eventos existen pero no hay registros');
            console.log('💡 CAUSA: Los registros se guardan en localStorage pero no en Supabase');
            console.log('🔧 SOLUCIÓN: Necesitamos arreglar la sincronización');
        } else if (registros.length > 0) {
            console.log('✅ Todo parece estar funcionando correctamente');
        } else {
            console.log('❓ No hay eventos ni registros para analizar');
        }
        
    } catch (error) {
        console.log('❌ Error consultando Supabase:', error.message);
    }
}

// Ejecutar
debuggearTodo(); 