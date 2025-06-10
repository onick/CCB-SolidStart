#!/usr/bin/env node

// test-registro-final.cjs - Testing final de la solución de duplicación

const { createClient } = require('@supabase/supabase-js');

// Configuración correcta de Supabase
const supabaseUrl = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarSolucion() {
  console.log('🧪 VERIFICACIÓN FINAL DE LA SOLUCIÓN');
  console.log('='.repeat(50));
  
  try {
    // Verificar eventos disponibles
    console.log('\n📊 Obteniendo eventos disponibles...');
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('id, titulo, registrados')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`✅ ${eventos.length} eventos encontrados:`);
    eventos.forEach((evento, index) => {
      console.log(`   ${index + 1}. "${evento.titulo}" - Registrados: ${evento.registrados || 0}`);
    });
    
    // Seleccionar evento para test
    const eventoTest = eventos.find(e => e.titulo.includes('Verificación')) || eventos[0];
    if (!eventoTest) {
      console.log('❌ No hay eventos para testing');
      return;
    }
    
    console.log(`\n🎯 Evento seleccionado: "${eventoTest.titulo}"`);
    console.log(`📈 Registrados actuales: ${eventoTest.registrados || 0}`);
    
    // Crear usuario de prueba
    const timestamp = Date.now();
    const usuarioTest = {
      nombre: `Test Final ${timestamp}`,
      email: `testfinal${timestamp}@testing.com`,
      telefono: '809-123-4567'
    };
    
    console.log(`\n👤 Creando usuario: ${usuarioTest.nombre}`);
    
    // Paso 1: Crear visitante
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
    
    console.log(`✅ Visitante creado: ${visitante.id}`);
    
    // Paso 2: Registrar en evento
    const codigo = `CCB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const { data: registro, error: errorRegistro } = await supabase
      .from('registro_eventos')
      .insert([{
        visitante_id: visitante.id,
        evento_id: eventoTest.id,
        codigo_registro: codigo,
        fecha_registro: new Date().toISOString(),
        estado: 'confirmado'
      }])
      .select()
      .single();
    
    if (errorRegistro) {
      console.error('❌ Error en registro:', errorRegistro);
      return;
    }
    
    console.log(`✅ Registro creado: ${codigo}`);
    
    // Paso 3: Verificar actualización del contador
    console.log('\n🔍 Verificando contador...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: eventoActualizado } = await supabase
      .from('eventos')
      .select('registrados')
      .eq('id', eventoTest.id)
      .single();
    
    const registradosNuevo = eventoActualizado.registrados || 0;
    const incremento = registradosNuevo - (eventoTest.registrados || 0);
    
    console.log(`📊 Contador: ${eventoTest.registrados || 0} → ${registradosNuevo}`);
    console.log(`📈 Incremento: ${incremento}`);
    
    // Análisis de resultado
    console.log('\n📋 RESULTADO:');
    if (incremento === 1) {
      console.log('✅ ¡ÉXITO! La solución funciona correctamente');
      console.log('✅ El contador se incrementó exactamente en 1');
      console.log('✅ No hay duplicación');
    } else if (incremento === 2) {
      console.log('❌ FALLO: Aún hay duplicación');
      console.log('❌ El contador se incrementó en 2');
    } else if (incremento === 0) {
      console.log('⚠️  Sin incremento - posible problema de sincronización');
    } else {
      console.log(`⚠️  Incremento inesperado: ${incremento}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar verificación
verificarSolucion();
