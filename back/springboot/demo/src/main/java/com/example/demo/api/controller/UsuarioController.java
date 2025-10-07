package com.example.demo.api.controller;

import com.example.demo.api.dto.LoginRequestDTO;
import com.example.demo.api.dto.PontuacaoRequestDTO;
import com.example.demo.api.dto.UsuarioDTO;
import com.example.demo.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true", maxAge = 3600)
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<UsuarioDTO>> listarRanking() {
        return ResponseEntity.ok(usuarioService.listarRanking());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> criar(@RequestBody UsuarioDTO usuarioDTO) {
        UsuarioDTO criado = usuarioService.criar(usuarioDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(usuarioService.autenticar(loginRequest));
    }

    @RequestMapping(value = "/login", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> loginOptions() {
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> atualizar(@PathVariable Integer id,
                                                @RequestBody UsuarioDTO usuarioDTO) {
        return ResponseEntity.ok(usuarioService.atualizar(id, usuarioDTO));
    }


    @PatchMapping("/{id}/pontuacao")
    public ResponseEntity<UsuarioDTO> incrementarPontuacao(@PathVariable Integer id,
                                                           @RequestBody(required = false) PontuacaoRequestDTO request) {
        int incremento = request != null && request.getIncremento() != null ? request.getIncremento() : 1;
        return ResponseEntity.ok(usuarioService.incrementarPontuacao(id, incremento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

