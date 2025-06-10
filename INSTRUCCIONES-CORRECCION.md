# 🔧 SOLUCIÓN PARA DUPLICACIÓN DE EVENTOS

## 📋 PROBLEMA IDENTIFICADO

El sistema está **duplicando eventos** cuando alguien se registra debido a:

1. **Función faltante**: `actualizarContadorRegistrados` no está definida en `services.ts`
2. **Doble sincronización**: Se ejecutan 2 procesos simultáneos:
   - `sincronizarRegistroConAdmin()` 
   - `actualizarContadorEventos()`
3. **Sin validación de duplicados** antes de crear en Supabase

## 🚀 SOLUCIÓN INMEDIATA

### Paso 1: Aplicar corrección temporal
```bash
# En el navegador, ir a la consola (F12) y ejecutar:
```

```javascript
// Cargar el archivo de corrección
const script = document.createElement('script');
script.src = './correccion-duplicacion.js';
document.head.appendChild(script);
```

### Paso 2: Verificar que funciona
```javascript
// En la consola del navegador:
window.registroSeguro.diagnosticar();
```

### Paso 3: Usar la función corregida
En lugar de la función original, usar:

```javascript
// ANTES (problemático):
guardarRegistroLocal(eventoId, email, nombre, codigo, eventoTitulo);

// AHORA (corregido):
const resultado = window.registroSeguro.registrarEnEvento(
  eventoId, 
  email, 
  nombre, 
  telefono, 
  eventoTitulo
);

if (resultado.exito) {
  alert(`✅ ${resultado.mensaje}`);
} else {
  alert(`❌ ${resultado.mensaje}`);
}
```

## 🔧 CORRECCIÓN PERMANENTE

### Modificar `eventos-publicos.tsx`:

1. **Reemplazar la función de registro** en el botón (alrededor de la línea 2338):

```typescript
// LÍNEA APROXIMADA 2338 - REEMPLAZAR ESTE BLOQUE:
onclick={() => {
  // Código actual problemático...
  const data = registroData();
  crearVisitanteDesdeEvento(data.nombre, data.email, data.telefono);
  const codigo = generateEventCode(evento.id, data.email);
  guardarRegistroLocal(evento.id, data.email, data.nombre, codigo, evento.titulo);
  // ... resto del código
}}

// POR ESTE CÓDIGO CORREGIDO:
onclick={() => {
  const data = registroData();
  
  // 🔧 USAR FUNCIÓN CORREGIDA
  const resultado = window.registroSeguro?.registrarEnEvento(
    evento.id,
    data.email,
    data.nombre,
    data.telefono,
    evento.titulo
  );
  
  if (resultado?.exito) {
    if (resultado.esRegistroExistente) {
      // Usuario ya registrado
      alert(`ℹ️ ${resultado.mensaje}\n\n💡 Guarda tu código para el día del evento.`);
    } else {
      // Nuevo registro exitoso
      alert(`🎉 ${resultado.mensaje}\n\n📧 Recibirás información por email.\n💾 Tus datos se guardaron para futuras visitas.`);
    }
  } else {
    alert(`❌ ${resultado?.mensaje || 'Error desconocido'}`);
  }
  
  setShowRegistroModal(false);
  limpiarFormulario();
}}
```

### Modificar `services.ts`:

2. **Agregar la función faltante** (alrededor de la línea 380):

```typescript
// AGREGAR DESPUÉS DE determinarEstadoEvento():
const actualizarContadorEventoLocal = (eventoId: string, incremento: number = 1): boolean => {
  try {
    const eventoIndex = eventosMockDinamicos.findIndex(e => e.id === eventoId);
    if (eventoIndex === -1) {
      console.warn(`⚠️ Evento ${eventoId} no encontrado`);
      return false;
    }
    
    const evento = eventosMockDinamicos[eventoIndex];
    const nuevosRegistrados = evento.registrados + incremento;
    
    // Validaciones
    if (incremento > 0 && nuevosRegistrados > evento.capacidad) {
      console.warn(`❌ Capacidad máxima alcanzada`);
      return false;
    }
    
    if (nuevosRegistrados < 0) {
      console.warn(`❌ Registrados no puede ser negativo`);
      return false;
    }
    
    // Actualizar
    eventosMockDinamicos[eventoIndex] = {
      ...evento,
      registrados: nuevosRegistrados,
      updated_at: new Date().toISOString()
    };
    
    guardarEventosEnStorage(eventosMockDinamicos);
    console.log(`✅ Contador actualizado: ${evento.registrados} → ${nuevosRegistrados}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error actualizando contador:`, error);
    return false;
  }
};
```

3. **Corregir la línea 858** en `registrarVisitanteEnEvento`:

```typescript
// REEMPLAZAR:
const actualizacionExitosa = actualizarContadorRegistrados(eventoId, 1);

// POR:
const actualizacionExitosa = actualizarContadorEventoLocal(eventoId, 1);
```

4. **Agregar validación de duplicados** en `sincronizarRegistroConAdmin`:

```typescript
// AL INICIO DE sincronizarRegistroConAdmin, AGREGAR:
// Verificar si ya existe el visitante
const visitanteExistente = await visitantesService.buscarPorEmail(registro.email);
if (visitanteExistente) {
  console.log('✅ Visitante ya existe, usando ID existente:', visitanteExistente.id);
  await registroEventosService.registrarVisitanteEnEvento(
    visitanteExistente.id,
    eventoId,
    registro.codigo
  );
  return;
}
```

## ✅ VERIFICACIÓN

Después de aplicar las correcciones:

1. **Verificar que no hay duplicados**:
```javascript
window.registroSeguro.diagnosticar();
```

2. **Probar registro**:
   - Intentar registrarse en un evento
   - Verificar que el contador se actualiza correctamente
   - Intentar registrarse de nuevo (debe detectar duplicado)

3. **Verificar en consola** que no aparecen errores de funciones faltantes

## 🎯 RESULTADO ESPERADO

- ✅ **Sin duplicación**: Cada usuario se registra solo una vez por evento
- ✅ **Validación**: Sistema detecta registros existentes
- ✅ **Contadores correctos**: Números de registrados precisos
- ✅ **Sin errores**: No más funciones faltantes en consola
- ✅ **Sincronización controlada**: Supabase se actualiza sin duplicar

## 📞 SOPORTE

Si necesitas ayuda implementando esta solución, puedo ayudarte con:

1. Ubicar exactamente las líneas a modificar
2. Probar que la corrección funciona
3. Verificar que el problema se ha resuelto completamente

La corrección está diseñada para ser **segura** y **no destructiva** - conserva todos los datos existentes.
