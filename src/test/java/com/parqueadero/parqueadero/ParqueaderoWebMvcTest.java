package com.parqueadero.parqueadero;

import com.parqueadero.parqueadero.controlador.ParqueaderoController;
import com.parqueadero.parqueadero.servicio.ParqueaderoService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ParqueaderoController.class)
@Import(ParqueaderoWebMvcTest.TestConfig.class)
@TestPropertySource(properties = "spring.web.resources.add-mappings=false")
class ParqueaderoWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ParqueaderoService parqueaderoService;

    @Test
    void home_shouldRenderIndexWithModelAttributes() throws Exception {
        Mockito.when(parqueaderoService.listarActivos()).thenReturn(Collections.emptyList());
        Mockito.when(parqueaderoService.listarTipos()).thenReturn(Collections.emptyList());

    mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("index"))
                .andExpect(model().attributeExists("entrada"))
                .andExpect(model().attributeExists("vehiculos"))
                .andExpect(model().attributeExists("tipos"));
    }
    @Configuration
    static class TestConfig {
        @Bean
        ParqueaderoService parqueaderoService() {
            return Mockito.mock(ParqueaderoService.class);
        }
    }
}
