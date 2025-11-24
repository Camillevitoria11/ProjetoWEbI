package br.edu.ifs.projetowebi.repository;


import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<CompraModel, Long> {

    // Buscar compras por usuário
    List<CompraModel> findByUsuarioId(Long usuarioId);

    // Buscar compras pelo cartão
    List<CompraModel> findByCartaoId(Long cartaoId);

    // Buscar compras por status (pendente, creditado...)
    List<CompraModel> findByStatus(StatusCreditModel statusCredito);
}
