package com.example.demo.api.controller;

import com.example.demo.api.dto.UsuarioDTO;
import com.example.demo.api.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    void deveIncrementarPontuacao() throws Exception {
        UsuarioDTO dto = UsuarioDTO.builder()
                .codigoUsuario(1)
                .email("user@test")
                .senha("123")
                .pontuacao(5)
                .build();

        Mockito.when(usuarioService.incrementarPontuacao(Mockito.eq(1), Mockito.eq(1)))
                .thenReturn(dto);

        mockMvc.perform(patch("/api/usuario/1/pontuacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"incremento\":1}"))
                .andExpect(status().isOk());
    }

    @Test
    void deveListarRanking() throws Exception {
        UsuarioDTO primeiro = UsuarioDTO.builder()
                .codigoUsuario(1)
                .email("user@test")
                .pontuacao(12)
                .build();

        UsuarioDTO segundo = UsuarioDTO.builder()
                .codigoUsuario(2)
                .email("outro@test")
                .pontuacao(7)
                .build();

        Mockito.when(usuarioService.listarRanking())
                .thenReturn(List.of(primeiro, segundo));

        mockMvc.perform(get("/api/usuario/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pontuacao").value(12))
                .andExpect(jsonPath("$[1].pontuacao").value(7));
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

