package br.edu.ifs.projetowebi.config;

import br.edu.ifs.projetowebi.model.BandeiraCartaoModel;
import br.edu.ifs.projetowebi.model.CatalogoCartaoModel;
import br.edu.ifs.projetowebi.model.ProgramaCatalogoModel;
import br.edu.ifs.projetowebi.repository.CatalogoCartaoRepository;
import br.edu.ifs.projetowebi.repository.ProgramaCatalogoRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final ProgramaCatalogoRepository programaCatalogoRepository;
    private final CatalogoCartaoRepository catalogoCartaoRepository;

    @PostConstruct
    public void init() {
        // Inicializa Programas
        if (programaCatalogoRepository.count() == 0) {
            List<ProgramaCatalogoModel> programas = Arrays.asList(
                    createPrograma("Smiles", "Programa de pontos da Gol", 1.2, 30),
                    createPrograma("Azul", "Programa de pontos da Azul", 1.1, 45),
                    createPrograma("Latam Pass", "Programa de pontos da Latam", 1.3, 35),
                    createPrograma("Livelo", "Bradesco e Banco do Brasil", 1.0, 30),
                    createPrograma("Esfera", "Santander", 1.0, 30)
            );
            programaCatalogoRepository.saveAll(programas);
        }

        // Inicializa o Catálogo de Cartões (A inteligência que você buscava)
        if (catalogoCartaoRepository.count() == 0) {
            List<CatalogoCartaoModel> cartoes = Arrays.asList(
                    createCatalogo("411111", "Itaú", "Itaú Personalité Visa Infinite", BandeiraCartaoModel.VISA, 2.5),
                    createCatalogo("521234", "Nubank", "Nubank Ultravioleta", BandeiraCartaoModel.MASTERCARD, 2.2),
                    createCatalogo("376442", "Amex", "The Platinum Card", BandeiraCartaoModel.AMERICAN_EXPRESS, 2.2),
                    createCatalogo("400000", "BB", "Ourocard Visa Platinum", BandeiraCartaoModel.VISA, 1.5)
            );
            catalogoCartaoRepository.saveAll(cartoes);
        }
    }

    private ProgramaCatalogoModel createPrograma(String nome, String descricao, Double multiplicador, Integer prazo) {
        ProgramaCatalogoModel programa = new ProgramaCatalogoModel();
        programa.setNome(nome);
        programa.setDescricao(descricao);
        programa.setMultiplicadorBase(multiplicador);
        programa.setPrazoCreditoDias(prazo);
        return programa;
    }

    // Helper method para o catálogo de cartões
    private CatalogoCartaoModel createCatalogo(String bin, String banco, String nome, BandeiraCartaoModel bandeira, double multi) {
        CatalogoCartaoModel c = new CatalogoCartaoModel();
        c.setBin(bin);
        c.setBanco(banco);
        c.setNomeExibicao(nome);
        c.setBandeira(bandeira);
        c.setMultiplicadorPadrao(BigDecimal.valueOf(multi));
        return c;
    }
}