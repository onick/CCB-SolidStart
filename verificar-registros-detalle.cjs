const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fhdyhzfqywrsdkzaowau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHloemZxeXdyc2RremFvd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NDE1NzUsImV4cCI6MjA0OTIxNzU3NX0.OHQJgJcY-CzXmEhJdqUBJHtQYlN1xA1iQkFZgWGZZXI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarRegistrosCompletos() {
  console.log('🔍 VERIFICANDO REGISTROS COMPLETOS CON JOIN...\n');

  try {
    // 1. Obtener registros con JOIN a visitantes y eventos
    console.log('📋 Consultando registros con JOIN...');
    const { data: registros, error: errorRegistros } = await supabase
      .from('registro_eventos')
      .select(`
        *,
        visitantes (
          id,
          nombre,
          apellido,
          email,
          telefono
        ),
        eventos (
          id,
          titulo,
          fecha,
          hora
        )
      `)
      .order('fecha_registro', { ascending: false });

    if (errorRegistros) {
      console.error('❌ Error en consulta de registros:', errorRegistros);
      return;
    }

    console.log(`✅ Registros encontrados: ${registros.length}\n`);

    // 2. Mostrar detalles de cada registro
    registros.forEach((registro, index) => {
      console.log(`📝 REGISTRO ${index + 1}:`);
      console.log(`   🆔 ID: ${registro.id}`);
      console.log(`   🎫 Código: ${registro.codigo_confirmacion}`);
      console.log(`   📅 Fecha: ${registro.fecha_registro}`);
      console.log(`   🎭 Estado: ${registro.estado}`);
      console.log(`   👤 Visitante:`, registro.visitantes);
      console.log(`   🎪 Evento:`, registro.eventos);
      console.log('   ---');
    });

    // 3. Verificar visitantes independientemente
    console.log('\n👥 VERIFICANDO VISITANTES DIRECTAMENTE...');
    const { data: visitantes, error: errorVisitantes } = await supabase
      .from('visitantes')
      .select('*');

    if (errorVisitantes) {
      console.error('❌ Error consultando visitantes:', errorVisitantes);
    } else {
      console.log(`✅ Visitantes totales: ${visitantes.length}`);
      visitantes.forEach((visitante, index) => {
        console.log(`   ${index + 1}. ${visitante.nombre} ${visitante.apellido} - ${visitante.email}`);
      });
    }

    // 4. Verificar eventos
    console.log('\n🎪 VERIFICANDO EVENTOS...');
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select('id, titulo, registrados');

    if (errorEventos) {
      console.error('❌ Error consultando eventos:', errorEventos);
    } else {
      console.log(`✅ Eventos totales: ${eventos.length}`);
      eventos.forEach((evento, index) => {
        console.log(`   ${index + 1}. ${evento.titulo} - Registrados: ${evento.registrados || 0}`);
      });
    }

    console.log('\n============================================================');
    
    if (registros.length === 0) {
      console.log('🎯 DIAGNÓSTICO: No hay registros en Supabase');
    } else if (registros.some(r => !r.visitantes)) {
      console.log('🎯 DIAGNÓSTICO: Hay registros pero falta JOIN con visitantes');
    } else {
      console.log('🎯 DIAGNÓSTICO: Los datos están completos en Supabase');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarRegistrosCompletos(); 