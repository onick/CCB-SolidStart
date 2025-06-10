// test-redis.js - Script para probar Redis
import Redis from 'redis';

async function testRedis() {
  try {
    console.log('🧪 Probando conexión a Redis...');
    
    // Usar URL del .env
    const client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await client.connect();
    console.log('✅ Redis conectado exitosamente');

    // Probar escritura
    await client.set('test:ccb', 'Hola Centro Cultural!');
    console.log('✅ Escritura exitosa');

    // Probar lectura
    const value = await client.get('test:ccb');
    console.log('✅ Lectura exitosa:', value);

    // Limpiar y desconectar
    await client.del('test:ccb');
    await client.disconnect();
    console.log('✅ Redis funcionando perfectamente');

  } catch (error) {
    console.error('❌ Error con Redis:', error);
    console.log('💡 Verifica que Redis esté corriendo y la URL sea correcta');
  }
}

testRedis();
