package br.edu.ifs.projetowebi.service.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroDTO {
    private String nome;
    private String email;
    private String senha;
}