const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fhdyhzfqywrsdkzaowau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZHloemZxeXdyc2RremFvd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NDE1NzUsImV4cCI6MjA0OTIxNzU3NX0.OHQJgJcY-CzXmEhJdqUBJHtQYlN1xA1iQkFZgWGZZXI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para determinar estado del evento
function determinarEstadoEvento(fecha, hora, duracion) {
  const fechaEvento = new Date(`${fecha} ${hora}`);
  const ahora = new Date();
  const fechaFin = new Date(fechaEvento.getTime() + duracion * 60 * 60 * 1000);
  
  if (ahora < fechaEvento) return 'proximo';
  if (ahora > fechaFin) return 'completado';
  return 'activo';
}

async function crearEventoDePrueba() {
  console.log('🎭 CREANDO EVENTO DE PRUEBA...\n');

  try {
    // Datos del evento de prueba
    const fechaEvento = new Date();
    fechaEvento.setDate(fechaEvento.getDate() + 7); // Una semana en el futuro
    
    const nuevoEvento = {
      titulo: 'Concierto de Prueba - Test',
      descripcion: 'Este es un evento de prueba creado automáticamente para verificar que aparece en eventos públicos.',
      categoria: 'Música',
      fecha: fechaEvento.toISOString().split('T')[0], // YYYY-MM-DD
      hora: '19:00',
      duracion: 2,
      ubicacion: 'Auditorio Principal',
      capacidad: 150,
      registrados: 0,
      precio: 500,
      imagen: '',
      estado: determinarEstadoEvento(
        fechaEvento.toISOString().split('T')[0], 
        '19:00', 
        2
      )
    };

    console.log('📝 Datos del evento:', nuevoEvento);
    console.log(`📅 Fecha calculada: ${nuevoEvento.fecha}`);
    console.log(`🎭 Estado calculado: ${nuevoEvento.estado}`);
    console.log('');

    // Insertar evento en Supabase
    console.log('💾 Insertando evento en Supabase...');
    const { data, error } = await supabase
      .from('eventos')
      .insert([nuevoEvento])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando evento:', error);
      return;
    }

    console.log('✅ Evento creado exitosamente!');
    console.log(`🆔 ID del evento: ${data.id}`);
    console.log(`🎵 Título: ${data.titulo}`);
    console.log(`📅 Fecha: ${data.fecha} a las ${data.hora}`);
    console.log(`🎭 Estado: ${data.estado}`);
    console.log('');

    // Verificar que aparece en la consulta de eventos públicos
    console.log('🔍 VERIFICANDO FILTROS DE EVENTOS PÚBLICOS...\n');

    // Obtener todos los eventos
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorEventos) {
      console.error('❌ Error obteniendo eventos:', errorEventos);
      return;
    }

    console.log(`📊 Total de eventos en BD: ${eventos.length}`);
    console.log('');

    // Aplicar filtro de eventos públicos
    const eventosPublicos = eventos.filter(evento => 
      evento.estado === 'activo' || evento.estado === 'proximo'
    );

    console.log(`🎯 Eventos que aparecerán en página pública: ${eventosPublicos.length}`);
    console.log('');

    eventosPublicos.forEach((evento, index) => {
      const esNuevo = evento.id === data.id ? ' 🆕 NUEVO' : '';
      console.log(`   ${index + 1}. "${evento.titulo}" - Estado: ${evento.estado}${esNuevo}`);
    });

    console.log('\n============================================================');
    
    if (eventosPublicos.some(e => e.id === data.id)) {
      console.log('🎉 ¡ÉXITO! El evento aparecerá en eventos públicos');
      console.log(`🌐 Ve a: http://localhost:3000/eventos-publicos`);
      console.log(`📋 Panel admin: http://localhost:3000/admin/eventos`);
    } else {
      console.log('❌ PROBLEMA: El evento NO aparecerá en eventos públicos');
      console.log(`🔧 Estado del evento: "${data.estado}"`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

crearEventoDePrueba(); 