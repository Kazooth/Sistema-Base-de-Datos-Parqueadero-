package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.TipoVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoVehiculoRepository extends JpaRepository<TipoVehiculo, Long> {
    Optional<TipoVehiculo> findByNombreIgnoreCase(String nombre);
}
