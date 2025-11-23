package br.edu.ifs.projetowebi.controller;


import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.service.cartao.CartaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

    @RestController
    @RequestMapping("/cartoes")
    @CrossOrigin(origins = "*")
    public class CartaoController {

        @Autowired
        private CartaoService cartaoService;

        @PostMapping
        public ResponseEntity<CartaoModel> salvar(@RequestBody CartaoModel cartao) {
            return ResponseEntity.ok(cartaoService.salvar(cartao));
        }

        @GetMapping("/usuario/{usuarioId}")
        public ResponseEntity<List<CartaoModel>> listarPorUsuario(@PathVariable Long usuarioId) {
            return ResponseEntity.ok(cartaoService.listarPorUsuario(usuarioId));
        }

        @PutMapping("{/usuarioId}")
        public ResponseEntity<CartaoModel> atualizar(@PathVariable Long usuarioId, @RequestBody CartaoModel cartao) {
            return ResponseEntity.ok(cartaoService );
        }
     }


