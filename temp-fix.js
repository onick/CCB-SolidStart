          console.log(`🔄 Sincronizando con eventosService: ${eventoActual.registrados} → ${nuevosRegistrados}`);
          
          // 🔧 CORRECCIÓN APLICADA: Comentado para prevenir duplicación
          // PROBLEMA: eventosService.actualizar causa doble incremento (0→1→2)
          // SOLUCIÓN: Solo usar localStorage que ya actualiza correctamente
          /*
          if (eventosService && eventosService.actualizar) {
            eventosService.actualizar(eventoId, { 
              registrados: nuevosRegistrados,
              updated_at: new Date().toISOString()
            }).then(() => {
              console.log('✅ EventosService sincronizado');
            }).catch((err) => {
              console.log('⚠️ Error en sincronización eventosService:', err);
            });
          }
          */
          console.log('🔧 EventosService omitido para prevenir duplicación - usando solo localStorage');
