INSERT IGNORE INTO tipos_vehiculo (nombre) VALUES ('CARRO');
INSERT IGNORE INTO tipos_vehiculo (nombre) VALUES ('MOTO');

INSERT IGNORE INTO tarifas (monto, tipo_vehiculo_id)
SELECT 3000, tv.id
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'CARRO';

INSERT IGNORE INTO tarifas (monto, tipo_vehiculo_id)
SELECT 1500, tv.id
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'MOTO';

INSERT IGNORE INTO vehiculos (placa, tipo_vehiculo_id, fecha_hora_entrada, fecha_hora_salida)
SELECT 'ABC123', tv.id, NOW(), NULL
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'CARRO';

INSERT IGNORE INTO vehiculos (placa, tipo_vehiculo_id, fecha_hora_entrada, fecha_hora_salida)
SELECT 'XYZ45A', tv.id, NOW(), NULL
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'MOTO';

-- Puestos de parqueo demo (si no existen)
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
VALUES (1, 'A1', 'CARRO', 'DISPONIBLE', 1, 1)
ON DUPLICATE KEY UPDATE codigo='A1';
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
VALUES (2, 'A2', 'CARRO', 'OCUPADO', 1, 2)
ON DUPLICATE KEY UPDATE codigo='A2';
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
VALUES (3, 'A3', 'MOTO', 'RESERVADO', 1, 3)
ON DUPLICATE KEY UPDATE codigo='A3';
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
VALUES (4, 'B1', 'CARRO', 'MANTENIMIENTO', 2, 1)
ON DUPLICATE KEY UPDATE codigo='B1';
