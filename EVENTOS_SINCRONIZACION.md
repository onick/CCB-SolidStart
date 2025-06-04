# 🔄 Sistema de Sincronización de Eventos - Centro Cultural Banreservas

## 📋 Descripción General

El sistema de eventos del Centro Cultural Banreservas está diseñado para que los eventos creados en el panel de administración (`/eventos`) aparezcan automáticamente en la página pública (`/eventos-publicos`).

## 🛠️ Cómo Funciona la Sincronización

### 1. **Creación de Eventos**
- **Página:** `http://localhost:3002/eventos`
- **Estado por defecto:** `'activo'` 
- **Acción:** Los eventos se crean usando `eventosService.crear()`

### 2. **Visualización Pública**
- **Página:** `http://localhost:3002/eventos-publicos`
- **Filtro:** Solo muestra eventos con estado `'activo'`
- **Actualización:** Automática cada 30 segundos + manual con botón "🔄 Actualizar"

## 🔗 Flujo de Sincronización

```
[Admin Panel] → [eventosService.crear()] → [Base de Datos/Mock] → [eventos-publicos]
     ↓                                                                    ↑
Crear Evento                                                    Auto-reload cada 30s
(estado: 'activo')                                                       ↑
                                                              Manual: botón "🔄 Actualizar"
```

## 📊 Estados de Eventos

| Estado | Descripción | Visible en Público |
|--------|-------------|-------------------|
| `'activo'` | Evento disponible para registro | ✅ SÍ |
| `'proximo'` | Evento programado | ❌ NO |
| `'completado'` | Evento finalizado | ❌ NO |

## 🎯 Características de Sincronización

### Automática
- ⏰ **Auto-reload cada 30 segundos** en la página pública
- 📡 **Detección automática** de nuevos eventos con estado `'activo'`
- 🔄 **Sincronización en tiempo real** (máximo 30 segundos de retraso)

### Manual
- 🔄 **Botón "Actualizar"** en el header de la página pública
- 📋 **Mensajes informativos** al crear eventos en el admin
- 💡 **Guías visuales** para usuarios

## 🚀 Cómo Probar la Sincronización

### Paso 1: Acceder al Panel de Administración
```
http://localhost:3002/eventos
```

### Paso 2: Crear un Evento
1. Hacer clic en "Crear Nuevo Evento"
2. Llenar el formulario (asegurar que estado = 'activo')
3. Guardar el evento

### Paso 3: Verificar en Página Pública
```
http://localhost:3002/eventos-publicos
```
- El evento debería aparecer automáticamente
- Si no aparece, usar el botón "🔄 Actualizar"

### Paso 4: Alternativamente - Usar Eventos de Prueba
1. En el panel admin, hacer clic en "Crear Eventos de Prueba"
2. Se crearán 5 eventos automáticamente
3. Verificar en la página pública

## 🔧 Arquitectura Técnica

### Servicios Utilizados
- **`eventosService.obtenerTodos()`** - Obtiene todos los eventos
- **`eventosService.crear()`** - Crea nuevos eventos
- **Mock/Supabase Storage** - Almacenamiento de datos

### Filtros Aplicados
```javascript
// En eventos-publicos.tsx
const eventosActivos = eventosData.filter(evento => evento.estado === 'activo');
```

### Auto-reload Implementation
```javascript
// Auto-recarga cada 30 segundos
setInterval(() => {
  recargarEventos();
}, 30000);
```

## 📝 Notas Importantes

1. **Solo eventos ACTIVOS** son visibles al público
2. **Sincronización máxima de 30 segundos** de retraso
3. **Botón manual de actualización** disponible en el header
4. **Mensajes informativos** guían al usuario sobre la sincronización
5. **Logs en consola** para debugging (`console.log`)

## 🐛 Troubleshooting

### Problema: El evento no aparece en la página pública
**Solución:**
1. Verificar que el estado del evento sea `'activo'`
2. Usar el botón "🔄 Actualizar" manualmente
3. Esperar hasta 30 segundos para la sincronización automática
4. Revisar logs en la consola del navegador

### Problema: La página no se actualiza automáticamente
**Solución:**
1. Recargar la página completamente
2. Verificar que no hay errores de JavaScript en la consola
3. Usar actualización manual como respaldo

## 🎉 Confirmación de Funcionamiento

✅ **Eventos se crean en admin panel**  
✅ **Eventos aparecen automáticamente en página pública**  
✅ **Filtrado por estado 'activo' funciona correctamente**  
✅ **Auto-reload cada 30 segundos activo**  
✅ **Botón de actualización manual disponible**  
✅ **Mensajes informativos implementados**

---

*Sistema desarrollado para Centro Cultural Banreservas - Gestión de Eventos* 