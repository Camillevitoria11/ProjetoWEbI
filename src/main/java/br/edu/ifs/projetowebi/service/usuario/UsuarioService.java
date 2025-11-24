package br.edu.ifs.projetowebi.service.usuario;



import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.service.usuario.dto.UsuarioSaidaDTO;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

//    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioModel cadastrarUsuario(UsuarioSaidaDTO dto) {
        // Validar email repetido
        usuarioRepository.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email já cadastrado!");
        });
        UsuarioModel usuario = new UsuarioModel();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
//        // Criptografar senha
//        String senhaCriptografada = encoder.encode(dto.getSenha());
        usuario.setSenhaHash(dto.getSenha());
        return usuarioRepository.save(usuario);
    }

    public UsuarioModel buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
    }

    public UsuarioModel buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
    }

    public void  deletarPorId(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NaoEncontradoException("Usuario não encontrado");
        }
         usuarioRepository.deleteById(id);
    }

    public List<UsuarioSaidaDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(usuarioModel ->
                        new UsuarioSaidaDTO(
                                usuarioModel.getSenhaHash(),
                                usuarioModel.getNome(),
                                usuarioModel.getEmail()
                        ))
                .toList();
    }

    public UsuarioSaidaDTO atualizarUsuario(long id) {
        UsuarioModel usuario = usuarioRepository.findById(id).orElseThrow(()->
                new NaoEncontradoException("Usuario não encontrado"));
        return new UsuarioSaidaDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getSenhaHash());
    }
}






