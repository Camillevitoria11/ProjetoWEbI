package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/programas-catalogo")
@RequiredArgsConstructor
public class ProgramaCatalogoController {

    private final ProgramaCatalogoRepository repository;

    @PostMapping
    public ResponseEntity<ProgramaCatalogoModel> cadastrarNoCatalogo(@RequestBody ProgramaCatalogoModel programa) {
        // Isso cria a "opção" Smiles, Azul, etc no banco
        return ResponseEntity.ok(repository.save(programa));
    }

    @GetMapping
    public ResponseEntity<List<ProgramaCatalogoModel>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }
}