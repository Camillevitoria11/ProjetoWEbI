package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.service.programadepontos.dto.ProgramaDePontosSaidaDTO;
import br.edu.ifs.projetowebi.service.programadepontos.ProgramaDePontosService;
import br.edu.ifs.projetowebi.service.programadepontos.form.ProgramaDePontosForm;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/programas-pontos")
@RequiredArgsConstructor
public class ProgramaDePontosController {

    private final ProgramaDePontosService service;


    @PostMapping
    public ResponseEntity<ProgramaDePontosSaidaDTO> criar(@Valid @RequestBody ProgramaDePontosForm form) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(form));
    }

     @GetMapping
     public ResponseEntity<List<ProgramaDePontosSaidaDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
  }

     @GetMapping("/{id}")
       public ResponseEntity<ProgramaDePontosSaidaDTO> buscarPorId(@PathVariable Long id) {
       return ResponseEntity.ok(service.buscarID(id));
   }


    @PutMapping("/{id}")
    public ResponseEntity<ProgramaDePontosSaidaDTO> atualizar(
            @PathVariable Long id, @Valid @RequestBody ProgramaDePontosSaidaDTO dto) {
        return ResponseEntity.ok(service.atualizarSaldo(id, dto.getSaldoPontos()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

     //PATCH simples para atualizar apenas o saldo
     @PatchMapping("/{id}/saldo")
     public ResponseEntity<ProgramaDePontosSaidaDTO> atualizarSaldo(
             @PathVariable Long id,
             @RequestBody Map<String, Integer> request) {

         Integer pontos = request.get("pontos");
         if (pontos == null) {
             throw new IllegalArgumentException("Campo 'pontos' é obrigatório");
         }

         return ResponseEntity.ok(service.atualizarSaldo(id, pontos));
     }
}


