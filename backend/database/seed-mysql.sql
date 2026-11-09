-- ========================================================
-- DATABASE SEED MYSQL: Constructora Del Valle S.A.
-- Datos iniciales: Materiales, Proveedores, Órdenes OC-1041 a OC-1061 y Kardex
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE alertas_reorden;
TRUNCATE TABLE movimientos;
TRUNCATE TABLE detalle_orden;
TRUNCATE TABLE ordenes_compra;
TRUNCATE TABLE proveedores;
TRUNCATE TABLE materiales;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Materiales
INSERT INTO materiales (id, codigo_estandar, descripcion, categoria, unidad, stock_minimo, stock_maximo, demanda_promedio_diaria, tiempo_entrega_dias, stock_seguridad, punto_reorden) VALUES
(1, 'MAT-CEM-01', 'Cemento gris 50 kg', 'Cementos', 'sacos', 50, 400, 15, 5, 75, 165),
(2, 'MAT-ACE-04', 'Varilla de acero #4 Grado 60', 'Acero', 'varillas', 100, 800, 35, 5, 175, 350),
(3, 'MAT-MAM-01', 'Block 12x20x40 estándar', 'Mampostería', 'unid', 500, 6000, 300, 4, 1200, 3600),
(4, 'MAT-AGR-01', 'Arena de río cribada (m³)', 'Agregados', 'm³', 5, 50, 3, 2, 8, 20),
(5, 'MAT-AGR-02', 'Piedra cuarta limpia (m³)', 'Agregados', 'm³', 10, 60, 5, 3, 15, 35),
(6, 'MAT-EPP-01', 'Casco de seguridad Tipo I', 'EPP', 'piezas', 20, 200, 8, 5, 40, 80);

-- 2. Proveedores
INSERT INTO proveedores (id, nombre, contacto) VALUES
(1, 'Proveedor A (Distribuidora de Cemento del Valle)', 'ventas@proveedora.cr / 2222-1000'),
(2, 'Aceros del Norte S.A.', 'pedidos@acerosnorte.cr / 2440-5500'),
(3, 'Bloquera Central S.A.', 'contacto@bloqueracentral.com / 2551-8899'),
(4, 'Tajo & Quebradores del Este', 'ventas@tajodeleste.cr / 2710-3344'),
(5, 'Seguridad Industrial Pro-Tech', 'info@protech-cr.com / 2234-9988');

-- 3. Órdenes de Compra (OC-1041 a OC-1061)
INSERT INTO ordenes_compra (id, numero_oc, proveedor_id, fecha_emision, area_solicitante, estado, monto_total) VALUES
(1, 'OC-1041', 1, '2026-10-02 08:30:00', 'Bodega Central', 'APROBADA', 1290000.00),
(2, 'OC-1042', 1, '2026-10-02 11:15:00', 'Bodega Central', 'PENDIENTE', 1290000.00),
(3, 'OC-1043', 2, '2026-10-04 14:00:00', 'Obra Puente Los Santos', 'APROBADA', 735000.00),
(4, 'OC-1044', 3, '2026-10-06 09:20:00', 'Bodega Central', 'APROBADA', 550000.00),
(5, 'OC-1045', 4, '2026-10-08 10:15:00', 'Obra Torre Los Álamos', 'APROBADA', 180000.00),
(6, 'OC-1046', 5, '2026-10-10 15:30:00', 'Seguridad Ocupacional', 'APROBADA', 240000.00),
(7, 'OC-1047', 1, '2026-10-12 11:00:00', 'Bodega Central', 'APROBADA', 645000.00),
(8, 'OC-1048', 2, '2026-10-14 13:45:00', 'Obra Vía San José', 'APROBADA', 980000.00),
(9, 'OC-1049', 3, '2026-10-15 08:00:00', 'Obra Torre Los Álamos', 'APROBADA', 1100000.00),
(10, 'OC-1050', 4, '2026-10-17 16:10:00', 'Bodega Central', 'APROBADA', 225000.00),
(11, 'OC-1051', 1, '2026-10-19 09:30:00', 'Bodega Central', 'APROBADA', 322500.00),
(12, 'OC-1052', 5, '2026-10-21 11:20:00', 'Seguridad Ocupacional', 'APROBADA', 120000.00),
(13, 'OC-1053', 2, '2026-10-22 14:15:00', 'Bodega Central', 'APROBADA', 490000.00),
(14, 'OC-1054', 3, '2026-10-24 10:00:00', 'Obra Puente Los Santos', 'APROBADA', 825000.00),
(15, 'OC-1055', 4, '2026-10-25 15:40:00', 'Obra Torre Los Álamos', 'APROBADA', 135000.00),
(16, 'OC-1056', 1, '2026-10-26 08:45:00', 'Bodega Central', 'APROBADA', 967500.00),
(17, 'OC-1057', 2, '2026-10-27 12:30:00', 'Obra Vía San José', 'APROBADA', 392000.00),
(18, 'OC-1058', 5, '2026-10-28 16:00:00', 'Seguridad Ocupacional', 'APROBADA', 160000.00),
(19, 'OC-1059', 3, '2026-10-29 09:10:00', 'Bodega Central', 'APROBADA', 660000.00),
(20, 'OC-1060', 4, '2026-10-30 11:50:00', 'Obra Torre Los Álamos', 'APROBADA', 270000.00),
(21, 'OC-1061', 1, '2026-10-31 14:00:00', 'Bodega Central', 'PENDIENTE_APROBACION', 1290000.00);

