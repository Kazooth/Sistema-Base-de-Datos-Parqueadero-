package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    List<Vehiculo> findByFechaHoraSalidaIsNullOrderByFechaHoraEntradaAsc();
    org.springframework.data.domain.Page<Vehiculo> findByFechaHoraSalidaIsNullOrderByFechaHoraEntradaAsc(org.springframework.data.domain.Pageable pageable);
    Optional<Vehiculo> findFirstByPlacaIgnoreCaseAndFechaHoraSalidaIsNull(String placa);
}
