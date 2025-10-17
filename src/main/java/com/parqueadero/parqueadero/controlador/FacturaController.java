package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.repositorio.FacturaRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class FacturaController {
    private final FacturaRepository facturaRepo;

    public FacturaController(FacturaRepository facturaRepo) {
        this.facturaRepo = facturaRepo;
    }

    @GetMapping("/facturas/{id}")
    public String ver(@PathVariable Long id, Model model) {
        var f = facturaRepo.findById(id).orElseThrow();
        model.addAttribute("factura", f);
        return "factura";
    }
}
