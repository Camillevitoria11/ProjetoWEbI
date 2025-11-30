package br.edu.ifs.projetowebi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "programas_usuario")
public class ProgramaDoUsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "saldo_pontos")
    private Integer saldoPontos = 0;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"programasDePontos", "cartoes", "senhaHash"})
    private UsuarioModel usuario;

    @ManyToOne
    @JoinColumn(name = "programa_catalogo_id")
    private ProgramaCatalogoModel programaCatalogo;
}