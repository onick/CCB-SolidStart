console.log('🧪 TEST RÁPIDO: Crear visitante con código CCB');

async function testCrearVisitante() {
  const SUPABASE_URL = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

  const visitantePrueba = {
    nombre: 'Test Corrección',
    apellido: 'Sistema',
    email: `test-fix-${Date.now()}@sync.com`,
    telefono: '8291234567',
    codigo_unico: `CCB-TEST${Date.now()}`, // ✅ CÓDIGO AGREGADO
    fecha_registro: new Date().toISOString(),
    estado: 'activo'
  };

  try {
    console.log('👤 Creando visitante con código CCB...');
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
      console.log('✅ ÉXITO! Visitante creado:', visitanteCreado[0]);
      console.log('🎫 Código CCB:', visitanteCreado[0].codigo_unico);
    } else {
      const errorText = await response.text();
      console.error('❌ ERROR:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ ERROR de conexión:', error);
  }
}

testCrearVisitante();
