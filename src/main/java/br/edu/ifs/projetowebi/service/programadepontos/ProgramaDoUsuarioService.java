package br.edu.ifs.projetowebi.service.programadepontos;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.ProgramaDoUsuarioModel;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import br.edu.ifs.projetowebi.repository.ProgramaDoUsuarioRepository;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import br.edu.ifs.projetowebi.service.programadepontos.dto.ProgramaDePontosSaidaDTO;
import br.edu.ifs.projetowebi.service.programadepontos.form.ProgramaDePontosForm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProgramaDoUsuarioService {

    private final ProgramaDoUsuarioRepository programaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProgramaCatalogoRepository programaCatalogoRepository;

    public ProgramaDePontosSaidaDTO salvar(ProgramaDePontosForm form) {
        // Buscar usuário e programa catálogo
        UsuarioModel usuario = usuarioRepository.findById(form.getUsuarioId())
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        ProgramaCatalogoModel programaCatalogo = programaCatalogoRepository.findById(form.getProgramaCatalogoId())
                .orElseThrow(() -> new NaoEncontradoException("Programa catálogo não encontrado"));

        // Criar programa do usuário
        ProgramaDoUsuarioModel programa = new ProgramaDoUsuarioModel();
        programa.setNome(form.getNome());
        programa.setSaldoPontos(form.getSaldoPontos());
        programa.setUsuario(usuario);
        programa.setProgramaCatalogo(programaCatalogo);

        ProgramaDoUsuarioModel programaSalvo = programaRepository.save(programa);
        return toDTO(programaSalvo);
    }

    public List<ProgramaDePontosSaidaDTO> listarTodos() {
        return programaRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public ProgramaDePontosSaidaDTO buscarID(Long id) {
        ProgramaDoUsuarioModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa do usuário não encontrado"));
        return toDTO(programa);
    }

    public ProgramaDePontosSaidaDTO atualizarSaldo(Long id, Integer novoSaldo) {
        ProgramaDoUsuarioModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa do usuário não encontrado"));

        programa.setSaldoPontos(novoSaldo);
        ProgramaDoUsuarioModel programaAtualizado = programaRepository.save(programa);

        return toDTO(programaAtualizado);
    }

    public void deletar(Long id) {
        if (!programaRepository.existsById(id)) {
            throw new NaoEncontradoException("Programa do usuário não encontrado");
        }
        programaRepository.deleteById(id);
    }

    private ProgramaDePontosSaidaDTO toDTO(ProgramaDoUsuarioModel programa) {
        return new ProgramaDePontosSaidaDTO(
                programa.getId(),
                programa.getNome(),
                programa.getSaldoPontos()
        );
    }
}