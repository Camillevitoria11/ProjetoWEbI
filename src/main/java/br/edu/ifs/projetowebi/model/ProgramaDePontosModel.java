package br.edu.ifs.projetowebi.model;



import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.bind.annotation.BindParam;

import java.util.List;

@Data
@Entity
@Table(name = "programas_pontos")
public class ProgramaDePontosModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Smiles | Azul | Latam Pass
    private Integer saldoPontos = 0;


    @ManyToOne
    @JoinColumn(name = "usuario_id") // Esta coluna deve existir na tabela programas_pontos
    @JsonIgnoreProperties({"programasDePontos", "cartoes", "senhaHash"}) // ✅ Ignora campos problemáticos
    private UsuarioModel usuario;
}



