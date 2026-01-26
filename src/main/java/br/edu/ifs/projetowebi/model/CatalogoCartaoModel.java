package br.edu.ifs.projetowebi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "catalogo_cartoes")
public class CatalogoCartaoModel {
    @Id
    private String bin; // Os 6 primeiros dígitos (ex: 411111)
    private String nomeExibicao; // "Itaú Personnalité Black"
    private String banco; // "Itaú"
    private BigDecimal multiplicadorPadrao;
    @Enumerated(EnumType.STRING)
    private BandeiraCartaoModel bandeira;
}
