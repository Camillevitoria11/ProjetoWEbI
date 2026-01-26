package br.edu.ifs.projetowebi.repository;

import br.edu.ifs.projetowebi.model.CatalogoCartaoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatalogoCartaoRepository extends JpaRepository<CatalogoCartaoModel, String> {
    // Busca pelo BIN (que definimos como ID/Primary Key na Model)
    Optional<CatalogoCartaoModel> findByBin(String bin);
}