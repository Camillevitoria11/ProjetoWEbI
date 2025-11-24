package br.edu.ifs.projetowebi.service.cartao.dto;

import br.edu.ifs.projetowebi.model.CartaoModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CartaoSaidaDTO {
    private Long id;
    private String nomeCartao;
    private Double multiplicadorPontos;

    // ✅ Construtor que recebe a entidade
    public CartaoSaidaDTO(CartaoModel cartao) {
        this.id = cartao.getId();
        this.nomeCartao = cartao.getNomeCartao();
        this.multiplicadorPontos = cartao.getMultiplicadorPontos();
    }
}