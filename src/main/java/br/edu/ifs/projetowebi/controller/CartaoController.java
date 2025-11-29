package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.service.cartao.CartaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cartoes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartaoController {

    private final CartaoService cartaoService;

    @PostMapping
    public ResponseEntity<CartaoModel> salvar(@RequestBody CartaoModel cartao) {
        return ResponseEntity.ok(cartaoService.salvar(cartao));
    }

    // Listar todos os cartões
    @GetMapping
    public ResponseEntity<List<CartaoModel>> listarTodos() {
        return ResponseEntity.ok(cartaoService.listarTodos());
    }

    // Listar cartões por usuário
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CartaoModel>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(cartaoService.listarPorUsuario(usuarioId));
    }

    // Buscar cartão por ID
    @GetMapping("/{id}")
    public ResponseEntity<CartaoModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cartaoService.buscarPorId(id));
    }

    // Atualizar cartão
    @PutMapping("/{id}")
    public ResponseEntity<CartaoModel> atualizar(@PathVariable Long id, @RequestBody CartaoModel cartao) {
        return ResponseEntity.ok(cartaoService.atualizar(id, cartao));
    }

    // Deletar cartão
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        cartaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}