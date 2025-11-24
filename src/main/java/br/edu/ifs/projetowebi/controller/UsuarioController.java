package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.service.usuario.dto.UsuarioSaidaDTO;
import br.edu.ifs.projetowebi.service.usuario.form.UsuarioForm; // SE TIVER UM FORM
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.service.usuario.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
//    public ResponseEntity<UsuarioSaidaDTO> cadastrar(@Valid @RequestBody UsuarioForm form) {
//        return ResponseEntity.status(HttpStatus.CREATED).body(Service.salvar(form));
//    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioModel> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UsuarioModel> buscarPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
    }
}