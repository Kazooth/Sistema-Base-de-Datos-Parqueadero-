package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.modelo.Factura;
import com.parqueadero.parqueadero.modelo.TipoVehiculo;
import com.parqueadero.parqueadero.modelo.Vehiculo;
import com.parqueadero.parqueadero.servicio.ParqueaderoServiceApi;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ParqueaderoRestController {

    private final ParqueaderoServiceApi service;

    public ParqueaderoRestController(ParqueaderoServiceApi service) {
        this.service = service;
    }

    @GetMapping("/vehiculos/activos")
    public List<Vehiculo> activos() { return service.listarActivos(); }

    @GetMapping("/tipos")
    public List<TipoVehiculo> tipos() { return service.listarTipos(); }

    @PostMapping("/vehiculos/entrada")
    public Vehiculo registrarEntrada(@RequestBody EntradaVehiculoDTO dto) {
        return service.registrarEntrada(dto);
    }

    @PostMapping("/vehiculos/{id}/salida")
    public Factura registrarSalida(@PathVariable Long id) {
        return service.registrarSalidaYFacturar(id);
    }
}
