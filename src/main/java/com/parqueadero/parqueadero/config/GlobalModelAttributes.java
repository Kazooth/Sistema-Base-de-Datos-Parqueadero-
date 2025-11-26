package com.parqueadero.parqueadero.config;

import com.parqueadero.parqueadero.dto.EntradaVehiculoDTO;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalModelAttributes {

    @ModelAttribute("entrada")
    public EntradaVehiculoDTO entrada() {
        return new EntradaVehiculoDTO();
    }
}
