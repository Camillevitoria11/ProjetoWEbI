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

    // ADAPTAÇÃO: Agora recebe o usuarioId vindo da autenticação do Controller
    public ProgramaDePontosSaidaDTO salvar(ProgramaDePontosForm form, Long usuarioId) {
        // 1. Busca o usuário pelo ID do Token (Segurança)
        UsuarioModel usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        // 2. Busca o Programa Mestre no Catálogo (Smiles, Azul, etc.)
        ProgramaCatalogoModel programaCatalogo = programaCatalogoRepository.findById(form.getProgramaCatalogoId())
                .orElseThrow(() -> new NaoEncontradoException("Programa catálogo não encontrado"));

        // 3. (Opcional) Validação: Verifica se o usuário já possui este programa vinculado
        // Isso evita duplicidade de "contas" do mesmo programa para o mesmo usuário
        boolean jaExiste = programaRepository.existsByUsuarioIdAndProgramaCatalogoId(usuarioId, programaCatalogo.getId());
        if (jaExiste) {
            throw new IllegalArgumentException("Você já possui este programa de pontos cadastrado.");
        }

        // 4. Instancia o novo Programa do Usuário
        ProgramaDoUsuarioModel programa = new ProgramaDoUsuarioModel();

        // Regra de Negócio: Se o usuário não der um apelido, usa o nome do catálogo (ex: "Smiles")
        String nomeDefinido = (form.getNome() != null && !form.getNome().isBlank())
                ? form.getNome()
                : programaCatalogo.getNome();

        programa.setNome(nomeDefinido);

        // Regra de Negócio todo programa novo nasce com ZERO pontos
        programa.setSaldoPontos(0);

        // 5. Estabelece os relacionamentos (FKs)
        programa.setUsuario(usuario);
        programa.setProgramaCatalogo(programaCatalogo);

        // 6. Salva e converte para DTO
        ProgramaDoUsuarioModel programaSalvo = programaRepository.save(programa);

        return toDTO(programaSalvo);
    }

    // ADAPTAÇÃO: Lista apenas os programas do usuário logado
    public List<ProgramaDePontosSaidaDTO> listarPorUsuario(Long usuarioId) {
        // Importante: Você deve criar este método findByUsuarioId no seu ProgramaDoUsuarioRepository
        return programaRepository.findByUsuarioId(usuarioId).stream()
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