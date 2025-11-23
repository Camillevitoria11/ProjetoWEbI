package br.edu.ifs.projetowebi.service.cartao.form;

import br.edu.ifs.projetowebi.model.BandeiraCartaoModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;

@Getter
@Setter
public class CartaoForm {

    @NotBlank(message = "O nome do cartão é obrigatório")
    @Length(min = 2, max = 100, message = "O nome do cartão deve ter entre 2 e 100 caracteres")
    private String nomeCartao;

     @NotNull(message = "A bandeira do cartão é obrigatória")
     private BandeiraCartaoModel bandeira;

    @NotNull(message = "O ID do programa de pontos é obrigatório")
    private Long programaId;

    @NotNull(message = "O ID do usuário é obrigatório")
    private Long usuarioId;

    @NotNull(message = "O multiplicador de pontos é obrigatório")
    @Positive(message = "O multiplicador de pontos deve ser maior que zero")
    private BigDecimal multiplicadorPontos;
}