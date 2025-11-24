package br.edu.ifs.projetowebi.service.usuario.dto;


import lombok.Data;

@Data
public class UsuarioSaidaDTO {
    private String nome;
    private String email;
    private String senha; // senha normal enviada no JSON
}

