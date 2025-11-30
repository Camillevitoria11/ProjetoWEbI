package br.edu.ifs.projetowebi.repository;

import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramaCatalogoRepository extends JpaRepository<ProgramaCatalogoModel, Long> {
}