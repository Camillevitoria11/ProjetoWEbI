package br.edu.ifs.projetowebi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@Entity
@Table(name = "usuarios")
public class UsuarioModel implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // ✅ EVITA serializar a senha no JSON
    private String senhaHash;

    // COMENTE temporariamente se tiver problemas
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // ✅ EVITA loop infinito com cartões
    private List<CartaoModel> cartoes;

    // UserDetails methods com @JsonIgnore
    @Override
    @JsonIgnore // ✅ EVITA serializar authorities
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar password duplicado
    public String getPassword() {
        return senhaHash;
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar username duplicado
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar campos técnicos do UserDetails
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar campos técnicos do UserDetails
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar campos técnicos do UserDetails
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore // ✅ EVITA serializar campos técnicos do UserDetails
    public boolean isEnabled() {
        return true;
    }
}