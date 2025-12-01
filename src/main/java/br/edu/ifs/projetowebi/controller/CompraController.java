package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.service.compra.CompraService;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping("/registrar")
    public ResponseEntity<CompraModel> registrarCompra(@RequestBody CompraModel compra) {
        CompraModel novaCompra = compraService.registrarCompra(compra);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaCompra);
    }

    @GetMapping
    public ResponseEntity<List<CompraModel>> listarTodasCompras() {
        return ResponseEntity.ok(compraService.listarTodas());
    }

    @GetMapping("/dto")
    public ResponseEntity<List<CompraSaidaDTO>> listarTodasComprasDTO() {
        return ResponseEntity.ok(compraService.listarTodasDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraModel> buscarCompraPorId(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    @GetMapping("/cartao/{cartaoId}")
    public ResponseEntity<List<CompraModel>> listarComprasPorCartao(@PathVariable Long cartaoId) {
        return ResponseEntity.ok(compraService.listarPorCartao(cartaoId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CompraModel>> listarComprasPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(compraService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompraModel>> listarComprasPorStatus(@PathVariable String status) {
        StatusCreditModel statusEnum = StatusCreditModel.valueOf(status.toUpperCase());
        return ResponseEntity.ok(compraService.listarPorStatus(statusEnum));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompraSaidaDTO> atualizarCompra(
            @PathVariable Long id,
            @RequestBody CompraModel compraAtualizada) {
        return ResponseEntity.ok(compraService.atualizarCompra(id, compraAtualizada));
    }

    @PostMapping("/{id}/creditar-manualmente")
    public ResponseEntity<CompraModel> creditarPontosManualmente(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.creditarPontosManualmente(id));
    }

    @GetMapping("/cartao/{cartaoId}/total")
    public ResponseEntity<BigDecimal> calcularTotalComprasCartao(@PathVariable Long cartaoId) {
        BigDecimal total = compraService.calcularTotalComprasPorCartao(cartaoId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/usuario/{usuarioId}/total-pontos")
    public ResponseEntity<Integer> calcularTotalPontosUsuario(@PathVariable Long usuarioId) {
        Integer totalPontos = compraService.calcularTotalPontosPorUsuario(usuarioId);
        return ResponseEntity.ok(totalPontos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCompra(@PathVariable Long id) {
        compraService.deletarPorId(id);
        return ResponseEntity.noContent().build();
    }
}