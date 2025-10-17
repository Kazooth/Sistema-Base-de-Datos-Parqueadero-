package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.dto.EstadisticasDTO;
import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.repositorio.FacturaRepository;
import com.parqueadero.parqueadero.repositorio.VehiculoRepository;
import com.parqueadero.parqueadero.servicio.ParqueaderoServiceApi;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EstadisticasController {
    private final VehiculoRepository vehiculoRepo;
    private final FacturaRepository facturaRepo;
    private final ParqueaderoServiceApi service;

    public EstadisticasController(VehiculoRepository vehiculoRepo, FacturaRepository facturaRepo, ParqueaderoServiceApi service) {
        this.vehiculoRepo = vehiculoRepo;
        this.facturaRepo = facturaRepo;
        this.service = service;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        long activos = vehiculoRepo.findByFechaHoraSalidaIsNullOrderByFechaHoraEntradaAsc().size();
        long facturas = facturaRepo.count();
        // estimado simple: activos * tarifa mínima (si existe), solo referencia
        double estimado = activos * 1000.0;
        model.addAttribute("stats", new EstadisticasDTO(activos, facturas, estimado));
        model.addAttribute("entrada", new EntradaVehiculoDTO());
        model.addAttribute("vehiculos", service.listarActivos());
        model.addAttribute("tipos", service.listarTipos());
        return "index";
    }
}
