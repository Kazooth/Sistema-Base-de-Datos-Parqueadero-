package com.parqueadero.parqueadero.dto;

public class EstadisticasDTO {
    private long vehiculosActivos;
    private long facturas;
    private double recaudoEstimado;

    public EstadisticasDTO(long vehiculosActivos, long facturas, double recaudoEstimado) {
        this.vehiculosActivos = vehiculosActivos;
        this.facturas = facturas;
        this.recaudoEstimado = recaudoEstimado;
    }

    public long getVehiculosActivos() { return vehiculosActivos; }
    public long getFacturas() { return facturas; }
    public double getRecaudoEstimado() { return recaudoEstimado; }
}
