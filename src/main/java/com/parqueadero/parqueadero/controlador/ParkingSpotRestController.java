package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.modelo.ParkingSpot;
import com.parqueadero.parqueadero.servicio.ParkingSpotService;
import com.parqueadero.parqueadero.repositorio.VehiculoRepository;
import com.parqueadero.parqueadero.servicio.ParqueaderoServiceApi;
import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spots")
public class ParkingSpotRestController {
    private final ParkingSpotService spotService;
    private final VehiculoRepository vehiculoRepo;
    private final SimpMessagingTemplate broker;
    private final ParqueaderoServiceApi parqueaderoService;

    public ParkingSpotRestController(ParkingSpotService spotService, VehiculoRepository vehiculoRepo, SimpMessagingTemplate broker, ParqueaderoServiceApi parqueaderoService) {
        this.spotService = spotService;
        this.vehiculoRepo = vehiculoRepo;
        this.broker = broker;
        this.parqueaderoService = parqueaderoService;
    }

    @GetMapping
    public List<ParkingSpot> listar() {
        return spotService.listar();
    }

    @PostMapping("/{id}/reservar")
    public ParkingSpot reservar(@PathVariable Long id) {
        var s = spotService.reservar(id);
        broker.convertAndSend("/topic/spots", s);
        return s;
    }

    @PostMapping("/{id}/mantenimiento")
    public ParkingSpot mantenimiento(@PathVariable Long id) {
        var s = spotService.mantenimiento(id);
        broker.convertAndSend("/topic/spots", s);
        return s;
    }

    @PostMapping("/{id}/liberar")
    public ParkingSpot liberar(@PathVariable Long id) {
        var s = spotService.liberar(id);
        broker.convertAndSend("/topic/spots", s);
        return s;
    }

    // Ocupar con placa: body { "placa": "ABC123", "tipoVehiculoId": 1 }
    @PostMapping("/{id}/ocupar")
    public ParkingSpot ocuparConPlaca(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var placa = body.getOrDefault("placa", "").trim();
        if (placa.isEmpty()) throw new IllegalArgumentException("La placa es obligatoria");
        var vehOpt = vehiculoRepo.findFirstByPlacaIgnoreCaseAndFechaHoraSalidaIsNull(placa);
        var vehiculo = vehOpt.orElseGet(() -> {
            var tipoStr = body.get("tipoVehiculoId");
            if (tipoStr == null || tipoStr.isBlank()) throw new IllegalArgumentException("Debe indicar tipoVehiculoId para crear la entrada");
            var dto = new EntradaVehiculoDTO();
            dto.setPlaca(placa);
            dto.setTipoVehiculoId(Long.parseLong(tipoStr));
            return parqueaderoService.registrarEntrada(dto);
        });
        var s = spotService.ocupar(id, vehiculo.getId());
        broker.convertAndSend("/topic/spots", s);
        return s;
    }
}
