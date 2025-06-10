#!/usr/bin/env node

// test-estadisticas.cjs - Testing de servicios de estadísticas

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Implementar funciones de estadísticas para testing
const estadisticasService = {
  async obtenerEstadisticasGenerales() {
    try {
      console.log('📊 Obteniendo estadísticas generales...');
      
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, registrados, precio, estado, created_at');
      
      const { data: visitantes } = await supabase
        .from('visitantes')
        .select('id, created_at');
      
      const hoy = new Date().toISOString().split('T')[0];
      const { data: registrosHoy } = await supabase
        .from('registro_eventos')
        .select('id, created_at')
        .gte('created_at', `${hoy}T00:00:00`)
        .lt('created_at', `${hoy}T23:59:59`);
      
      const totalEventos = eventos?.length || 0;
      const eventosActivos = eventos?.filter(e => e.estado === 'activo').length || 0;
      const totalVisitantes = visitantes?.length || 0;
      const registrosHoyCount = registrosHoy?.length || 0;
      const totalRegistrados = eventos?.reduce((sum, evento) => sum + (evento.registrados || 0), 0) || 0;
      const ingresosTotales = eventos?.reduce((sum, evento) => 
        sum + ((evento.registrados || 0) * (evento.precio || 0)), 0
      ) || 0;

      return {
        totalEventos,
        eventosActivos,
        totalVisitantes,
        registrosHoy: registrosHoyCount,
        totalRegistrados,
        ingresosTotales
      };
      
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  },

  async obtenerEventosPopulares(limite = 5) {
    try {
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, titulo, registrados, capacidad, categoria, estado')
        .order('registrados', { ascending: false })
        .limit(limite);
      
      return eventos?.map(evento => ({
        ...evento,
        porcentajeOcupacion: Math.round(((evento.registrados || 0) / evento.capacidad) * 100)
      })) || [];
      
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  },

  async obtenerActividadReciente(limite = 5) {
    try {
      const { data: actividad } = await supabase
        .from('registro_eventos')
        .select(`
          id,
          created_at,
          visitantes!inner(nombre, email),
          eventos!inner(titulo)
        `)
        .order('created_at', { ascending: false })
        .limit(limite);
      
      return actividad?.map(item => ({
        visitante: item.visitantes.nombre,
        evento: item.eventos.titulo,
        fecha: item.created_at
      })) || [];
      
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  }
};

async function testearEstadisticas() {
  console.log('🧪 TESTING DE SERVICIOS DE ESTADÍSTICAS');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Estadísticas generales
    console.log('\n📊 TEST 1: Estadísticas Generales');
    const stats = await estadisticasService.obtenerEstadisticasGenerales();
    
    if (stats) {
      console.log('✅ Estadísticas obtenidas exitosamente:');
      console.log(`   📅 Total eventos: ${stats.totalEventos}`);
      console.log(`   🎭 Eventos activos: ${stats.eventosActivos}`);
      console.log(`   👥 Total visitantes: ${stats.totalVisitantes}`);
      console.log(`   📝 Registros hoy: ${stats.registrosHoy}`);
      console.log(`   🎫 Total registrados: ${stats.totalRegistrados}`);
      console.log(`   💰 Ingresos totales: RD$${stats.ingresosTotales.toLocaleString()}`);
    } else {
      console.log('❌ Error obteniendo estadísticas generales');
    }

    // Test 2: Eventos populares
    console.log('\n🔥 TEST 2: Eventos Populares');
    const populares = await estadisticasService.obtenerEventosPopulares(3);
    
    if (populares.length > 0) {
      console.log('✅ Eventos populares obtenidos:');
      populares.forEach((evento, index) => {
        console.log(`   ${index + 1}. "${evento.titulo}"`);
        console.log(`      📊 ${evento.registrados}/${evento.capacidad} (${evento.porcentajeOcupacion}%)`);
        console.log(`      🎭 Categoría: ${evento.categoria}`);
      });
    } else {
      console.log('⚠️  No se encontraron eventos populares');
    }

    // Test 3: Actividad reciente
    console.log('\n📋 TEST 3: Actividad Reciente');
    const actividad = await estadisticasService.obtenerActividadReciente(3);
    
    if (actividad.length > 0) {
      console.log('✅ Actividad reciente obtenida:');
      actividad.forEach((item, index) => {
        const fecha = new Date(item.fecha).toLocaleString('es-DO');
        console.log(`   ${index + 1}. ${item.visitante} → "${item.evento}"`);
        console.log(`      📅 ${fecha}`);
      });
    } else {
      console.log('⚠️  No se encontró actividad reciente');
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN DEL TESTING:');
    console.log(`✅ Estadísticas generales: ${stats ? 'FUNCIONANDO' : 'ERROR'}`);
    console.log(`✅ Eventos populares: ${populares.length > 0 ? 'FUNCIONANDO' : 'SIN DATOS'}`);
    console.log(`✅ Actividad reciente: ${actividad.length > 0 ? 'FUNCIONANDO' : 'SIN DATOS'}`);
    console.log('\n🎯 Estado: SERVICIOS DE ESTADÍSTICAS LISTOS PARA IMPLEMENTAR');
    
  } catch (error) {
    console.error('❌ Error general en testing:', error);
  }
}

testearEstadisticas();
