package br.edu.ifs.projetowebi.service.usuario.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    private String email;
    private String senha;
}