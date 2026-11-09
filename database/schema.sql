-- ========================================================
-- DATABASE SCHEMA: Constructora Del Valle S.A.
-- Control de Inventario y Detección de Fugas
-- Compatible con PostgreSQL y SQLite
-- ========================================================

-- 1. Tabla de Materiales
CREATE TABLE IF NOT EXISTS materiales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_estandar VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'General',
    unidad VARCHAR(20) DEFAULT 'unid',
    stock_minimo INT DEFAULT 0,
    stock_maximo INT NOT NULL,
    demanda_promedio_diaria INT NOT NULL,
    tiempo_entrega_dias INT NOT NULL,
    stock_seguridad INT NOT NULL,
    punto_reorden INT NOT NULL
);

-- 2. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(50)
);

-- 3. Tabla de Órdenes de Compra (OC)
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_oc VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INT REFERENCES proveedores(id),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    area_solicitante VARCHAR(50) NOT NULL,
    estado VARCHAR(25) DEFAULT 'APROBADA', -- APROBADA, PENDIENTE, PENDIENTE_APROBACION, ANULADA
    monto_total DECIMAL(12,2)
);

-- 4. Detalle de Orden de Compra
CREATE TABLE IF NOT EXISTS detalle_orden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_compra_id INT REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    material_id INT REFERENCES materiales(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- 5. Tabla de Movimientos de Inventario (Trazabilidad)
CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INT REFERENCES materiales(id),
    tipo_movimiento VARCHAR(20) NOT NULL, -- ENTRADA, SALIDA, TRASLADO, AJUSTE
    cantidad INT NOT NULL,
    bodega_origen VARCHAR(50),
    bodega_destino VARCHAR(50),
    documento_referencia VARCHAR(50), -- ej. OC-1041, VALE-502
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id VARCHAR(50) NOT NULL
);

-- 6. Tabla de Alertas de Reorden
CREATE TABLE IF NOT EXISTS alertas_reorden (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INT REFERENCES materiales(id),
    stock_al_disparar INT NOT NULL,
    punto_reorden_calculado INT NOT NULL,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_resolucion VARCHAR(20) DEFAULT 'PENDIENTE' -- PENDIENTE, RESUELTA
);

