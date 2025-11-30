package br.edu.ifs.projetowebi.service.programadepontos.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class ProgramaDePontosForm {

    @NotBlank(message = "Não deve enviar o nome vazio")
    @Length(min = 5, max = 100, message = "É obrigatorio informar o nome")
    private String nome;

    @NotNull(message = "É necessario informar os pontos")
    private Integer saldoPontos;

    @NotNull(message = "É necessário informar o usuário")
    private Long usuarioId;

    @NotNull(message = "É necessário informar o programa catálogo")
    private Long programaCatalogoId;
}