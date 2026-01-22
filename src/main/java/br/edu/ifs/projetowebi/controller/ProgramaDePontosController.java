package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.service.programadepontos.dto.ProgramaDePontosSaidaDTO;
import br.edu.ifs.projetowebi.service.programadepontos.ProgramaDoUsuarioService;
import br.edu.ifs.projetowebi.service.programadepontos.form.ProgramaDePontosForm;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/programas_usuario")
@RequiredArgsConstructor
public class ProgramaDePontosController {

    private final ProgramaDoUsuarioService service;

    // CORREÇÃO: Recebe o usuario autenticado e passa o ID para o service
    @PostMapping
    public ResponseEntity<ProgramaDePontosSaidaDTO> criar(
            @Valid @RequestBody ProgramaDePontosForm form,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.salvar(form, usuarioLogado.getId()));
    }

    // CORREÇÃO: Lista apenas os programas que pertencem ao usuário logado
    @GetMapping
    public ResponseEntity<List<ProgramaDePontosSaidaDTO>> listar(
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioLogado.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramaDePontosSaidaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarID(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramaDePontosSaidaDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProgramaDePontosSaidaDTO dto) {
        return ResponseEntity.ok(service.atualizarSaldo(id, dto.getSaldoPontos()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/saldo")
    public ResponseEntity<ProgramaDePontosSaidaDTO> atualizarSaldo(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {

        Integer pontos = request.get("pontos");
        if (pontos == null) {
            throw new IllegalArgumentException("O campo 'pontos' é obrigatório");
        }
        return ResponseEntity.ok(service.atualizarSaldo(id, pontos));
    }
}