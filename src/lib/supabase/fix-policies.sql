-- Arreglar políticas de seguridad para permitir operaciones CRUD completas
-- Ejecuta esto en Supabase SQL Editor

-- =============================================================================
-- ARREGLAR POLÍTICAS PARA EVENTOS
-- =============================================================================

-- Eliminar políticas existentes para eventos
DROP POLICY IF EXISTS "Eventos son visibles públicamente" ON eventos;

-- Crear nuevas políticas más permisivas para eventos
CREATE POLICY "Todos pueden ver eventos" ON eventos
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden insertar eventos" ON eventos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar eventos" ON eventos
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden eliminar eventos" ON eventos
    FOR DELETE USING (true);

-- =============================================================================
-- ARREGLAR POLÍTICAS PARA VISITANTES
-- =============================================================================

-- Eliminar políticas existentes para visitantes si hay problemas
DROP POLICY IF EXISTS "Visitantes son visibles públicamente" ON visitantes;
DROP POLICY IF EXISTS "Cualquiera puede insertar visitantes" ON visitantes;

-- Crear nuevas políticas más permisivas para visitantes
CREATE POLICY "Todos pueden ver visitantes" ON visitantes
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden insertar visitantes" ON visitantes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar visitantes" ON visitantes
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden eliminar visitantes" ON visitantes
    FOR DELETE USING (true);

-- =============================================================================
-- ARREGLAR POLÍTICAS PARA REGISTRO_EVENTOS
-- =============================================================================

-- Eliminar políticas existentes para registro_eventos
DROP POLICY IF EXISTS "Registros son visibles públicamente" ON registro_eventos;
DROP POLICY IF EXISTS "Cualquiera puede insertar registros" ON registro_eventos;

-- Crear nuevas políticas más permisivas para registro_eventos
CREATE POLICY "Todos pueden ver registros" ON registro_eventos
    FOR SELECT USING (true);

CREATE POLICY "Todos pueden insertar registros" ON registro_eventos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos pueden actualizar registros" ON registro_eventos
    FOR UPDATE USING (true);

CREATE POLICY "Todos pueden eliminar registros" ON registro_eventos
    FOR DELETE USING (true);

-- =============================================================================
-- ARREGLAR POLÍTICAS PARA ADMINISTRADORES
-- =============================================================================

-- Crear políticas para administradores
CREATE POLICY IF NOT EXISTS "Todos pueden ver administradores" ON administradores
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Todos pueden insertar administradores" ON administradores
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- VERIFICAR ESTADO DE LAS POLÍTICAS
-- =============================================================================

-- Mostrar todas las políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Políticas de seguridad actualizadas correctamente';
    RAISE NOTICE '🔓 Todas las operaciones CRUD están ahora permitidas';
    RAISE NOTICE '📋 Puedes crear, leer, actualizar y eliminar datos';
    RAISE NOTICE '🔄 Reintenta el script de creación de eventos';
END $$; 