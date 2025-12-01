package br.edu.ifs.projetowebi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "compras")
public class CompraModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private Integer pontosCalculados = 0;

    @Column(nullable = false)
    private LocalDateTime dataCompra;

    private LocalDateTime dataCredito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCreditModel statusCredito = StatusCreditModel.PENDENTE;

    private String comprovanteUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cartao_id", nullable = false)
    @JsonIgnore
    private CartaoModel cartao;

    // Método para calcular data de crédito baseado no programa
    public void calcularDataCredito() {
        if (this.cartao != null &&
                this.cartao.getProgramaPontos() != null &&
                this.cartao.getProgramaPontos().getProgramaCatalogo() != null) {

            Integer prazoDias = this.cartao.getProgramaPontos().getProgramaCatalogo().getPrazoCreditoDias();
            if (prazoDias != null) {
                this.dataCredito = this.dataCompra.plusDays(prazoDias);
            }
        }
    }

    // Método para calcular pontos automaticamente
    public void calcularPontos() {
        if (this.cartao != null && this.cartao.getMultiplicadorPontos() != null && this.valor != null) {
            BigDecimal multiplicador = this.cartao.getMultiplicadorPontos();
            BigDecimal pontos = this.valor.multiply(multiplicador);
            this.pontosCalculados = pontos.intValue();
        }
    }

    // Método executado antes de salvar
    @PrePersist
    protected void prePersist() {
        if (this.dataCompra == null) {
            this.dataCompra = LocalDateTime.now();
        }
        this.calcularPontos();
        this.calcularDataCredito();
    }

    // Método para creditar pontos
    public boolean creditarPontos() {
        if (this.statusCredito == StatusCreditModel.PENDENTE &&
                this.cartao != null &&
                this.cartao.getProgramaPontos() != null) {

            ProgramaDoUsuarioModel programa = this.cartao.getProgramaPontos();
            Integer saldoAtual = programa.getSaldoPontos() != null ? programa.getSaldoPontos() : 0;
            programa.setSaldoPontos(saldoAtual + this.pontosCalculados);
            this.statusCredito = StatusCreditModel.CREDITADO;
            this.dataCredito = LocalDateTime.now();
            return true;
        }
        return false;
    }
}