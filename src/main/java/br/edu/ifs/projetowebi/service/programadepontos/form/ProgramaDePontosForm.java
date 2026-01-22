package br.edu.ifs.projetowebi.service.programadepontos.form;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProgramaDePontosForm {
    // Sem @NotNull aqui, pois pegamos do Token
    private Long usuarioId;

    @NotNull(message = "É necessário informar o programa catálogo")
    private Long programaCatalogoId;

    private Integer saldoPontos;

    private String nome;
}