package br.edu.ifs.projetowebi.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "cartoes")
public class CartaoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeCartao;

    @Enumerated(EnumType.STRING)
    private BandeiraCartaoModel bandeira; // Visa | Master | Elo...

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "programa_id")
    private ProgramaDoUsuarioModel programaPontos;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private UsuarioModel usuario;

    private BigDecimal multiplicadorPontos; // Ex.: 2.0 (2 pontos por real)

    @OneToMany(mappedBy = "cartao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // EVITA LOOP INFINITO
    private List<CompraModel> compras;
}



