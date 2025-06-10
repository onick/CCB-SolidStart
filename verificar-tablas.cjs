#!/usr/bin/env node

// verificar-tablas.cjs - Verificar estructura de tablas en Supabase

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarTablas() {
  console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLAS');
  console.log('='.repeat(40));
  
  // Verificar tabla eventos
  console.log('\n📋 TABLA: eventos');
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error en eventos:', error);
    } else {
      console.log('✅ Tabla eventos accesible');
      if (data.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(data[0]).join(', '));
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  // Verificar tabla visitantes
  console.log('\n👤 TABLA: visitantes');
  try {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error en visitantes:', error);
    } else {
      console.log('✅ Tabla visitantes accesible');
      if (data.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(data[0]).join(', '));
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  // Verificar tabla registro_eventos
  console.log('\n📝 TABLA: registro_eventos');
  try {
    const { data, error } = await supabase
      .from('registro_eventos')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error en registro_eventos:', error);
    } else {
      console.log('✅ Tabla registro_eventos accesible');
      if (data.length > 0) {
        console.log('📊 Columnas disponibles:', Object.keys(data[0]).join(', '));
      } else {
        console.log('📊 Tabla vacía - no se pueden ver columnas');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  // Intentar insertar un registro de prueba mínimo
  console.log('\n🧪 TESTING: Insertar registro mínimo');
  try {
    const { data, error } = await supabase
      .from('registro_eventos')
      .insert([{
        visitante_id: 'test-id',
        evento_id: 'test-evento-id'
      }])
      .select();
    
    if (error) {
      console.error('❌ Error insertando:', error);
      console.log('💡 Esto nos ayuda a ver qué campos son requeridos');
    } else {
      console.log('✅ Inserción exitosa (esto no debería pasar con IDs fake)');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

verificarTablas();
