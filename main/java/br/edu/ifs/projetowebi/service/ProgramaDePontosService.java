package br.edu.ifs.projetowebi.service;


import br.edu.ifs.projetowebi.model.ProgramaDePontosModel;
import br.edu.ifs.projetowebi.repository.ProgramaDePontosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProgramaDePontosService {

    @Autowired
    private ProgramaDePontosRepository programaRepository;

    public ProgramaDePontosModel salvar(ProgramaDePontosModel programa) {
        return programaRepository.save(programa);
    }

    public ProgramaDePontosModel atualizarSaldo(Long id, Integer pontos) {
        ProgramaDePontosModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa não encontrado"));

        programa.setSaldoPontos(programa.getSaldoPontos() + pontos);
        return programaRepository.save(programa);
    }
}

