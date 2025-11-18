package br.edu.ifs.projetowebi.controller;



import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

    @RestController
    @RequestMapping("/usuarios")
    @CrossOrigin(origins = "*") // permite testar no front/postman
    public class UsuarioController {

        @Autowired
        private UsuarioService usuarioService;

        @PostMapping
        public ResponseEntity<UsuarioModel> cadastrar(@RequestBody UsuarioModel usuario) {
            UsuarioModel novo = usuarioService.cadastrarUsuario(usuario);
            return ResponseEntity.ok(novo);  
        }

        @GetMapping("/{id}")
        public ResponseEntity<UsuarioModel> buscarPorId(@PathVariable Long id) {
            return ResponseEntity.ok(usuarioService.buscarPorId(id));
        }

        @GetMapping("/email/{email}")
        public ResponseEntity<UsuarioModel> buscarPorEmail(@PathVariable String email) {
            return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
        }

        @PutMapping("/{id}")
        public ResponseEntity<UsuarioModel> atualizar(@PathVariable Long id, @RequestBody UsuarioModel usuario) {
            return ResponseEntity.ok(usuarioService.atualizarUsuario(id, usuario));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deletar(@PathVariable Long id) {
            usuarioService.deletarUsuario(id);
            return ResponseEntity.noContent().build();
        }
    }


