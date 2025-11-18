package br.edu.ifs.projetowebi.model;


import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "usuarios")
public class UsuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // Tornando o nome obrigatório
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)//para a entidade  que não podem, sob nenhuma circunstância, ter um valor nulo.
    private String senhaHash; // Mudando o nome para indicar que é um hash!

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartaoModel> cartoes;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompraModel> compras;
}

