package br.edu.ifs.projetowebi.service.compra;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import br.edu.ifs.projetowebi.repository.ProgramaDoUsuarioRepository;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final CartaoRepository cartaoRepository;
    private final ProgramaDoUsuarioRepository programaDoUsuarioRepository;

    @Transactional
    public CompraModel registrarCompra(CompraModel compra) {
        // Validações
        if (compra.getCartao() == null || compra.getCartao().getId() == null) {
            throw new RuntimeException("Cartão é obrigatório");
        }

        CartaoModel cartao = cartaoRepository.findById(compra.getCartao().getId())
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        compra.setCartao(cartao);

        // O @PrePersist da CompraModel já calcula pontos e data
        CompraModel compraSalva = compraRepository.save(compra);

        // Creditar pontos automaticamente
        creditarPontosDaCompra(compraSalva);

        return compraSalva;
    }

    @Transactional
    protected void creditarPontosDaCompra(CompraModel compra) {
        if (compra.creditarPontos()) {
            // Salva as alterações no programa
            programaDoUsuarioRepository.save(compra.getCartao().getProgramaPontos());
            compraRepository.save(compra);
        }
    }

    public List<CompraModel> listarTodas() {
        return compraRepository.findAll();
    }

    public CompraModel buscarPorId(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Compra não encontrada"));
    }

    public List<CompraModel> listarPorCartao(Long cartaoId) {
        return compraRepository.findByCartaoId(cartaoId);
    }

    public List<CompraModel> listarPorUsuario(Long usuarioId) {
        return compraRepository.findByCartaoUsuarioId(usuarioId);
    }

    public List<CompraModel> listarPorStatus(StatusCreditModel status) {
        return compraRepository.findByStatusCredito(status);
    }

    @Transactional
    public void deletarPorId(Long id) {
        if (!compraRepository.existsById(id)) {
            throw new NaoEncontradoException("Compra não encontrada");
        }
        compraRepository.deleteById(id);
    }

    @Transactional
    public CompraSaidaDTO atualizarCompra(Long id, CompraModel compraAtualizada) {
        CompraModel compraExistente = compraRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Compra não encontrada"));

        // Atualiza os campos permitidos
        if (compraAtualizada.getDescricao() != null) {
            compraExistente.setDescricao(compraAtualizada.getDescricao());
        }
        if (compraAtualizada.getValor() != null) {
            compraExistente.setValor(compraAtualizada.getValor());
            compraExistente.calcularPontos(); // Recalcula pontos
        }
        if (compraAtualizada.getComprovanteUrl() != null) {
            compraExistente.setComprovanteUrl(compraAtualizada.getComprovanteUrl());
        }
        if (compraAtualizada.getStatusCredito() != null) {
            compraExistente.setStatusCredito(compraAtualizada.getStatusCredito());
        }

        CompraModel compraSalva = compraRepository.save(compraExistente);

        return new CompraSaidaDTO(
                compraSalva.getId(),
                compraSalva.getValor(),
                compraSalva.getPontosCalculados(),
                compraSalva.getDataCompra(),
                compraSalva.getDataCredito(),
                compraSalva.getStatusCredito().name(),
                compraSalva.getDescricao(),
                compraSalva.getComprovanteUrl()
        );
    }

    @Transactional
    public CompraModel creditarPontosManualmente(Long compraId) {
        CompraModel compra = buscarPorId(compraId);
        if (compra.creditarPontos()) {
            programaDoUsuarioRepository.save(compra.getCartao().getProgramaPontos());
            return compraRepository.save(compra);
        }
        throw new RuntimeException("Não foi possível creditar pontos");
    }

//     Metodo para listar compras com DTOs
    public List<CompraSaidaDTO> listarTodasDTO() {
        return compraRepository.findAll().stream()
                .map(compra -> new CompraSaidaDTO(
                        compra.getId(),
                        compra.getValor(),
                        compra.getPontosCalculados(),
                        compra.getDataCompra(),
                        compra.getDataCredito(),
                        compra.getStatusCredito().name(),
                        compra.getDescricao(),
                        compra.getComprovanteUrl()
                ))
                .toList();
    }

    public BigDecimal calcularTotalComprasPorCartao(Long cartaoId) {
        return compraRepository.findByCartaoId(cartaoId).stream()
                .map(CompraModel::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Integer calcularTotalPontosPorUsuario(Long usuarioId) {
        return compraRepository.findByCartaoUsuarioId(usuarioId).stream()
                .map(CompraModel::getPontosCalculados)
                .reduce(0, Integer::sum);
    }
}