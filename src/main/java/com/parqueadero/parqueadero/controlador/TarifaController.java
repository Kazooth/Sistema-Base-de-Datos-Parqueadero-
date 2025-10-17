package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.modelo.Tarifa;
import com.parqueadero.parqueadero.repositorio.TarifaRepository;
import com.parqueadero.parqueadero.repositorio.TipoVehiculoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/tarifas")
public class TarifaController {
    private final TarifaRepository tarifaRepo;
    private final TipoVehiculoRepository tipoRepo;

    public TarifaController(TarifaRepository tarifaRepo, TipoVehiculoRepository tipoRepo) {
        this.tarifaRepo = tarifaRepo;
        this.tipoRepo = tipoRepo;
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("tarifas", tarifaRepo.findByActivoTrueOrderByIdDesc());
        model.addAttribute("tipos", tipoRepo.findAll());
        model.addAttribute("tarifa", new Tarifa());
        return "tarifas";
    }

    @PostMapping
    public String crear(@ModelAttribute Tarifa tarifa, RedirectAttributes ra) {
        if (tarifa.getTipoVehiculo() == null || tarifa.getTipoVehiculo().getId() == null) {
            ra.addFlashAttribute("error", "Seleccione un tipo de vehículo.");
            return "redirect:/tarifas";
        }
        if (tarifa.getMonto() <= 0) {
            ra.addFlashAttribute("error", "El monto debe ser mayor a 0.");
            return "redirect:/tarifas";
        }
        tarifaRepo.save(tarifa);
        ra.addFlashAttribute("success", "Tarifa guardada correctamente.");
        return "redirect:/tarifas";
    }

    @PostMapping("/{id}/actualizar")
    public String actualizar(@PathVariable Long id,
                             @RequestParam double monto,
                             @RequestParam(required = false, defaultValue = "true") boolean activo,
                             RedirectAttributes ra) {
        var opt = tarifaRepo.findById(id);
        if (opt.isEmpty()) {
            ra.addFlashAttribute("error", "La tarifa no existe.");
            return "redirect:/tarifas";
        }
        var t = opt.get();
        if (monto <= 0) {
            ra.addFlashAttribute("error", "El monto debe ser mayor a 0.");
            return "redirect:/tarifas";
        }
        t.setMonto(monto);
        t.setActivo(activo);
        tarifaRepo.save(t);
        ra.addFlashAttribute("success", "Tarifa actualizada.");
        return "redirect:/tarifas";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id, RedirectAttributes ra) {
        var opt = tarifaRepo.findById(id);
        if (opt.isEmpty()) {
            ra.addFlashAttribute("error", "La tarifa no existe.");
            return "redirect:/tarifas";
        }
        var t = opt.get();
        t.setActivo(false);
        tarifaRepo.save(t);
        ra.addFlashAttribute("success", "Tarifa desactivada.");
        return "redirect:/tarifas";
    }
}
