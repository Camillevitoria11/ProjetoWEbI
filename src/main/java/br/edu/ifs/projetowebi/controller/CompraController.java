package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.service.compra.CompraService;
import br.edu.ifs.projetowebi.service.compra.dto.CompraEntradaDTO;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // Importante para o upload [cite: 43]

import java.util.List;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping(value = "/registrar", consumes = {"multipart/form-data"})
    public ResponseEntity<CompraSaidaDTO> registrarCompra(
            @RequestPart("dados") CompraEntradaDTO dto,
            @RequestPart("comprovante") MultipartFile arquivo,
            @AuthenticationPrincipal UsuarioModel usuarioLogado) { // Adicione o usuário aqui

        // Passe o usuarioLogado para o Service vincular a compra ao ID correto
        CompraModel compraSalva = compraService.processarNovaCompra(dto, arquivo, usuarioLogado);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CompraSaidaDTO.fromEntity(compraSalva));
    }

    @GetMapping("/usuario")
    public ResponseEntity<List<CompraSaidaDTO>> listarTodasCompras(@AuthenticationPrincipal UsuarioModel usuarioLogado) {
        if (usuarioLogado == null) {
            // Se cair aqui, o Token foi aceito, mas o Spring não achou o usuário no contexto
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


//    @GetMapping("/usuario")
//    public ResponseEntity<List<CompraSaidaDTO>> listarComprasDoUsuarioLogado(@AuthenticationPrincipal UsuarioModel usuarioLogado) {
//        // O service retorna List<CompraSaidaDTO>
//        List<CompraSaidaDTO> compras = compraService.listarPorUsuario(usuarioLogado.getId());
//
//        // Agora o retorno do ResponseEntity bate com a assinatura do metodo
//        return ResponseEntity.ok(compras);
//    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<CompraModel>> listarComprasPorStatus(@PathVariable String status) {
        StatusCreditModel statusEnum = StatusCreditModel.valueOf(status.toUpperCase());
        return ResponseEntity.ok(compraService.listarPorStatus(statusEnum));
    }

    @PostMapping("/{id}/creditar-manualmente")
    public ResponseEntity<CompraModel> creditarPontosManualmente(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.creditarPontosManualmente(id));
    }

    @GetMapping("/total-pontos")
    public ResponseEntity<Integer> calcularTotalPontosUsuario(@AuthenticationPrincipal UsuarioModel usuarioLogado) {
        // Agora o cálculo é feito apenas para o dono da conta logada
        Integer totalPontos = compraService.calcularTotalPontosPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(totalPontos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCompra(@PathVariable Long id) {
        compraService.deletarPorId(id);
        return ResponseEntity.noContent().build();
    }
}