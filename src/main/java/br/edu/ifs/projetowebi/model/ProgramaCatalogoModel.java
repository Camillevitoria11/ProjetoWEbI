package br.edu.ifs.projetowebi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "programas_catalogo")
public class ProgramaCatalogoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome; // "Smiles", "Azul", "Latam Pass"

    private String descricao; // "Programa de pontos da Gol"

    @Column(name = "multiplicador_base")
    private Double multiplicadorBase = 1.0;

    @Column(name = "prazo_credito_dias")
    private Integer prazoCreditoDias = 30;
}