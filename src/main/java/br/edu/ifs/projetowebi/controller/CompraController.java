package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compras")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping
    public ResponseEntity<CompraModel> registrar(@RequestBody CompraModel compra) {
        return ResponseEntity.ok(compraService.registrarCompra(compra));
    }

    // Listar todas as compras
    @GetMapping
    public ResponseEntity<List<CompraModel>> listarTodas() {
        return ResponseEntity.ok(compraService.listarTodas());
    }

    // Buscar compra por ID (URL diferente)
    @GetMapping("/{id}")
    public ResponseEntity<CompraModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    // Listar compras por usuário
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CompraModel>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(compraService.listarPorUsuario(usuarioId));
    }

    // Listar compras por cartão
    @GetMapping("/cartao/{cartaoId}")
    public ResponseEntity<List<CompraModel>> listarPorCartao(@PathVariable Long cartaoId) {
        return ResponseEntity.ok(compraService.listarPorCartao(cartaoId));
    }
}