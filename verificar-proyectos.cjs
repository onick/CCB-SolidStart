// Script para verificar ambos proyectos de Supabase
const https = require('https');

console.log('🔍 VERIFICANDO AMBOS PROYECTOS DE SUPABASE...\n');

// Credenciales del proyecto actual (en .env)
const proyectoActual = {
  nombre: 'Proyecto Actual (.env)',
  url: 'ypkbgkrdnfpnlnrkcfuk.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3Jkbm5wbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo'
};

// Credenciales del proyecto CentroCulturalBR
const proyectoCCB = {
  nombre: 'CentroCulturalBR',
  url: 'fhdyhzfqywrsdkzaowau.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHloemZxeXdyc2RremFvd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NDE1NzUsImV4cCI6MjA0OTIxNzU3NX0.OHQJgJcY-CzXmEhJdqUBJHtQYlN1xA1iQkFZgWGZZXI'
};

// Función para consultar un proyecto
function consultarProyecto(proyecto, tabla) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: proyecto.url,
            port: 443,
            path: `/rest/v1/${tabla}?select=*`,
            method: 'GET',
            headers: {
                'apikey': proyecto.key,
                'Authorization': `Bearer ${proyecto.key}`
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

async function verificarProyecto(proyecto) {
    console.log(`📊 ${proyecto.nombre} (${proyecto.url}):`);
    console.log('─'.repeat(50));
    
    try {
        // Verificar eventos
        const eventos = await consultarProyecto(proyecto, 'eventos');
        console.log(`   📅 Eventos: ${eventos.length}`);
        if (eventos.length > 0) {
            eventos.slice(0, 3).forEach((evento, i) => {
                console.log(`      ${i+1}. ${evento.titulo} - Registrados: ${evento.registrados}`);
            });
            if (eventos.length > 3) console.log(`      ... y ${eventos.length - 3} más`);
        }
        
        // Verificar visitantes  
        const visitantes = await consultarProyecto(proyecto, 'visitantes');
        console.log(`   👥 Visitantes: ${visitantes.length}`);
        
        // Verificar registros
        const registros = await consultarProyecto(proyecto, 'registro_eventos');
        console.log(`   📋 Registros: ${registros.length}`);
        
        console.log('   ✅ CONEXIÓN: Exitosa\n');
        
        return {
            eventos: eventos.length,
            visitantes: visitantes.length,
            registros: registros.length,
            conectado: true
        };
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}\n`);
        return {
            eventos: 0,
            visitantes: 0,
            registros: 0,
            conectado: false,
            error: error.message
        };
    }
}

async function main() {
    const resultadoActual = await verificarProyecto(proyectoActual);
    const resultadoCCB = await verificarProyecto(proyectoCCB);
    
    console.log('🎯 RECOMENDACIÓN:');
    console.log('═'.repeat(50));
    
    if (!resultadoActual.conectado && !resultadoCCB.conectado) {
        console.log('❌ Ningún proyecto funciona - revisar credenciales');
    } else if (resultadoActual.conectado && !resultadoCCB.conectado) {
        console.log('✅ Mantener proyecto actual - es el único que funciona');
    } else if (!resultadoActual.conectado && resultadoCCB.conectado) {
        console.log('🔄 Cambiar a CentroCulturalBR - proyecto actual no funciona');
    } else {
        // Ambos funcionan - decidir por datos
        const totalActual = resultadoActual.eventos + resultadoActual.visitantes + resultadoActual.registros;
        const totalCCB = resultadoCCB.eventos + resultadoCCB.visitantes + resultadoCCB.registros;
        
        if (totalActual > totalCCB) {
            console.log('✅ Mantener proyecto actual - tiene más datos');
        } else if (totalCCB > totalActual) {
            console.log('🔄 Cambiar a CentroCulturalBR - tiene más datos');
        } else {
            console.log('⚖️  Ambos proyectos están igual - puedes usar cualquiera');
        }
    }
}

main(); 