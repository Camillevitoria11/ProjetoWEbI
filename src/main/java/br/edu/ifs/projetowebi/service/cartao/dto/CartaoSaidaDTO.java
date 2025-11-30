package br.edu.ifs.projetowebi.service.cartao.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartaoSaidaDTO {
    private Long idCartao;
    private String nomeCartao;
    private BigDecimal multiplicadorPontos;
}