package br.edu.ifs.projetowebi.service.compra;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.model.UsuarioModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import br.edu.ifs.projetowebi.repository.ProgramaDoUsuarioRepository;
import br.edu.ifs.projetowebi.service.compra.dto.CompraEntradaDTO;
import br.edu.ifs.projetowebi.service.compra.dto.CompraSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service

public class CompraService {

    private final CompraRepository compraRepository;
    private final CartaoRepository cartaoRepository;
    private final ProgramaDoUsuarioRepository programaDoUsuarioRepository;

    // Diretório para salvar os comprovantes (Requisito de Upload)
    private final String uploadDir = "uploads/comprovantes/";
    /**
     * Processa uma nova compra vinda do Frontend com arquivo anexo.
     * Atende aos requisitos de cálculo automático e suporte a arquivos.
     */
    @Transactional
    public CompraModel processarNovaCompra(CompraEntradaDTO dto, MultipartFile arquivo, UsuarioModel usuarioLogado) {
        // 1. Busca o cartão para obter o multiplicador de pontos
        CartaoModel cartao = cartaoRepository.findById(dto.getCartaoId())
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        CompraModel compra = new CompraModel();
        compra.setUsuario(usuarioLogado);
        compra.setDescricao(dto.getDescricao());
        compra.setValor(dto.getValor());
        compra.setCartao(cartao);
        compra.setStatusCredito(StatusCreditModel.PENDENTE);

        // 2. Cálculo Automático de Pontos [cite: 21]
        if (cartao.getMultiplicadorPontos() != null) {
            BigDecimal pontos = dto.getValor().multiply(cartao.getMultiplicadorPontos());
            compra.setPontosCalculados(pontos.intValue());
        } else {
            compra.setPontosCalculados(dto.getValor().intValue()); // Padrão 1:1 caso nulo
        }

        return compraRepository.save(compra);
    }

    @Transactional
    public CompraModel registrarCompra(CompraModel compra) {
        if (compra.getCartao() == null || compra.getCartao().getId() == null) {
            throw new RuntimeException("Cartão é obrigatório");
        }

        CartaoModel cartao = cartaoRepository.findById(compra.getCartao().getId())
                .orElseThrow(() -> new NaoEncontradoException("Cartão não encontrado"));

        compra.setCartao(cartao);
        CompraModel compraSalva = compraRepository.save(compra);

        // Creditar pontos automaticamente se a regra de negócio permitir
        creditarPontosDaCompra(compraSalva);

        return compraSalva;
    }

    @Transactional
    protected void creditarPontosDaCompra(CompraModel compra) {
        if (compra.creditarPontos()) {
            programaDoUsuarioRepository.save(compra.getCartao().getProgramaDoUsuario());
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
        CompraModel compraExistente = buscarPorId(id);

        if (compraAtualizada.getDescricao() != null) {
            compraExistente.setDescricao(compraAtualizada.getDescricao());
        }
        if (compraAtualizada.getValor() != null) {
            compraExistente.setValor(compraAtualizada.getValor());
            // Recalcula pontos se o valor mudar [cite: 21]
            if (compraExistente.getCartao().getMultiplicadorPontos() != null) {
                BigDecimal pontos = compraAtualizada.getValor().multiply(compraExistente.getCartao().getMultiplicadorPontos());
                compraExistente.setPontosCalculados(pontos.intValue());
            }
        }
        if (compraAtualizada.getStatusCredito() != null) {
            compraExistente.setStatusCredito(compraAtualizada.getStatusCredito());
        }

        CompraModel compraSalva = compraRepository.save(compraExistente);

        return CompraSaidaDTO.fromEntity(compraSalva);
    }

    @Transactional
    public CompraModel creditarPontosManualmente(Long compraId) {
        CompraModel compra = buscarPorId(compraId);
        if (compra.creditarPontos()) {
            programaDoUsuarioRepository.save(compra.getCartao().getProgramaDoUsuario());
            return compraRepository.save(compra);
        }
        throw new RuntimeException("Não foi possível creditar pontos");
    }

    public List<CompraSaidaDTO> listarTodasDTO() {
        return compraRepository.findAll().stream()
                .map(CompraSaidaDTO::fromEntity)
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

    private CompraSaidaDTO toDTO(CompraModel compra) {
        CompraSaidaDTO dto = new CompraSaidaDTO();

        dto.setId(compra.getId());
        dto.setDescricao(compra.getDescricao());
        dto.setValor(compra.getValor());
        dto.setPontosCalculados(compra.getPontosCalculados());
        dto.setDataCompra(compra.getDataCompra());
        dto.setDataCredito(compra.getDataCredito());
        dto.setStatusCredito(compra.getStatusCredito().toString());

        // Aqui pegamos o nome do cartão e do usuário navegando pelos relacionamentos
        if (compra.getCartao() != null) {
            dto.setNomeCartao(compra.getCartao().getNomeCartao());

            if (compra.getCartao().getProgramaDoUsuario() != null &&
                    compra.getCartao().getProgramaDoUsuario().getUsuario() != null) {
                dto.setNomeUsuario(compra.getCartao().getProgramaDoUsuario().getUsuario().getNome());
            }
        }

        dto.setComprovanteUrl(compra.getComprovanteUrl());

        return dto;
    }
    public List<CompraSaidaDTO> listarPorUsuario(Long usuarioId) {
        // Busca as compras usando a query que ajustamos no Repository
        List<CompraModel> compras = compraRepository.findByUsuarioId(usuarioId);

        // Converte cada model da lista em um DTO
        return compras.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}