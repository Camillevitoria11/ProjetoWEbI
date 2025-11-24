package br.edu.ifs.projetowebi.controller;


import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    }
