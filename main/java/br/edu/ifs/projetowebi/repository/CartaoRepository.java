package br.edu.ifs.projetowebi.repository;



import br.edu.ifs.projetowebi.model.CartaoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartaoRepository extends JpaRepository<CartaoModel, Long> {

    List<CartaoModel> findByUsuarioId(Long usuarioId);
}


