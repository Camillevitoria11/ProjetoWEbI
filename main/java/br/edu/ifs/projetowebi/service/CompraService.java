package br.edu.ifs.projetowebi.service;


import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.StatusCreditoModel;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private CartaoRepository cartaoRepository;

    @Autowired
    private ProgramaDePontosService programaService;

    public CompraModel registrarCompra(CompraModel compra) {

        CartaoModel cartao = cartaoRepository.findById(compra.getCartao().getId())
                .orElseThrow(() -> new RuntimeException("Cartão não encontrado"));

        // calcular pontos = valor * multiplicador
        var pontos = compra.getValorCompra()
                .multiply(cartao.getMultiplicadorPontos())
                .intValue();

        compra.setPontosCalculados(pontos);
        compra.setDataCompra(LocalDate.now());
        compra.setStatusCredito(StatusCreditoModel.valueOf("PENDENTE"));

        // atualizar saldo no programa
        programaService.atualizarSaldo(cartao.getProgramaPontos().getId(), pontos);

        return compraRepository.save(compra);
    }
}