-- 4. Detalle de Órdenes
INSERT INTO detalle_orden (orden_compra_id, material_id, cantidad, precio_unitario) VALUES
(1, 1, 200, 6450.00),
(2, 1, 200, 6450.00),
(3, 2, 150, 4900.00),
(4, 3, 1000, 550.00),
(5, 4, 12, 15000.00),
(6, 6, 60, 4000.00),
(7, 1, 100, 6450.00),
(8, 2, 200, 4900.00),
(9, 3, 2000, 550.00),
(10, 5, 15, 15000.00),
(11, 1, 50, 6450.00),
(12, 6, 30, 4000.00),
(13, 2, 100, 4900.00),
(14, 3, 1500, 550.00),
(15, 4, 9, 15000.00),
(16, 1, 150, 6450.00),
(17, 2, 80, 4900.00),
(18, 6, 40, 4000.00),
(19, 3, 1200, 550.00),
(20, 5, 18, 15000.00),
(21, 1, 200, 6450.00);

-- 5. Movimientos Históricos
INSERT INTO movimientos (material_id, tipo_movimiento, cantidad, bodega_origen, bodega_destino, documento_referencia, fecha_registro, usuario_id) VALUES
(1, 'ENTRADA', 300, 'Proveedor A', 'Bodega Central', 'OC-1041', '2026-10-03 09:00:00', 'usr_juan_perez'),
(1, 'SALIDA', 110, 'Bodega Central', 'Obra Torre Los Álamos', 'VALE-801', '2026-10-15 14:20:00', 'usr_juan_perez'),
(2, 'ENTRADA', 500, 'Aceros del Norte', 'Bodega Central', 'OC-1043', '2026-10-05 10:00:00', 'usr_juan_perez'),
(2, 'SALIDA', 80, 'Bodega Central', 'Obra Puente Los Santos', 'VALE-812', '2026-10-18 11:30:00', 'usr_carlos_m'),
(3, 'ENTRADA', 4000, 'Bloquera Central S.A.', 'Bodega Central', 'OC-1044', '2026-10-07 08:30:00', 'usr_juan_perez'),
(3, 'SALIDA', 1200, 'Bodega Central', 'Obra Torre Los Álamos', 'VALE-830', '2026-10-25 16:00:00', 'usr_juan_perez'),
(4, 'ENTRADA', 20, 'Tajo & Quebradores', 'Bodega Central', 'OC-1045', '2026-10-09 11:00:00', 'usr_carlos_m'),
(4, 'SALIDA', 6, 'Bodega Central', 'Obra Vía San José', 'VALE-845', '2026-10-28 10:45:00', 'usr_carlos_m'),
(5, 'ENTRADA', 50, 'Tajo & Quebradores', 'Bodega Central', 'OC-1050', '2026-10-18 13:00:00', 'usr_juan_perez'),
(5, 'SALIDA', 5, 'Bodega Central', 'Obra Torre Los Álamos', 'VALE-852', '2026-10-29 09:30:00', 'usr_juan_perez'),
(6, 'ENTRADA', 120, 'Pro-Tech', 'Bodega Central', 'OC-1046', '2026-10-11 15:00:00', 'usr_juan_perez'),
(6, 'SALIDA', 10, 'Bodega Central', 'Seguridad Ocupacional', 'VALE-860', '2026-10-30 08:15:00', 'usr_juan_perez');

-- 6. Alertas de Reorden Iniciales
INSERT INTO alertas_reorden (material_id, stock_al_disparar, punto_reorden_calculado, fecha_alerta, estado_resolucion) VALUES
(3, 2800, 3600, '2026-10-25 16:00:00', 'PENDIENTE'),
(4, 14, 20, '2026-10-28 10:45:00', 'PENDIENTE');

