package br.edu.ifs.projetowebi.service.cartao;


import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
//import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@RequiredArgsConstructor
@Service
public class CartaoService {

    private final CartaoService cartao;
    private CartaoRepository cartaoRepository;


//    public CartaoSaidaDTO salvar(CartaoModel cartao) {
//        if (cartao.getMultiplicadorPontos() == null) {
//            cartao.setMultiplicadorPontos(new java.math.BigDecimal("1.0"));
//        }
//        return new CartaoSaidaDTO();
//    }

    public List<CartaoSaidaDTO> listarTodos(){
        return cartaoRepository.findAll().stream().map(cartaoModel->
               new CartaoSaidaDTO(
                       cartaoModel.getNomeCartao(),
                       cartaoModel.getNomeCartao()
        )).toList();

<<<<<<< HEAD
    }
=======
    public CartaoModel salvar(CartaoModel cartao) {
        if (cartao.getMultiplicadorPontos() == null) {
            cartao.setMultiplicadorPontos(1.0);
        }
        return cartaoRepository.save(cartao);
    }

    public List<CartaoModel> listarTodos() {
        return cartaoRepository.findAll();
    }

    //Listar cartões por usuário
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

>>>>>>> 662bc59244ab6d98532d928b30e331b2845ccc7b
    public void deletar(Long id) {
        if (!cartaoRepository.existsById(id)) {
            throw new NaoEncontradoException("Programa não encontrado");
        }
        cartaoRepository.deleteById(id);
    }
}

