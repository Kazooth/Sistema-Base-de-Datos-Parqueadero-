package com.parqueadero.parqueadero.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_spots")
public class ParkingSpot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true)
    private String codigo; // p.e. A1, B12

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private SpotType tipo = SpotType.CARRO;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private SpotStatus estado = SpotStatus.DISPONIBLE;

    private Integer fila;   // para layout grid
    private Integer columna;// para layout grid

    @OneToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo; // si está OCUPADO

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public SpotType getTipo() { return tipo; }
    public void setTipo(SpotType tipo) { this.tipo = tipo; }
    public SpotStatus getEstado() { return estado; }
    public void setEstado(SpotStatus estado) { this.estado = estado; }
    public Integer getFila() { return fila; }
    public void setFila(Integer fila) { this.fila = fila; }
    public Integer getColumna() { return columna; }
    public void setColumna(Integer columna) { this.columna = columna; }
    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
}
