package com.parqueadero.parqueadero.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_factura")
public class DetalleFactura {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false)
    @JoinColumn(name = "factura_id")
    private Factura factura;

    @ManyToOne(optional=false)
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @ManyToOne(optional=false)
    @JoinColumn(name = "tarifa_id")
    private Tarifa tarifa;

    @Column(nullable=false)
    private double monto;

    private long horasCobradas;

    public long getHorasCobradas() { return horasCobradas; }
    public void setHorasCobradas(long horasCobradas) { this.horasCobradas = horasCobradas; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Factura getFactura() { return factura; }
    public void setFactura(Factura factura) { this.factura = factura; }
    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
    public Tarifa getTarifa() { return tarifa; }
    public void setTarifa(Tarifa tarifa) { this.tarifa = tarifa; }
    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
}
