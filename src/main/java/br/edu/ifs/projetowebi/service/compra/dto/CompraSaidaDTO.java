package br.edu.ifs.projetowebi.service.compra.dto;

import br.edu.ifs.projetowebi.model.CompraModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompraSaidaDTO {
    private Long id;
    private BigDecimal valor;
    private Integer pontosCalculados;
    private LocalDateTime dataCompra;
    private LocalDateTime dataCredito;
    private String statusCredito;
    private String descricao;
    private String comprovanteUrl;
    private String nomeCartao;
    private String nomeUsuario;

    // Construtor para os métodos existentes no service
    public static CompraSaidaDTO fromEntity(CompraModel compra) {
        CompraSaidaDTO dto = new CompraSaidaDTO();
        dto.setId(compra.getId());
        dto.setValor(compra.getValor());
        dto.setPontosCalculados(compra.getPontosCalculados());
        dto.setDataCompra(compra.getDataCompra());
        dto.setDataCredito(compra.getDataCredito());
        dto.setStatusCredito(compra.getStatusCredito().name());
        dto.setDescricao(compra.getDescricao());
        dto.setComprovanteUrl(compra.getComprovanteUrl());

        if (compra.getCartao() != null) {
            // Use o nome exato que está na CartaoModel
            dto.setNomeCartao(compra.getCartao().getNomeCartao());

            // Caminho: Compra -> Cartão -> Programa -> Usuário
            if (compra.getCartao().getProgramaDoUsuario() != null &&
                    compra.getCartao().getProgramaDoUsuario().getUsuario() != null) {
                dto.setNomeUsuario(compra.getCartao().getProgramaDoUsuario().getUsuario().getNome());
            }
        }

        return dto;
    }
}