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

    private String descricao;
    private BigDecimal valor;
    private LocalDate dataCompra;

//    @Enumerated(EnumType.STRING)
//    private StatusCreditModel status;

    @ManyToOne
    @JoinColumn(name = "cartao_id")
    private CartaoModel cartao;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UsuarioModel usuario;
}