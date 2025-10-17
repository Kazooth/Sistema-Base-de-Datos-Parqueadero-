package com.parqueadero.parqueadero.servicio;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import com.parqueadero.parqueadero.modelo.*;
import com.parqueadero.parqueadero.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ParqueaderoService implements ParqueaderoServiceApi {

    private final VehiculoRepository vehiculoRepo;
    private final TipoVehiculoRepository tipoRepo;
    private final TarifaRepository tarifaRepo;
    private final FacturaRepository facturaRepo;
    private final DetalleFacturaRepository detalleRepo;

    public ParqueaderoService(VehiculoRepository vehiculoRepo,
                              TipoVehiculoRepository tipoRepo,
                              TarifaRepository tarifaRepo,
                              FacturaRepository facturaRepo,
                              DetalleFacturaRepository detalleRepo) {
        this.vehiculoRepo = vehiculoRepo;
        this.tipoRepo = tipoRepo;
        this.tarifaRepo = tarifaRepo;
        this.facturaRepo = facturaRepo;
        this.detalleRepo = detalleRepo;
    }

    @Override
    public List<Vehiculo> listarActivos() {
        return vehiculoRepo.findByFechaHoraSalidaIsNullOrderByFechaHoraEntradaAsc();
    }

    @Override
    public List<TipoVehiculo> listarTipos() {
        return tipoRepo.findAll();
    }

    @Override
    @Transactional
    public Vehiculo registrarEntrada(EntradaVehiculoDTO dto) {
        if (dto.getPlaca() == null || dto.getPlaca().isBlank())
            throw new IllegalArgumentException("La placa es obligatoria.");
        if (dto.getTipoVehiculoId() == null)
            throw new IllegalArgumentException("Debes seleccionar el tipo de vehículo.");

        // Evitar duplicados dentro del parqueadero
        vehiculoRepo.findFirstByPlacaIgnoreCaseAndFechaHoraSalidaIsNull(dto.getPlaca())
                .ifPresent(v -> { throw new IllegalStateException("La placa ya está registrada adentro."); });

        var tipo = tipoRepo.findById(dto.getTipoVehiculoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de vehículo no existe."));

        var v = new Vehiculo();
        v.setPlaca(dto.getPlaca().trim().toUpperCase());
        v.setTipoVehiculo(tipo);
        v.setFechaHoraEntrada(LocalDateTime.now());
        return vehiculoRepo.save(v);
    }

    @Override
    @Transactional
    public Factura registrarSalidaYFacturar(Long vehiculoId) {
        var v = vehiculoRepo.findById(vehiculoId)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado."));

        if (v.getFechaHoraSalida() != null)
            throw new IllegalStateException("El vehículo ya tiene salida registrada.");

        v.setFechaHoraSalida(LocalDateTime.now());

        long minutos = Duration.between(v.getFechaHoraEntrada(), v.getFechaHoraSalida()).toMinutes();
        long horas = Math.max(1, (long) Math.ceil(minutos / 60.0)); // cobra mínimo 1 hora

    var tarifa = tarifaRepo.findFirstByTipoVehiculo_IdAndActivoTrueOrderByIdDesc(v.getTipoVehiculo().getId())
                .orElseThrow(() -> new IllegalStateException(
                        "No hay tarifa configurada para " + v.getTipoVehiculo().getNombre()));

        double subtotal = tarifa.getMonto() * horas;

        var factura = new Factura();
        factura.setTotal(0);
        factura = facturaRepo.save(factura);

        var det = new DetalleFactura();
        det.setFactura(factura);
        det.setVehiculo(v);
        det.setTarifa(tarifa);
        det.setMonto(subtotal);
    det.setHorasCobradas(horas);
        detalleRepo.save(det);

        factura.setTotal(subtotal);
        return facturaRepo.save(factura);
    }
}
