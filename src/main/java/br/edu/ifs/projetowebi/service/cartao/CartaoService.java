package br.edu.ifs.projetowebi.service.cartao;

import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CartaoService {

    private final CartaoRepository cartaoRepository;

    public CartaoModel salvar(CartaoModel cartao) {
        return cartaoRepository.save(cartao);
    }

    public List<CartaoModel> listarPorUsuario(Long usuarioId) {
        return cartaoRepository.findByUsuarioId(usuarioId);
    }

    public CartaoModel atualizar(Long id, CartaoModel cartaoAtualizado) {
        CartaoModel cartaoExistente = cartaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));

        cartaoExistente.setNomeCartao(cartaoAtualizado.getNomeCartao());
        cartaoExistente.setMultiplicadorPontos(cartaoAtualizado.getMultiplicadorPontos());

        return cartaoRepository.save(cartaoExistente);
    }

    public List<CartaoModel> listarTodos() {
        return cartaoRepository.findAll();
    }

    public CartaoModel buscarPorId(Long id) {
        return cartaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));
    }

    public void deletar(Long id) {
        cartaoRepository.deleteById(id);
    }
}