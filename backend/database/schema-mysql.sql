-- ========================================================
-- DATABASE SCHEMA MYSQL: Constructora Del Valle S.A.
-- Control de Inventario y Detección de Fugas
-- Compatible con MySQL / MariaDB (XAMPP / MySQL Server)
-- ========================================================

CREATE TABLE IF NOT EXISTS materiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ordenes_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_oc VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INT,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    area_solicitante VARCHAR(50) NOT NULL,
    estado VARCHAR(25) DEFAULT 'APROBADA',
    monto_total DECIMAL(12,2),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detalle_orden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_compra_id INT NOT NULL,
    material_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL,
    cantidad INT NOT NULL,
    bodega_origen VARCHAR(50),
    bodega_destino VARCHAR(50),
    documento_referencia VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alertas_reorden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    stock_al_disparar INT NOT NULL,
    punto_reorden_calculado INT NOT NULL,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_resolucion VARCHAR(20) DEFAULT 'PENDIENTE',
    FOREIGN KEY (material_id) REFERENCES materiales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

