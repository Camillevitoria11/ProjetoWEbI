package br.edu.ifs.projetowebi.repository;

import br.edu.ifs.projetowebi.model.CompraModel;
import br.edu.ifs.projetowebi.model.StatusCreditModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<CompraModel, Long> {

    List<CompraModel> findByStatusCredito(StatusCreditModel statusCredito);
    List<CompraModel> findByUsuarioId(Long usuarioId);
    List<CompraModel> findByCartaoId(Long cartaoId);
}