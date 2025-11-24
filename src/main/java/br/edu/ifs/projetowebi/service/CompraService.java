package br.edu.ifs.projetowebi.service;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.service.programadepontos.ProgramaDePontosService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@RequiredArgsConstructor
@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final CartaoRepository cartaoRepository;
    private final ProgramaDePontosService programaService;

    public CompraModel registrarCompra(CompraModel compra) {
        CartaoModel cartao = cartaoRepository.findById(compra.getCartao().getId())
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        // Calcular pontos = valor * multiplicador
        // Use getValor() em vez de getValorCompra()
        var pontos = compra.getValor()
                .multiply(cartao.getMultiplicadorPontos())
                .intValue();

        // Use setPontos() em vez de setPontosCalculados()
        compra.setPontos(pontos);
        compra.setDataCompra(LocalDate.now());

        // Use o enum diretamente
        compra.setStatus(StatusCreditModel.PENDENTE);

        // Atualizar saldo no programa - use atualizarSaldo()
        programaService.atualizarSaldo(cartao.getProgramaPontos().getId(), pontos);

        return compraRepository.save(compra);
    }
}