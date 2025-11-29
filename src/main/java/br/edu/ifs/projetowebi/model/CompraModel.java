package br.edu.ifs.projetowebi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@Entity
@Table(name = "compras")
public class CompraModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal valorCompra;

    private Integer pontosCalculados;

    private LocalDate dataCompra;

    private LocalDate prazoCredito;

    @Enumerated(EnumType.STRING)
    private StatusCreditModel statusCredito; // pendente | creditado

    private String comprovanteUrl;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UsuarioModel usuario;

    @ManyToOne
    @JoinColumn(name = "cartao_id")
    private CartaoModel cartao;
}




