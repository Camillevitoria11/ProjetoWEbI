package br.edu.ifs.projetowebi.config;

import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final ProgramaCatalogoRepository programaCatalogoRepository;

    @PostConstruct
    public void init() {
        if (programaCatalogoRepository.count() == 0) {
            List<ProgramaCatalogoModel> programas = Arrays.asList(
                    createPrograma("Smiles", "Programa de pontos da Gol", 1.2, 30),
                    createPrograma("Azul", "Programa de pontos da Azul", 1.1, 45),
                    createPrograma("Latam Pass", "Programa de pontos da Latam", 1.3, 35),
                    createPrograma("TudoAzul", "Programa de pontos da Azul", 1.0, 40),
                    createPrograma("Multiplus", "Programa de pontos da Tam", 1.15, 30)
            );
            programaCatalogoRepository.saveAll(programas);
        }
    }

    private ProgramaCatalogoModel createPrograma(String nome, String descricao, Double multiplicador, Integer prazo) {
        ProgramaCatalogoModel programa = new ProgramaCatalogoModel();
        programa.setNome(nome);
        programa.setDescricao(descricao);
        programa.setMultiplicadorBase(multiplicador);
        programa.setPrazoCreditoDias(prazo);
        return programa;
    }
}