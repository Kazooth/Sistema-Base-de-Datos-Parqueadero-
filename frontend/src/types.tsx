export type TipoVehiculo = { id: number; nombre: string }
export type Vehiculo = { id: number; placa: string; fechaHoraEntrada: string; tipoVehiculo?: TipoVehiculo }
export type Spot = { id: number; codigo: string; tipo: 'MOTO'|'CARRO'|'ELECTRICO'|'GRANDE'|'DISCAPACIDAD'; estado: 'DISPONIBLE'|'OCUPADO'|'RESERVADO'|'MANTENIMIENTO'; vehiculo?: { placa: string } }
