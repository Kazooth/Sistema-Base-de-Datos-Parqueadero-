package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.time.LocalDateTime;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
	@Query("select f from Factura f order by f.id desc")
	List<Factura> listarRecientes();

	List<Factura> findByFechaCreacionBetweenOrderByIdDesc(LocalDateTime desde, LocalDateTime hasta);
}
