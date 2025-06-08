-- ESQUEMA FINAL INTEGRADO - Centro Cultural Banreservas
-- Resuelve dependencias y unifica todo

-- Eliminar triggers que dependen de la función
DROP TRIGGER IF EXISTS update_visitantes_updated_at ON visitantes;
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
DROP TRIGGER IF EXISTS update_registro_eventos_updated_at ON registro_eventos;
DROP TRIGGER IF EXISTS update_administradores_updated_at ON administradores;
DROP TRIGGER IF EXISTS trigger_actualizar_contador_registrados ON registro_eventos;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_contador_registrados() CASCADE;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Visitantes son visibles públicamente" ON visitantes;
DROP POLICY IF EXISTS "Cualquiera puede insertar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden ver visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden insertar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden actualizar visitantes" ON visitantes;
DROP POLICY IF EXISTS "Todos pueden eliminar visitantes" ON visitantes;
DROP POLICY IF EXISTS "visitantes_policy" ON visitantes;
DROP POLICY IF EXISTS "Eventos son visibles públicamente" ON eventos;
DROP POLICY IF EXISTS "Todos pueden ver eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden insertar eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden actualizar eventos" ON eventos;
DROP POLICY IF EXISTS "Todos pueden eliminar eventos" ON eventos;
DROP POLICY IF EXISTS "eventos_policy" ON eventos;
DROP POLICY IF EXISTS "Registros son visibles públicamente" ON registro_eventos;
DROP POLICY IF EXISTS "Cualquiera puede insertar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden ver registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden insertar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden actualizar registros" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden eliminar registros" ON registro_eventos;
DROP POLICY IF EXISTS "registro_eventos_policy" ON registro_eventos;
DROP POLICY IF EXISTS "Todos pueden ver administradores" ON administradores;
DROP POLICY IF EXISTS "Todos pueden insertar administradores" ON administradores;
DROP POLICY IF EXISTS "administradores_policy" ON administradores;

-- Crear tablas con estructura unificada
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS registro_eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    codigo_confirmacion VARCHAR(20) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmado' CHECK (estado IN ('confirmado', 'cancelado', 'asistio')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(visitante_id, evento_id)
);

CREATE TABLE IF NOT EXISTS administradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes si no existen
DO $$
BEGIN
    -- Agregar columna usuario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'administradores' AND column_name = 'usuario') THEN
        ALTER TABLE administradores ADD COLUMN usuario VARCHAR(100) UNIQUE;
    END IF;
    
    -- Agregar columna role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'administradores' AND column_name = 'role') THEN
        ALTER TABLE administradores ADD COLUMN role VARCHAR(50) DEFAULT 'admin';
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_visitantes_email ON visitantes(email);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_registro_visitante ON registro_eventos(visitante_id);
CREATE INDEX IF NOT EXISTS idx_registro_evento ON registro_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_registro_codigo ON registro_eventos(codigo_confirmacion);

-- Funciones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS y políticas
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_access_visitantes" ON visitantes FOR ALL USING (true);
CREATE POLICY "all_access_eventos" ON eventos FOR ALL USING (true);
CREATE POLICY "all_access_registro_eventos" ON registro_eventos FOR ALL USING (true);
CREATE POLICY "all_access_administradores" ON administradores FOR ALL USING (true);

-- Datos de prueba
INSERT INTO eventos (titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, estado)
SELECT * FROM (VALUES
    ('Concierto de Jazz Contemporáneo', 'Una noche única con los mejores exponentes del jazz contemporáneo dominicano', 'concierto', DATE '2024-12-20', TIME '20:00', 3.0, 'Auditorio Principal', 300, 0, 1500.00, 'activo'),
    ('Exposición: Arte Digital Dominicano', 'Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías', 'exposicion', DATE '2024-12-15', TIME '18:00', 4.0, 'Galería Norte', 150, 0, 800.00, 'activo'),
    ('Obra Teatral: Memorias del Caribe', 'Drama contemporáneo que explora la identidad caribeña dominicana', 'teatro', DATE '2024-12-22', TIME '19:30', 2.5, 'Teatro Principal', 200, 0, 1200.00, 'activo')
) AS v(titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, estado)
WHERE NOT EXISTS (SELECT 1 FROM eventos WHERE titulo = 'Concierto de Jazz Contemporáneo');

INSERT INTO administradores (usuario, password_hash, nombre, email, role)
SELECT 'admin', '$2b$10$8K8mF3.6qN2bY1P.KsD8E.', 'Administrador CCB', 'admin@ccb.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM administradores WHERE usuario = 'admin'); 