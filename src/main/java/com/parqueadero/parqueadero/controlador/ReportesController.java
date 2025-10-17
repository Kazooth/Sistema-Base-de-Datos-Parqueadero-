package com.parqueadero.parqueadero.controlador;

import com.parqueadero.parqueadero.repositorio.FacturaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.stream.Collectors;
import java.util.*;
import java.time.YearMonth;

@Controller
public class ReportesController {
    private final FacturaRepository facturaRepo;

    public ReportesController(FacturaRepository facturaRepo) {
        this.facturaRepo = facturaRepo;
    }

    @GetMapping("/reportes")
    public String reportes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            Model model) {
        var d = desde != null ? desde : LocalDate.now().minusDays(7);
        var h = hasta != null ? hasta : LocalDate.now();
        var list = facturaRepo.findByFechaCreacionBetweenOrderByIdDesc(d.atStartOfDay(), h.atTime(LocalTime.MAX));

        // KPIs
        double total = list.stream().mapToDouble(f -> f.getTotal()).sum();
        long count = list.size();
        double promedio = count > 0 ? total / count : 0;

        // Serie por día (llenando huecos)
        Map<LocalDate, Double> byDay = new LinkedHashMap<>();
        for (LocalDate cursor = d; !cursor.isAfter(h); cursor = cursor.plusDays(1)) {
            byDay.put(cursor, 0.0);
        }
        list.forEach(f -> {
            var day = f.getFechaCreacion().toLocalDate();
            byDay.computeIfPresent(day, (k, v) -> v + f.getTotal());
        });
        var labelsDias = byDay.keySet().stream().map(LocalDate::toString).toList();
        var valoresDias = byDay.values().stream().toList();

        // Serie por tipo de vehículo (tomando detalle)
        Map<String, Double> byTipo = new HashMap<>();
        list.forEach(f -> {
            if (f.getDetalles() != null) {
                f.getDetalles().forEach(dv -> {
                    String nombre = dv.getVehiculo() != null && dv.getVehiculo().getTipoVehiculo() != null ? dv.getVehiculo().getTipoVehiculo().getNombre() : "DESCONOCIDO";
                    byTipo.merge(nombre, dv.getMonto(), Double::sum);
                });
            }
        });
        var labelsTipos = new ArrayList<>(byTipo.keySet());
        Collections.sort(labelsTipos);
        var valoresTipos = labelsTipos.stream().map(byTipo::get).toList();

        // Serie por mes en el rango
        Map<YearMonth, Double> byMonth = new LinkedHashMap<>();
        for (YearMonth cursor = YearMonth.from(d); !cursor.isAfter(YearMonth.from(h)); cursor = cursor.plusMonths(1)) {
            byMonth.put(cursor, 0.0);
        }
        list.forEach(f -> {
            var ym = YearMonth.from(f.getFechaCreacion());
            if (byMonth.containsKey(ym)) {
                byMonth.computeIfPresent(ym, (k, v) -> v + f.getTotal());
            }
        });
        var labelsMes = byMonth.keySet().stream().map(YearMonth::toString).toList();
        var valoresMes = byMonth.values().stream().toList();

        // Top placas por recaudo (top 5)
        Map<String, Double> byPlaca = new HashMap<>();
        list.forEach(f -> {
            if (f.getDetalles() != null) {
                f.getDetalles().forEach(dv -> {
                    String placa = dv.getVehiculo() != null ? dv.getVehiculo().getPlaca() : "?";
                    byPlaca.merge(placa, dv.getMonto(), Double::sum);
                });
            }
        });
        var topPlacas = byPlaca.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .toList();
        var labelsTopPlacas = topPlacas.stream().map(Map.Entry::getKey).toList();
        var valoresTopPlacas = topPlacas.stream().map(Map.Entry::getValue).toList();

        model.addAttribute("desde", d);
        model.addAttribute("hasta", h);
        model.addAttribute("facturas", list);
        model.addAttribute("total", total);
        model.addAttribute("count", count);
        model.addAttribute("promedio", promedio);
        model.addAttribute("labelsDias", labelsDias);
        model.addAttribute("valoresDias", valoresDias);
        model.addAttribute("labelsTipos", labelsTipos);
        model.addAttribute("valoresTipos", valoresTipos);
        model.addAttribute("labelsMes", labelsMes);
        model.addAttribute("valoresMes", valoresMes);
        model.addAttribute("labelsTopPlacas", labelsTopPlacas);
        model.addAttribute("valoresTopPlacas", valoresTopPlacas);
        return "reportes";
    }

    @GetMapping("/reportes.csv")
    public ResponseEntity<byte[]> reportesCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        var list = facturaRepo.findByFechaCreacionBetweenOrderByIdDesc(desde.atStartOfDay(), hasta.atTime(LocalTime.MAX));
        var header = "id,total,fechaCreacion\n";
        var body = list.stream()
                .map(f -> f.getId() + "," + f.getTotal() + "," + f.getFechaCreacion())
                .collect(Collectors.joining("\n"));
        var csv = (header + body).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reportes.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }
}
