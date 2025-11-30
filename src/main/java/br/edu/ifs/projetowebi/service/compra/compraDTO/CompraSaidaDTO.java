package br.edu.ifs.projetowebi.service.compra.compraDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor

public class CompraSaidaDTO {
    private Long id;
    private BigDecimal valorCompra;
    private LocalDate dataCompra;
    private String comprovanteUrl;
}
