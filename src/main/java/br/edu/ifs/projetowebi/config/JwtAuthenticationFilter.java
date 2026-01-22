package br.edu.ifs.projetowebi.config;

import br.edu.ifs.projetowebi.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = recuperarToken(request);

        if (token != null && tokenService.isTokenValido(token)) {
            String userName  = tokenService.getUserName(token);
            UserDetails usuario = userDetailsService.loadUserByUsername(userName);

            var authentication = new UsernamePasswordAuthenticationToken(usuario, userName, usuario.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        // Verifica se o header existe e começa corretamente com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        // substring(7) remove exatamente "Bearer " (7 caracteres incluindo o espaço)
        // .trim() remove qualquer espaço acidental que reste
        return authHeader.substring(7).trim();
    }
}