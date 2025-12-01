package br.edu.ifs.projetowebi.service.compra.form;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CompraForm {

    @NotBlank(message = "A descrição da compra é obrigatória")
    @Length(min = 2, max = 200, message = "A descrição deve ter entre 2 e 200 caracteres")
    private String descricao;

    @NotNull(message = "O valor da compra é obrigatório")
    @Positive(message = "O valor da compra deve ser maior que zero")
    private BigDecimal valorCompra;

    @NotNull(message = "A data da compra é obrigatória")
    private LocalDate dataCompra;

    @NotNull(message = "O ID do usuário é obrigatório")
    private Long usuarioId;

    @NotNull(message = "O ID do cartão é obrigatório")
    private Long cartaoId;
}
