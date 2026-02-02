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

    // Salvar um novo programa para o usuário
    public ProgramaDePontosSaidaDTO salvar(ProgramaDePontosForm form, Long usuarioId) {
        // 1. Busca o usuário pelo ID
        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        // 2. Busca o programa no catálogo
        ProgramaCatalogoModel programaCatalogo = programaCatalogoRepository.findById(form.getProgramaCatalogoId())
                .orElseThrow(() -> new NaoEncontradoException("Programa catálogo não encontrado"));

        // 3. Verifica se o usuário já possui este programa
        boolean jaExiste = programaRepository.existsByUsuarioIdAndProgramaCatalogoId(usuarioId, programaCatalogo.getId());
        if (jaExiste) {
            throw new IllegalArgumentException("Você já possui este programa de pontos cadastrado.");
        }

        // 4. Cria o novo programa
        ProgramaDoUsuarioModel programa = new ProgramaDoUsuarioModel();

        // Define o nome (usa apelido se fornecido, senão usa nome do catálogo)
        String nomeDefinido = (form.getNome() != null && !form.getNome().isBlank())
                ? form.getNome()
                : programaCatalogo.getNome();

        programa.setNome(nomeDefinido);
        programa.setSaldoPontos(0); // Inicia com zero pontos
        programa.setUsuario(usuario);
        programa.setProgramaCatalogo(programaCatalogo);

        // 5. Salva no banco
        ProgramaDoUsuarioModel programaSalvo = programaRepository.save(programa);

        // 6. Retorna DTO
        return toDTO(programaSalvo);
    }

    // Listar programas de um usuário
    public List<ProgramaDePontosSaidaDTO> listarPorUsuario(Long usuarioId) {
        return programaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDTO)
                .toList();
    }

    // Buscar programa por ID
    public ProgramaDePontosSaidaDTO buscarID(Long id) {
        ProgramaDoUsuarioModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa do usuário não encontrado"));
        return toDTO(programa);
    }

    // Atualizar saldo de pontos
    public ProgramaDePontosSaidaDTO atualizarSaldo(Long id, Integer novoSaldo) {
        ProgramaDoUsuarioModel programa = programaRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Programa do usuário não encontrado"));

        programa.setSaldoPontos(novoSaldo);
        ProgramaDoUsuarioModel programaAtualizado = programaRepository.save(programa);

        return toDTO(programaAtualizado);
    }

    // Deletar programa
    public void deletar(Long id) {
        if (!programaRepository.existsById(id)) {
            throw new NaoEncontradoException("Programa do usuário não encontrado");
        }
        programaRepository.deleteById(id);
    }

    // Método para verificar se o programa pertence ao usuário
    public void verificarPropriedade(Long programaId, Long usuarioId) {
        ProgramaDoUsuarioModel programa = programaRepository.findById(programaId)
                .orElseThrow(() -> new NaoEncontradoException("Programa não encontrado"));

        if (!programa.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("Este programa não pertence ao usuário");
        }
    }

    // Converter Model para DTO
    private ProgramaDePontosSaidaDTO toDTO(ProgramaDoUsuarioModel programa) {
        return new ProgramaDePontosSaidaDTO(
                programa.getId(),
                programa.getNome(),
                programa.getSaldoPontos()
        );
    }
}