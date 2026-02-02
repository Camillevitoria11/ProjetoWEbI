package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.service.compra.CompraService;
import br.edu.ifs.projetowebi.service.compra.dto.CompraEntradaDTO;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CompraSaidaDTO> criarCompra(
            @RequestBody @Valid CompraEntradaDTO dto,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        log.info("📥 POST /compras (JSON) - Usuário: {}, Descrição: {}, Valor: {}, CartaoId: {}",
                usuarioLogado != null ? usuarioLogado.getEmail() : "null",
                dto.getDescricao(), dto.getValor(), dto.getCartaoId());

        if (usuarioLogado == null) {
            log.error("❌ Usuário não autenticado");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Chama o service passando null para arquivo
            CompraModel compraSalva = compraService.processarNovaCompra(dto, null, usuarioLogado);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CompraSaidaDTO.fromEntity(compraSalva));

        } catch (Exception e) {
            log.error("❌ Erro ao criar compra: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Endpoint com arquivo (multipart/form-data)
    @PostMapping(value = "/registrar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompraSaidaDTO> registrarCompraComArquivo(
            @RequestPart("dados") @Valid CompraEntradaDTO dto,
            @RequestPart(value = "comprovante", required = false) MultipartFile arquivo,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) {

        log.info("📥 POST /compras/registrar (Multipart) - Usuário: {}",
                usuarioLogado != null ? usuarioLogado.getEmail() : "null");

        if (usuarioLogado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            CompraModel compraSalva = compraService.processarNovaCompra(dto, arquivo, usuarioLogado);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CompraSaidaDTO.fromEntity(compraSalva));

        } catch (Exception e) {
            log.error("❌ Erro ao criar compra com arquivo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }


    @GetMapping("/usuario")
    public ResponseEntity<List<CompraSaidaDTO>> listarTodasCompras(@AuthenticationPrincipal UsuarioModel usuarioLogado) {
        if (usuarioLogado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(compraService.listarPorUsuario(usuarioLogado.getId()));
    }

    @GetMapping("/dto")
    public ResponseEntity<List<CompraSaidaDTO>> listarTodasComprasDTO() {
        return ResponseEntity.ok(compraService.listarTodasDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompraModel> buscarCompraPorId(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompraModel>> listarComprasPorStatus(@PathVariable String status) {
        try {
            StatusCreditModel statusEnum = StatusCreditModel.valueOf(status.toUpperCase());
            return ResponseEntity.ok(compraService.listarPorStatus(statusEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/creditar-manualmente")
    public ResponseEntity<CompraModel> creditarPontosManualmente(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.creditarPontosManualmente(id));
    }

    @GetMapping("/total-pontos")
    public ResponseEntity<Integer> calcularTotalPontosUsuario(@AuthenticationPrincipal UsuarioModel usuarioLogado) {
        if (usuarioLogado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Integer totalPontos = compraService.calcularTotalPontosPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(totalPontos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCompra(@PathVariable Long id) {
        compraService.deletarPorId(id);
        return ResponseEntity.noContent().build();
    }
}