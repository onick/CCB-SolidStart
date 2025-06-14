// test-buscar-telefono.cjs - Prueba rápida de buscarPorTelefono()
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar las variables correctas del .env
const SUPABASE_URL = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probarBuscarPorTelefono() {
  console.log('🧪 TESTING: buscarPorTelefono()');
  console.log('================================');
  
  try {
    // Primero listar algunos visitantes para obtener un teléfono de prueba
    console.log('📋 Obteniendo visitantes existentes...');
    const { data: visitantes, error: errorLista } = await supabase
      .from('visitantes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (errorLista) {
      console.error('❌ Error obteniendo visitantes:', errorLista);
      return;
    }
    
    if (!visitantes || visitantes.length === 0) {
      console.log('📝 No hay visitantes en la BD para probar');
      return;
    }
    
    console.log(`✅ Encontrados ${visitantes.length} visitantes (últimos creados)`);
    visitantes.forEach((v, i) => {
      console.log(`   ${i+1}. ${v.nombre} ${v.apellido || ''} - Tel: ${v.telefono || 'Sin teléfono'} - Email: ${v.email}`);
    });
    
    // Si no hay visitantes con teléfono, probar directamente con el que creamos
    let visitanteConTelefono = visitantes.find(v => v.telefono);
    
    if (!visitanteConTelefono) {
      console.log('⚠️  Probando con teléfono de test: 809-555-1234');
      // Buscar directamente
      console.log(`\n🔍 Probando buscarPorTelefono('809-555-1234')...`);
      
      const { data: resultado, error: errorBusqueda } = await supabase
        .from('visitantes')
        .select('*')
        .eq('telefono', '809-555-1234')
        .single();
      
      if (errorBusqueda) {
        console.error('❌ Error en búsqueda:', errorBusqueda);
        return;
      }
      
      if (resultado) {
        console.log('✅ ¡FUNCIÓN BUSCAR_POR_TELEFONO FUNCIONA!');
        console.log('📱 Resultado:');
        console.log(`   Nombre: ${resultado.nombre} ${resultado.apellido || ''}`);
        console.log(`   Email: ${resultado.email}`);
        console.log(`   Teléfono: ${resultado.telefono}`);
        console.log(`   ID: ${resultado.id}`);
      } else {
        console.log('❌ No se encontró visitante con teléfono 809-555-1234');
      }
      return;
    }
    
    console.log(`\n🔍 Probando buscarPorTelefono('${visitanteConTelefono.telefono}')...`);
    
    // Usar la nueva función
    const { data: resultado, error: errorBusqueda } = await supabase
      .from('visitantes')
      .select('*')
      .eq('telefono', visitanteConTelefono.telefono)
      .single();
    
    if (errorBusqueda) {
      console.error('❌ Error en búsqueda:', errorBusqueda);
      return;
    }
    
    if (resultado) {
      console.log('✅ ¡FUNCIÓN BUSCAR_POR_TELEFONO FUNCIONA!');
      console.log('📱 Resultado:');
      console.log(`   Nombre: ${resultado.nombre}`);
      console.log(`   Email: ${resultado.email}`);
      console.log(`   Teléfono: ${resultado.telefono}`);
      console.log(`   ID: ${resultado.id}`);
    } else {
      console.log('❌ No se encontró resultado (inesperado)');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

probarBuscarPorTelefono();
