package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.Tarifa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TarifaRepository extends JpaRepository<Tarifa, Long> {
    Optional<Tarifa> findFirstByTipoVehiculo_Id(Long tipoVehiculoId);
    Optional<Tarifa> findFirstByTipoVehiculo_IdAndActivoTrueOrderByIdDesc(Long tipoVehiculoId);
    List<Tarifa> findByActivoTrueOrderByIdDesc();
}
