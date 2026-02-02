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

@RestController
@RequestMapping("/programas")
@RequiredArgsConstructor
public class ProgramaDePontosController {

    private final ProgramaDoUsuarioService service;
    private final br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository catalogoRepository;

    // ==================== ENDPOINTS PARA O FRONTEND ====================

    // 1. GET /programas/usuario - Lista programas do usuário logado
    @GetMapping("/usuario")
    public ResponseEntity<List<ProgramaDePontosSaidaDTO>> listarProgramasUsuario(
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {
        List<ProgramaDePontosSaidaDTO> programas = service.listarPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(programas);
    }

    // 2. GET /programas/catalogo - Lista todos os programas disponíveis
    @GetMapping("/catalogo")
    public ResponseEntity<List<CatalogoResponseDTO>> listarCatalogo() {
        List<br.edu.ifs.projetowebi.model.ProgramaCatalogoModel> catalogos = catalogoRepository.findAll();

        List<CatalogoResponseDTO> response = catalogos.stream()
                .map(catalogo -> new CatalogoResponseDTO(
                        catalogo.getId(),
                        catalogo.getNome(),
                        catalogo.getDescricao(),
                        catalogo.getMultiplicadorBase()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // 3. POST /programas/associar - Associa um programa do catálogo ao usuário
    @PostMapping("/associar")
    public ResponseEntity<ProgramaDePontosSaidaDTO> associarPrograma(
            @Valid @RequestBody AssociarProgramaRequest request,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        // Cria o form usando o ID do catálogo
        ProgramaDePontosForm form = new ProgramaDePontosForm();
        form.setProgramaCatalogoId(request.getProgramaCatalogoId());

        // Salva o programa para o usuário
        ProgramaDePontosSaidaDTO programaSalvo = service.salvar(form, usuarioLogado.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(programaSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPrograma(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        // Verifica se o programa pertence ao usuário
        service.verificarPropriedade(id, usuarioLogado.getId());

        // Se passar da verificação, deleta
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ENDPOINTS ORIGINAIS (MANTIDOS) ====================

    @PostMapping("/criar")
    public ResponseEntity<ProgramaDePontosSaidaDTO> criar(
            @Valid @RequestBody ProgramaDePontosForm form,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        ProgramaDePontosSaidaDTO programaSalvo = service.salvar(form, usuarioLogado.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(programaSalvo);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<ProgramaDePontosSaidaDTO>> listar(
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {
        List<ProgramaDePontosSaidaDTO> programas = service.listarPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(programas);
    }

    @GetMapping("/listar/{id}")
    public ResponseEntity<ProgramaDePontosSaidaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarID(id));
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<ProgramaDePontosSaidaDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProgramaDePontosSaidaDTO dto) {
        return ResponseEntity.ok(service.atualizarSaldo(id, dto.getSaldoPontos()));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/saldo")
    public ResponseEntity<ProgramaDePontosSaidaDTO> atualizarSaldo(
            @PathVariable Long id,
            @RequestBody AtualizarSaldoRequest request) {

        if (request.getPontos() == null) {
            throw new IllegalArgumentException("O campo 'pontos' é obrigatório");
        }
        return ResponseEntity.ok(service.atualizarSaldo(id, request.getPontos()));
    }
}

// ==================== DTOs AUXILIARES ====================

// DTO para associação de programa
class AssociarProgramaRequest {
    private Long programaCatalogoId;

    // Getters e Setters
    public Long getProgramaCatalogoId() {
        return programaCatalogoId;
    }

    public void setProgramaCatalogoId(Long programaCatalogoId) {
        this.programaCatalogoId = programaCatalogoId;
    }
}

// DTO para resposta do catálogo
class CatalogoResponseDTO {
    private Long programaId;
    private String nome;
    private String descricao;
    private Double multiplicadorBase;

    public CatalogoResponseDTO(Long programaId, String nome, String descricao, Double multiplicadorBase) {
        this.programaId = programaId;
        this.nome = nome;
        this.descricao = descricao;
        this.multiplicadorBase = multiplicadorBase;
    }

    // Getters
    public Long getProgramaId() {
        return programaId;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public Double getMultiplicadorBase() {
        return multiplicadorBase;
    }
}

// DTO para atualização de saldo
class AtualizarSaldoRequest {
    private Integer pontos;

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }
}