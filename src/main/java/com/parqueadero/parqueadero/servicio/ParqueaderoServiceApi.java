package com.parqueadero.parqueadero.servicio;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.modelo.*;

import java.util.List;

public interface ParqueaderoServiceApi {
    List<Vehiculo> listarActivos();
    List<TipoVehiculo> listarTipos();
    Vehiculo registrarEntrada(EntradaVehiculoDTO dto);
    Factura registrarSalidaYFacturar(Long vehiculoId);
}
