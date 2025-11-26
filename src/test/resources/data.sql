INSERT INTO tipos_vehiculo (nombre)
SELECT 'CARRO'
WHERE NOT EXISTS (SELECT 1 FROM tipos_vehiculo WHERE UPPER(nombre) = 'CARRO');
INSERT INTO tipos_vehiculo (nombre)
SELECT 'MOTO'
WHERE NOT EXISTS (SELECT 1 FROM tipos_vehiculo WHERE UPPER(nombre) = 'MOTO');

INSERT INTO tarifas (monto, tipo_vehiculo_id, activo)
SELECT 3000, tv.id, TRUE
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'CARRO';

INSERT INTO tarifas (monto, tipo_vehiculo_id, activo)
SELECT 1500, tv.id, TRUE
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'MOTO';

INSERT INTO vehiculos (placa, tipo_vehiculo_id, fecha_hora_entrada, fecha_hora_salida)
SELECT 'ABC123', tv.id, CURRENT_TIMESTAMP, NULL
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'CARRO';

INSERT INTO vehiculos (placa, tipo_vehiculo_id, fecha_hora_entrada, fecha_hora_salida)
SELECT 'XYZ45A', tv.id, CURRENT_TIMESTAMP, NULL
FROM tipos_vehiculo tv
WHERE UPPER(tv.nombre) = 'MOTO';

-- Puestos de parqueo demo (se insertan de forma simple en entorno de test)
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
SELECT 1, 'A1', 'CARRO', 'DISPONIBLE', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM parking_spots WHERE id = 1);
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
SELECT 2, 'A2', 'CARRO', 'OCUPADO', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM parking_spots WHERE id = 2);
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
SELECT 3, 'A3', 'MOTO', 'RESERVADO', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM parking_spots WHERE id = 3);
INSERT INTO parking_spots (id, codigo, tipo, estado, fila, columna)
SELECT 4, 'B1', 'CARRO', 'MANTENIMIENTO', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM parking_spots WHERE id = 4);
