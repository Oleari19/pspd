package com.example.demo.api.service;

import com.example.demo.api.dto.LoginRequestDTO;
import com.example.demo.api.dto.UsuarioDTO;
import com.example.demo.api.model.UsuarioEntity;
import com.example.demo.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::mapearParaDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> listarRanking() {
        return usuarioRepository.findAll()
                .stream()
                .sorted((a, b) -> Integer.compare(
                        b.getPontuacao() != null ? b.getPontuacao() : 0,
                        a.getPontuacao() != null ? a.getPontuacao() : 0))
                .map(entity -> {
                    UsuarioDTO dto = mapearParaDTO(entity);
                    if (dto != null) {
                        dto.setSenha(null);
                    }
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDTO buscarPorId(Integer id) {
        UsuarioEntity entity = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));
        return mapearParaDTO(entity);
    }

    @Transactional
    public UsuarioDTO criar(UsuarioDTO usuarioDTO) {
        if (usuarioDTO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatorios nao enviados");
        }

        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }

        UsuarioEntity entity = new UsuarioEntity();
        aplicarValores(entity, usuarioDTO);
        UsuarioEntity salvo = usuarioRepository.save(entity);
        return mapearParaDTO(salvo);
    }
    @Transactional
    public UsuarioDTO atualizar(Integer id, UsuarioDTO usuarioDTO) {
        UsuarioEntity existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        aplicarValores(existente, usuarioDTO);
        UsuarioEntity atualizado = usuarioRepository.save(existente);
        return mapearParaDTO(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado");
        }

        usuarioRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public UsuarioDTO autenticar(LoginRequestDTO loginRequest) {
        UsuarioEntity usuario = usuarioRepository.findByEmailAndSenha(loginRequest.getEmail(), loginRequest.getSenha())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas"));

        return mapearParaDTO(usuario);
    }


    @Transactional
    public UsuarioDTO incrementarPontuacao(Integer id, int incremento) {
        if (incremento <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incremento deve ser maior que zero");
        }

        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        int atual = usuario.getPontuacao() != null ? usuario.getPontuacao() : 0;
        usuario.setPontuacao(atual + incremento);

        UsuarioEntity atualizado = usuarioRepository.save(usuario);
        return mapearParaDTO(atualizado);
    }

    private UsuarioDTO mapearParaDTO(UsuarioEntity entity) {
        if (entity == null) {
            return null;
        }

        return UsuarioDTO.builder()
                .codigoUsuario(entity.getCodigoUsuario())
                .email(entity.getEmail())
                .senha(entity.getSenha())
                .pontuacao(entity.getPontuacao())
                .build();
    }

    private void aplicarValores(UsuarioEntity entity, UsuarioDTO dto) {
        if (dto == null) {
            return;
        }

        entity.setEmail(dto.getEmail());
        entity.setSenha(dto.getSenha());
        entity.setPontuacao(dto.getPontuacao() != null ? dto.getPontuacao() : 0);
    }
}





