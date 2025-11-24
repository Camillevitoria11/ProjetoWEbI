package br.edu.ifs.projetowebi.service.usuario.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@AllArgsConstructor
@Getter
@Setter
public class UsuarioSaidaDTO {
    private String nome;
    private String email;
    private String senha; // senha normal enviada no JSON

}

