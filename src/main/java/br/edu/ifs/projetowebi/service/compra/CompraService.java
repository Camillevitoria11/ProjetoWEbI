package br.edu.ifs.projetowebi.service.compra;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CartaoModel;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.repository.CartaoRepository;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import br.edu.ifs.projetowebi.service.cartao.dto.CartaoSaidaDTO;
import br.edu.ifs.projetowebi.service.compra.compraDTO.CompraSaidaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final CartaoRepository cartaoRepository;

    public CompraModel registrarCompra(CompraModel compra) {
        return compraRepository.save(compra);
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

    public void deletarPorId(CompraModel compra, long id) {
        if (!compraRepository.existsById(id)) {
            throw new NaoEncontradoException("Usuario não encontrado");
        }
    }

    public CompraSaidaDTO atualizarCompra(CompraModel compra, long id) {
        CompraModel compraAtualizada = compraRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Compra não encontrada"));

        // Atualiza os campos
        compraAtualizada.setValorCompra(compra.getValorCompra());
        compraAtualizada.setDataCompra(compra.getDataCompra());
        compraAtualizada.setComprovanteUrl(compra.getComprovanteUrl());

        CompraModel compraSalva = compraRepository.save(compraAtualizada);

        return new CompraSaidaDTO(
                compraSalva.getId(),
                compraSalva.getValorCompra(),
                compraSalva.getDataCompra(),
                compraSalva.getComprovanteUrl()
        );
    }
    }