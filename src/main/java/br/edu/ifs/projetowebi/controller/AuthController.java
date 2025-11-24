package br.edu.ifs.projetowebi.controller;

import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.repository.UsuarioRepository;
import br.edu.ifs.projetowebi.config.TokenService;
import br.edu.ifs.projetowebi.service.usuario.dto.LoginDTO;
import br.edu.ifs.projetowebi.service.usuario.dto.RegistroDTO;
import br.edu.ifs.projetowebi.service.usuario.dto.TokenDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/registrar")
    public ResponseEntity<String> registrar(@Valid @RequestBody RegistroDTO registroDTO) {
        if (usuarioRepository.existsByEmail(registroDTO.getEmail())) {
            return ResponseEntity.badRequest().body("Email já cadastrado");
        }

        UsuarioModel usuario = new UsuarioModel();
        usuario.setNome(registroDTO.getNome());
        usuario.setEmail(registroDTO.getEmail());
        usuario.setSenhaHash(passwordEncoder.encode(registroDTO.getSenha()));

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuário registrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getSenha());

        Authentication auth = authManager.authenticate(authToken);
        String token = tokenService.gerarToken(auth);

        return ResponseEntity.ok(new TokenDTO(token, "Bearer"));
    }
}