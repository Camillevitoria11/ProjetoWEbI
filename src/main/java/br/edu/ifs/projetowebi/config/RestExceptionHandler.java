package br.edu.ifs.projetowebi.config;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;

@ControllerAdvice

public class RestExceptionHandler {
    @ExceptionHandler({ MethodArgumentNotValidException.class })
    public ResponseEntity<ValidateExceptionResponse> handleArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request,
            Locale locale) {

       // logger.error(ex.getMessage(), ex);

        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        var fieldList = processarErros(fieldErrors);

        var httpStatus = HttpStatus.BAD_REQUEST;

        var message = ValidateExceptionResponse.builder()
                .status(httpStatus.value())
                .error(ex.getClass().getSimpleName())
                .message("Um ou mais campos inválidos")
                .path(request.getRequestURI())
                .locale(locale)
                .timestamp(OffsetDateTime.now())
                .fields(fieldList)
                .build();

        return ResponseEntity.status(httpStatus).body(message);
    }
    private List<ValidateExceptionResponse.Field> processarErros(List<FieldError> fieldErrors) {
        return fieldErrors.stream()
                .map(fieldError -> ValidateExceptionResponse.Field.builder()
                        .fieldName(fieldError.getField())
                        .fieldErrorMessage(fieldError.getDefaultMessage())
                        .build()
                ).toList();
    }

    @ExceptionHandler({ NaoEncontradoException.class })
    private ResponseEntity<RestErrorMessage> lidarComRecursosNaoEncontrado(NaoEncontradoException exception, HttpServletRequest request, Locale locale) {
        RestErrorMessage restErrorMessage= gerarRestErrorMessageDinamico(HttpStatus.NOT_FOUND,exception,request,locale);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(restErrorMessage);
    }

    private RestErrorMessage gerarRestErrorMessageDinamico(HttpStatus httpStatus, Throwable ex, HttpServletRequest request, Locale locale) {
        return RestErrorMessage.builder()
                .status(httpStatus.value())
                .error(ex.getClass().getSimpleName())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .locale(locale)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
