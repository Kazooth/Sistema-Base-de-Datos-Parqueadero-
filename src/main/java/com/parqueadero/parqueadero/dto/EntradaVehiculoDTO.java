package com.parqueadero.parqueadero.dto;

public class EntradaVehiculoDTO {
    private String placa;
    private Long tipoVehiculoId;

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public Long getTipoVehiculoId() { return tipoVehiculoId; }
    public void setTipoVehiculoId(Long tipoVehiculoId) { this.tipoVehiculoId = tipoVehiculoId; }
}
