package br.edu.ifs.projetowebi.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "cartoes") // Nome da tabela no banco
public class CartaoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_cartao") // Mapeia para a coluna no banco
    private String nomeCartao;

    @ManyToOne
    @JoinColumn(name = "programa_id") // Nome da coluna de foreign key
    private ProgramaDePontosModel programaPontos;

    @ManyToOne
    @JoinColumn(name = "usuario_id") // Nome da coluna de foreign key
    private UsuarioModel usuario;

    @Column(name = "multiplicador_pontos")
    private BigDecimal multiplicadorPontos;

    @OneToMany(mappedBy = "cartao", cascade = CascadeType.ALL)
    private List<CompraModel> compras;
}