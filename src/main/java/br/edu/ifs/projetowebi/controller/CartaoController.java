package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CatalogoCartaoModel;
import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import br.edu.ifs.projetowebi.model.ProgramaDoUsuarioModel;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import br.edu.ifs.projetowebi.repository.ProgramaDoUsuarioRepository;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import br.edu.ifs.projetowebi.service.cartao.CartaoService;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private UsuarioModel getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Usuário não autenticado");
        }

        String username = authentication.getName();
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + username));
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody CartaoSaidaDTO dto) {
        try {
            UsuarioModel usuario = getUsuarioAutenticado();

            CartaoModel cartao = new CartaoModel();
            cartao.setNomeCartao(dto.nomeCartao());
            cartao.setMultiplicadorPontos(dto.multiplicadorPontos());
            cartao.setBandeira(dto.bandeira());
            cartao.setUsuario(usuario);

            // Associa ProgramaDoUsuario se tiver programaId
            if (dto.programaId() != null) {
                ProgramaCatalogoModel programaCatalogo = programaCatalogoRepository.findById(dto.programaId())
                        .orElseThrow(() -> new RuntimeException("Programa não encontrado"));

                // Busca ou cria ProgramaDoUsuario
                ProgramaDoUsuarioModel programaDoUsuario = programaDoUsuarioRepository
                        .findByUsuarioIdAndProgramaCatalogoId(usuario.getId(), programaCatalogo.getId())
                        .orElseGet(() -> {
                            ProgramaDoUsuarioModel novo = new ProgramaDoUsuarioModel();
                            novo.setNome(programaCatalogo.getNome());
                            novo.setUsuario(usuario);
                            novo.setProgramaCatalogo(programaCatalogo);
                            novo.setSaldoPontos(0);
                            return programaDoUsuarioRepository.save(novo);
                        });

                cartao.setProgramaDoUsuario(programaDoUsuario);
            }

            CartaoModel cartaoSalvo = repository.save(cartao);
            return ResponseEntity.ok(cartaoSalvo);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro de autenticação: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarMeusCartoes() {
        try {
            UsuarioModel usuario = getUsuarioAutenticado();
            List<CartaoModel> cartoes = repository.findByUsuarioId(usuario.getId());
            return ResponseEntity.ok(cartoes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro de autenticação: " + e.getMessage());
        }
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
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody CartaoModel cartao) {
        try {
            UsuarioModel usuario = getUsuarioAutenticado();

            // Verifica se o cartão pertence ao usuário
            CartaoModel cartaoExistente = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));

            if (!cartaoExistente.getUsuario().getId().equals(usuario.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Você não tem permissão para atualizar este cartão");
            }

            return ResponseEntity.ok(cartaoService.atualizar(id, cartao));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro de autenticação: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            UsuarioModel usuario = getUsuarioAutenticado();

            // Verifica se o cartão pertence ao usuário
            CartaoModel cartao = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));

            if (!cartao.getUsuario().getId().equals(usuario.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Você não tem permissão para excluir este cartão");
            }

            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro de autenticação: " + e.getMessage());
        }
    }

    @GetMapping("/dto")
    public ResponseEntity<?> listarTodosDTO() {
        try {
            UsuarioModel usuario = getUsuarioAutenticado();
            return ResponseEntity.ok(cartaoService.listarTodosDTOPorUsuario(usuario.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Erro de autenticação: " + e.getMessage());
        }
    }
}