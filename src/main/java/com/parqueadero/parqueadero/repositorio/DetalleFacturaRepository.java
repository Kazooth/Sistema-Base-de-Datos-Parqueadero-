package com.parqueadero.parqueadero.repositorio;

import com.parqueadero.parqueadero.modelo.DetalleFactura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleFacturaRepository extends JpaRepository<DetalleFactura, Long> {}
