-- Schema completo para Centro Cultural Banreservas
-- Ejecutar en SQL Editor de Supabase

-- 1. Tabla de visitantes
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de eventos
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

-- 3. Tabla de registro de eventos
CREATE TABLE IF NOT EXISTS registro_eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    codigo_confirmacion VARCHAR(20) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmado' CHECK (estado IN ('confirmado', 'cancelado', 'asistio')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(visitante_id, evento_id)
);

-- 4. Tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_visitantes_email ON visitantes(email);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_registro_visitante ON registro_eventos(visitante_id);
CREATE INDEX IF NOT EXISTS idx_registro_evento ON registro_eventos(evento_id);
CREATE INDEX IF NOT EXISTS idx_registro_codigo ON registro_eventos(codigo_confirmacion);

-- 6. Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security) - HABILITADA PERO PERMISIVA
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para todos los usuarios autenticados y anónimos
CREATE POLICY "visitantes_policy" ON visitantes FOR ALL USING (true);
CREATE POLICY "eventos_policy" ON eventos FOR ALL USING (true);
CREATE POLICY "registro_eventos_policy" ON registro_eventos FOR ALL USING (true);
CREATE POLICY "administradores_policy" ON administradores FOR ALL USING (true);

-- 8. Insertar eventos de prueba
INSERT INTO eventos (titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, estado) VALUES
('Concierto de Jazz Contemporáneo', 'Una noche única con los mejores exponentes del jazz contemporáneo dominicano', 'concierto', '2024-12-20', '20:00', 3.0, 'Auditorio Principal', 300, 0, 1500.00, 'activo'),
('Exposición: Arte Digital Dominicano', 'Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías', 'exposicion', '2024-12-15', '18:00', 4.0, 'Galería Norte', 150, 0, 800.00, 'activo'),
('Obra Teatral: Memorias del Caribe', 'Drama contemporáneo que explora la identidad caribeña dominicana', 'teatro', '2024-12-22', '19:30', 2.5, 'Teatro Principal', 200, 0, 1200.00, 'activo'),
('Taller de Escritura Creativa', 'Aprende técnicas de narrativa con escritores dominicanos reconocidos', 'taller', '2024-12-18', '14:00', 3.0, 'Aula de Arte', 25, 0, 500.00, 'activo'),
('Festival de Danza Folclórica', 'Celebración de las tradiciones dancísticas dominicanas', 'concierto', '2024-12-28', '17:00', 4.0, 'Plaza Central', 500, 0, 0.00, 'activo');

-- 9. Insertar administrador por defecto
INSERT INTO administradores (usuario, password_hash, nombre, email, role) VALUES
('admin', '$2b$10$8K8mF3.6qN2bY1P.KsD8E.', 'Administrador CCB', 'admin@ccb.com', 'admin');

-- ¡Listo! Base de datos configurada para Centro Cultural Banreservas 