package br.edu.ifs.projetowebi.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cartoes")
public class CartaoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String nomeCartao;
    private Double multiplicadorPontos;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UsuarioModel usuario;

    @ManyToOne
    @JoinColumn(name = "programa_pontos_id")
    private ProgramaDePontosModel programaPontos;

    public Double getMultiplicadorPontos() {
        return multiplicadorPontos;
    }

    public void setMultiplicadorPontos(Double multiplicadorPontos) {
        this.multiplicadorPontos = multiplicadorPontos;
    }
}



