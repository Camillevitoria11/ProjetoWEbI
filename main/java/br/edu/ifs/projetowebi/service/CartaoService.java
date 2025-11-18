package br.edu.ifs.projetowebi.service;


import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartaoService {

    @Autowired
    private CartaoRepository cartaoRepository;

    public CartaoModel salvar(CartaoModel cartao) {
        if (cartao.getMultiplicadorPontos() == null) {
            cartao.setMultiplicadorPontos(new java.math.BigDecimal("1.0"));
        }
        return cartaoRepository.save(cartao);
    }

    public List<CartaoModel> listarPorUsuario(Long usuarioId) {
        return cartaoRepository.findByUsuarioId(usuarioId);
    }
}

