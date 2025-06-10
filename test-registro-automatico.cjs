#!/usr/bin/env node

// test-registro-automatico.cjs - Testing automatizado de la solución de duplicación

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jnb3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1OTMxNDEsImV4cCI6MjA0OTE2OTE0MX0.KhF8XqoHwZTJ6dNJi_PfZWBOTUMIYoLsb2OdNemG4r4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistroDuplicacion() {
  console.log('🧪 TESTING AUTOMATIZADO - VERIFICACIÓN DE SOLUCIÓN');
  console.log('='.repeat(60));
  
  try {
    // PASO 1: Verificar estado inicial de eventos
    console.log('\n📊 PASO 1: Verificando estado inicial...');
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('id, titulo, registrados')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo eventos:', error);
      return;
    }
    
    console.log(`✅ ${eventos.length} eventos encontrados:`);
    eventos.forEach((evento, index) => {
      console.log(`   ${index + 1}. "${evento.titulo}" - Registrados: ${evento.registrados || 0}`);
    });
    
    // Seleccionar evento de test
    const eventoTest = eventos.find(e => e.titulo.includes('Taller de Verificación')) || eventos[0];
    if (!eventoTest) {
      console.log('❌ No hay eventos disponibles para testing');
      return;
    }
    
    console.log(`\n🎯 Evento seleccionado para test: "${eventoTest.titulo}"`);
    const registradosInicial = eventoTest.registrados || 0;
    console.log(`📈 Registrados inicial: ${registradosInicial}`);
    
    // PASO 2: Simular registro de usuario
    console.log('\n👤 PASO 2: Simulando registro de usuario...');
    
    const usuarioTest = {
      nombre: `Test Usuario ${Date.now()}`,
      email: `test${Date.now()}@testing.com`,
      telefono: '809-555-0123'
    };
    
    console.log(`📝 Datos del usuario: ${usuarioTest.nombre} (${usuarioTest.email})`);
    
    // Crear visitante
    const { data: visitante, error: errorVisitante } = await supabase
      .from('visitantes')
      .insert([{
        nombre: usuarioTest.nombre,
        apellido: '',
        email: usuarioTest.email,
        telefono: usuarioTest.telefono,
        fecha_registro: new Date().toISOString(),
        estado: 'activo'
      }])
      .select()
      .single();
    
    if (errorVisitante) {
      console.error('❌ Error creando visitante:', errorVisitante);
      return;
    }
    
    console.log(`✅ Visitante creado con ID: ${visitante.id}`);
    
    // Registrar en evento
    const codigoRegistro = `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const { data: registro, error: errorRegistro } = await supabase
      .from('registro_eventos')
      .insert([{
        visitante_id: visitante.id,
        evento_id: eventoTest.id,
        codigo_registro: codigoRegistro,
        fecha_registro: new Date().toISOString(),
        estado: 'confirmado'
      }])
      .select()
      .single();
    
    if (errorRegistro) {
      console.error('❌ Error registrando en evento:', errorRegistro);
      return;
    }
    
    console.log(`✅ Registro creado con código: ${codigoRegistro}`);
    
    // PASO 3: Verificar que el contador se actualizó correctamente
    console.log('\n🔍 PASO 3: Verificando actualización de contador...');
    
    // Esperar un momento para que se procesen las actualizaciones
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Obtener estado actualizado del evento
    const { data: eventoActualizado, error: errorActualizado } = await supabase
      .from('eventos')
      .select('id, titulo, registrados')
      .eq('id', eventoTest.id)
      .single();
    
    if (errorActualizado) {
      console.error('❌ Error obteniendo evento actualizado:', errorActualizado);
      return;
    }
    
    const registradosFinal = eventoActualizado.registrados || 0;
    console.log(`📈 Registrados final: ${registradosFinal}`);
    console.log(`📊 Incremento: ${registradosInicial} → ${registradosFinal}`);
    
    // PASO 4: Análisis de resultados
    console.log('\n📋 PASO 4: Análisis de resultados...');
    
    const incremento = registradosFinal - registradosInicial;
    
    if (incremento === 1) {
      console.log('✅ ¡ÉXITO! El contador se incrementó correctamente en 1');
      console.log('✅ La solución de duplicación está funcionando');
    } else if (incremento === 2) {
      console.log('❌ FALLO: El contador se incrementó en 2 (duplicación persiste)');
      console.log('❌ La solución necesita más ajustes');
    } else if (incremento === 0) {
      console.log('⚠️  ADVERTENCIA: El contador no se incrementó');
      console.log('⚠️  Puede ser problema de sincronización o persistencia');
    } else {
      console.log(`⚠️  RESULTADO INESPERADO: Incremento de ${incremento}`);
    }
    
    // PASO 5: Verificar registros duplicados
    console.log('\n🔍 PASO 5: Verificando registros duplicados...');
    
    const { data: registrosEvento, error: errorRegistros } = await supabase
      .from('registro_eventos')
      .select('*')
      .eq('evento_id', eventoTest.id)
      .eq('visitante_id', visitante.id);
    
    if (errorRegistros) {
      console.error('❌ Error verificando registros:', errorRegistros);
    } else {
      console.log(`📊 Registros encontrados para este usuario: ${registrosEvento.length}`);
      
      if (registrosEvento.length === 1) {
        console.log('✅ Sin registros duplicados - correcto');
      } else {
        console.log(`❌ Se encontraron ${registrosEvento.length} registros (debería ser 1)`);
      }
    }
    
    // PASO 6: Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE LA PRUEBA:');
    console.log(`🎯 Evento: "${eventoTest.titulo}"`);
    console.log(`👤 Usuario: ${usuarioTest.nombre}`);
    console.log(`📊 Contador: ${registradosInicial} → ${registradosFinal} (incremento: ${incremento})`);
    console.log(`📝 Registros: ${registrosEvento.length}`);
    
    if (incremento === 1 && registrosEvento.length === 1) {
      console.log('\n🎉 ¡TESTING EXITOSO! La solución funciona correctamente');
    } else {
      console.log('\n❌ TESTING FALLÓ - La solución necesita ajustes');
    }
    
  } catch (error) {
    console.error('❌ Error general en testing:', error);
  }
}

// Ejecutar test
testRegistroDuplicacion();
