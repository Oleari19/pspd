package com.example.demo.api.controller;

import com.example.demo.api.dto.UsuarioDTO;
import com.example.demo.api.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioService usuarioService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void devePermitirPostLogin() throws Exception {
        UsuarioDTO dto = UsuarioDTO.builder()
                .codigoUsuario(1)
                .email("user@test")
                .senha("123")
                .build();

        Mockito.when(usuarioService.autenticar(Mockito.any()))
                .thenReturn(dto);

        String payload = objectMapper.writeValueAsString(java.util.Map.of("email", "user@test", "senha", "123"));

        mockMvc.perform(post("/api/usuario/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void preflightLoginRetornaOk() throws Exception {
        mockMvc.perform(options("/api/usuario/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("POST")));
    }
}

