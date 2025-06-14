console.log('🔍 DIAGNÓSTICO SUPABASE - Centro Cultural Banreservas');

// Test de conectividad básica
async function diagnosticarSupabase() {
  const SUPABASE_URL = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

  console.log('📡 URL:', SUPABASE_URL);
  console.log('🔑 Key (primeros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

  // Test 1: Ping básico
  try {
    console.log('\n🌐 TEST 1: Conectividad básica...');
    const response = await fetch(SUPABASE_URL + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    console.log('✅ Status:', response.status);
    console.log('✅ Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.error('❌ ERROR conectividad básica:', error);
  }

  // Test 2: Obtener eventos
  try {
    console.log('\n📅 TEST 2: Obteniendo eventos...');
    const response = await fetch(SUPABASE_URL + '/rest/v1/eventos?select=*', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const eventos = await response.json();
      console.log('✅ Eventos obtenidos:', eventos.length);
      console.log('📊 Primer evento:', eventos[0]);
    } else {
      console.error('❌ Error obteniendo eventos:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ ERROR obteniendo eventos:', error);
  }

  // Test 3: Verificar tabla visitantes
  try {
    console.log('\n👥 TEST 3: Verificando tabla visitantes...');
    const response = await fetch(SUPABASE_URL + '/rest/v1/visitantes?select=*&limit=1', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const visitantes = await response.json();
      console.log('✅ Tabla visitantes accesible, registros:', visitantes.length);
    } else {
      console.error('❌ Error accediendo tabla visitantes:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ ERROR tabla visitantes:', error);
  }

  // Test 4: Crear visitante de prueba
  try {
    console.log('\n🧪 TEST 4: Creando visitante de prueba...');
    const visitantePrueba = {
      nombre: 'Test Diagnóstico',
      apellido: 'Sistema',
      email: `test-${Date.now()}@diagnostico.com`,
      telefono: '8291234567',
      fecha_registro: new Date().toISOString(),
      estado: 'activo'
    };

    const response = await fetch(SUPABASE_URL + '/rest/v1/visitantes', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(visitantePrueba)
    });
    
    if (response.ok) {
      const visitanteCreado = await response.json();
      console.log('✅ Visitante creado exitosamente:', visitanteCreado[0]);
    } else {
      const errorText = await response.text();
      console.error('❌ Error creando visitante:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ ERROR creando visitante:', error);
  }

  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
}

// Ejecutar diagnóstico
diagnosticarSupabase();
