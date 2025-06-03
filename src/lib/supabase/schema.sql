-- =============================================================================
-- ESQUEMA DE BASE DE DATOS PARA CENTRO CULTURAL BANRESERVAS
-- Diseñado para mantener el layout aprobado del sistema
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLA DE VISITANTES
-- =============================================================================
CREATE TABLE visitantes (
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

-- Índices para mejor rendimiento
CREATE INDEX idx_visitantes_email ON visitantes(email);
CREATE INDEX idx_visitantes_estado ON visitantes(estado);
CREATE INDEX idx_visitantes_fecha_registro ON visitantes(fecha_registro);

-- =============================================================================
-- TABLA DE EVENTOS
-- =============================================================================
CREATE TABLE eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion INTEGER DEFAULT 2, -- duración en horas
    ubicacion VARCHAR(255) NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 100,
    registrados INTEGER DEFAULT 0,
    precio DECIMAL(10,2) DEFAULT 0.00,
    imagen TEXT,
    estado VARCHAR(20) DEFAULT 'proximo' CHECK (estado IN ('proximo', 'activo', 'completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para eventos
CREATE INDEX idx_eventos_fecha ON eventos(fecha);
CREATE INDEX idx_eventos_categoria ON eventos(categoria);
CREATE INDEX idx_eventos_estado ON eventos(estado);

-- =============================================================================
-- TABLA DE REGISTRO DE EVENTOS (RELACIÓN VISITANTES-EVENTOS)
-- =============================================================================
CREATE TABLE registro_eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    codigo_confirmacion VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'checkin', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para registros
CREATE INDEX idx_registro_visitante ON registro_eventos(visitante_id);
CREATE INDEX idx_registro_evento ON registro_eventos(evento_id);
CREATE INDEX idx_registro_codigo ON registro_eventos(codigo_confirmacion);
CREATE UNIQUE INDEX idx_registro_unico ON registro_eventos(visitante_id, evento_id);

-- =============================================================================
-- TABLA DE ADMINISTRADORES
-- =============================================================================
CREATE TABLE administradores (
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
-- FUNCIONES AUXILIARES
-- =============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_visitantes_updated_at BEFORE UPDATE ON visitantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registro_eventos_updated_at BEFORE UPDATE ON registro_eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contador de registrados en eventos
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

-- Trigger para actualizar contador
CREATE TRIGGER trigger_actualizar_contador_registrados
    AFTER INSERT OR UPDATE OR DELETE ON registro_eventos
    FOR EACH ROW EXECUTE FUNCTION actualizar_contador_registrados();

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Políticas para visitantes (lectura pública, escritura limitada)
CREATE POLICY "Visitantes son visibles públicamente" ON visitantes
    FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede insertar visitantes" ON visitantes
    FOR INSERT WITH CHECK (true);

-- Políticas para eventos (lectura pública)
CREATE POLICY "Eventos son visibles públicamente" ON eventos
    FOR SELECT USING (true);

-- Políticas para registro de eventos
CREATE POLICY "Registros son visibles públicamente" ON registro_eventos
    FOR SELECT USING (true);

CREATE POLICY "Cualquiera puede insertar registros" ON registro_eventos
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- DATOS INICIALES (SEEDS)
-- =============================================================================

-- Insertar algunos eventos de ejemplo
INSERT INTO eventos (titulo, descripcion, categoria, fecha, hora, duracion, ubicacion, capacidad, registrados, precio, imagen, estado) VALUES
('Concierto de Jazz Contemporáneo', 'Una noche única con los mejores exponentes del jazz contemporáneo dominicano', 'Música', '2024-12-20', '20:00', 3, 'Auditorio Principal', 300, 245, 1500.00, 'https://via.placeholder.com/400x200/1E40AF/FFFFFF?text=Jazz+Concert', 'proximo'),
('Exposición: Arte Digital Dominicano', 'Muestra colectiva de artistas dominicanos que exploran las nuevas tecnologías', 'Arte', '2024-12-15', '18:00', 4, 'Galería Norte', 150, 89, 800.00, 'https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Arte+Digital', 'activo'),
('Obra Teatral: Memorias del Caribe', 'Drama contemporáneo que narra la historia de tres generaciones', 'Teatro', '2024-12-21', '19:30', 2, 'Teatro Principal', 120, 98, 1200.00, 'https://via.placeholder.com/400x200/EF4444/FFFFFF?text=Teatro+Caribe', 'proximo'),
('Taller de Escritura Creativa', 'Aprende técnicas narrativas con escritores experimentados', 'Talleres', '2024-12-17', '10:00', 4, 'Aula 3', 25, 22, 500.00, 'https://via.placeholder.com/400x200/EC4899/FFFFFF?text=Escritura+Creativa', 'activo'),
('Festival de Danza Folclórica', 'Celebración de las tradiciones dancísticas dominicanas', 'Danza', '2024-12-25', '16:00', 5, 'Plaza Central', 500, 387, 0.00, 'https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Danza+Folklorica', 'proximo');

-- Insertar administrador por defecto
INSERT INTO administradores (nombre, email, password_hash, rol) VALUES
('Administrador CCB', 'admin@ccb.do', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =============================================================================
-- VISTAS PARA ESTADÍSTICAS
-- =============================================================================

-- Vista para estadísticas del dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM eventos) as total_eventos,
    (SELECT COUNT(*) FROM eventos WHERE estado = 'activo') as eventos_activos,
    (SELECT COUNT(*) FROM visitantes) as total_visitantes,
    (SELECT COUNT(*) FROM visitantes WHERE DATE(fecha_registro) = CURRENT_DATE) as visitantes_hoy,
    (SELECT COUNT(*) FROM registro_eventos WHERE estado = 'checkin') as total_checkins,
    (SELECT SUM(eventos.precio * eventos.registrados) FROM eventos) as ingresos_totales;

-- Vista para eventos populares
CREATE VIEW eventos_populares AS
SELECT 
    e.*,
    ROUND((e.registrados::numeric / e.capacidad::numeric) * 100, 2) as porcentaje_ocupacion
FROM eventos e
WHERE e.registrados > 0
ORDER BY porcentaje_ocupacion DESC; 