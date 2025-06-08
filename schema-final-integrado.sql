-- =============================================================================
-- ESQUEMA FINAL INTEGRADO PARA CENTRO CULTURAL BANRESERVAS
-- Integra tu esquema existente + el nuevo + políticas
-- Maneja TODAS las dependencias de forma segura
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PASO 1: ELIMINAR TODOS LOS TRIGGERS QUE DEPENDEN DE LA FUNCIÓN
-- =============================================================================

-- Eliminar triggers existentes que dependen de update_updated_at_column()
DROP TRIGGER IF EXISTS update_visitantes_updated_at ON visitantes;
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
DROP TRIGGER IF EXISTS update_registro_eventos_updated_at ON registro_eventos;
DROP TRIGGER IF EXISTS update_administradores_updated_at ON administradores;

-- Eliminar trigger del contador si existe
DROP TRIGGER IF EXISTS trigger_actualizar_contador_registrados ON registro_eventos;

-- =============================================================================
-- PASO 2: ELIMINAR FUNCIONES EXISTENTES
-- =============================================================================

-- Ahora sí podemos eliminar las funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_contador_registrados() CASCADE;

-- =============================================================================
-- PASO 3: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =============================================================================

-- Políticas de visitantes
DROP POLICY IF EXISTS "Visitantes son visibles públicamente" ON visitantes;
DROP POLICY IF EXISTS "Cualquiera puede insertar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden ver visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden insertar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden actualizar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden eliminar visitantes" ON visitantes;
DROP POLICY IF EXISTS "visitantes_policy" ON visitantes;

-- Políticas de eventos
DROP POLICY IF EXISTS "Eventos son visibles públicamente" ON eventos;
DROP POLICY IF EXISTS "Todos pueden ver eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden insertar eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden actualizar eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden eliminar eventos" ON eventos;
DROP POLICY IF EXISTS "eventos_policy" ON eventos;

-- Políticas de registro_eventos
DROP POLICY IF EXISTS "Registros son visibles públicamente" ON registro_eventos;
DROP POLICY IF EXISTS "Cualquiera puede insertar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden ver registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden insertar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden actualizar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden eliminar registros" ON registro_eventos;
DROP POLICY IF EXISTS "registro_eventos_policy" ON registro_eventos;

-- Políticas de administradores
DROP POLICY IF EXISTS "Todos pueden ver administradores" ON administradores;
DROP POLICY IF EXISTS "Todos pueden insertar administradores" ON administradores;
DROP POLICY IF EXISTS "administradores_policy" ON administradores;

-- =============================================================================
-- PASO 4: CREAR/ACTUALIZAR ESTRUCTURA DE TABLAS
-- =============================================================================

-- Tabla de visitantes (integrada)
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    cedula VARCHAR(20),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evento_id UUID,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    codigo_qr TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos (integrada)
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion DECIMAL(3,1) DEFAULT 2.0,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 100,
    registrados INTEGER DEFAULT 0,
    precio DECIMAL(10,2) DEFAULT 0.00,
    imagen TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'proximo', 'completado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de registro_eventos (integrada)
CREATE TABLE IF NOT EXISTS registro_eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitante_id UUID NOT NULL,
    evento_id UUID NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    codigo_confirmacion VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmado' CHECK (estado IN ('pendiente', 'confirmado', 'checkin', 'cancelado', 'asistio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de administradores (integrada)
CREATE TABLE IF NOT EXISTS administradores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    rol VARCHAR(50) DEFAULT 'admin',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PASO 5: CREAR FOREIGN KEYS E ÍNDICES (SEGUROS)
-- =============================================================================

-- Foreign keys para registro_eventos
DO $$
BEGIN
    -- Eliminar constraints existentes primero
    ALTER TABLE registro_eventos DROP CONSTRAINT IF EXISTS registro_eventos_visitante_id_fkey;
    ALTER TABLE registro_eventos DROP CONSTRAINT IF EXISTS registro_eventos_evento_id_fkey;
    
    -- Crear nuevas constraints
    ALTER TABLE registro_eventos ADD CONSTRAINT registro_eventos_visitante_id_fkey 
        FOREIGN KEY (visitante_id) REFERENCES visitantes(id) ON DELETE CASCADE;
    ALTER TABLE registro_eventos ADD CONSTRAINT registro_eventos_evento_id_fkey 
        FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE;
