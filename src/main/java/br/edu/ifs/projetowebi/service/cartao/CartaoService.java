package br.edu.ifs.projetowebi.service.cartao;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CartaoService {

    private final CartaoRepository cartaoRepository;

    public CartaoModel salvar(CartaoModel cartao) {
        if (cartao.getMultiplicadorPontos() == null) {
            cartao.setMultiplicadorPontos(BigDecimal.valueOf(1.0));
        }
        return cartaoRepository.save(cartao);
    }

    public List<CartaoModel> listarTodos() {
        return cartaoRepository.findAll();
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
                .map(cartaoModel -> new CartaoSaidaDTO(
                        cartaoModel.getId(),
                        cartaoModel.getNomeCartao(),
                        cartaoModel.getMultiplicadorPontos()
                ))
                .toList();
    }
}