package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.servicio.ParkingSpotService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ParkingSpotController {
    private final ParkingSpotService spotService;

    public ParkingSpotController(ParkingSpotService spotService) {
        this.spotService = spotService;
    }

    @GetMapping("/mapa")
    public String mapa(Model model) {
        model.addAttribute("spots", spotService.listar());
        return "mapa";
    }
}
