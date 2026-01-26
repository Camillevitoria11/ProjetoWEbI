package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CatalogoCartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import br.edu.ifs.projetowebi.repository.ProgramaDoUsuarioRepository;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import br.edu.ifs.projetowebi.service.cartao.CartaoService;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cartoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class CartaoController {

    @Autowired
    private CartaoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final CartaoService cartaoService;

    @Autowired
    private ProgramaCatalogoRepository programaCatalogoRepository;

    @Autowired
    private ProgramaDoUsuarioRepository programaDoUsuarioRepository;

    @PostMapping
    public ResponseEntity<CartaoModel> salvar(@RequestBody CartaoSaidaDTO dto) {
        CartaoModel cartao = new CartaoModel();
        cartao.setNomeCartao(dto.nomeCartao());
        cartao.setMultiplicadorPontos(dto.multiplicadorPontos());
        cartao.setBandeira(dto.bandeira());

        // 1. Vincula o Usuário (Garante usuario_id no banco)
        usuarioRepository.findById(1L).ifPresent(cartao::setUsuario);

        // 2. Vincula o Programa DO USUÁRIO (Garante programa_id no banco)
        if (dto.nomeCartao().toLowerCase().contains("nubank")) {
            // Buscamos o programa 'Meu Nubank' que já existe para o usuário 1
            programaDoUsuarioRepository.findById(2L).ifPresent(cartao::setProgramaDoUsuario);
        } else if (dto.nomeCartao().toLowerCase().contains("itau")) {
            programaDoUsuarioRepository.findById(1L).ifPresent(cartao::setProgramaDoUsuario);
        }

        return ResponseEntity.ok(repository.save(cartao));
    }

    // Listar todos os cartões
    @GetMapping
    public ResponseEntity<List<CartaoSaidaDTO>> listarTodos() {
        return ResponseEntity.ok(cartaoService.listarTodosDTO());
    }

    @GetMapping("/detalhes/{id}")
    public ResponseEntity<CartaoSaidaDTO> buscarDetalhes(@PathVariable Long id) {
        return ResponseEntity.ok(cartaoService.buscarDetalhesPorId(id));
    }

    // Listar cartões por usuário
    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<CartaoModel>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(cartaoService.listarPorUsuario(usuarioId));
    }

    // Buscar cartão por ID
    @GetMapping("/{id}")
    public ResponseEntity<CartaoModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cartaoService.buscarPorId(id));
    }

    @GetMapping("/identificar/{numero}")
    public ResponseEntity<CatalogoCartaoModel> identificar(@PathVariable String numero) {
        // O Service vai buscar pelo BIN (substring 0,6)
        CatalogoCartaoModel catalogo = cartaoService.identificarPeloNumero(numero);
        return ResponseEntity.ok(catalogo);
    }

    // Atualizar cartão
    @PutMapping("/{id}")
    public ResponseEntity<CartaoModel> atualizar(@PathVariable Long id, @RequestBody CartaoModel cartao) {
        return ResponseEntity.ok(cartaoService.atualizar(id, cartao));
    }

    // Deletar cartão
    @DeleteMapping("/{id}")
    @Transactional // Importante para garantir a deleção no banco
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ OPÇÃO ALTERNATIVA: Se quiser usar DTOs em alguns endpoints
    @GetMapping("/dto")
    public ResponseEntity<List<CartaoSaidaDTO>> listarTodosDTO() {
        return ResponseEntity.ok(cartaoService.listarTodosDTO());
    }
}