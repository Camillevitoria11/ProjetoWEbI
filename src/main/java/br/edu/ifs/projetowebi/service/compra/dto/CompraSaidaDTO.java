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
    public CompraSaidaDTO(Long id, BigDecimal valor, Integer pontosCalculados,
                          LocalDateTime dataCompra, LocalDateTime dataCredito,
                          String statusCredito, String descricao, String comprovanteUrl) {
        this.id = id;
        this.valor = valor;
        this.pontosCalculados = pontosCalculados;
        this.dataCompra = dataCompra;
        this.dataCredito = dataCredito;
        this.statusCredito = statusCredito;
        this.descricao = descricao;
        this.comprovanteUrl = comprovanteUrl;
    }

    // Metodo para converter da entidade com todos os dados
    public static CompraSaidaDTO fromEntity(CompraModel compra) {
        CompraSaidaDTO dto = new CompraSaidaDTO(
                compra.getId(),
                compra.getValor(),
                compra.getPontosCalculados(),
                compra.getDataCompra(),
                compra.getDataCredito(),
                compra.getStatusCredito().name(),
                compra.getDescricao(),
                compra.getComprovanteUrl()
        );

        if (compra.getCartao() != null) {
            dto.setNomeCartao(compra.getCartao().getNomeCartao());
            if (compra.getCartao().getUsuario() != null) {
                dto.setNomeUsuario(compra.getCartao().getUsuario().getNome());
            }
        }

        return dto;
    }
}