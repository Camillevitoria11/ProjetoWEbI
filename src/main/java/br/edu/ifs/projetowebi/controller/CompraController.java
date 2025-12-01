package br.edu.ifs.projetowebi.controller;


import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.service.compra.CompraService;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
    @RequestMapping("/compras")
    @CrossOrigin(origins = "*")
    public class CompraController {

        @Autowired
        private CompraService compraService;

        @PostMapping
        public ResponseEntity<CompraModel> registrar(@RequestBody CompraModel compra) {
            return ResponseEntity.ok(compraService.registrarCompra(compra));
        }

        @GetMapping
        public ResponseEntity<List<CompraModel>> listarTodas() {
            return ResponseEntity.ok(compraService.listarTodas());
        }

        @GetMapping("/{id}")
        public ResponseEntity<CompraModel> buscarCompraPorId(@PathVariable Long id) {
            return ResponseEntity.ok(compraService.buscarPorId(id));
        }
        @DeleteMapping("/delete/{id}")
        public ResponseEntity<CompraModel> deletarCompraPorId(@PathVariable Long id) {
            return ResponseEntity.noContent().build();
        }
        @PutMapping("/{id}")
        public ResponseEntity<CompraSaidaDTO> atualizar(@PathVariable Long id, @RequestBody CompraModel compra) {
            return ResponseEntity.ok(compraService.atualizarCompra(compra, id));
        }

    }


