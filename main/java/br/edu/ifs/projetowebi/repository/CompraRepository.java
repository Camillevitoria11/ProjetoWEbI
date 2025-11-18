package br.edu.ifs.projetowebi.repository;


import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompraRepository extends JpaRepository<CompraModel, Long> {

    // Buscar compras por usuário
    List<CompraModel> findByUsuarioId(Long usuarioId);

    // Buscar compras pelo cartão
    List<CompraModel> findByCartaoId(Long cartaoId);

    // Buscar compras por status (pendente, creditado...)
    List<CompraModel> findByStatusCredito(StatusCreditoModel statusCredito);
}
