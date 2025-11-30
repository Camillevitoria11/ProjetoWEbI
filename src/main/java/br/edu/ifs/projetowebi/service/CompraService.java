package br.edu.ifs.projetowebi.service;

import br.edu.ifs.projetowebi.config.excecoes.NaoEncontradoException;
import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.repository.CompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CompraService {

    private final CompraRepository compraRepository;

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

    public List<CompraModel> listarPorUsuario(Long usuarioId) {
        return compraRepository.findByUsuarioId(usuarioId);
    }

    public List<CompraModel> listarPorCartao(Long cartaoId) {
        return compraRepository.findByCartaoId(cartaoId);
    }

    public List<CompraModel> listarPorStatus(StatusCreditModel status) {
        return compraRepository.findByStatusCredito(status);
    }
}