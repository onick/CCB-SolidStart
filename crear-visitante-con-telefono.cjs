// crear-visitante-con-telefono.cjs - Crear visitante de prueba
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function crearVisitanteConTelefono() {
  console.log('📱 Creando visitante con teléfono para prueba...');
  
  try {
    const { data, error } = await supabase
      .from('visitantes')
      .insert([{
        nombre: 'Ana',
        apellido: 'Prueba Express',
        email: 'ana.express@test.com',
        telefono: '809-555-1234'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando visitante:', error);
      return;
    }
    
    console.log('✅ Visitante creado exitosamente:');
    console.log(`   Nombre: ${data.nombre}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Teléfono: ${data.telefono}`);
    console.log(`   ID: ${data.id}`);
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

crearVisitanteConTelefono();
