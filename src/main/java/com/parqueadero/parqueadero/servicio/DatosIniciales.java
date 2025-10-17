package com.parqueadero.parqueadero.servicio;

import com.parqueadero.parqueadero.modelo.Tarifa;
import com.parqueadero.parqueadero.modelo.TipoVehiculo;
import com.parqueadero.parqueadero.repositorio.TarifaRepository;
import com.parqueadero.parqueadero.repositorio.TipoVehiculoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatosIniciales implements CommandLineRunner {

    private final TipoVehiculoRepository tipoRepo;
    private final TarifaRepository tarifaRepo;

    public DatosIniciales(TipoVehiculoRepository tipoRepo, TarifaRepository tarifaRepo) {
        this.tipoRepo = tipoRepo;
        this.tarifaRepo = tarifaRepo;
    }

    @Override
    public void run(String... args) {
        var carro = tipoRepo.findByNombreIgnoreCase("CARRO")
                .orElseGet(() -> { var t = new TipoVehiculo(); t.setNombre("CARRO"); return tipoRepo.save(t); });
        var moto = tipoRepo.findByNombreIgnoreCase("MOTO")
                .orElseGet(() -> { var t = new TipoVehiculo(); t.setNombre("MOTO"); return tipoRepo.save(t); });

        tarifaRepo.findFirstByTipoVehiculo_Id(carro.getId()).orElseGet(() -> {
            var tf = new Tarifa(); tf.setMonto(3000); tf.setTipoVehiculo(carro); return tarifaRepo.save(tf);
        });
        tarifaRepo.findFirstByTipoVehiculo_Id(moto.getId()).orElseGet(() -> {
            var tf = new Tarifa(); tf.setMonto(1500); tf.setTipoVehiculo(moto); return tarifaRepo.save(tf);
        });
    }
}
