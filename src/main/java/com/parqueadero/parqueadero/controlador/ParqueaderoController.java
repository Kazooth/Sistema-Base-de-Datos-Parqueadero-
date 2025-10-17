package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.dto.EstadisticasDTO;
import com.parqueadero.parqueadero.repositorio.FacturaRepository;
import com.parqueadero.parqueadero.servicio.ParqueaderoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class ParqueaderoController {

    private final ParqueaderoService service;
    private final FacturaRepository facturaRepo;
    @Value("${spa.dev-url:}")
    private String spaDevUrl;

    public ParqueaderoController(ParqueaderoService service, FacturaRepository facturaRepo) {
        this.service = service;
        this.facturaRepo = facturaRepo;
    }

    // Asegura que SIEMPRE exista 'entrada' en el modelo
    @ModelAttribute("entrada")
    public EntradaVehiculoDTO initEntrada() {
        return new EntradaVehiculoDTO();
    }

    // Landing principal "/" -> SPA (React)
    // Si spa.dev-url está configurado (p.ej. http://localhost:5173), redirige al dev server.
    // Si no, sirve la SPA empacada en static/app/index.html
    @GetMapping("/")
    public String landing() {
        if (spaDevUrl != null && !spaDevUrl.isBlank()) {
            return "redirect:" + spaDevUrl;
        }
        return "forward:/app/index.html";
    }

    // Antiguo home de Thymeleaf disponible en /home
    @GetMapping("/home")
    public String legacyHome(Model model) {
        var vehiculos = service.listarActivos();
        long activos = vehiculos.size();
        long facturas = facturaRepo.count();
        double estimado = activos * 1000.0;
        model.addAttribute("stats", new EstadisticasDTO(activos, facturas, estimado));
        return "home";
    }

    // Panel operativo "/index"
    @GetMapping("/index")
    public String home(Model model) {
        if (!model.containsAttribute("entrada")) {
            model.addAttribute("entrada", new EntradaVehiculoDTO());
        }
        var vehiculos = service.listarActivos();
        model.addAttribute("vehiculos", vehiculos);
        model.addAttribute("tipos", service.listarTipos());
        // stats simples
        long activos = vehiculos.size();
        long facturas = facturaRepo.count();
        double estimado = activos * 1000.0;
        model.addAttribute("stats", new EstadisticasDTO(activos, facturas, estimado));
        return "index";
    }

    @PostMapping("/vehiculos/entrada")
    public String registrarEntrada(@ModelAttribute("entrada") EntradaVehiculoDTO dto, RedirectAttributes ra) {
        var v = service.registrarEntrada(dto);
        ra.addFlashAttribute("success", "Entrada registrada para placa " + v.getPlaca());
        return "redirect:/";
    }

    @PostMapping("/vehiculos/{id}/salida")
    public String registrarSalida(@PathVariable Long id, RedirectAttributes ra) {
        var f = service.registrarSalidaYFacturar(id);
        return "redirect:/facturas/" + f.getId();
    }

    @GetMapping("/historial")
    public String historial(Model model) {
        model.addAttribute("facturas", facturaRepo.listarRecientes());
        return "historial";
    }
}
