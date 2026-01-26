package br.edu.ifs.projetowebi.service.cartao;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CatalogoCartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.CatalogoCartaoRepository;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CartaoService {

    private final CartaoRepository cartaoRepository;
    private final CatalogoCartaoRepository catalogoCartaoRepository;

    public CatalogoCartaoModel identificarPeloNumero(String numero) {
        if (numero == null || numero.length() < 6) {
            throw new IllegalArgumentException("Número de cartão inválido ou incompleto");
        }

        String bin = numero.substring(0, 6);

        // Busca no catálogo mestre. Se não achar, retornar um erro
        // ou um objeto padrão de "Cartão Desconhecido"
        return catalogoCartaoRepository.findByBin(bin)
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado no catálogo global"));
    }

    public CartaoModel salvar(CartaoModel cartao) {
        if (cartao.getMultiplicadorPontos() == null) {
            cartao.setMultiplicadorPontos(BigDecimal.valueOf(1.0));
        }
        return cartaoRepository.save(cartao);
    }

    public List<CartaoModel> listarPorUsuario(Long usuarioId) {
        return cartaoRepository.findByUsuarioId(usuarioId);
    }

    public CartaoModel buscarPorId(Long id) {
        return cartaoRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));
    }

    public CartaoModel atualizar(Long id, CartaoModel cartaoAtualizado) {
        CartaoModel cartaoExistente = cartaoRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        if (cartaoAtualizado.getNomeCartao() != null) {
            cartaoExistente.setNomeCartao(cartaoAtualizado.getNomeCartao());
        }
        if (cartaoAtualizado.getMultiplicadorPontos() != null) {
            cartaoExistente.setMultiplicadorPontos(cartaoAtualizado.getMultiplicadorPontos());
        }

        return cartaoRepository.save(cartaoExistente);
    }

    public void deletar(Long id) {
        if (!cartaoRepository.existsById(id)) {
            throw new NaoEncontradoException("Cartão não encontrado");
        }
        cartaoRepository.deleteById(id);
    }

    public List<CartaoSaidaDTO> listarTodosDTO() {
        return cartaoRepository.findAll().stream()
                .map(cartao -> new CartaoSaidaDTO(
                        cartao.getId(),
                        cartao.getNomeCartao(),
                        cartao.getMultiplicadorPontos(),
                        cartao.getBandeira() != null ? cartao.getBandeira() : "Não identificada",
                        cartao.getUsuario() != null ? cartao.getUsuario().getNome() : "Sem Usuário",
                        cartao.getProgramaDoUsuario() != null ? cartao.getProgramaDoUsuario().getNome() : "Sem Programa",
                        // ADICIONADO: O 7º argumento (Saldo de Pontos)
                        cartao.getProgramaDoUsuario() != null ? cartao.getProgramaDoUsuario().getSaldoPontos() : 0
                )).toList();
    }

    public CartaoSaidaDTO buscarDetalhesPorId(Long id) {
        CartaoModel cartao = cartaoRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        return new CartaoSaidaDTO(
                cartao.getId(),
                cartao.getNomeCartao(),
                cartao.getMultiplicadorPontos(),
                cartao.getBandeira() != null ? cartao.getBandeira() : null,
                cartao.getUsuario() != null ? cartao.getUsuario().getNome() : null,
                cartao.getProgramaDoUsuario() != null ? cartao.getProgramaDoUsuario().getNome() : null,
                cartao.getProgramaDoUsuario() != null ? cartao.getProgramaDoUsuario().getSaldoPontos() : 0
        );
    }
}