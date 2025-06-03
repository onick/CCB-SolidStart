# 🗄️ Integración de Base de Datos - Centro Cultural Banreservas

## 📋 Resumen de la Implementación

Esta implementación añade **Supabase** como base de datos al proyecto **manteniendo exactamente el mismo diseño** y layout aprobado. El frontend permanece idéntico, pero ahora los datos se almacenan y consultan desde una base de datos real.

## 🎯 ¿Qué cambia vs qué permanece igual?

### ✅ **LO QUE PERMANECE EXACTAMENTE IGUAL:**
- **Diseño visual:** Todos los colores, tipografías, espaciados
- **Layout:** Estructura de 2 columnas, sidebar, navegación
- **Tarjetas de estadísticas:** Mismos gradientes e iconos
- **Modales y formularios:** Misma apariencia y comportamiento
- **Navegación:** Mismas rutas y breadcrumbs
- **Experiencia de usuario:** Mismas interacciones

### 🔄 **LO QUE MEJORA INTERNAMENTE:**
- **Persistencia de datos:** Los datos ahora se guardan permanentemente
- **Estadísticas reales:** Las métricas reflejan datos reales de la base de datos
- **Escalabilidad:** Preparado para manejar miles de visitantes y eventos
- **Sincronización:** Múltiples usuarios pueden ver los mismos datos actualizados

## 🚀 Pasos de Configuración

### 1. **Crear proyecto en Supabase**

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota las credenciales que aparecen en Settings > API:
   - Project URL
   - anon (public) key
   - service_role key

### 2. **Configurar el esquema de base de datos**

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Copia y pega todo el contenido de `src/lib/supabase/schema.sql`
3. Ejecuta el script completo
4. Verifica que se crearon las tablas: `visitantes`, `eventos`, `registro_eventos`, `administradores`

### 3. **Configurar variables de entorno**

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales reales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-real
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real
   ```

### 4. **Actualizar el cliente de Supabase**

Edita `src/lib/supabase/client.ts` y actualiza las URLs:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';
```

## 📊 Estructura de la Base de Datos

### **Tabla: `visitantes`**
- `id` (UUID) - Identificador único
- `nombre`, `apellido` - Información personal
- `email` (único) - Contacto principal
- `telefono`, `cedula` - Información adicional
- `fecha_registro` - Timestamp de cuando se registró
- `estado` - 'activo' o 'inactivo'

### **Tabla: `eventos`**
- `id` (UUID) - Identificador único
- `titulo`, `descripcion` - Información del evento
- `categoria` - Música, Arte, Teatro, etc.
- `fecha`, `hora`, `duracion` - Programación
- `ubicacion` - Lugar del evento
- `capacidad`, `registrados` - Control de aforo
- `precio` - Costo del evento
- `estado` - 'proximo', 'activo', 'completado'

### **Tabla: `registro_eventos`** (Relación N:N)
- `visitante_id` - Referencia al visitante
- `evento_id` - Referencia al evento
- `codigo_confirmacion` - Código único para check-in
- `estado` - 'pendiente', 'confirmado', 'checkin', 'cancelado'

## 🔧 Servicios Implementados

### **visitantesService**
```typescript
// Obtener todos los visitantes
await visitantesService.obtenerTodos()

// Crear nuevo visitante
await visitantesService.crear({
  nombre: "Juan",
  apellido: "Pérez", 
  email: "juan@email.com"
})

// Obtener estadísticas
await visitantesService.obtenerEstadisticas()
```

### **eventosService**
```typescript
// Obtener todos los eventos
await eventosService.obtenerTodos()

// Crear nuevo evento
await eventosService.crear({
  titulo: "Nuevo Concierto",
  categoria: "Música",
  fecha: "2024-12-30"
  // ... más campos
})

// Obtener estadísticas
await eventosService.obtenerEstadisticas()
```

### **registroEventosService**
```typescript
// Registrar visitante en evento
await registroEventosService.registrarVisitanteEnEvento(
  visitanteId, 
  eventoId, 
  codigoConfirmacion
)

// Confirmar check-in
await registroEventosService.confirmarCheckin(codigo)
```

## 🎨 Cómo Mantener el Diseño

### **1. Las tarjetas de estadísticas ahora muestran datos reales:**

```typescript
// ANTES (datos estáticos)
const stats = {
  eventos: 25,
  visitantes: 1247
}

// AHORA (datos reales de Supabase)
const stats = await eventosService.obtenerEstadisticas()
// { total: 25, activos: 8, visitantes: 1247, checkins: 892 }
```

### **2. Los formularios ahora guardan en base de datos:**

```typescript
// El mismo formulario, pero ahora persiste los datos
const handleSubmit = async (formData) => {
  const nuevoVisitante = await visitantesService.crear(formData)
  if (nuevoVisitante) {
    // Mismo feedback visual de éxito
    mostrarMensajeExito("¡Visitante registrado exitosamente!")
  }
}
```

### **3. Las listas ahora se cargan desde Supabase:**

```typescript
// Los mismos componentes visuales, datos reales
const [eventos, setEventos] = createSignal([])

onMount(async () => {
  const eventosReales = await eventosService.obtenerTodos()
  setEventos(eventosReales)
})
```

## 🔄 Migración de Datos Estáticos

Para migrar los datos que ya tenías hardcodeados:

1. **Ejecuta el seeder automático:**
   ```typescript
   import { seedDataService } from './lib/supabase/services'
   await seedDataService.poblarDatosIniciales()
   ```

2. **O inserta manualmente en Supabase:**
   - Ve a Table Editor en Supabase
   - Inserta los eventos que tenías en el código
   - Mantén los mismos IDs si es posible

## 🔒 Seguridad Implementada

- **Row Level Security (RLS)** habilitado
- **Políticas de acceso** configuradas
- **Validación de tipos** con TypeScript
- **Variables de entorno** para credenciales

## 🎯 Próximos Pasos

1. **Configurar Supabase** siguiendo esta guía
2. **Probar en desarrollo** con datos reales
3. **Verificar que el diseño permanece idéntico**
4. **Desplegar a producción** cuando esté listo

## 🆘 Troubleshooting

### **Error: "Invalid API key"**
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el archivo `.env` existe

### **Error: "Table doesn't exist"**
- Ejecuta el script `schema.sql` en Supabase
- Verifica que todas las tablas se crearon

### **Los datos no aparecen**
- Verifica las políticas RLS en Supabase
- Comprueba la consola del navegador por errores

---

## ✨ Resultado Final

**El sistema mantendrá exactamente el mismo aspecto visual**, pero ahora será una aplicación completa con:

- ✅ **Base de datos real** con Supabase
- ✅ **Mismo diseño aprobado** conservado al 100%
- ✅ **Datos persistentes** que no se pierden al recargar
- ✅ **Estadísticas reales** basadas en datos verdaderos
- ✅ **Escalabilidad** para manejar miles de usuarios
- ✅ **Seguridad** con autenticación y permisos

¡El layout aprobado se mantiene completamente intacto! 🎨 