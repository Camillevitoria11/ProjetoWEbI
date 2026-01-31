package br.edu.ifs.projetowebi.service.compra.dto;

import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CompraEntradaDTO {
    private String descricao;
    private BigDecimal valor;
    private Long cartaoId;
    private Long UsuarioId;
    private Long programaUsuarioId; // ID do ProgramaDoUsuárioModel
}
