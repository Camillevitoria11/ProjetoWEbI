package br.edu.ifs.projetowebi.controller;


import br.edu.ifs.projetowebi.model.ProgramaDePontosModel;
import br.edu.ifs.projetowebi.service.ProgramaDePontosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/programas")
    @CrossOrigin(origins = "*")
    public class ProgramaDePontosController {

        @Autowired
        private ProgramaDePontosService programaService;

        @PostMapping
        public ResponseEntity<ProgramaDePontosModel> salvar(@RequestBody ProgramaDePontosModel programa) {
            return ResponseEntity.ok(programaService.salvar(programa));
        }

        @PutMapping("/{id}/atualizar-saldo/{pontos}")
        public ResponseEntity<ProgramaDePontosModel> atualizarSaldo(
                @PathVariable Long id,
                @PathVariable Integer pontos) {
            return ResponseEntity.ok(programaService.atualizarSaldo(id, pontos));
        }
    }


