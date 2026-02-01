package br.edu.ifs.projetowebi.repository;

import br.edu.ifs.projetowebi.model.ProgramaDoUsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProgramaDoUsuarioRepository extends JpaRepository<ProgramaDoUsuarioModel, Long> {
    List<ProgramaDoUsuarioModel> findByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM ProgramaDoUsuarioModel p " +
            "WHERE p.usuario.id = :usuarioId AND p.programaCatalogo.id = :programaCatalogoProgramaId")
    Optional<ProgramaDoUsuarioModel> findByUsuarioAndProgramaCatalogo(
            @Param("usuarioId") Long usuarioId,
            @Param("programaCatalogoProgramaId") Long programaCatalogoProgramaId
    );

    // Método de conveniência
    default boolean existsByUsuarioIdAndProgramaCatalogoId(Long usuarioId, Long programaCatalogoProgramaId) {
        return findByUsuarioAndProgramaCatalogo(usuarioId, programaCatalogoProgramaId).isPresent();
    }
}