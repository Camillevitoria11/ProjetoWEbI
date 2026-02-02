package br.edu.ifs.projetowebi.service.programadepontos.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgramaDePontosSaidaDTO {

    private Long id;
    private String nome;
    private Integer saldoPontos;
}
