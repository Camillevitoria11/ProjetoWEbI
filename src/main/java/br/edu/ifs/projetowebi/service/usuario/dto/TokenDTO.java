package br.edu.ifs.projetowebi.service.usuario.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TokenDTO {
    private String token;
    private String tipo = "Bearer";
}