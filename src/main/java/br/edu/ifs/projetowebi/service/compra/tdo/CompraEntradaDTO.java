package br.edu.ifs.projetowebi.service.compra.tdo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompraEntradaDTO {
    private String descricao;
    private BigDecimal valor;
    private Long cartaoId;  // Apenas o ID do cartão
}
