console.log('🧪 TEST CÓDIGO CORTO');

async function testCodigoCorto() {
  const SUPABASE_URL = 'https://ypkbgkrdnfpnlnrkcfuk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwa2Jna3JkbmZwbmxucmtjZnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDY2ODAsImV4cCI6MjA2NDg4MjY4MH0.DohlV8hr__JX4LpfL-KTYwm6MR1xwbF3hwhBqGCajKo';

  // Generar código más corto
  const timestamp = Date.now();
  const hash = btoa(`test-${timestamp}`).slice(0, 6);
  const codigoCorto = `CCB-${hash}`.toUpperCase(); // Máximo 10 chars
  
  console.log('🎫 Código generado:', codigoCorto, '(longitud:', codigoCorto.length, ')');

  const visitantePrueba = {
    nombre: 'Test Final',
    apellido: 'Sync',
    email: `final-${Date.now()}@test.com`,
    telefono: '8091234567',
    codigo_unico: codigoCorto,
    fecha_registro: new Date().toISOString(),
    estado: 'activo'
  };

  try {
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
      console.log('✅ ÉXITO TOTAL! Visitante creado exitosamente');
      console.log('📋 ID:', visitanteCreado[0].id);
      console.log('👤 Nombre:', visitanteCreado[0].nombre);
      console.log('📧 Email:', visitanteCreado[0].email);
      console.log('🎫 Código:', visitanteCreado[0].codigo_unico);
    } else {
      const errorText = await response.text();
      console.error('❌ ERROR:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ ERROR de conexión:', error);
  }
}

testCodigoCorto();
