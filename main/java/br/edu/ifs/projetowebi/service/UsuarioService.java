package br.edu.ifs.projetowebi.service;


import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioModel cadastrarUsuario(UsuarioModel usuario) {
        // valida se email já existe
        Optional<UsuarioModel> existente = usuarioRepository.findByEmail(usuario.getEmail());
        if (existente.isPresent()) {
            throw new RuntimeException("Email já cadastrado!");
        }

        return usuarioRepository.save(usuario);
    }

    public UsuarioModel buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public UsuarioModel buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public UsuarioModel atualizarUsuario(Long id, UsuarioModel novosDados) {
        UsuarioModel usuario = buscarPorId(id);

        usuario.setNome(novosDados.getNome());
        usuario.setEmail(novosDados.getEmail());

        return usuarioRepository.save(usuario);
    }

    public void deletarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}

