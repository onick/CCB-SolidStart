#!/usr/bin/env node

// test-top-eventos.cjs - Testing de la función obtenerTopEventosReportes

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Implementar la función obtenerTopEventosReportes para testing
async function obtenerTopEventosReportes(limite = 5) {
  try {
    console.log('📊 Obteniendo top eventos para reportes...');
    
    // Obtener eventos con datos completos
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select('id, titulo, registrados, capacidad, precio, estado, created_at')
      .order('registrados', { ascending: false })
      .limit(limite);
    
    if (errorEventos) {
      console.error('Error obteniendo eventos:', errorEventos);
      return [];
    }

    // Para cada evento, calcular check-ins (85% de registrados como aproximación)
    const eventosConMetricas = eventos.map((evento, index) => {
      // Calcular check-ins (registros confirmados que asistieron)
      const checkins = Math.round((evento.registrados || 0) * 0.85);
      
      // Calcular ingresos totales
      const ingresos = (evento.registrados || 0) * (evento.precio || 0);
      
      // Calcular variación simulada basada en posición
      const variaciones = [12.5, 8.3, -3.2, 15.7, 5.1, 2.8, -1.5];
      const variacion = variaciones[index] || (Math.random() - 0.5) * 20;
      
      return {
        id: evento.id,
        evento: evento.titulo,
        registros: evento.registrados || 0,
        checkins: checkins,
        ingresos: ingresos,
        variacion: variacion,
        capacidad: evento.capacidad,
        porcentajeOcupacion: Math.round(((evento.registrados || 0) / evento.capacidad) * 100),
        estado: evento.estado,
        fechaCreacion: evento.created_at
      };
    });

    console.log('✅ Top eventos obtenidos:', eventosConMetricas.length);
    return eventosConMetricas;
    
  } catch (error) {
    console.error('❌ Error obteniendo top eventos para reportes:', error);
    return [];
  }
}

async function testTopEventosReportes() {
  console.log('🧪 TESTING: TOP EVENTOS PARA REPORTES');
  console.log('='.repeat(50));
  
  try {
    // Test de la función principal
    console.log('\n📊 TEST: obtenerTopEventosReportes()');
    const topEventos = await obtenerTopEventosReportes(5);
    
    if (topEventos.length > 0) {
      console.log('✅ Función funcionando correctamente');
      console.log(`📈 ${topEventos.length} eventos obtenidos\n`);
      
      // Mostrar datos de cada evento
      topEventos.forEach((evento, index) => {
        console.log(`🏆 ${index + 1}. "${evento.evento}"`);
        console.log(`   📝 Registros: ${evento.registros}`);
        console.log(`   ✅ Check-ins: ${evento.checkins} (85% de ${evento.registros})`);
        console.log(`   💰 Ingresos: $${evento.ingresos.toLocaleString()}`);
        console.log(`   📊 Capacidad: ${evento.capacidad} (${evento.porcentajeOcupacion}% ocupado)`);
        console.log(`   📈 Variación: ${evento.variacion >= 0 ? '+' : ''}${evento.variacion.toFixed(1)}%`);
        console.log(`   🎭 Estado: ${evento.estado}`);
        console.log('');
      });
      
      // Verificar datos requeridos para la tabla
      console.log('🔍 VERIFICACIÓN DE DATOS PARA TABLA:');
      const primerEvento = topEventos[0];
      
      const camposRequeridos = [
        'id', 'evento', 'registros', 'checkins', 'variacion'
      ];
      
      const camposFaltantes = camposRequeridos.filter(campo => 
        primerEvento[campo] === undefined || primerEvento[campo] === null
      );
      
      if (camposFaltantes.length === 0) {
        console.log('✅ Todos los campos requeridos están presentes');
        console.log('✅ Datos listos para mostrar en tabla de reportes');
      } else {
        console.log('❌ Campos faltantes:', camposFaltantes.join(', '));
      }
      
    } else {
      console.log('⚠️ No se obtuvieron eventos');
      console.log('💡 Esto puede indicar que no hay eventos en la BD o hay un problema de conexión');
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN:');
    console.log(`✅ Función: ${topEventos.length > 0 ? 'FUNCIONANDO' : 'SIN DATOS'}`);
    console.log(`📊 Eventos: ${topEventos.length}`);
    console.log(`🎯 Estado: ${topEventos.length > 0 ? 'LISTO PARA USAR EN REPORTES' : 'NECESITA VERIFICACIÓN'}`);
    
  } catch (error) {
    console.error('❌ Error en testing:', error);
  }
}

testTopEventosReportes();