END $$;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_visitantes_email ON visitantes(email);
CREATE INDEX IF NOT EXISTS idx_visitantes_estado ON visitantes(estado);
CREATE INDEX IF NOT EXISTS idx_visitantes_fecha_registro ON visitantes(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_registro_visitante ON registro_eventos(visitante_id);
CREATE INDEX IF NOT EXISTS idx_registro_evento ON registro_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_registro_codigo ON registro_eventos(codigo_confirmacion);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registro_unico ON registro_eventos(visitante_id, evento_id);

-- =============================================================================
-- PASO 6: CREAR FUNCIONES Y TRIGGERS (NUEVA VERSIÓN)
-- =============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar contador de registrados
CREATE OR REPLACE FUNCTION actualizar_contador_registrados()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.estado IN ('confirmado', 'asistio') THEN
        UPDATE eventos 
        SET registrados = registrados + 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado NOT IN ('confirmado', 'asistio') AND NEW.estado IN ('confirmado', 'asistio') THEN
        UPDATE eventos 
        SET registrados = registrados + 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado IN ('confirmado', 'asistio') AND NEW.estado NOT IN ('confirmado', 'asistio') THEN
        UPDATE eventos 
        SET registrados = registrados - 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'DELETE' AND OLD.estado IN ('confirmado', 'asistio') THEN
        UPDATE eventos 
        SET registrados = registrados - 1 
        WHERE id = OLD.evento_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Crear todos los triggers
CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registro_eventos_updated_at BEFORE UPDATE ON registro_eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administradores_updated_at BEFORE UPDATE ON administradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_actualizar_contador_registrados
    AFTER INSERT OR UPDATE OR DELETE ON registro_eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_contador_registrados();

-- =============================================================================
-- PASO 7: CONFIGURAR ROW LEVEL SECURITY Y POLÍTICAS
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Políticas súper permisivas para todos
CREATE POLICY "visitantes_all_access" ON visitantes FOR ALL USING (true);
CREATE POLICY "eventos_all_access" ON eventos FOR ALL USING (true);
CREATE POLICY "registro_eventos_all_access" ON registro_eventos FOR ALL USING (true);
CREATE POLICY "administradores_all_access" ON administradores FOR ALL USING (true);

-- =============================================================================
-- PASO 8: INSERTAR DATOS INICIALES (SOLO SI NO EXISTEN)
-- =============================================================================

-- Insertar eventos de prueba SOLO si la tabla está vacía
INSERT INTO eventos (titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, estado)
SELECT * FROM (VALUES
    ('Concierto de Jazz Contemporáneo', 'Una noche única con los mejores exponentes del jazz contemporáneo dominicano', 'concierto', '2024-12-20', '20:00', 3.0, 'Auditorio Principal', 300, 0, 1500.00, 'activo'),
    ('Exposición: Arte Digital Dominicano', 'Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías', 'exposicion', '2024-12-15', '18:00', 4.0, 'Galería Norte', 150, 0, 800.00, 'activo'),
    ('Obra Teatral: Memorias del Caribe', 'Drama contemporáneo que explora la identidad caribeña dominicana', 'teatro', '2024-12-22', '19:30', 2.5, 'Teatro Principal', 200, 0, 1200.00, 'activo'),
    ('Taller de Escritura Creativa', 'Aprende técnicas de narrativa con escritores dominicanos reconocidos', 'taller', '2024-12-18', '14:00', 3.0, 'Aula de Arte', 25, 0, 500.00, 'activo'),
    ('Festival de Danza Folclórica', 'Celebración de las tradiciones dancísticas dominicanas', 'concierto', '2024-12-28', '17:00', 4.0, 'Plaza Central', 500, 0, 0.00, 'activo')
) AS v(titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, estado)
WHERE NOT EXISTS (SELECT 1 FROM eventos WHERE titulo = 'Concierto de Jazz Contemporáneo');

-- Insertar administrador por defecto SOLO si no existe
INSERT INTO administradores (usuario, nombre, email, password_hash, role, rol, activo)
SELECT 'admin', 'Administrador CCB', 'admin@ccb.com', '$2b$10$8K8mF3.6qN2bY1P.KsD8E.', 'admin', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM administradores WHERE usuario = 'admin');

-- =============================================================================
-- PASO 9: CREAR VISTAS ÚTILES
-- =============================================================================

-- Vista para estadísticas del dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM eventos) as total_eventos,
    (SELECT COUNT(*) FROM eventos WHERE estado = 'activo') as eventos_activos,
    (SELECT COUNT(*) FROM visitantes) as total_visitantes,
    (SELECT COUNT(*) FROM visitantes WHERE DATE(fecha_registro) = CURRENT_DATE) as visitantes_hoy,
    (SELECT COUNT(*) FROM registro_eventos WHERE estado IN ('checkin', 'asistio')) as total_checkins,
    (SELECT COALESCE(SUM(eventos.precio * eventos.registrados), 0) FROM eventos) as ingresos_totales;

-- =============================================================================
-- MENSAJE DE ÉXITO
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 ¡ESQUEMA INTEGRADO APLICADO EXITOSAMENTE!';
    RAISE NOTICE '📋 Todas las tablas sincronizadas: visitantes, eventos, registro_eventos, administradores';
    RAISE NOTICE '🔧 Triggers y funciones recreados sin conflictos';
    RAISE NOTICE '🔓 Políticas de seguridad súper permisivas configuradas';
    RAISE NOTICE '📊 Base de datos lista para usar con tu aplicación';
    RAISE NOTICE '🚀 Ahora actualiza tu .env con las credenciales correctas';
END $$; 