package br.edu.ifs.projetowebi.service.programadepontos;


import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.ProgramaDePontosModel;
import br.edu.ifs.projetowebi.repository.ProgramaDePontosRepository;
import br.edu.ifs.projetowebi.service.programadepontos.dto.ProgramaDePontosSaidaDTO;
import br.edu.ifs.projetowebi.service.programadepontos.form.ProgramaDePontosForm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;


@RequiredArgsConstructor
@Service
public class ProgramaDePontosService {

    private final ProgramaDePontosRepository programaRepository;

    public ProgramaDePontosSaidaDTO salvar(ProgramaDePontosForm programa) {
        ProgramaDePontosModel model = new ProgramaDePontosModel();
        model.setNome(programa.getNome());
        model.setSaldoPontos(programa.getSaldoPontos());
        programaRepository.save(model);
        return new ProgramaDePontosSaidaDTO(
                model.getId(), model.getNome(), model.getSaldoPontos()
        );
    }

    public ProgramaDePontosSaidaDTO atualizarSaldo(Long id, Integer pontos) {
        ProgramaDePontosModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa não encontrado"));

        programa.setSaldoPontos(programa.getSaldoPontos() + pontos);
        ProgramaDePontosModel programaAtualizado = programaRepository.save(programa);

        return new ProgramaDePontosSaidaDTO(
                programaAtualizado.getId(),
                programaAtualizado.getNome(),
                programaAtualizado.getSaldoPontos()
        );
    }

    public ProgramaDePontosSaidaDTO buscarID(long id) {
        ProgramaDePontosModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa não encontrado"));
        return new ProgramaDePontosSaidaDTO(
                programa.getId(), programa.getNome(), programa.getSaldoPontos()
        );

       }
       public List<ProgramaDePontosSaidaDTO> listarTodos(){
        return programaRepository.findAll().stream().map(programaDePontosModel->
                new ProgramaDePontosSaidaDTO(programaDePontosModel.getId(),programaDePontosModel.getNome(),
                        programaDePontosModel.getSaldoPontos())).toList();
        }

    public void deletar(Long id) {
        if (!programaRepository.existsById(id)) {
            throw new NaoEncontradoException("Programa não encontrado");
        }
        programaRepository.deleteById(id);
      }
    }



