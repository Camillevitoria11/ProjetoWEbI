package br.edu.ifs.projetowebi.repository;

import br.edu.ifs.projetowebi.model.ProgramaDoUsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramaDoUsuarioRepository extends JpaRepository<ProgramaDoUsuarioModel, Long> {
    List<ProgramaDoUsuarioModel> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioIdAndProgramaCatalogoId(Long usuarioId, Long programaCatalogoId);

}
