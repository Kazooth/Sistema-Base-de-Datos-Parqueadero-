package com.parqueadero.parqueadero.servicio;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.modelo.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ParqueaderoServiceApi {
    List<Vehiculo> listarActivos();
    Page<Vehiculo> listarActivos(Pageable pageable);
    List<TipoVehiculo> listarTipos();
    Vehiculo registrarEntrada(EntradaVehiculoDTO dto);
    Factura registrarSalidaYFacturar(Long vehiculoId);
}
