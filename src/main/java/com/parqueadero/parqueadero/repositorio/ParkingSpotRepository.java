package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.ParkingSpot;
import com.parqueadero.parqueadero.modelo.SpotStatus;
import com.parqueadero.parqueadero.modelo.SpotType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    Optional<ParkingSpot> findByCodigo(String codigo);
    List<ParkingSpot> findByEstado(SpotStatus estado);
    List<ParkingSpot> findByTipo(SpotType tipo);
    List<ParkingSpot> findByEstadoAndTipo(SpotStatus estado, SpotType tipo);
}
