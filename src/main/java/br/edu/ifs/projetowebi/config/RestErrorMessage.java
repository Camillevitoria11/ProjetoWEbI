package br.edu.ifs.projetowebi.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.Locale;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public sealed class RestErrorMessage permits ValidateExceptionResponse{
    private Integer status;
    private String error;
    private String message;
    private String path;
    private Locale locale;
    private OffsetDateTime timestamp;

}
