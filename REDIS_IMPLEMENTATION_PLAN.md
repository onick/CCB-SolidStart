# 🚀 PLAN DE IMPLEMENTACIÓN REDIS PARA CCB

## 📊 PROBLEMA ACTUAL
- Eventos "saltando" entre fuentes de datos
- Auto-recargas cada 30s causan inconsistencias
- isSupabaseConfigured() falla esporádicamente
- Performance limitada para cargas altas

## 🎯 SOLUCIÓN CON REDIS

### ARQUITECTURA PROPUESTA
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│    Redis    │───▶│  Supabase   │
│   (React)   │◀───│   (Cache)   │◀───│    (DB)     │
└─────────────┘    └─────────────┘    └─────────────┘
     <1ms              <5ms              100-500ms
```

### FLUJO DE DATOS
1. **READ**: Frontend → Redis → (miss?) → Supabase → Redis → Frontend
2. **WRITE**: Frontend → Supabase → Invalidate Redis → Frontend
3. **AUTO-SYNC**: Background job sync Supabase → Redis cada 5min

## 🔧 IMPLEMENTACIÓN TÉCNICA

### 1. REDIS SETUP
```bash
# Docker Redis
docker run -d --name ccb-redis -p 6379:6379 redis:alpine

# O Redis Cloud (gratuito hasta 30MB)
```

### 2. CACHE STRATEGY
```javascript
// Cache Keys
eventos:all           → Lista todos los eventos
eventos:publicos      → Solo eventos activos/próximos  
eventos:admin         → Todos los eventos (admin)
evento:{id}          → Evento individual
stats:eventos        → Estadísticas pre-calculadas

// TTL (Time To Live)
eventos:* → 5 minutos
stats:*   → 15 minutos
```

### 3. CÓDIGO SUGERIDO
```javascript
// services/redis.service.js
export class RedisEventosService {
  async getEventosPublicos() {
    // 1. Buscar en cache
    let eventos = await redis.get('eventos:publicos');
    
    if (eventos) {
      console.log('🚀 Cache HIT - Redis');
      return JSON.parse(eventos);
    }
    
    // 2. Cache MISS → Buscar en Supabase
    console.log('💾 Cache MISS - Fetching from Supabase');
    eventos = await supabase.from('eventos').select('*');
    
    // 3. Guardar en cache
    await redis.setex('eventos:publicos', 300, JSON.stringify(eventos));
    return eventos;
  }
  
  async invalidateCache() {
    await redis.del('eventos:publicos', 'eventos:admin', 'eventos:all');
    console.log('🗑️ Cache invalidated');
  }
}
```

## 📈 PERFORMANCE ESPERADO

### SIN REDIS (ACTUAL)
- **Carga inicial**: 200-500ms
- **Auto-refresh**: 200-500ms cada 30s
- **Usuarios simultáneos**: ~50-100
- **Calls a Supabase**: Cada request

### CON REDIS
- **Carga inicial**: 5-20ms (cache hit)
- **Auto-refresh**: 5-20ms
- **Usuarios simultáneos**: 1000+
- **Calls a Supabase**: Solo en cache miss o writes

## 🚀 PLAN DE MIGRACIÓN

### FASE 1: Setup Básico (1-2 horas)
1. Instalar Redis (Docker o Cloud)
2. Crear servicio Redis básico
3. Implementar cache para eventos públicos

### FASE 2: Cache Completo (2-3 horas)  
1. Cache para eventos admin
2. Cache invalidation en writes
3. Error handling y fallbacks

### FASE 3: Optimización (1-2 horas)
1. Background sync jobs
2. Estadísticas pre-calculadas
3. Monitoring y logs

## 💰 COSTOS
- **Redis Cloud Free**: 30MB (suficiente para 10K+ eventos)
- **Self-hosted**: $0 (Docker local)
- **Upstash Redis**: $0.20/100K requests

## 🎯 BENEFICIOS INMEDIATOS
✅ Elimina inconsistencias de datos
✅ 10-50x más rápido
✅ Soporta miles de usuarios
✅ Reduce costos de Supabase
✅ Mejor experiencia de usuario

¿Quieres que implementemos esto? 🚀
