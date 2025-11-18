package br.edu.ifs.projetowebi.repository;



import br.edu.ifs.projetowebi.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    // JpaRepository<[SUA CLASSE ENTIDADE], [TIPO DO ID]>
    @Repository
    public interface ClienteRepository extends JpaRepository<Cliente, Long> {
        // Agora você pode usar métodos como:
        // clienteRepository.findAll()
        // clienteRepository.save(cliente)
    }

