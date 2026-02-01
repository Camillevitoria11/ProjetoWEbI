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

        // Vincula o Usuário (Fixo em 1L conforme seu padrão)
        usuarioRepository.findById(1L).ifPresent(cartao::setUsuario);

        // Lógica Dinâmica:
        // 1. Se o DTO trouxer um ID de programa, usamos ele (Recomendado)
        // 2. Senão, tenta encontrar pelo nome do banco/cartão
        if (dto.programaId() != null) {
            programaDoUsuarioRepository.findById(dto.programaId()).ifPresent(cartao::setProgramaDoUsuario);
        } else {
            String termoBusca = dto.nomeCartao().split(" ")[0].toLowerCase();
            programaDoUsuarioRepository.findAll().stream()
                    .filter(p -> p.getNome().toLowerCase().contains(termoBusca))
                    .findFirst()
                    .ifPresent(cartao::setProgramaDoUsuario);
        }

        return ResponseEntity.ok(repository.save(cartao));
    }

    @GetMapping("/detalhes/{id}")
    public ResponseEntity<CartaoSaidaDTO> buscarDetalhes(@PathVariable Long id) {
        return ResponseEntity.ok(cartaoService.buscarDetalhesPorId(id));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CartaoModel>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(cartaoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartaoModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cartaoService.buscarPorId(id));
    }

    @GetMapping("/identificar/{numero}")
    public ResponseEntity<CatalogoCartaoModel> identificar(@PathVariable String numero) {
        CatalogoCartaoModel catalogo = cartaoService.identificarPeloNumero(numero);
        return ResponseEntity.ok(catalogo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartaoModel> atualizar(@PathVariable Long id, @RequestBody CartaoModel cartao) {
        return ResponseEntity.ok(cartaoService.atualizar(id, cartao));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dto")
    public ResponseEntity<List<CartaoSaidaDTO>> listarTodosDTO() {
        return ResponseEntity.ok(cartaoService.listarTodosDTO());
    }
}