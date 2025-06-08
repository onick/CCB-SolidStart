-- =============================================================================
-- ESQUEMA SEGURO PARA CENTRO CULTURAL BANRESERVAS
-- Versión que no falla si las tablas ya existen
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLA DE VISITANTES (SEGURA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
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

-- Índices para mejor rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_visitantes_email ON visitantes(email);
CREATE INDEX IF NOT EXISTS idx_visitantes_estado ON visitantes(estado);
CREATE INDEX IF NOT EXISTS idx_visitantes_fecha_registro ON visitantes(fecha_registro);

-- =============================================================================
-- TABLA DE EVENTOS (SEGURA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion INTEGER DEFAULT 2,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 100,
    registrados INTEGER DEFAULT 0,
    precio DECIMAL(10,2) DEFAULT 0.00,
    imagen TEXT,
    estado VARCHAR(20) DEFAULT 'proximo' CHECK (estado IN ('proximo', 'activo', 'completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para eventos (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);

-- =============================================================================
-- TABLA DE REGISTRO DE EVENTOS (SEGURA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS registro_eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitante_id UUID NOT NULL,
    evento_id UUID NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    codigo_confirmacion VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'checkin', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar foreign keys solo si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registro_eventos_visitante_id_fkey') THEN
        ALTER TABLE registro_eventos ADD CONSTRAINT registro_eventos_visitante_id_fkey 
        FOREIGN KEY (visitante_id) REFERENCES visitantes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registro_eventos_evento_id_fkey') THEN
        ALTER TABLE registro_eventos ADD CONSTRAINT registro_eventos_evento_id_fkey 
        FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Índices para registros (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_registro_visitante ON registro_eventos(visitante_id);
CREATE INDEX IF NOT EXISTS idx_registro_evento ON registro_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_registro_codigo ON registro_eventos(codigo_confirmacion);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registro_unico ON registro_eventos(visitante_id, evento_id);

-- =============================================================================
-- TABLA DE ADMINISTRADORES (SEGURA)
-- =============================================================================
CREATE TABLE IF NOT EXISTS administradores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FUNCIONES Y TRIGGERS (SEGUROS)
-- =============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers solo si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_visitantes_updated_at') THEN
        CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_eventos_updated_at') THEN
        CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registro_eventos_updated_at') THEN
        CREATE TRIGGER update_registro_eventos_updated_at BEFORE UPDATE ON registro_eventos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Función para actualizar contador de registrados
CREATE OR REPLACE FUNCTION actualizar_contador_registrados()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.estado = 'confirmado' THEN
        UPDATE eventos 
        SET registrados = registrados + 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado != 'confirmado' AND NEW.estado = 'confirmado' THEN
        UPDATE eventos 
        SET registrados = registrados + 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.estado = 'confirmado' AND NEW.estado != 'confirmado' THEN
        UPDATE eventos 
        SET registrados = registrados - 1 
        WHERE id = NEW.evento_id;
    ELSIF TG_OP = 'DELETE' AND OLD.estado = 'confirmado' THEN
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

-- Crear trigger del contador solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_contador_registrados') THEN
        CREATE TRIGGER trigger_actualizar_contador_registrados
        AFTER INSERT OR UPDATE OR DELETE ON registro_eventos
        FOR EACH ROW EXECUTE FUNCTION actualizar_contador_registrados();
    END IF;
END $$;

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (SEGURAS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Políticas para visitantes (crear solo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Visitantes son visibles públicamente') THEN
        CREATE POLICY "Visitantes son visibles públicamente" ON visitantes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cualquiera puede insertar visitantes') THEN
        CREATE POLICY "Cualquiera puede insertar visitantes" ON visitantes FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Políticas para eventos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Eventos son visibles públicamente') THEN
        CREATE POLICY "Eventos son visibles públicamente" ON eventos FOR SELECT USING (true);
    END IF;
END $$;

-- Políticas para registro de eventos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Registros son visibles públicamente') THEN
        CREATE POLICY "Registros son visibles públicamente" ON registro_eventos FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cualquiera puede insertar registros') THEN
        CREATE POLICY "Cualquiera puede insertar registros" ON registro_eventos FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- =============================================================================
-- VISTAS PARA ESTADÍSTICAS (SEGURAS)
-- =============================================================================

-- Vista para estadísticas del dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM eventos) as total_eventos,
    (SELECT COUNT(*) FROM eventos WHERE estado = 'activo') as eventos_activos,
    (SELECT COUNT(*) FROM visitantes) as total_visitantes,
    (SELECT COUNT(*) FROM visitantes WHERE DATE(fecha_registro) = CURRENT_DATE) as visitantes_hoy,
    (SELECT COUNT(*) FROM registro_eventos WHERE estado = 'checkin') as total_checkins,
    (SELECT COALESCE(SUM(eventos.precio * eventos.registrados), 0) FROM eventos) as ingresos_totales;

-- Vista para eventos populares
CREATE OR REPLACE VIEW eventos_populares AS
SELECT 
    e.*,
    ROUND((e.registrados::numeric / e.capacidad::numeric) * 100, 2) as porcentaje_ocupacion
FROM eventos e
WHERE e.registrados > 0
ORDER BY porcentaje_ocupacion DESC;

-- =============================================================================
-- MENSAJE DE ÉXITO
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema ejecutado exitosamente para Centro Cultural Banreservas';
    RAISE NOTICE '📊 Tablas verificadas: visitantes, eventos, registro_eventos, administradores';
    RAISE NOTICE '🔧 Funciones y triggers configurados';
    RAISE NOTICE '🔒 Políticas de seguridad aplicadas';
END $$; 