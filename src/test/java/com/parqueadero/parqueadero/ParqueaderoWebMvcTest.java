package com.parqueadero.parqueadero;

import com.parqueadero.parqueadero.controlador.ParqueaderoController;
import com.parqueadero.parqueadero.repositorio.FacturaRepository;
import com.parqueadero.parqueadero.servicio.ParqueaderoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.ui.ConcurrentModel;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParqueaderoWebMvcTest {

    @Mock
    ParqueaderoService parqueaderoService;

    @Mock
    FacturaRepository facturaRepository;

    @Mock
    Environment env;

    @InjectMocks
    ParqueaderoController controller;

    @Test
    void home_shouldRenderIndexWithModelAttributes() {
        when(parqueaderoService.listarActivos()).thenReturn(Collections.emptyList());
        when(parqueaderoService.listarTipos()).thenReturn(Collections.emptyList());

        ConcurrentModel model = new ConcurrentModel();
        String view = controller.home(model);

        assertThat(view).isEqualTo("index");
        assertThat(model.containsAttribute("entrada")).isTrue();
        assertThat(model.containsAttribute("vehiculos")).isTrue();
        assertThat(model.containsAttribute("tipos")).isTrue();
    }
}
